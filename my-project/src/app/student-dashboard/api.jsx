// file: app/actions.ts

"use server";
import { createClient } from "../../../utils/supabase/server";
import { executeCode } from "../components/editor/api";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// This action fetches assignments for a given student.
// It returns both the assignments that are already active
// and the single next assignment that is scheduled to start.
export async function getAssignmentsData(student_id) {
  // const user = await supabase.auth.getUser(); // extra security.
  // if (user.error) {
  //   console.error("Error fetching user:", user.error);
  //   return { error: "Could not fetch user." };
  // }
  const supabase = await createClient();
  // 1. Get all assignments that are already visible (this is safe to send)
  const { data: visibleAssignments, error: visibleError } = await supabase
    .from("assignment_students")
    .select("*")
    .eq("student_id", student_id)
    .lte("start_date", "now()")
    .order("start_date", { ascending: false });

  console.log("Visisble assignments:", visibleAssignments);
  if (visibleError) {
    console.error("Error fetching visible assignments:", visibleError);
    return { error: "Could not fetch visible assignments." };
  }

  // 2. Get ONLY THE TIME of the single next upcoming event
  const { data: nextEvent, error: nextEventError } = await supabase
    .from("assignment_students")
    .select("start_date") // <-- We ONLY select the start_date
    .eq("student_id", student_id)
    .gt("start_date", "now()")
    .order("start_date", { ascending: true });

  console.log("Next event:", nextEvent);

  // It's normal for nextEvent to be null if there are no more assignments.
  // We don't need to treat "no rows" as a hard error here.

  // 3. Return the visible assignments and JUST the next start time string
  return {
    visibleAssignments,
    nextStartTime: nextEvent?.start_date || null, // Send the string or null
  };
}
export const getAssignmentDetails = async (assignment_id) => {
  const supabase = await createClient();
  console.log("Fetching assignment details:", assignment_id);
  if (!assignment_id) {
    console.error("No assignment ID provided, got null or undefined.");
    return;
  }
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, title, description, language, code_template, hints, open_at, due_at, status, locked_lines,  allow_late_submission, allow_copy_paste, allow_auto_complete, auto_grade, show_results, testing_url,rubric "
    )
    .eq("id", assignment_id)
    .single(); // Use .single() to get a single object instead of an array
  if (error) {
    console.error("Error fetching assignments:", error.message);
    return;
  } else {
    console.log("Assignment details:", data);
    return data;
  }
};

