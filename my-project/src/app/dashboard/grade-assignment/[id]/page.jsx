import React from "react";
import { CodingInterface } from "../../../components/student-workspace";
import { createClient } from "../../../../../utils/supabase/server";
import { cookies } from "next/headers";
import {
  fetchRubricDataForAssignment,
  fetchStudentsForAssignment,
} from "../../api";
export default async function AssignmentPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  // Debug: Check what cookies we have

  // Check both session and user

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Check if we have either session or user
  if (!user) {
    console.log("❌ No authentication found");
    return (
      <div className="p-4">
        <h1>Authentication Required</h1>
        <p>Please log in to view this assignment.</p>
      </div>
    );
  }

  const authenticatedUser = user;
  console.log("✅ Authenticated user:", authenticatedUser.id);

  const { data: assignmentData, error } = await supabase
    .from("assignments")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching assignment data:", error);
    return <div>Error loading assignment data.</div>;
  }
  // This should ideally be passed in as a prop or come from context.
  const fetchGradingData = async (assignmentId) => {
    try {
      const [fetchedStudents, fetchedRubricData] = await Promise.all([
        fetchStudentsForAssignment(assignmentId),
        fetchRubricDataForAssignment(assignmentId),
      ]);

      // Safely get the first object from the fetchedRubricData array
      const rubricDataObject = fetchedRubricData?.[0];

      return {
        students: fetchedStudents || [],
        // Access the 'testcases' property from the object
        testcases: rubricDataObject?.testcases || [],
        // Access the 'rubric' property from the object
        rubric: rubricDataObject?.rubric || [],
      };
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      // Return empty arrays on error for consistency
      return { students: [], testcases: [], rubric: [] };
    }
  };
  const rubricData = await fetchGradingData(id);
  console.log("Fetched rubric data:", rubricData);
  // Use the authenticated user's ID for the permission check
  if (assignmentData.teacher_id !== authenticatedUser.id) {
    return <div>You do not have permission to view this assignment.</div>;
  }

  return (
    <CodingInterface
      role="teacher"
      user={authenticatedUser}
      id={id}
      data={assignmentData}
      rubric={rubricData}
    />
  );
}
