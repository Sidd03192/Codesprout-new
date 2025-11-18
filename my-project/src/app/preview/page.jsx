"use client";
import { useEffect, useState } from "react";
import { CodingInterface } from "../components/student-workspace";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PreviewPage() {
  const [assignmentData, setAssignmentData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedData = localStorage.getItem("assignmentData");
    console.log("storedData:", storedData);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAssignmentData(parsedData);
      console.log("assignment:", parsedData);

      // Show toast notification for preview mode
      toast("Preview Mode", {
        description:
          "You are viewing a preview. This is not published and functionality is limited.",
        duration: 50000,
      });
    } else {
      // Redirect back if no data
      router.push("/");
    }
  }, []);

  // Disabled save function for preview
  const handleSaveAssignment = async (code, isSubmit) => {
    toast({
      title: "Preview Mode",
      description: "Save and submit functionality is disabled in preview mode.",
      color: "warning",
      duration: 3000,
      placement: "top-center",
      variant: "solid",
    });
    return Promise.resolve("disabled");
  };

  return (
    <div>
      {assignmentData && (
        <CodingInterface
          id={null} // No ID in preview
          isPreview={true}
          previewData={assignmentData}
          role="student"
          submissionData={null}
          assignmentData={null}
          onSaveAssignment={handleSaveAssignment}
          rubric={null}
        />
      )}
    </div>
  );
}
