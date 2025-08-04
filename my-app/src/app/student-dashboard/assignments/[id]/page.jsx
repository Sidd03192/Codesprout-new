import { use } from "react"; // Don't forget to import `use`
import { CodingInterface } from "../../../components/student-workspace"; // Adjust path if needed

export default function AssignmentPage({ params }) {
  // 1. Unwrap the params object to safely access its properties
  const resolvedParams = use(params);
  const { id } = resolvedParams; // Get the id

  console.log("Parent page is passing down this ID:", id);

  // 2. Pass the `id` as a prop to your child component
  return <CodingInterface id={id} role="student" />;
}
