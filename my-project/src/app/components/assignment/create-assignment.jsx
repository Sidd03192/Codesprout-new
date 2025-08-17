// ... existing imports ...
import { createClient } from "../../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { parseDate, parseDateTime } from "@internationalized/date";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  ScrollShadow,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Textarea,
  DatePicker,
  Form,
  Tooltip,
  form,
  Spinner,
  addToast,
} from "@heroui/react";
import React, { useEffect, useCallback, useRef } from "react";
import {
  Code,
  WandSparkles,
  LassoSelect,
  Upload,
  ArrowUpFromLine,
  FlaskConical,
  FileSliders,
  MonitorCog,
} from "lucide-react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { RichTextEditor } from "./RichText/rich-description";
import { executeCode } from "../editor/api";
import CodeEditor from "../editor/code-editor";
import { Testcase } from "./testcases";
import { AssignmentPreview } from "./assignment-preview";
import { getClasses, fetchStudentsForClass } from "../../dashboard/api";
import { MiniRubric } from "./rubric";
// Helper functions to convert between Date and DateValue (moved to top level)
const dateToDateValue = (date) => {
  if (!date) return null;
  const jsDate = date instanceof Date ? date : new Date(date);
  const year = jsDate.getFullYear();
  const month = String(jsDate.getMonth() + 1).padStart(2, "0");
  const day = String(jsDate.getDate()).padStart(2, "0");
  const hour = String(jsDate.getHours()).padStart(2, "0");
  const minute = String(jsDate.getMinutes()).padStart(2, "0");
  return parseDateTime(`${year}-${month}-${day}T${hour}:${minute}`);
};

const dateValueToDate = (dateValue) => {
  if (!dateValue) return null;
  return new Date(
    dateValue.year,
    dateValue.month - 1,
    dateValue.day,
    dateValue.hour || 0,
    dateValue.minute || 0
  );
};

