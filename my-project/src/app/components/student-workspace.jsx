"use client";
import React, {
  useState,
  useRef,
  useCallback,
  act,
  useMemo,
  useEffect,
} from "react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Placeholder } from "@tiptap/extensions";
import { all, createLowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Countdown from "react-countdown";

import Heading from "@tiptap/extension-heading";
import {
  Play,
  RotateCcw,
  Settings,
  ChevronRight,
  GripVertical,
  CloudUpload,
  Save,
  Bubbles,
} from "lucide-react";
import {
  Button,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
  Spinner,
  Skeleton,
  addToast,
  code,
} from "@heroui/react";
import { createClient } from "../../../utils/supabase/client";
import { executeCode } from "./editor/api";
import "./assignment/RichText/editor-styles.css"; // Import highlight.js theme
import { Results } from "./results";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import CodeEditor from "./editor/code-editor";

export const CodingInterface = ({
  id,
  isPreview,
  previewData,
  role,
  submissionData,
  assignmentData,
  onSaveAssignment,
  rubric,
}) => {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("Description");
  const [dueDate, setDueDate] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(45);
  const [topHeight, setTopHeight] = useState(65);
  const [time, setTime] = useState("-");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialCode, setInitialCode] = useState("");
  const [timeUp, setTimeUp] = useState(false);
  const [realtimeSubmissionData, setRealtimeSubmissionData] =
    useState(submissionData);

  useEffect(() => {
    const currentData = isPreview ? previewData : assignmentData;
    if (currentData?.due_at) {
      setDueDate(new Date(currentData.due_at));
      console.log("Due date:", currentData.due_at);
    }
  }, [assignmentData?.due_at, previewData?.due_at, isPreview]);

  // Real-time subscription for grading updates
  useEffect(() => {
    if (isPreview || role === "teacher" || !id) return;

    let cleanup = null;

    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("No authenticated user found for real-time subscription");
          return;
        }

        console.log(
          "Setting up real-time subscription for assignment:",
          id,
          "user:",
          user.id
        );

        const channel = supabase
          .channel(`assignment-${id}-student-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "assignment_students",
              filter: `student_id=eq.${user.id} AND assignment_id=eq.${id}`,
            },
            (payload) => {
              console.log("Real-time grading update received:", payload);
              if (payload.new?.grading_data) {
                setRealtimeSubmissionData((prev) => ({
                  ...prev,
                  grading_data: payload.new.grading_data,
                  status: payload.new.status,
                  last_updated: new Date().toISOString(),
                }));
                // Auto-switch to results tab when grading is complete
                if (
                  payload.new.status === "submitted" &&
                  payload.new.grading_data
                ) {
                  setActiveTab("results");
                }
              }
            }
          )
          .subscribe((status) => {
            console.log("Subscription status:", status);
            if (status === "SUBSCRIBED") {
              console.log("Successfully subscribed to real-time updates");
            } else if (status === "CLOSED") {
              console.log("Real-time subscription closed");
            } else if (status === "CHANNEL_ERROR") {
              console.error("Real-time subscription error");
            }
          });

        cleanup = () => {
          console.log("Cleaning up real-time subscription");
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up real-time subscription:", error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [id, isPreview, role, supabase]);

  // Initialize component with passed data
  useEffect(() => {
    const dataToUse = isPreview ? previewData : assignmentData;

    if (!dataToUse) {
      console.log(
        isPreview ? "No preview data provided" : "No assignment data provided"
      );
      return;
    }

    // Set initial code from submission or template
    const codeToUse =
      submissionData?.submitted_code || dataToUse.code_template || "";
    setInitialCode(codeToUse);

    // Check if assignment is past due (only for non-preview mode)
    if (!isPreview && dataToUse.due_at) {
      const due_time = new Date(dataToUse.due_at).getTime();
      if (due_time < Date.now()) {
        setTimeUp(true);
        setActiveTab("results");
      }
    }

    // Set default tab based on submission status
    if (submissionData?.status === "submitted") {
      setActiveTab("results");
    }

    console.log(
      isPreview
        ? "Preview data initialized"
        : "Assignment data initialized from props"
    );
  }, [assignmentData, submissionData, isPreview, previewData]);

  // Auto-save functionality
  useEffect(() => {
    if (isPreview || role === "teacher" || !id || !assignmentData) return;
    if (typeof window === "undefined") return; // Browser check

    const autoSaveKey = `autosave_${id}`;

    // Function to auto-save code
    const autoSaveCode = () => {
      if (!editorRef.current || typeof window === "undefined") return;

      const currentCode = editorRef.current.getValue();
      if (currentCode && currentCode !== initialCode) {
        try {
          const autoSaveData = {
            code: currentCode,
            timestamp: Date.now(),
            assignmentId: id,
          };
          localStorage.setItem(autoSaveKey, JSON.stringify(autoSaveData));
          console.log("Auto-saved code for assignment:", id);
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    };

    // Set up auto-save interval (every 30 seconds)
    const autoSaveInterval = setInterval(autoSaveCode, 30000);

    // Check for existing auto-saved code on mount
    const checkAutoSavedCode = () => {
      if (typeof window === "undefined") return;

      try {
        const saved = localStorage.getItem(autoSaveKey);
        if (saved) {
          const { code, timestamp } = JSON.parse(saved);

          // Check if auto-save is recent (within 24 hours)
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          if (Date.now() - timestamp < maxAge && code !== initialCode) {
            // Ask user if they want to restore auto-saved code
            const shouldRestore = window.confirm(
              "We found unsaved changes from your previous session. Would you like to restore them?"
            );

            if (shouldRestore && editorRef.current) {
              editorRef.current.setValue(code);
              console.log("Restored auto-saved code");
            }
          } else {
            // Remove old auto-save data
            localStorage.removeItem(autoSaveKey);
          }
        }
      } catch (error) {
        console.error("Error checking auto-saved code:", error);
      }
    };

    // Check for auto-saved code after a short delay to ensure editor is ready
    const checkTimeout = setTimeout(checkAutoSavedCode, 1000);

    // Cleanup function
    return () => {
      clearInterval(autoSaveInterval);
      clearTimeout(checkTimeout);

      // Auto-save on unmount
      autoSaveCode();
    };
  }, [id, assignmentData, initialCode, isPreview, role]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    if (!file.name.endsWith(".zip")) {
      reader.onload = (e) => {
        editorRef.current?.setValue(e.target.result);
      };
      reader.readAsText(file);
    } else {
      const zip = new JSZip();
      reader.onload = async (e) => {
        try {
          const zipContent = await zip.loadAsync(e.target.result);
          const firstCodeFile = Object.keys(zipContent.files).find((filename) =>
            /\.(java|py|txt|js|cpp)$/i.test(filename)
          );

          if (!firstCodeFile) {
            alert("No code file found in the ZIP.");
            return;
          }

          const code = await zipContent.files[firstCodeFile].async("text");
          editorRef.current?.setValue(code);
        } catch (err) {
          console.error("Error reading ZIP:", err);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    event.target.value = null;
  };

  const saveAssignmentData = async (isSubmit) => {
    if (isPreview || role == "teacher") {
      console.warn("Preview mode, skipping save/submit.");
      return;
    }

    if (!onSaveAssignment) {
      console.error("No save handler provided");
      return;
    }

    const submit = isSubmit || false;
    const currentData = isPreview ? previewData : assignmentData;
    const due_time = new Date(currentData?.due_at).getTime();
    if (Date.now() - 60 * 300 > due_time || !currentData) {
      console.warn("Assignment is past due, cannot submit."); // one minute buffer
      setSaving(false);
      return;
    }

    if (isSubmit) {
      setIsSubmitting(true);
    } else {
      setSaving(true);
    }

    const student_code =
      editorRef?.current?.getValue() || currentData?.code_template || "";

    try {
      const data = await onSaveAssignment(student_code, submit);
      if (data === "success") {
        if (submit) {
          console.log("Assignment data submitted successfully");
          setActiveTab("results");
          addToast({
            title: "Assignment Submitted",
            description: "Your assignment has been submitted successfully.",
            status: "success",
            color: "success",
            variant: "bordered",
            duration: 3000,
          });
        } else {
          console.log("Assignment data saved successfully");
          addToast({
            title: "Assignment Saved",
            description: "Your assignment progress has been saved.",
            status: "success",
            color: "success",
            variant: "bordered",
            duration: 3000,
          });
        }
      } else {
        throw new Error(
          submit ? "Failed to submit assignment" : "Failed to save assignment"
        );
      }
    } catch (error) {
      console.error("Save/submit error:", error);
      if (submit) {
        addToast({
          title: "Submission Failed",
          description: "There was an error submitting your assignment.",
          status: "error",
          duration: 3000,
          color: "danger",
          variant: "bordered",
        });
      } else {
        addToast({
          title: "Save Failed",
          description: "There was an error saving your assignment progress.",
          status: "error",
          duration: 3000,
          color: "danger",
          variant: "bordered",
        });
      }
    } finally {
      setIsSubmitting(false);
      setSaving(false);
      if (isSubmit) {
        onClose();
      }
    }
  };

  const editorRef = React.useRef(null);

  const isDragging = useRef(false);
  const dragType = useRef("");

  const handleMouseDown = useCallback(
    (type) => (e) => {
      isDragging.current = true;
      dragType.current = type;
      e.preventDefault();
    },
    []
  );
  const handleResetCode = () => {
    if (role == "teacher") return;
    if (initialCode) {
      editorRef.current?.setValue(initialCode);
    } else {
      addToast({
        title: "No initial code available",
        description:
          "There is no initial code to reset to. This may be an error",
        duration: 3000,
        color: "warning",
        variant: "flat",
      });
    }
  };
  const [output, setOutput] = useState(null);

  const runCode = async () => {
    const code = editorRef.current?.getValue?.();
    console.log("Running code..:", code);

    if (!code) {
      setOutput("Please select a language and write some code.");
      return;
    }

    try {
      // TODO edit teh selecedLanguage
      setIsRunning(true);
      const startTime = performance.now();
      const result = await executeCode("java", code);
      const endTime = performance.now();

      const runResult = result.run || {};
      if (!runResult.stderr) {
        setTime((endTime - startTime).toFixed(2));
      }
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

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;

    if (dragType.current === "vertical") {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 25 && newWidth < 75) {
        setLeftWidth(newWidth);
      }
    } else if (dragType.current === "horizontal") {
      const rightPanel = document.querySelector(".right-panel");
      const rect = rightPanel.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      if (newHeight > 30 && newHeight < 85) {
        setTopHeight(newHeight);
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    dragType.current = "";
  }, []);

  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const lowlight = createLowlight(all); // You can also use `common` or individual
  lowlight.register("javascript", js);
  const extensions = [
    StarterKit.configure({
      bulletList: false,
      codeBlock: false,
      heading: false,
    }),
    Placeholder.configure({
      placeholder: "Enter assignment guidelines",
      showOnlyCurrent: true,
      HTMLAttributes: {
        class: "text-default-400 bg-red-500 italic",
      },
    }),

    // Inline formatting
    Underline,
    Superscript,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline cursor-pointer",
      },
    }),

    // Images (base64 allowed)
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: "rounded-md max-w-full",
      },
    }),

    // Bullet list (we disabled it above, so re‐enable with custom styles)
    BulletList.configure({
      HTMLAttributes: {
        class: "list-disc pl-6",
      },
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: "my-2 ",
      },
    }),

    // Code block with syntax highlighting
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "javascript",
      languageClassPrefix: "language-",
      HTMLAttributes: {
        class:
          "bg-gray-900 rounded-md p-4 my-2 font-mono text-sm overflow-x-auto",
      },
    }),

    Heading.configure({
      levels: [1, 2],
      HTMLAttributes: {
        class: "prose prose-slate dark:prose-invert my-4",
      },
    }),
    TextStyle,
    Color.configure({
      types: ["textStyle"],
    }),
  ];
  const convertJsonToHtml = (content) => {
    if (!content) {
      return "";
    }

    // If it's already a string (HTML), return as-is
    if (typeof content === 'string') {
      return content;
    }

    // If it's a JSON object, convert using TipTap's generateHTML
    try {
      return generateHTML(content, extensions);
    } catch (error) {
      console.error('Error converting JSON to HTML:', error);
      // Fallback to empty string or the content as string if conversion fails
      return typeof content === 'object' ? "" : String(content);
    }
  };

  const currentData = isPreview ? previewData : assignmentData;
  const descriptionHtml = convertJsonToHtml(currentData?.description);

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (
        <span className="text-red-500 font-bold">Assignment is past due.</span>
      );
    } else {
      const isUrgent =
        days === 0 && hours === 0 && minutes < 5
          ? "text-red-500 font-bold animate-pulse" // Urgent state styles
          : ""; // Normal state styles

      const pad = (num) => num.toString().padStart(2, "0");
      return (
        <>
          {" "}
          <span className={isUrgent}>
            {days > 0 && `${days}d `}
            {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
          </span>
        </>
      );
    }
  };

  return (
    <div>
      <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] p-4 flex gap-2">
        {/* Left Panel - Problem Description */}
        <Card
          className="backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl flex flex-col overflow-hidden bg-zinc-800/40"
          style={{ width: `${leftWidth}%` }}
        >
          {!(isPreview ? previewData : assignmentData) ? (
            <div className="flex items-center justify-center h-full">
              <Spinner color="secondary" />
            </div>
          ) : (
            // FIX #1: This wrapper div must become a flex container that fills the card.
            <div className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-0 pt-4 px-2 border-b border-white/10 bg-black/20 min-h-[50px]">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  aria-label="Problem Sections"
                  color="secondary"
                  variant="underlined"
                  className="font-medium"
                >
                  <Tab key={"Description"} title={"Description"} />
                  <Tab key={"results"} title={"Results & Submissions"} />
                </Tabs>
              </CardHeader>

              {/* Problem Content */}
              {activeTab === "Description" && (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="space-y-8">
                    {/* Title and Difficulty */}
                    <div className="space-y-4">
                      <h1 className="text-3xl font-bold text-white">
                        {currentData?.title || "Assignment Title"}
                      </h1>
                      <div className="flex items-center gap-3"></div>
                    </div>

                    {/* The content that will overflow and cause scrolling */}
                    <div className="space-y-4">
                      <div
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "results" && (
                <div className="w-full h-full flex  max-h-full ">
                  <div className="  w-full   max-h-full bg-transparent">
                    {role === "teacher" && (
                      <Results
                        id={currentData?.id}
                        editorRef={editorRef}
                        rubric={rubric}
                        role={role}
                      />
                    )}

                    {role === "student" &&
                      (realtimeSubmissionData?.grading_data ? (
                        <Results
                          id={currentData?.id}
                          editorRef={editorRef}
                          rubric={currentData?.rubric}
                          gradingData={realtimeSubmissionData?.grading_data}
                          role={role}
                        />
                      ) : (
                        <div className="flex flex-col gap-5 justify-center items-center h-full">
                          <Bubbles size={200} className="text-gray-400" />
                          <p className="text-gray-400">
                            {realtimeSubmissionData?.status === "submitted"
                              ? "Your assignment is being graded... Please wait."
                              : "Relaxxx.... No grades or results available yet."}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
        {/* Vertical Resize Handle */}
        <div
          className="w-1.5 bg-white/10 hover:bg-purple-500/50 active:bg-purple-500/50 cursor-col-resize rounded-full transition-colors duration-200 flex items-center justify-center group"
          onMouseDown={handleMouseDown("vertical")}
        >
          <GripVertical
            size={16}
            className="text-white/30 group-hover:text-blue-400/70 transition-colors"
          />
        </div>

        {/* Right Panel - Code Editor and Console */}
        <Card
          className="backdrop-blur-sm rounded-lg border border-white/10 shadow-2xl flex flex-col overflow-hidden right-panel bg-zinc-800/50 "
          style={{ width: `${100 - leftWidth - 1}%` }}
        >
          {/* Code Editor Section */}
          <div style={{ height: "100%" }} className="flex flex-col">
            {/* Code Editor Header */}
            <CardHeader className="flex items-center justify-between  py-2 px-6 border-b border-white/10 bg-black/20  h-14">
              <Select
                defaultSelectedKeys={[`${currentData?.language || "java"}`]}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-gray-800/60 text-white w-36 rounded-lg  "
                size="sm"
                isDisabled
              >
                <SelectItem key={"python"}>🐍 Python</SelectItem>
                <SelectItem key={"java"}>☕ Java</SelectItem>
              </Select>
              <div className="text-sm text-gray-400 font-semibold bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30">
                <span>⏰</span>

                {dueDate &&
                  (timeUp ? (
                    <span className="text-red-500 font-bold">
                      Assignment is past due
                    </span>
                  ) : (
                    <Countdown
                      date={dueDate}
                      renderer={countdownRenderer}
                      onComplete={() => {
                        saveAssignmentData(true);
                        setTimeUp(true);
                      }}
                    />
                  ))}
              </div>

              <div className="flex items-center gap-2">
                <Tooltip content="Reset Code" color="danger">
                  <Button
                    onPress={handleResetCode}
                    isIconOnly
                    variant="light"
                    className=" hover:bg-white/10 rounded-xl transition-all duration-200 group"
                    size="sm"
                  >
                    <RotateCcw
                      size={16}
                      className="text-gray-400 group-hover:text-white"
                    />
                  </Button>
                </Tooltip>

                <Button
                  isIconOnly
                  variant="light"
                  className=" hover:bg-white/10 rounded-xl transition-all duration-200 group"
                  size="sm"
                >
                  <Settings
                    size={16}
                    className="text-gray-400 group-hover:text-white"
                  />
                </Button>
              </div>
            </CardHeader>

            {/* Code Editor */}

            {!(isPreview ? previewData : assignmentData) ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : (
              <div className="flex-1 bg-black/30  custom-scrollbar overflow-auto">
                <CodeEditor
                  language={selectedLanguage || "java"}
                  editorRef={editorRef}
                  role="student"
                  // TODO : make this dynamic
                  disableMenu={true}
                  starterCode={currentData?.code_template || ""}
                  initialLockedLines={new Set([])}
                  isDisabled={timeUp}
                />
              </div>
            )}
          </div>
          {/* Console Section */}

          <div className="absolute z-49 w-full items-center justify-center flex  max-h-[250px]">
            <div className="fixed bottom-4 w-[97%] z-50 rounded-xl border border-divider bg-neutral-900/80 backdrop-blur-sm shadow-2xl ">
              {/* --- Console Content Area --- */}
              <div className="p-4 min-h-[200px]">
                {output ? (
                  <div className="text-sm font-mono text-white/80 whitespace-pre-wrap">
                    <span className="text-cyan-400">~ %</span> {output}
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">
                    Click "Run" to see your code's output.
                  </div>
                )}
              </div>

              {/* --- Floating Time Display (Bottom Left) --- */}
              <div className="absolute bottom-4 left-4 flex items-center text-sm text-gray-300 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                ⏱️ {time}
              </div>

              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <Button
                  onPress={runCode}
                  isDisabled={isRunning}
                  size="md"
                  radius="sm"
                  startContent={
                    isRunning ? (
                      <Spinner color="default" size="sm" />
                    ) : (
                      <Play size={16} />
                    )
                  }
                  color="secondary"
                  variant="faded"
                >
                  Run
                </Button>
                <Button
                  color="primary"
                  variant="faded"
                  size="md"
                  radius="sm"
                  onPress={() => saveAssignmentData(false)}
                  isDisabled={isSubmitting || saving || timeUp || isPreview}
                  startContent={
                    saving ? (
                      <Spinner size="sm" color="default" />
                    ) : (
                      <Save size={16} />
                    )
                  }
                >
                  Save
                </Button>
                <Button
                  onPress={onOpen}
                  isDisabled={isSubmitting || timeUp || isPreview}
                  size="md"
                  radius="sm"
                  startContent={
                    isSubmitting ? (
                      <Spinner color="default" size="sm" />
                    ) : (
                      <CloudUpload size={16} />
                    )
                  }
                  color="success"
                  variant="faded"
                >
                  Submit
                </Button>
              </div>

              {/* --- Hidden file input and Modal (no layout changes needed) --- */}
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                accept=".java,.py,.txt,.js,.cpp,.jsx,.zip"
                onChange={handleFileUpload}
              />
              <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Submit Assignment
                      </ModalHeader>
                      <ModalBody>
                        {isSubmitting ? (
                          <p>
                            Your assignment is being submitted. Please do not
                            close this window.
                          </p>
                        ) : (
                          <p>
                            Are you sure you want to submit this assignment?
                            This action cannot be undone.
                          </p>
                        )}
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                        <Button
                          color="success"
                          onPress={() => saveAssignmentData(true)}
                          isDisabled={isSubmitting || timeUp || isPreview}
                        >
                          {isSubmitting ? <Spinner size="sm" /> : "Yes, Submit"}
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
