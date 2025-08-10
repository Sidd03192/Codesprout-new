import { CodingInterface } from "../../../components/student-workspace"; // Adjust path if needed
import { fetchStudentData } from "../../api";

export default async function AssignmentPage({ params }) {
  // 1. Unwrap the params object to safely access its properties
  const { id } = await params;

  console.log("Parent page is passing down this ID:", id);

  const submissionData = await fetchStudentData(id); // contains submitted code
  console.log("SubmissionData:", submissionData);
  // 2. Pass the `id` as a prop to your child component
  return (
    <CodingInterface id={id} role="student" submissionData={submissionData} />
  );
}