export const joinClassroomByToken = async (token, userId) => {
  console.log("Joining classroom by token:", token);
  const supabase = await createClient();
  
  try {
    // Call the API to handle token-based joining
    const response = await fetch(`/api/classroom/join/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Token join error:", data.error);
      return { success: false, error: data.error };
    }

    return { 
      success: true, 
      class_id: data.class_id,
      class_name: data.class_name,
      already_enrolled: data.already_enrolled
    };
  } catch (error) {
    console.error("Error joining by token:", error);
    return { success: false, error: "Failed to join classroom" };
  }
};

export const joinClassroom = async (joinCode, userId) => {
  console.log("hello");
  const supabase = await createClient();
  console.log("User ID:", userId);
  const { data: classes, error: fetchError } = await supabase
    .from("classes")
    .select("*")
    .eq("join_id", joinCode)
    .limit(1);

  if (fetchError || classes.length === 0) {
    console.error("Invalid join code or DB error:", fetchError?.message);
    return null;
  }

  const course = classes[0];
  const { data: existingJoin } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", userId)
    .eq("class_id", course.id)
    .maybeSingle();

  if (existingJoin) {
    console.log("User already joined this course");
    return null; // check if this makes sense
  }
  /*const { data: emailData, error: emailError } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  if (emailError) {
    console.error("Error fetching email:", emailError.message);
    return null;
  }
  const email = emailData.email;*/

  const { error: insertError } = await supabase.from("enrollments").insert({
    student_id: userId,
    enrolled_at: new Date(),
    class_id: course.id,
    full_name: "john doe",
    email: "johndoe@gmail.com",
  });

  if (insertError) {
    console.error("Error joining course:", insertError.message);
    return null;
  }
  return course;
};

export const getUserCourses = async (userId) => {
  const supabase = await createClient();
  console.log("userId: ", userId);
  const { data, error } = await supabase
    .from("enrollments")
    .select("class_id")
    .eq("student_id", userId);
  if (error) {
    console.error("Error fetching user courses:", error.message);
    return null;
  }
  if (data.length === 0) {
    return [];
  }
  const course_ids = data.map((entry) => entry.class_id);
  const { data: courses, error: coursesError } = await supabase
    .from("classes")
    .select("*")
    .in("id", course_ids);

  if (coursesError) {
    console.error("Error fetching courses:", coursesError.message);
    return null;
  }

  return courses;
};

export const saveAssignment = async (
  student_code,
  student_id,
  assignment_id,
  isSubmitting,
  submitted_at,
  path,
  rubric
) => {
  const supabase = await createClient();

  console.log(
    "Saving assignment data for student:",
    student_id,
    "assignment:",
    assignment_id,
    "code:",
    student_code,
    "path:",
    path,
    "rubric:",
    rubric
  );
  const numericAssignmentId = parseInt(assignment_id, 10);

  if (!student_code || !student_id || !numericAssignmentId) {
    console.error("Missing required parameters for saving assignment data.");
    return;
  }
  let date = null;
  let structuredResult = null;
  let status = isSubmitting ? "submitted" : "draft";
  let gradingResult = null; // should have score and feedback
  let stylingResults = [];
  let requirementsResults = [];

  if (isSubmitting) {
    console.log(
      "Submitting... preparing to call grading API and AI evaluation in parallel."
    );
    try {
      // Start both grading API call and AI evaluation in parallel
      const gradingPromise = fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/grade`, // full URL cause we on server
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentCode: student_code,
            testing_path: path,
          }),
        }
      );

      // Prepare AI evaluation promises in parallel
      let aiEvaluationPromises = [];
      if (rubric) {
        console.log("attempting to parse rubric for parallel AI evaluation");
        const stylingSection = rubric.find(
          (section) => section.title === "Styling Criteria"
        );
        const requirementsSection = rubric.find(
          (section) => section.title === "Requirements"
        );

        if (
          stylingSection &&
          stylingSection.items &&
          stylingSection.items.length > 0
        ) {
          const stylingCriteria = stylingSection.items.map((item) => ({
            name: item.name,
            maxPoints: item.maxPoints || 10,
          }));
          aiEvaluationPromises.push(
            evaluateCodeWithAI(student_code, stylingCriteria, "Styling")
          );
        } else {
          aiEvaluationPromises.push(Promise.resolve([]));
        }

        if (
          requirementsSection &&
          requirementsSection.items &&
          requirementsSection.items.length > 0
        ) {
          const requirementsCriteria = requirementsSection.items.map(
            (item) => ({
              name: item.name,
              maxPoints: item.maxPoints || 10,
            })
          );
          aiEvaluationPromises.push(
            evaluateCodeWithAI(
              student_code,
              requirementsCriteria,
              "Requirements"
            )
          );
        } else {
          aiEvaluationPromises.push(Promise.resolve([]));
        }
      } else {
        console.log("no rubric provided, skipping AI evaluation");
        aiEvaluationPromises = [Promise.resolve([]), Promise.resolve([])];
      }

      // Wait for both grading and AI evaluation to complete in parallel
      const [gradingResponse, aiStylingResults, aiRequirementsResults] =
        await Promise.all([gradingPromise, ...aiEvaluationPromises]);

      // Handle grading response
      if (!gradingResponse.ok) {
        const errorBody = await gradingResponse.json();
        throw new Error(
          errorBody.error ||
            `API call failed with status: ${gradingResponse.status}`
        );
      }
      gradingResult = await gradingResponse.json();
      console.log("Received grading result from API:", gradingResult);

      // AI results are already available from parallel execution
      stylingResults = aiStylingResults;
      requirementsResults = aiRequirementsResults;
      console.log("AI styling results:", stylingResults);
      console.log("AI requirements results:", requirementsResults);

      structuredResult = structureTestingData(
        gradingResult,
        stylingResults,
        requirementsResults
      );
    } catch (apiError) {
      console.error(
        "Fatal: Failed to get grading result from API or AI evaluation.",
        apiError
      );
    }
  }

  // shoudl create a new row in assignment_student as a JSON and put all grading relating things in there to make the schema more simple.
  const { error } = await supabase
    .from("assignment_students")
    .update({
      submitted_code: student_code,
      submitted_at: date,
      status: status,
      grading_data: structuredResult,
    })
    .eq("student_id", student_id)
    .eq("assignment_id", numericAssignmentId);
  if (error) {
    console.error("Error saving assignment data:", error.message);
    return [];
  } else {
    return "success";
  }
};

