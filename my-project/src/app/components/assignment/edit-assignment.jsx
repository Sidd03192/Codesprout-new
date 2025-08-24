// ... existing imports ...
import { useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
const supabase = createClient();
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
export default function EditAssignmentPage({
  assignment_id,
  session,
  classes,
  setOpen,
}) {
  const [formData, setFormData] = React.useState({
    classId: "",
    className: "",
    title: "",
    description: "",

    selectedStudentIds: [],
    codeTemplate:
      "// Write your code template here\nfunction example() {\n  // This line can be locked\n  \n",
    dueDate: null,
    startDate: null,
    lockedLines: [],
    hiddenLines: [],
    allowLateSubmission: false,
    autoGrade: false,
    allowAutocomplete: false,
    showResults: false,
    allowCopyPaste: false,
    checkStyle: false,
  });

  const [selectedFile, setSelectedFile] = React.useState(1);
  const [selectedLanguage, setSelectedLanguage] = React.useState();
  const editorRef = React.useRef(null);
  const descriptionRef = useRef(null);
  const fileInputRef = React.useRef(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For submission loading state
  const [isLoading, setIsLoading] = React.useState(false);
  const [students, setStudents] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [assignmentPreviewData, setAssignmentPreviewData] =
    React.useState(null);
  const router = useRouter();
  const [testcases, setTestcases] = useState([]);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", assignment_id)
        .single();

      if (error || !data) {
        console.error("Error fetching assignment:", error);
        return;
      }

      if (editorRef.current?.setValue && data.code_template) {
        editorRef.current.setValue(data.code_template);
      }

      if (descriptionRef.current?.setContent && data.description) {
        descriptionRef.current.setContent(data.description);
      }

      setFormData((prev) => ({
        ...prev,
        classId: data.class_id?.toString() ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        codeTemplate: data.code_template ?? "",
        dueDate: data.due_at ? new Date(data.due_at) : null,
        startDate: data.open_at ? new Date(data.open_at) : null,
        lockedLines: data.locked_lines ?? [],
        hiddenLines: data.hidden_lines ?? [],
        allowLateSubmission: data.allow_late_submission ?? false,
        autoGrade: data.auto_grade ?? false,
        allowAutocomplete: data.allow_auto_complete ?? false,
        showResults: data.show_results ?? false,
        allowCopyPaste: data.allow_copy_paste ?? false,
        checkStyle: data.check_style ?? false,
        testcases: data.test_cases ?? [],
      }));

      setSelectedLanguage(data.language || "java");
      console.log("code", formData.codeTemplate);
      if (Array.isArray(data.test_cases)) {
        setTestcases(data.test_cases);
      }

      if (data.class_id) {
        const fetchedStudents = await fetchStudentsForClass(data.class_id);
        setStudents(fetchedStudents);
      }
    };

    fetchAssignmentData();
  }, [assignment_id]);

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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Form submitted:", formData);

    const code = editorRef.current.getValue();
    const description = descriptionRef.current.getJSON();
    const assignmentData = {
      class_id: formData.classId,
      teacher_id: session.user.id,
      title: formData.title,
      description: description,
      language: selectedLanguage,
      code_template: code,
      hints: "",
      open_at: startDate.toString(),
      due_at: dueDate.toString(),
      status: "inactive",
      test_cases: formData.testcases,
      locked_lines: formData.lockedLines,
      hidden_lines: formData.hiddenLines,
      allow_late_submission: formData.allowLateSubmission,
      allow_copy_paste: formData.allowCopyPaste,
      allow_auto_complete: formData.allowAutocomplete,
      auto_grade: formData.autoGrade,
      show_results: formData.showResults,
      check_style: formData.checkStyle,
    };

    try {
      const { error: updateError } = await supabase
        .from("assignments")
        .update(assignmentData)
        .eq("id", assignment_id); // Update the assignment by ID

      if (updateError) {
        console.error("Error updating assignment:", updateError);
        addToast({
          title: "Error",
          description: "Failed to update assignment.",
          color: "danger",
          duration: 5000,
          variant: "solid",
        });
        return;
      }

      addToast({
        title: "Updated Successfully",
        description: "Assignment was updated.",
        color: "success",
        duration: 5000,
        placement: "top-center",
        variant: "solid",
      });
    } catch (err) {
      console.error("Unexpected error during update:", err);
      alert(`An unexpected error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setOpen(false); // Close modal/page
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
        <form onSubmit={handleUpdate} className="space-y-8">
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
                <DatePicker
                  isRequired
                  hideTimeZone
                  showMonthAndYearPickers
                  label="Open Assignment at"
                  variant="bordered"
                  granularity="minute"
                  value={startDate}
                  onChange={setStartDate}
                />
                <DatePicker
                  hideTimeZone
                  isRequired
                  showMonthAndYearPickers
                  label="Close Assignment at"
                  variant="bordered"
                  granularity="minute"
                  value={dueDate}
                  onChange={setDueDate}
                />
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
                selectedKeys={formData.classId ? [formData.classId] : []}
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
                        {students.length === formData.selectedStudentIds.length
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
                                  isSelected={formData.selectedStudentIds.includes(
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
                  >
                    <Icon icon="lucide:wand-sparkles" /> AI Generate
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
                  <Tab key={2} title="Testing"></Tab>
                </Tabs>
                <div className="mb-4 text-sm text-zinc-400 flex items-center">
                  <Icon
                    icon="lucide:lock"
                    className="mr-2 text-base text-red-700"
                  />
                  <span>
                    {" "}
                    {/* It's also good practice to wrap your text in a span */}
                    Click on the line numbers to lock/unlock lines for students.
                  </span>
                </div>
              </div>
              {selectedFile == 1 && (
                <CodeEditor
                  classname="w-full"
                  height={"600px"}
                  language={selectedLanguage || "java"}
                  editorRef={editorRef}
                  initialValue={formData.codeTemplate}
                  role="teacher"
                  starterCode={
                    formData.codeTemplate ||
                    "// this file will be visible to students."
                  }
                  handleHiddenLinesChange={handleHiddenLinesChange}
                  handleLockedLinesChange={handleLockedLinesChange}
                />
              )}

              {selectedFile == 2 && (
                <CodeEditor
                  classname="w-full"
                  height={"600px"}
                  language={selectedLanguage || "java"}
                  editorRef={editorRef}
                  role="student"
                  starterCode={
                    "// this file can be used to write test cases for students."
                  }
                />
              )}

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
                  {" "}
                  <Testcase testcases={testcases} setTestcases={setTestcases} />
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Grading Options</h3>
                    <p className="text-zinc-400">
                      Configure how this assignment will be graded.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Checkbox
                        value={formData.autoGrade}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, autoGrade: value }))
                        }
                      >
                        Auto-grade test cases
                      </Checkbox>
                      <Checkbox
                        value={formData.checkStyle}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            checkStyle: value,
                          }))
                        }
                      >
                        Check for code style
                      </Checkbox>

                      <Tooltip
                        className="max-w-[300px]"
                        content={
                          <div>
                            {"Includes class methods & variable names"}
                            <br />
                            {"(its harmless)"}
                          </div>
                        }
                      >
                        <Checkbox
                          value={formData.allowAutocomplete}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              allowAutocomplete: value,
                            }))
                          }
                        >
                          Disable autocomplete
                        </Checkbox>
                      </Tooltip>
                      <Checkbox
                        value={formData.allowCopyPaste}
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

                    <div className="space-y-4 pt-4">
                      <Input
                        classNames={{
                          input: "bg-zinc-700",
                          inputWrapper: "bg-zinc-700",
                        }}
                        label="Points per test case"
                        placeholder="10"
                        type="number"
                        min="0"
                        variant="bordered"
                      />
                      <Input
                        classNames={{
                          input: "bg-zinc-700",
                          inputWrapper: "bg-zinc-700",
                        }}
                        label="Style points"
                        placeholder="5"
                        type="number"
                        min="0"
                        variant="bordered"
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
                {isSubmitting ? "Saving..." : "Save Changes"}
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