export default function CreateAssignmentPage({
  session,
  classes,
  setOpen,
  isEdit,
  assignmentData,
}) {
  const supabase = createClient();

  // need to complete
  const [formData, setFormData] = React.useState({
    classId: isEdit ? assignmentData.class_id : "",
    className: isEdit ? assignmentData.class_name : "",
    title: isEdit ? assignmentData.title : "",
    description: isEdit ? assignmentData.description : "",

    selectedStudentIds: isEdit ? assignmentData.student_ids : [],
    codeTemplate:
      "// Write your code template here\nfunction example() {\n  // This line can be locked\n  console.log('Hello world');\n}\n",
    dueDate: isEdit ? new Date(assignmentData.due_at) : null,
    startDate: isEdit ? new Date(assignmentData.open_at) : null,
    lockedLines: isEdit ? assignmentData.locked_lines : [],
    hiddenLines: isEdit ? assignmentData.hidden_lines : [],
    allowLateSubmission: isEdit ? assignmentData.allow_late_submission : false,
    allowAutocomplete: isEdit ? assignmentData.allow_auto_complete : false,
    autoGrade: isEdit ? assignmentData.auto_grade : false,
    showResults: isEdit ? assignmentData.show_results : false,
    allowCopyPaste: isEdit ? assignmentData.allow_copy_paste : false,
    checkStyle: isEdit ? assignmentData.check_style : false,
  });

  const [selectedFile, setSelectedFile] = React.useState(1);
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    isEdit ? assignmentData.language : "java"
  );
  const editorRef = React.useRef(null);
  const descriptionRef = useRef(null);
  const fileInputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For submission loading state
  const [isLoading, setIsLoading] = React.useState(false);
  const [students, setStudents] = useState([]);
  const [startDate, setStartDate] = useState(
    isEdit
      ? dateToDateValue(assignmentData.open_at)
      : dateToDateValue(new Date(Date.now() + 60 * 60 * 1000)) // 1 hour from now
  );
  const [dueDate, setDueDate] = useState(
    isEdit ? dateToDateValue(assignmentData.due_at) : null
  );
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [assignmentPreviewData, setAssignmentPreviewData] =
    React.useState(null);
  const router = useRouter();
  const [testcases, setTestcases] = useState([]);
  const [dateErrors, setDateErrors] = useState({
    startDate: "",
    dueDate: "",
  });
  // Date validation functions
  const validateDates = (newStartDate, newDueDate) => {
    const errors = { startDate: "", dueDate: "" };
    const now = new Date();

    // Convert DateValue to Date for comparison
    const startDateJS = dateValueToDate(newStartDate);
    const dueDateJS = dateValueToDate(newDueDate);

    // Check if start date is in the past
    if (startDateJS && startDateJS < now) {
      errors.startDate = "Start date must be in the future";
    }

    // Check if due date is before start date
    if (startDateJS && dueDateJS && dueDateJS <= startDateJS) {
      errors.dueDate = "Due date must be after start date";
    }

    // Check if due date is in the past
    if (dueDateJS && dueDateJS < now) {
      errors.dueDate = "Due date must be in the future";
    }

    setDateErrors(errors);
    return !errors.startDate && !errors.dueDate;
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    validateDates(date, dueDate);
  };

  const handleDueDateChange = (date) => {
    setDueDate(date);
    validateDates(startDate, date);
  };

  useEffect(() => {
    if (isEdit) {
      editorRef.current?.setValue(assignmentData.code_template);
      descriptionRef.current?.commands?.setContent(assignmentData.description);
      // Load rubric data if it exists
      if (assignmentData.rubric) {
        try {
          const rubricData =
            typeof assignmentData.rubric === "string"
              ? JSON.parse(assignmentData.rubric)
              : assignmentData.rubric;
          setSections(rubricData);
        } catch (error) {
          console.error("Error parsing rubric data:", error);
        }
      }

      // Load test cases from Supabase storage if testing_url exists
      if (assignmentData.testing_url) {
        loadTestCasesFromStorage(assignmentData.testing_url);
      }
    }
    editorRef.current?.setValue(formData.codeTemplate);
    descriptionRef.current?.commands?.setContent(formData.description);
  }, [editorRef.current, descriptionRef.current]);
  useEffect(() => {
    const fetchStudents = async () => {
      if (formData.classId) {
        setIsLoading(true);

        const fetchedStudents = await fetchStudentsForClass(formData.classId);
        console.log("students for class:", fetchedStudents);
        setStudents(fetchedStudents);
      } else {
        setStudents([]);
      }
      setIsLoading(false);
    };

    fetchStudents();
  }, [formData.classId]);
  // student & code stuff

  const handleClassChange = useCallback((classId, className) => {
    // updates class Id
    setFormData((prev) => ({
      ...prev,
      classId,
      className,

      selectedStudentIds: [],
    }));
  });
  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleStudent = (studentId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedStudentIds.includes(studentId);
      return {
        ...prev,
        selectedStudentIds: isSelected
          ? prev.selectedStudentIds.filter((id) => id !== studentId)
          : [...prev.selectedStudentIds, studentId],
      };
    });
  };

  const handleSelectAllStudents = () => {
    const allStudentIds = students.map((s) => s.student_id);
    console.log("all student ids:", allStudentIds);
    const allSelected = students.length === formData.selectedStudentIds.length;

    setFormData((prev) => ({
      ...prev,
      selectedStudentIds: allSelected ? [] : allStudentIds,
    }));
  };

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTestCases, setIsGeneratingTestCases] = useState(false);

  // AI Mode states
  const [showAIPrompt, setShowAIPrompt] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAssignment, setIsGeneratingAssignment] = useState(false);

  const runCode = async () => {
    const code = editorRef.current?.getValue?.();
    if (!code) {
      setOutput("Please select a language and write some code.");
      return;
    }

    try {
      setIsRunning(true);
      const result = await executeCode(selectedLanguage || "java", code);
      console.log(result);
      const runResult = result.run || {};
      const finalOutput =
        runResult.output ||
        runResult.stdout ||
        runResult.stderr ||
        "No output.";

      setOutput(finalOutput);
    } catch (error) {
      console.error(error);
      console.error("Execution failed:", error);
      setOutput("Execution failed.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleTemplateStreaming = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // Get the editor and its model ONCE before the loop
    const editor = editorRef.current;
    if (!editor) return;

    try {
      // Clear editor at start
      editor.setValue("");
      const model = editor.getModel();
      if (!model) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.partial && data.content) {
                  // EFFICIENT: Insert new content at the end without reading or replacing
                  const lastLine = model.getLineCount();
                  const lastCol = model.getLineMaxColumn(lastLine);

                  // This tells Monaco to insert the new text at the very end
                  model.applyEdits([
                    {
                      range: new monaco.Range(
                        lastLine,
                        lastCol,
                        lastLine,
                        lastCol
                      ),
                      text: data.content,
                    },
                  ]);

                  // Optional but recommended: Automatically scroll to the new content
                  editor.revealPosition({
                    lineNumber: model.getLineCount(),
                    column: model.getLineMaxColumn(model.getLineCount()),
                  });
                }
              }
            } catch (e) {
              console.log("Skipping malformed JSON:", line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };
  const generateWithAI = async () => {
    console.log("Generating with AI...");
    const description =
      descriptionRef.current?.getText?.() || formData.description;

    if (!description || description.trim() === "") {
      console.log("Description Required");
      addToast({
        title: "Description Required",
        description:
          "Please provide a problem description before generating code.",
        color: "warning",
        duration: 3000,
        variant: "solid",
      });
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/generate-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description,
          language: selectedLanguage || "java",
        }),
      });

      console.log("AI response:", response);
      if (!response.ok) {
        throw new Error("Failed to generate template");
      }

      await handleTemplateStreaming(response);

      addToast({
        title: "Template Generated",
        description: "Your Code template has been created !",
        color: "success",
        duration: 3000,
        variant: "solid",
      });
    } catch (error) {
      console.error("AI generation failed:", error);
      addToast({
        title: "Generation Failed",
        description: "Failed to generate code template. Please try again.",
        color: "danger",
        duration: 3000,
        variant: "solid",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTestCases = async () => {
    const code = editorRef.current?.getValue?.();
    const description =
      descriptionRef.current?.getText?.() || formData.description;

    if (!code || code.trim() === "") {
      addToast({
        title: "Code Required",
        description:
          "Please provide code in the editor before generating test cases.",
        color: "warning",
        duration: 3000,
        variant: "solid",
      });
      return;
    }

    if (!description || description.trim() === "") {
      addToast({
        title: "Description Required",
        description:
          "Please provide a problem description before generating test cases.",
        color: "warning",
        duration: 3000,
        variant: "solid",
      });
      return;
    }

    try {
      setIsGeneratingTestCases(true);

      const response = await fetch("/api/generate-test-cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentDescription: `${description}\n\nCode Template:\n${code}`,
          language: selectedLanguage || "java",
          prompt: description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate test cases");
      }

      const data = await response.json();

      if (data.testFileContent) {
        // Create a test file and add it to testcases
        const testFile = new File(
          [data.testFileContent],
          data.filename || "test.java",
          { type: "text/java" }
        );

        const testcaseObject = {
          id: Date.now(),
          name: data.filename || "test.java",
          size: testFile.size,
          type: testFile.type,
          uploadTime: new Date().toLocaleString(),
          isZip: false,
          file: testFile,
          contents: [],
          isExpanded: false,
        };

        setTestcases([testcaseObject]);

        addToast({
          title: "Test Cases Generated",
          description: "Test cases have been generated based on your code!",
          color: "success",
          duration: 3000,
          variant: "solid",
        });
      }
    } catch (error) {
      console.error("Test case generation failed:", error);
      addToast({
        title: "Generation Failed",
        description: "Failed to generate test cases. Please try again.",
        color: "danger",
        duration: 3000,
        variant: "solid",
      });
    } finally {
      setIsGeneratingTestCases(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      handleFormChange("codeTemplate", content);
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Complete AI Assignment Generation
  const generateCompleteAssignment = async () => {
    if (!aiPrompt.trim()) {
      addToast({
        title: "Prompt Required",
        description:
          "Please enter a description of the assignment you want to create.",
        color: "warning",
        duration: 3000,
        variant: "solid",
      });
      return;
    }

    try {
      setIsGeneratingAssignment(true);

      // Generate all components in parallel
      const [metadataRes, descriptionRes, codeRes, testRes] = await Promise.all(
        [
          // Step 1: Generate assignment metadata
          fetch("/api/generate-complete-assignment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: aiPrompt,
              classes: classes,
              language: selectedLanguage || "java",
            }),
          }),

          // Step 2: Generate description
          fetch("/api/generate-description", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: aiPrompt }),
          }),

          // Step 3: Generate code template
          fetch("/api/generate-code-template", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: aiPrompt,
              language: selectedLanguage || "java",
            }),
          }),

          // Step 4: Generate test cases
          fetch("/api/generate-test-cases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assignmentDescription: aiPrompt,
              language: selectedLanguage || "java",
              prompt: aiPrompt,
            }),
          }),
        ]
      );

      // Check all responses
      if (!metadataRes.ok || !descriptionRes.ok || !codeRes.ok || !testRes.ok) {
        throw new Error("Failed to generate assignment components");
      }

      // Parse all responses
      const [metadata, description, codeTemplate, testCase] = await Promise.all(
        [
          metadataRes.json(),
          descriptionRes.json(),
          codeRes.json(),
          testRes.json(),
        ]
      );

      // Populate form with generated data
      populateFormWithAIData(metadata, description, codeTemplate, testCase);

      // Hide AI prompt and show form
      setShowAIPrompt(false);

      addToast({
        title: "Assignment Generated Successfully!",
        description:
          "Your complete assignment has been generated. You can now edit any details.",
        color: "success",
        duration: 5000,
        variant: "solid",
      });
    } catch (error) {
      console.error("AI assignment generation failed:", error);
      addToast({
        title: "Generation Failed",
        description:
          "Failed to generate complete assignment. Please try again.",
        color: "danger",
        duration: 3000,
        variant: "solid",
      });
    } finally {
      setIsGeneratingAssignment(false);
    }
  };

  // Helper function to populate form with AI-generated data
  const populateFormWithAIData = (
    metadata,
    description,
    codeTemplate,
    testCase
  ) => {
    console.log(
      metadata,
      description,
      codeTemplate,
      testCase,
      "thisis the code generated"
    );

    // Populate basic form data including description and codetemaplete
    if (metadata.title) {
      setFormData((prev) => ({
        ...prev,
        title: metadata.title,
        description: description.html || description,
        codeTemplate: codeTemplate.skeletonCode || codeTemplate,
        classId: metadata.classId || metadata.class_id,
        className: classes.find(
          (c) => c.id === (metadata.classId || metadata.class_id)
        )?.name,
      }));
    }

    // Set language
    if (metadata.language) {
      setSelectedLanguage(metadata.language);
    }

    // Set dates
    if (metadata.suggestedOpenDate) {
      setStartDate(dateToDateValue(new Date(metadata.suggestedOpenDate)));
    }
    if (metadata.suggestedDueDate) {
      setDueDate(dateToDateValue(new Date(metadata.suggestedDueDate)));
    }

    // Directly update description editor
    if (description.html) {
      setTimeout(() => {
        descriptionRef.current?.commands?.setContent(description.html, "html");
      }, 100);
    }

    // Directly update code editor
    if (codeTemplate.skeletonCode) {
      setTimeout(() => {
        editorRef.current?.setValue?.(codeTemplate.skeletonCode);
      }, 100);
    }

    // Set rubric
    if (metadata.rubric) {
      setSections(metadata.rubric);
    }

    // Set settings with defaults
    setFormData((prev) => ({
      ...prev,
      autoGrade: metadata.settings?.autoGrade ?? true,
      checkStyle: metadata.settings?.checkStyle ?? true,
      allowCopyPaste: metadata.settings?.allowCopyPaste ?? true,
      showResults: metadata.settings?.showResults ?? true,
      allowLateSubmission: metadata.settings?.allowLateSubmission ?? false,
      lockedLines: metadata.lockedLines || [],
    }));

    // Handle test case file
    if (testCase.testFileContent) {
      // Create a test file and add it to testcases
      const testFile = new File(
        [testCase.testFileContent],
        testCase.filename || "test.java",
        { type: "text/java" }
      );

      const testcaseObject = {
        id: Date.now(),
        name: testCase.filename || "test.java",
        size: testFile.size,
        type: testFile.type,
        uploadTime: new Date().toLocaleString(),
        isZip: false,
        file: testFile,
        contents: [],
        isExpanded: false,
      };

      setTestcases([testcaseObject]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dates before submission
    if (!validateDates(startDate, dueDate)) {
      addToast({
        title: "Invalid Dates",
        description: "Please fix the date errors before submitting.",
        color: "danger",
        duration: 5000,
        variant: "solid",
      });
      return;
    }

    if (!startDate || !dueDate) {
      addToast({
        title: "Missing Dates",
        description: "Please select both start and due dates.",
        color: "danger",
        duration: 5000,
        variant: "solid",
      });
      return;
    }

    // setIsSubmitting(true); // Start loading
    console.log("Form submitted:", formData);
    const testing_url = await uploadTestcases();
    console.log(testing_url);
    const code = editorRef.current.getValue();
    const description = descriptionRef.current.getJSON();
    const assignmentData = {
      class_id: formData.classId, // need to update thsi
      teacher_id: session.user.id,
      title: formData.title,
      description: description, // Assuming this holds the text content from RichTextEditor
      language: selectedLanguage,
      code_template: code,
      hints: "", // To be implemented
      open_at: dateValueToDate(startDate).toISOString(),
      due_at: dateValueToDate(dueDate).toISOString(),
      created_at: new Date().toISOString(),
      status: "inactive",
      locked_lines: formData.lockedLines,
      allow_late_submission: formData.allowLateSubmission,
      allow_copy_paste: formData.allowCopyPaste,
      allow_auto_complete: formData.allowAutocomplete,
      auto_grade: formData.autoGrade,
      show_results: formData.showResults,
      check_style: formData.checkStyle,
      testing_url: testing_url,
      rubric: sections,
    };

    console.log("Submitting assignmentData to the database:", assignmentData);

    try {
      const { data: assignmentResult, error: assignmentError } = await supabase
        .from("assignments")
        .insert([assignmentData])
        .select();

      if (assignmentError) {
        console.error("Error inserting assignment:", assignmentError);

        addToast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          color: "danger",
          duration: 5000,
          variant: "solid",
        });
        setIsSubmitting(false); // Stop loading
        return;
      }

      console.log("Assignment created successfully:", assignmentResult);

      if (assignmentResult && assignmentResult.length > 0) {
        const newAssignmentId = assignmentResult[0].id;

        if (
          formData.selectedStudentIds &&
          formData.selectedStudentIds.length > 0
        ) {
          const assignmentStudentData = formData.selectedStudentIds.map(
            (studentId) => ({
              assignment_id: newAssignmentId,
              student_id: studentId,
              start_date: dateValueToDate(startDate).toISOString(),
              title: formData.title,
              due_date: dateValueToDate(dueDate).toISOString(),
            })
          );

          console.log(
            "Submitting assignmentStudentData:",
            assignmentStudentData
          );

          const {
            data: studentAssignmentResult,
            error: studentAssignmentError,
          } = await supabase
            .from("assignment_students")
            .insert(assignmentStudentData);

          if (studentAssignmentError) {
            console.error(
              "Error inserting student assignments:",
              studentAssignmentError
            );
            addToast({
              title: "Unexpected Error",
              description: "An unexpected error occurred. Please try again.",
              color: "danger",
              duration: 5000,
              variant: "solid",
            });
            // Note: Here, the assignment is created, but student association failed.
            // You might want to inform the user or handle this case specifically.
            setIsSubmitting(false); // Stop loading
            return;
          }
          console.log(
            "Student assignments created successfully:",
            studentAssignmentResult
          );
        } else {
          console.log("No students selected for this assignment.");
        }
        addToast({
          title: "Assignment Created Successfully",
          description:
            "The assignment will now be visible to you in the assignments page",
          color: "success",
          duration: 5000,
          placement: "top-center",
          variant: "solid",
        });
      } else {
        console.error(
          "Assignment creation returned no result or empty result array."
        );
        addToast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          color: "danger",
          duration: 5000,
          placement: "top-center",
          variant: "solid",
        });
      }
    } catch (error) {
      console.error("An unexpected error occurred during submission:", error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Stop loading in all cases
      setOpen(false);
    }
  };

  const loadTestCasesFromStorage = async (testingUrl) => {
    try {
      const { data, error } = await supabase.storage
        .from("testing")
        .download(testingUrl);

      if (error) {
        console.error("Error downloading test cases:", error);
        return;
      }
      // Create a testcase object from the downloaded file
      const fileName = testingUrl.split("/").pop();
      const testcaseObject = {
        id: Date.now(),
        name: fileName,
        size: data.size,
        type: data.type,
        uploadTime: new Date().toLocaleString(),
        isZip: fileName.endsWith(".zip"),
        file: data,
        contents: [],
        isExpanded: false,
      };

      setTestcases([testcaseObject]);
      console.log("loaded" + assignmentData.testing_url);
      console.log("Test cases loaded from storage:", testcaseObject);
    } catch (error) {
      console.error("Error loading test cases from storage:", error);
    }
  };

  const uploadTestcases = async () => {
    try {
      const fileWrapper = testcases[0];
      // 3. Get the ACTUAL file from the wrapper object
      const actualFileToUpload = fileWrapper.file;
      console.log("file to upload", fileWrapper.file);
      const fileExtension = formData.title;
      const fileName = `${Date.now()}.${fileExtension}`;
      const filePath = `test-cases/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("testing")
        .upload(filePath, actualFileToUpload);

      if (uploadError) {
        throw uploadError;
      }
      return filePath;
    } catch (error) {
      console.error("Error during upload:", error.message);
      alert(`Upload failed: ${error.message}`);
    } finally {
    }
  };

  const handlePreview = () => {
    const code = editorRef.current?.getValue?.();
    const description =
      descriptionRef.current?.getHTML?.() || "<p>No description provided.</p>";

    const previewData = {
      title: formData.title || "Untitled Assignment",
      description,

      code_template: code || "// No code provided",
      language: selectedLanguage || "java",
    };
    console.log("previewData:", previewData);
    localStorage.setItem("assignmentData", JSON.stringify(previewData));
    window.open("/preview", "_blank", "noopener,noreferrer");

    // Save to sessionStorage so preview page can fetch it (since we can't pass complex objects via query string)
  };

  // handling lines stuff
  const handleLockedLinesChange = useCallback((newLockedLines) => {
    setFormData((prev) => {
      // Avoid re-render if the value hasn't actually changed
      if (JSON.stringify(prev.lockedLines) === JSON.stringify(newLockedLines)) {
        return prev;
      }
      return { ...prev, lockedLines: newLockedLines };
    });
  }, []); // Empty dependency array means this function is created only once

  const handleHiddenLinesChange = useCallback((newHiddenLines) => {
    setFormData((prev) => {
      if (JSON.stringify(prev.hiddenLines) === JSON.stringify(newHiddenLines)) {
        return prev;
      }
      return { ...prev, hiddenLines: newHiddenLines };
    });
  }, []);

  // rubric state & methods

  const [sections, setSections] = useState([
    {
      id: "section_1",
      title: "Styling Criteria",
      items: [
        {
          id: "item_1_1",
          name: "",
          maxPoints: 0,
          autograde: false,
        },
      ],
      isNameEditable: true,
      canAddItems: true,
      autograde: false, // This is for the section itself
    },
    {
      id: "section_2",
      title: "Requirements",
      items: [
        {
          id: "item_2_1",
          name: "",
          maxPoints: 0,
          autograde: true,
        },
      ],
      isNameEditable: true,
      canAddItems: true,
      autograde: true, // This is for the section itself
    },
  ]);
  const handleToggleSectionAutograde = (sectionId) => {
    console.log("toggling autograde for section:", sectionId);
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId
          ? { ...section, autograde: !section.autograde }
          : section
      )
    );
  };

  const handleAddItem = (sectionId) => {
    setSections((currentSections) =>
      currentSections.map((section) => {
        if (section.id === sectionId) {
          const newItem = {
            id: `item_${Date.now()}`,
            name: "",
            maxPoints: 5,
            autograde: false,
          };
          return { ...section, items: [...section.items, newItem] };
        }
        return section;
      })
    );
  };

  const handleDeleteItem = (sectionId, itemId) => {
    setSections((currentSections) =>
      currentSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          };
        }
        return section;
      })
    );
  };

  const handleItemChange = (sectionId, itemId, field, value) => {
    setSections((currentSections) =>
      currentSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, [field]: value } : item
            ),
          };
        }
        return section;
      })
    );
  };
  const languages = [
    { key: "python", name: "Python" },
    { key: "java", name: "Java" },
    { key: "cpp", name: "C++" },
    { key: "c", name: "C" },
    { key: "javascript", name: "Javascript" },
  ];

  return (
    <div className=" bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]  text-zinc-100">
      <main className="mx-auto w-full p-4 pb-5 custom-scrollbar">
        {/* AI Assignment Generation (only show when not editing) */}
        {!isEdit && showAIPrompt && (
          <Card className="bg-zinc-800/40 p-6 w-full mb-8">
            <div className="text-center">
              <div className="mb-4">
                <Icon
                  icon="lucide:wand-sparkles"
                  className="text-4xl text-purple-400 mx-auto mb-2"
                />
                <h2 className="text-2xl font-semibold mb-2">
                  Create Assignment with AI
                </h2>
                <p className="text-zinc-400">
                  Describe the assignment you want to create and grab a cup of
                  coffee. We'll take care of the rest.
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                <Textarea
                  label="Assignment Description"
                  placeholder="Example: Create a binary search algorithm assignment for my CS201 class, due next Friday. Students should implement an efficient binary search function that handles edge cases and returns the index of the target element."
                  value={aiPrompt}
                  onValueChange={setAiPrompt}
                  variant="bordered"
                  minRows={4}
                  maxRows={8}
                  className="w-full"
                />

                <div className="flex justify-center gap-4">
                  <Select
                    label="Programming Language"
                    placeholder="Select language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    variant="bordered"
                    className="max-w-xs"
                  >
                    {languages.map((lang) => (
                      <SelectItem key={lang.key} value={lang.key}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="flat"
                    color="primary"
                    onPress={() => setShowAIPrompt(false)}
                    isDisabled={isGeneratingAssignment}
                  >
                    Create Manually
                  </Button>
                  <Button
                    color="secondary"
                    onPress={generateCompleteAssignment}
                    isLoading={isGeneratingAssignment}
                    isDisabled={!aiPrompt.trim()}
                  >
                    <Icon icon="lucide:wand-sparkles" className="mr-2" />
                    {isGeneratingAssignment
                      ? "Generating..."
                      : "Generate Assignment"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Regular form (show when not in AI mode or when editing) */}
        {(isEdit || !showAIPrompt) && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Assignment  Card */}
            <Card className="bg-zinc-800/40 p-6 w-full">
              <h2 className="mb-6 text-xl font-semibold">Assignment Details</h2>
              <div className="grid  gap-6 lg:grid-cols-2">
                <Input
                  isRequired
                  label="Assignment Title"
                  placeholder="Enter assignment title"
                  value={formData.title}
                  variant="bordered"
                  onValueChange={(value) => handleFormChange("title", value)}
                />
                <div className="flex  gap-4 ">
                  <div className="flex-1">
                    <DatePicker
                      isRequired
                      hideTimeZone
                      showMonthAndYearPickers
                      label="Open Assignment at"
                      variant="bordered"
                      granularity="minute"
                      value={startDate}
                      onChange={handleStartDateChange}
                      isInvalid={!!dateErrors.startDate}
                      errorMessage={dateErrors.startDate}
                    />
                  </div>
                  <div className="flex-1">
                    <DatePicker
                      hideTimeZone
                      isRequired
                      showMonthAndYearPickers
                      label="Close Assignment at"
                      variant="bordered"
                      granularity="minute"
                      value={dueDate}
                      onChange={handleDueDateChange}
                      isInvalid={!!dateErrors.dueDate}
                      errorMessage={dateErrors.dueDate}
                    />
                  </div>
                </div>

                <RichTextEditor
                  className="md:col-span-2 bg-zinc-200 max-h-[400px]"
                  isRequired
                  editorRef={descriptionRef}
                />

                <Select
                  isRequired
                  className="md:col-span-2 "
                  variant="bordered"
                  label="Class"
                  placeholder="Select a class"
                  selectedKeys={
                    formData.classId ? [String(formData.classId)] : []
                  }
                  onChange={(e) =>
                    handleClassChange(e.target.value, e.target.name)
                  }
                >
                  {classes &&
                    classes.length > 0 &&
                    classes.map((classInfo) => (
                      <SelectItem
                        key={classInfo.id}
                        value={classInfo.id}
                        name={classInfo.name}
                      >
                        {classInfo.name}
                      </SelectItem>
                    ))}
                </Select>
              </div>

              {/* Students */}

              {students && formData.classId && (
                <div className="mt-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-medium font-medium">Students</h3>
                        <Button
                          className="mb-3"
                          color="primary"
                          variant="flat"
                          onPress={handleSelectAllStudents}
                        >
                          {students.length ===
                          formData.selectedStudentIds?.length
                            ? "Unselect All"
                            : "Select All"}
                        </Button>
                      </div>
                      <ScrollShadow className="max-h-[200px]">
                        <div className="space-y-2">
                          {students && students.length > 0 ? (
                            students.map((student) => (
                              <div
                                key={student.student_id}
                                className="flex items-center justify-between rounded-medium border border-zinc-700 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    isSelected={formData.selectedStudentIds?.includes(
                                      student.student_id
                                    )}
                                    onValueChange={() =>
                                      handleToggleStudent(student.student_id)
                                    }
                                  />
                                  <div>
                                    <div className="font-medium">
                                      {student.full_name}
                                    </div>
                                    <div className="text-small text-zinc-400">
                                      {student.student_email || "No email"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-small text-red-400 w-full flex justify-center">
                              This class has no students. Please add students in
                              the classroom page.
                            </div>
                          )}
                        </div>
                      </ScrollShadow>

                      {classes.length === 0 && (
                        <div className="mt-2 text-small text-zinc-400">
                          {/* Number of selected students of total (total is second) */}
                          {formData.selectedStudentIds.length} of{" "}
                          {students.length || "0"} selected
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Code Template and Settings Split Screen */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              {/* Code Template Section - 60% width */}
              <Card className="col-span-1 xl:col-span-3 bg-zinc-800/40 ">
                <div className=" flex items-center justify-between px-6 pt-6">
                  <h2 className="text-xl font-semibold">Code Template</h2>
                  <div className="flex items-center gap-2 ">
                    <Select
                      placeholder="Select a language"
                      className="min-w-[120px]"
                      defaultSelectedKeys={["java"]}
                      value={selectedLanguage}
                      isRequired={true}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      {languages.map((lang) => (
                        <SelectItem key={lang.key} value={lang.key}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </Select>

                    <Button
                      variant="flat"
                      color="primary"
                      className="min-w-[100px] "
                      onPress={triggerFileUpload}
                    >
                      <Icon icon="lucide:upload" className="" />
                      Upload
                    </Button>
                    <Button
                      variant="flat"
                      color="secondary"
                      className="min-w-[130px] "
                      onPress={generateWithAI}
                      isDisabled={isGenerating}
                    >
                      <Icon icon="lucide:wand-sparkles" />
                      {isGenerating ? "Generating..." : "AI Generate"}
                    </Button>
                    <Button
                      variant="flat"
                      color="success"
                      className="min-w-[100px]"
                      onPress={runCode}
                      isDisabled={isRunning}
                    >
                      <Icon icon="lucide:play" />
                      {isRunning ? "Running..." : "Run"}
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".js,.py,.java,.ts,.cs,.cpp,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                <div className="w-full flex justify-between pr-6 items-end">
                  <Tabs
                    color="secondary"
                    size="lg"
                    variant="underlined"
                    defaultSelectedKey={1}
                    selectedKey={selectedFile}
                    onSelectionChange={setSelectedFile}
                    aria-label="Tabs sizes"
                  >
                    <Tab key={1} title="Student Template"></Tab>
                  </Tabs>
                  <div className="mb-4 text-sm text-zinc-400 flex items-center">
                    <Icon
                      icon="lucide:lock"
                      className="mr-2 text-base text-red-700"
                    />
                    <span>
                      {" "}
                      {/* It's also good practice to wrap your text in a span */}
                      Click on the line numbers to lock/unlock lines for
                      students.
                    </span>
                  </div>
                </div>
                <CodeEditor
                  classname="w-full"
                  language={selectedLanguage || "java"}
                  editorRef={editorRef}
                  role="teacher"
                  initialLockedLines={formData.lockedLines}
                  starterCode={"// this file will be visible to students."}
                  handleHiddenLinesChange={handleHiddenLinesChange}
                  handleLockedLinesChange={handleLockedLinesChange}
                />
                {output && (
                  <div className="mt-4 p-4 bg-black text-white rounded-lg">
                    <h3 className="text-sm text-zinc-400 mb-2">Output:</h3>
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
              </Card>

              {/* Assignment Settings & Test Cases - 40% width */}
              <Card className="col-span-1 xl:col-span-2 bg-zinc-800/40 p-6">
                <h2 className="mb-6 text-xl font-semibold">
                  Assignment Settings
                </h2>
                <Tabs color="default" variant="bordered">
                  {/* Test Cases Section */}
                  <Tab
                    key="photos"
                    title={
                      <div className="flex items-center space-x-1">
                        <FlaskConical size={15} />
                        <span>Test Cases</span>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Test Cases</h3>
                        <Button
                          color="secondary"
                          variant="flat"
                          size="sm"
                          onPress={generateTestCases}
                          isLoading={isGeneratingTestCases}
                          isDisabled={isGeneratingTestCases}
                        >
                          <Icon icon="lucide:wand-sparkles" className="mr-1" />
                          {isGeneratingTestCases
                            ? "Generating..."
                            : "Generate Tests"}
                        </Button>
                      </div>
                      <Testcase
                        testcases={testcases}
                        setTestcases={setTestcases}
                      />
                    </div>
                  </Tab>

                  <Tab
                    key="items"
                    title={
                      <div className="flex items-center space-x-1">
                        <MonitorCog size={15} />
                        <span>Settings</span>
                      </div>
                    }
                  >
                    <div className=" items-center">
                      <h3 className="text-lg font-medium">Grading Options</h3>
                      <p className="text-zinc-400">
                        Configure how this assignment will be graded.
                      </p>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <Checkbox
                          isSelected={formData.autoGrade}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              autoGrade: value,
                            }))
                          }
                        >
                          Auto-grade test cases
                        </Checkbox>
                        <Checkbox
                          isSelected={formData.checkStyle}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              checkStyle: value,
                            }))
                          }
                        >
                          Check for code style
                        </Checkbox>

                        <Checkbox
                          isSelected={formData.allowCopyPaste}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              allowCopyPaste: value,
                            }))
                          }
                        >
                          Allow copy & paste
                        </Checkbox>
                      </div>
                      <div className="w-full flex items-center justify-center">
                        <Divider className="w-4/5 justify-center" />
                      </div>
                      <div className="space-y-4 pt-2 overflow-y-auto max-h-[450px] custom-scrollbar">
                        <MiniRubric
                          sections={sections}
                          handleToggleSectionAutograde={
                            handleToggleSectionAutograde
                          }
                          handleAddItem={handleAddItem}
                          handleDeleteItem={handleDeleteItem}
                          handleItemChange={handleItemChange}
                        />
                      </div>
                    </div>
                  </Tab>

                  {/* Grading Options Section */}
                </Tabs>
              </Card>
            </div>

            {/* Submissions Section */}
            <Card className="bg-zinc-800/40 p-6">
              <h2 className="mb-6 text-xl font-semibold">Submissions</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-medium font-medium">
                      Submission Options
                    </h3>
                    <div className="space-y-2">
                      <Checkbox>Show test results immediately</Checkbox>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-medium font-medium">
                      Submission Limits
                    </h3>
                    <div className="space-y-4">
                      <Input
                        classNames={{
                          input: "bg-zinc-700",
                          inputWrapper: "bg-zinc-700",
                        }}
                        label="Maximum Attempts"
                        placeholder="Unlimited"
                        type="number"
                        min="0"
                        variant="bordered"
                      />
                      <div className="mt-6 flex flex-wrap gap-4">
                        <Checkbox
                          isSelected={formData.allowLateSubmission}
                          onValueChange={(value) =>
                            handleFormChange("allowLateSubmission", value)
                          }
                        >
                          Allow late submissions
                        </Checkbox>
                        <Tooltip content="Displays testcases results to students immediately after submission">
                          <Checkbox
                            isSelected={formData.showResults}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                showResults: value,
                              }))
                            }
                          >
                            Show results immediately
                          </Checkbox>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button size="lg" variant="flat" onPress={handlePreview}>
                See Preview
              </Button>

              <div className="flex gap-2">
                <Button size="lg" variant="flat">
                  Export
                </Button>
                <Button
                  color="primary"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  spinner={<Spinner />}
                >
                  {isSubmitting ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </div>
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            `}</style>
          </form>
        )}

        {showPreviewModal && assignmentPreviewData && (
          <AssignmentPreview
            assignment={assignmentPreviewData}
            onClose={() => setShowPreviewModal(false)}
          />
        )}
      </main>
    </div>
  );
}