const evaluateCodeWithAI = async (studentCode, criteria, criteriaType) => {
  try {
    const systemPrompt = `You are an expert code reviewer. Evaluate the submitted code against the provided ${criteriaType} criteria. 

For each criterion, determine if the code meets the requirement and assign points accordingly.

Respond with a JSON array where each object has:
- name: the criterion name (exactly as provided)
- status: "passed", "failed", or "partial"
- pointsAchieved: number of points earned (0 or maxPoints)
- maxPoints: maximum points for this criterion
- feedback: brief explanation of the evaluation

Be fair but thorough in your evaluation.`;

    const userPrompt = `Code to evaluate:
\`\`\`
${studentCode}
\`\`\`

${criteriaType} criteria to check:
${criteria.map((c) => `- ${c.name} (max ${c.maxPoints} points)`).join("\n")}

Evaluate each criterion and provide the results as a JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;

    console.log("AI response:", aiResponse);

    // Strip markdown code blocks if present
    let jsonString = aiResponse;
    if (jsonString.includes("```json")) {
      jsonString = jsonString.replace(/```json\s*/g, "").replace(/```/g, "");
    } else if (jsonString.includes("```")) {
      jsonString = jsonString.replace(/```\s*/g, "").replace(/```/g, "");
    }
    jsonString = jsonString.trim();

    // Try to parse the JSON response
    try {
      const parsedResults = JSON.parse(jsonString);
      return parsedResults.map((result) => ({
        name: result.name,
        status: result.status || "ungraded",
        maxPoints: result.maxPoints || 0,
        pointsAchieved: result.pointsAchieved || 0,
        feedback: result.feedback || "",
      }));
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return default ungraded results if parsing fails
      return criteria.map((c) => ({
        name: c.name,
        status: "ungraded",
        maxPoints: c.maxPoints,
        pointsAchieved: -1,
        feedback: "AI evaluation failed",
      }));
    }
  } catch (error) {
    console.error("AI evaluation error:", error);
    // Return default ungraded results if AI call fails
    return criteria.map((c) => ({
      name: c.name,
      status: "ungraded",
      maxPoints: c.maxPoints,
      pointsAchieved: -1,
      feedback: "AI evaluation failed",
    }));
  }
};

const structureTestingData = (
  data,
  stylingResults = [],
  requirementsResults = []
) => {
  if (!data || !data.testResults) {
    return "null";
  }

  return {
    // --- Data from the autograder ---
    totalPointsAchieved: data.totalPointsAchieved,
    maxTotalPoints: data.maxTotalPoints,
    testResults: data.testResults,
    rawStdout: data.rawStdout || "",
    rawStderr: data.rawStderr || "",
    exitCode: data.exitCode || 0,
    gradedAt: new Date().toISOString(),
    error: data.error || null,
    // --- Placeholders for manual grading and teacher input ---
    gradeOverride: null,
    // AI-generated results
    stylingResults: stylingResults,
    requirementsResults: requirementsResults,
    teacherFeedback: null,
    rubric: null,
  };
};

export const fetchStudentData = async (assignment_id) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const student_id = user.id;

  const { data, error } = await supabase
    .from("assignment_students")
    .select("grading_data, submitted_code, submitted_at, name")
    .eq("student_id", student_id)
    .eq("assignment_id", assignment_id)
    .single();

  if (error) {
    console.error("Error fetching grading data:", error.message);
    return null;
  }
  console.log(data, "dataaaaaaaaaaaaaaaaaaaaaaaa");

  return data;
};
