"use client";
import { useEffect, useState } from "react";
import { AssignmentPreview } from "../components/assignment/assignment-preview"; // adjust path as needed
import { useRouter } from "next/navigation";

export default function PreviewPage() {
  const [assignmentData, setAssignmentData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("assignmentData");
    console.log("storedData:", storedData);
    if (storedData) {
      setAssignmentData(JSON.parse(storedData));
      console.log("assignment:", storedData);

    } else {
      // Redirect back if no data
      router.push("/");
    }
  }, []);

  return (
    <div>
      {assignmentData && (
        <AssignmentPreview
          assignment={assignmentData}
          onClose={() => router.back()} // acts like modal close
        />
      )}
    </div>
  );
}
   