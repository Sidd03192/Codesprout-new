"use server";

import { createClient } from "../../../utils/supabase/server";
// export const googleLogin = async () => {
//   const supabase = createClient();
//   try {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//     });

//     if (error) {
//       console.error("OAuth Sign-in Error:", error.message);
//     } else {
//       console.log("OAuth redirecting…", data);
//     }
//   } catch (err) {
//     console.error("Unexpected error during Google Sign-in:", err.message);
//   }
//   console.log("Google login successs");
// };

export const insertUserIfNew = async (role) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return;

  // ✅ Check if the user was created within the last 1 minute
  const userCreatedAt = new Date(user.created_at);
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 1 minute ago

  if (userCreatedAt > oneMinuteAgo) {
    // Insert into users table
    const { data, error: dbError } = await supabase
      .from("users")
      .insert([{ id: user.id, email: user.email, role: role }]);

    if (dbError) {
      console.error("Error inserting user:", dbError.message);
    } else {
      console.log("User successfully inserted:", data);
    }
  } else {
    console.log(
      "User already exists or was created earlier — skipping insert."
    );
  }
};

// Server side code for assignments page.

export const getClasses = async ({ teacher_id }) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("teacher_id", teacher_id);

  if (error) {
    console.error("Error fetching classes:", error.message);
    return [];
  } else {
    return data;
  }
};
// gets students from a specific class.
export async function fetchStudentsForClass(classId) {
  const supabase = await createClient();

  console.log("Fetching students for class:", classId);
  const { data, error } = await supabase
    .from("enrollments")
    .select("student_id, full_name, email") // Just select the columns you need
    .eq("class_id", classId);

  if (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  } else {
    console.log("Enrollments:", data);
  }

  return data;
}

export async function fetchRubricDataForAssignment(assignmentId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assignments")
    .select("testcases, rubric")
    .eq("id", assignmentId);

  console.log("rubric data fetched: **********", data);
  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
  return data;
}

export async function fetchStudentsForAssignment(assignmentId) {
  console.log("Fetching students for assignment:", assignmentId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignment_students")
    .select("*")
    .eq("assignment_id", assignmentId);

  console.log("Students fetched:" + data);
  if (error) {
    console.error("Error fetching assignment students:", error);
    return [];
  }
  return data;
}

export async function updateStudentGrading(
  studentId,
  assignmentId,
  gradingData
) {
  console.log(
    "Updating grading for student:",
    studentId,
    "assignment:",
    assignmentId,
    "data:",
    gradingData
  );

  const supabase = await createClient();
  const { error } = await supabase
    .from("assignment_students")
    .update(gradingData)
    .eq("student_id", studentId)
    .eq("assignment_id", assignmentId);

  if (error) {
    console.error("Error updating grading:", error);
  } else {
    console.log("Grading updated successfully");
  }
}

export async function fetchAssignmentsForTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assignments:", error.message);
    return [];
  } else {
    return data;
  }
}
export async function updateGrade(submissionsToUpdate, assignmentId) {
  const supabase = await createClient();

  try {
    console.log("Submissions to update:", submissionsToUpdate);
    if (!submissionsToUpdate || submissionsToUpdate.length === 0) {
      console.log("No submissions to update.");
      return { success: true, message: "No submissions to update." };
    }

    const updatePromises = submissionsToUpdate.map(
      (submission) =>
        supabase
          .from("assignment_students")
          .update({
            grading_data: submission.grading_data,
            status: "graded",
          })
          .match({ id: submission.id, assignment_id: assignmentId }) // This is the crucial fix
    );

    // Execute all the update promises concurrently.
    const results = await Promise.all(updatePromises);
    const firstError = results.find((result) => result.error);
    if (firstError) {
      throw new Error(`An update failed: ${firstError.error.message}`);
    }
    return {
      success: true,
      updated: submissionsToUpdate.length,
      message: `Successfully updated ${submissionsToUpdate.length} submissions`,
    };
  } catch (error) {
    console.error("Error in batch update:", error);
    return {
      success: false,
      error: error.message,
      message: "Failed to update grades",
    };
  }
}
