"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "../../../utils/supabase/client";
import { Rubric } from "./assignment/rubric";
const supabase = createClient();
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  ScrollShadow,
  Spinner,
  Textarea,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  addToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Avatar,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  fetchStudentsForAssignment,
  fetchTestcasesForAssignment,
  updateGrade,
} from "../dashboard/api";
import {
  ArrowRight,
  Save,
  ArrowLeft,
  SquareChartGantt,
  Clock,
  ListCheck,
  MessageSquare,
} from "lucide-react";
import { fetchGradingData } from "../student-dashboard/api";
// --- Helper Components & Icons ---

const CodeBlock = ({ content, language = "text", className = "" }) => {
  const formatContent = (value) => {
    if (value === null || value === undefined) return String(value);
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <pre
      className={`bg-zinc-800  rounded-2xl p-4 text-sm  overflow-x-auto ${className}`}
    >
      <code className={`language-javascript `}>{formatContent(content)}</code>
    </pre>
  );
};

const ScoreCard = ({ score, total, date }) => {
  const percentage = score / total;
  const percentageText = Math.round(percentage * 100);
  const ringRef = useRef(null);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate the ring on load
    const offset = circumference - percentage * circumference;
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = offset;
    }

    // Trigger confetti for good scores
    // if (percentage >= 0.75) {
    //   setTimeout(() => {
    //     confetti({
    //       particleCount: 150,
    //       spread: 90,
    //       origin: { y: 0.6 },
    //     });
    //   }, 1000);
    // }
  }, [score, total, percentage, circumference]);

  return (
    <div className=" flex m-3 gap-6 p-6 items-center justify-between  border border-divider rounded-2xl">
      <div className="items-center max-w-[60%] ">
        <h1 className="text-4xl font-bold text-white ">
          Your Submission Results
        </h1>
        <div className="flex w-full items-center justify-start  gap-2">
          <p className="flex text-xs mt-2 ml-1 text-gray-400 items-center gap-1">
            {" "}
            <Clock size={16} /> Graded on: {date}
          </p>
        </div>
      </div>
      <div className="text-center flex flex-col items-center">
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-slate-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              ref={ringRef}
              className="text-emerald-500"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                transition:
                  "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                strokeDasharray: `${circumference} ${circumference}`,
                strokeDashoffset: circumference,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {percentageText}%
            </span>
            <span className="text-slate-400 text-lg">
              {score} / {total}
            </span>
          </div>
        </div>
        {/* <h2 className="text-2xl font-bold text-emerald-400">Great Job!</h2>
        <p className="text-slate-400 mt-1">You passed with a solid score.</p> */}
      </div>
    </div>
  );
};

// --- Reusable Accordion Section ---
const AccordionSection = ({ title, items, onPointsChange, viewMode }) => {
  if (!items || items.length === 0) {
    return null; // Don't render the section if there are no items
  }

  return (
    <Accordion className="mb-4">
      <AccordionItem
        className="border border-divider rounded-2xl px-3"
        startContent={
          <Icon icon="lucide-list" className="text-xl text-secondary " />
        }
        title={<h3 className="text-lg font-semibold ">{title}</h3>}
      >
        {items.map((item, index) => (
          <Accordion
            isCompact
            key={item.name || index}
            className="border border-divider rounded-lg overflow-hidden mb-2"
          >
            <AccordionItem
              hideIndicator={title !== "Test Cases"}
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {item.status === "passed" ||
                      (item.passed && (
                        <Icon
                          icon="lucide-check"
                          color="green"
                          className="text-xl"
                        />
                      ))}
                    {item.status === "failed" && (
                      <Icon icon="lucide-x" color="red" className="text-xl" />
                    )}
                    {item.status === "errored" && (
                      <Icon
                        icon="lucide-triangle-alert"
                        color="yellow"
                        className="text-xl"
                      />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {viewMode === "teacher" ? (
                      <div className="flex items-center gap-2 text-sm min-w-fit">
                        <input
                          type="number"
                          max={item.maxPoints}
                          value={item.pointsAchieved}
                          onChange={(e) =>
                            onPointsChange(index, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="bg-zinc-700/60 border-[.5px] border-zinc-600 rounded-xl max-w-12 p-1 text-center font-semibold focus:border-default"
                        />
                        <span className="text-gray-400">
                          / {item.maxPoints} pts
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">
                        {item.points || item.pointsAchieved} / {item.maxPoints}{" "}
                        pts
                      </span>
                    )}
                  </div>
                </div>
              }
            >
              {title === "Test Cases" &&
                (item.status === "failed" || item.status === "errored") && (
                  <div className="p-4">
                    <h4 className="font-semibold text-red-300 mb-2">
                      {item.status === "errored"
                        ? "Error Log"
                        : "Failure Details"}
                    </h4>
                    <CodeBlock
                      content={item.message || "No details available."}
                    />
                  </div>
                )}
            </AccordionItem>
          </Accordion>
        ))}
      </AccordionItem>
    </Accordion>
  );
};

const GradingResults = ({
  grading_data,
  viewMode,
  student,
  rubricData,
  setChangedSubmissionIds,
  handleSaveSession,
  nextStudent,
  onOpen,
  onStudentUpdate, // Changed prop name from onStudentUpdate to setSelected
}) => {
  grading_data = viewMode === "teacher" ? student?.grading_data : grading_data;

  if (!grading_data)
    return (
      <div className="h-full w-full text-center mt-4">
        No Student have submitted this assignment.
      </div>
    );
  const [feedback, setFeedback] = useState("");
  const [overallOverrideScore, setOverallOverrideScore] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [stylingResults, setStylingResults] = useState([]);
  const [requirementsResults, setRequirementsResults] = useState([]);

  useEffect(() => {
    if (!grading_data || !rubricData) {
      console.log("missing data");
    }

    setFeedback(grading_data.teacherFeedback || "");
    setOverallOverrideScore(
      grading_data.gradeOverride != null
        ? String(grading_data.gradeOverride)
        : ""
    );

    const initialTestResults = (grading_data.testResults || []).map(
      (result) => {
        const rubricItem = (rubricData.testcases || []).find(
          (item) => item.name === result.name
        );
        return {
          ...result,
          maxPoints: rubricItem
            ? Number(rubricItem.maxPoints)
            : result.maxPoints,
        };
      }
    );
    setTestResults(initialTestResults);

    const initializeManualResults = (rubricItems, existingResults) => {
      if (!rubricItems) return existingResults || [];
      return rubricItems.map((item) => {
        const existing = (existingResults || []).find(
          (res) => res.name === item.name
        );
        return (
          existing || {
            name: item.name,
            maxPoints: item.maxPoints,
            pointsAchieved: 0,
            status: "ungraded",
          }
        );
      });
    };

    setStylingResults(
      initializeManualResults(
        rubricData.rubric?.[0]?.items,
        grading_data.stylingResults
      )
    );
    setRequirementsResults(
      initializeManualResults(
        rubricData.rubric?.[1]?.items,
        grading_data.requirementsResults
      )
    );
  }, [student, grading_data, rubricData]);

  const updateStudentGradingData = (updates) => {
    if (viewMode !== "teacher" || !student) return;

    const currentTestResults = updates.testResults || testResults;
    const currentStylingResults = updates.stylingResults || stylingResults;
    const currentRequirementsResults =
      updates.requirementsResults || requirementsResults;
    const currentFeedback =
      "teacherFeedback" in updates ? updates.teacherFeedback : feedback;
    const currentOverride =
      "gradeOverride" in updates ? updates.gradeOverride : overallOverrideScore;

    const calculatedTotalPoints = [
      ...currentTestResults,
      ...currentStylingResults,
      ...currentRequirementsResults,
    ].reduce((sum, item) => sum + (item.pointsAchieved || 0), 0);

    const gradeOverride =
      currentOverride !== "" && !isNaN(parseFloat(currentOverride))
        ? parseFloat(currentOverride)
        : null;

    const updatedGradingData = {
      ...student.grading_data,
      testResults: currentTestResults,
      stylingResults: currentStylingResults,
      requirementsResults: currentRequirementsResults,
      teacherFeedback: currentFeedback,
      gradeOverride,
      gradedAt: new Date().toISOString(),
      totalPointsAchieved: gradeOverride ?? calculatedTotalPoints,
    };

    const updatedStudent = {
      ...student,
      grading_data: updatedGradingData,
    };

    // Call the parent's state setter, which is now correctly named 'setSelected'
    onStudentUpdate(updatedStudent);

    setChangedSubmissionIds((prev) => new Set(prev).add(student.id));
  };

  const handlePointsChange = (sectionType, index, value) => {
    const numericValue = parseFloat(value);
    const updater = (prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? { ...item, pointsAchieved: isNaN(numericValue) ? 0 : numericValue }
          : item
      );

    let updates = {};
    if (sectionType === "styling") {
      const newStylingResults = updater(stylingResults);
      setStylingResults(newStylingResults);
      updates.stylingResults = newStylingResults;
    }
    if (sectionType === "requirements") {
      const newRequirementsResults = updater(requirementsResults);
      setRequirementsResults(newRequirementsResults);
      updates.requirementsResults = newRequirementsResults;
    }
    if (sectionType === "test") {
      const newTestResults = updater(testResults);
      setTestResults(newTestResults);
      updates.testResults = newTestResults;
    }

    updateStudentGradingData(updates);
  };

  const handleFeedbackChange = (newFeedback) => {
    setFeedback(newFeedback);
    updateStudentGradingData({ teacherFeedback: newFeedback });
  };

  const handleOverrideScoreChange = (newScore) => {
    setOverallOverrideScore(newScore);
    updateStudentGradingData({ gradeOverride: newScore });
  };

  const handleSave = () => {
    handleSaveSession();
  };

  const calculatedTotalPoints = useMemo(() => {
    return [
      ...(testResults || []),
      ...(stylingResults || []),
      ...(requirementsResults || []),
    ].reduce((acc, item) => acc + (item.pointsAchieved || 0), 0);
  }, [testResults, stylingResults, requirementsResults]);

  const maxTotalPoints = useMemo(() => {
    return [
      ...(testResults || []),
      ...(stylingResults || []),
      ...(requirementsResults || []),
    ].reduce((acc, item) => acc + (Number(item.maxPoints) || 0), 0);
  }, [testResults, stylingResults, requirementsResults]);

  const finalScore =
    overallOverrideScore !== "" && !isNaN(parseFloat(overallOverrideScore))
      ? parseFloat(overallOverrideScore)
      : calculatedTotalPoints;

  return (
    <div className="font-sans mx-auto">
      {viewMode == "student" && (
        <ScoreCard
          score={110}
          total={maxTotalPoints}
          date={new Date(grading_data?.gradedAt).toLocaleString()}
        />
      )}
      {viewMode === "teacher" && (
        <div className="p-6 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-100">
              {student?.name
                ? student?.name || +"'s Submission"
                : "Your Submission"}
            </h2>
            <p className="text-xs mt-1 ml-1 text-gray-400 mt-1 ml-1">
              Graded on: {new Date(grading_data?.gradedAt).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <div className="text-3xl font-bold">
                {viewMode === "teacher" ? (
                  <div className="flex items-baseline">
                    <input
                      type="number"
                      max={maxTotalPoints}
                      value={overallOverrideScore}
                      onChange={(e) =>
                        handleOverrideScoreChange(e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder={calculatedTotalPoints.toFixed(0)}
                      className="bg-zinc-700/60 border-[.5px] border-zinc-600 rounded-xl max-w-20 p-1 text-center font-semibold focus:border-default mr-2"
                    />
                    <span className="text-xl">/ {maxTotalPoints}</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold">
                    {finalScore.toFixed(2)}{" "}
                    <span className="text-xl">/ {maxTotalPoints}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6">
        {grading_data?.error && (
          <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-red-300">Compilation Error</h3>
            <CodeBlock content={grading_data.error} />
          </div>
        )}

        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="block text-center items-center flex gap-2 text-xl mb-1 font-semibold">
              <MessageSquare size={20} /> Feedback
            </h3>
            {viewMode === "teacher" && (
              <Button
                radius="sm"
                variant="flat"
                color="secondary"
                onPress={onOpen}
              >
                <SquareChartGantt size={16} /> Edit Rubric
              </Button>
            )}
          </div>
          <Textarea
            value={feedback || grading_data?.teacherFeedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            isReadOnly={viewMode === "student"}
            placeholder="Provide feedback..."
            variant="bordered"
            size="lg"
            className="w-full min-h-32 text-xl"
          />
        </div>

        <h3 className="text-xl w-full flex gap-2 items-center font-semibold mb-4 ">
          <ListCheck size={20} /> Grading Breakdown
        </h3>

        {/* <FeedbackPanel feedback={"some feedback"} code={"some code"} /> */}
        <AccordionSection
          title="Test Cases"
          items={testResults}
          onPointsChange={(index, value) =>
            handlePointsChange("test", index, value)
          }
          viewMode={viewMode}
        />
        <AccordionSection
          title="Styling"
          items={stylingResults}
          onPointsChange={(index, value) =>
            handlePointsChange("styling", index, value)
          }
          viewMode={viewMode}
        />
        <AccordionSection
          title="Requirements"
          items={requirementsResults}
          onPointsChange={(index, value) =>
            handlePointsChange("requirements", index, value)
          }
          viewMode={viewMode}
        />

        <div className="flex items-center justify-end py-5 mb-10">
          <div className="flex gap-2">
            {viewMode === "teacher" ? (
              <>
                <Button
                  variant="flat"
                  radius="sm"
                  color="primary"
                  onPress={handleSave}
                >
                  <Save size={16} />
                  Save Session
                </Button>
                <Button
                  variant="flat"
                  radius="sm"
                  color="secondary"
                  onPress={nextStudent}
                >
                  Next
                  <ArrowRight size={16} />
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentScrollSection = ({ students, selected, setSelected }) => {
  // This function scrolls the container left or right
  const getColor = (status) => {
    if (status == null) {
      return "default";
    }
    switch (
      status // need to hook this up based on the student_assignments table
    ) {
      case "graded":
        return "success";
      case "ungraded":
        return "default";
      case "current":
        return "secondary";
    }
  };
  const scrollContainerRef = React.useRef(null);
  const scroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollOffset,
        behavior: "smooth",
      });
    }
  };
  return (
    <div className="  bg-inherit ">
      <div className="flex bg-inherit items-center w-full max-w-4xl p-3 pb-0 px-0 mx-auto">
        {/* Left Arrow Button */}
        <Button
          isIconOnly
          onClick={() => scroll(-300)}
          className="bg-transparent"
        >
          <Icon icon={"lucide-chevron-left"} className="text-xl" />
        </Button>

        {/* Stretchy Middle Section */}
        <div className="flex-1 min-w-0">
          {" "}
          {/* This is the key fix */}
          <ScrollShadow
            ref={scrollContainerRef}
            orientation="horizontal"
            className="custom-scrollbar"
          >
            {/* The ref on this div was removed */}
            <div className="flex gap-4 p-2">
              {students?.map((student, index) => (
                <Button
                  onPress={() => setSelected(student)}
                  color={getColor(student.status)}
                  key={index}
                  className="flex-shrink-0 border-2 rounded-full"
                >
                  {student.name}
                </Button>
              ))}
            </div>
          </ScrollShadow>
        </div>

        {/* Right Arrow Button */}
        <Button
          isIconOnly
          onClick={() => scroll(300)}
          className="bg-transparent"
        >
          <Icon icon={"lucide-chevron-right"} className="text-xl" />
        </Button>
      </div>
      <div>
        <p className="text-sm text-gray-400 text-center w-full">
          Graded (9) of 18 students. 8 Did not submit.
        </p>
      </div>
      <Divider></Divider>
    </div>
  );
};
// --- Example Usage Wrapper ---
export const Results = ({ editorRef, role, rubric, id, gradingData }) => {
  const [grading_data, setGrading_data] = useState(gradingData);
  const [students, setStudents] = useState(rubric?.students || []);
  const testcases = rubric?.testcases || [];
  const [rubricData, setRubricData] = useState(rubric || []);
  const [selected, setSelected] = useState(students[0] || null);
  const [changedSubmitionIds, setChangedSubmitionIds] = useState(new Set());
  console.log(gradingData);
  console.log("students", rubric?.students);
  // Update grading_data when gradingData prop changes (for real-time updates)
  useEffect(() => {
    if (gradingData && gradingData !== grading_data) {
      setGrading_data(gradingData);
      console.log(
        "Real-time grading data updated in Results component:",
        gradingData
      );
    }
  }, [gradingData]);
  const handleStudentUpdate = (updatedStudent) => {
    // Update the master list of students
    setStudents((currentStudents) =>
      currentStudents.map((s) =>
        s.id === updatedStudent.id ? updatedStudent : s
      )
    );
    // Also update the currently selected student to ensure the UI is in sync
    setSelected(updatedStudent);
  };

  const [currentView, setCurrentView] = useState("grading");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const setNextSelected = () => {
    const currentIndex = students.findIndex(
      (student) => student.student_id === selected?.student_id
    );
    const nextIndex = (currentIndex + 1) % students.length;
    setSelected(students[nextIndex]);
  };
  useEffect(() => {
    if (!selected || currentView !== "grading") return;
    editorRef.current.setValue(
      selected?.submitted_code || "No code submitted yet"
    );
  }, [selected]);

  const handleSaveSession = async () => {
    const submissionsToUpdate = students.filter((student) =>
      changedSubmitionIds.has(student.id)
    );
    console.log("submitssions to update:", submissionsToUpdate);
    const result = await updateGrade(submissionsToUpdate, id);
    if (result.success) {
      console.log("successfully updated grades");
      addToast({
        title: "Updated Grades!",
        description: "You may safely exit this page.",
        status: "success",
        color: "success",
        variant: "bordered",
        duration: 3000,
      });
    } else {
      console.error("Error updating grades:", result.error);
      addToast({
        title: "Failed to Update Grades",
        description: "Please do not exit this page. Report this error",
        status: "danger",
        color: "danger",
        variant: "bordered",
        duration: 3000,
      });
    }
  };
  return (
    <div className=" pb-10 h-full overflow-auto  custom-scrollbar ">
      {currentView === "grading" && role === "teacher" && (
        <StudentScrollSection
          students={students}
          selected={selected}
          setSelected={setSelected}
        />
      )}
      {(selected && currentView === "grading" && rubricData) ||
      (role === "student" && rubricData && grading_data) ? (
        <GradingResults
          nextStudent={setNextSelected}
          student={selected}
          rubricData={rubricData}
          grading_data={grading_data} // This prop name seems inconsistent, might need review
          viewMode={role}
          setCurrentView={setCurrentView}
          onOpen={onOpen}
          onOpenChange={onOpenChange}
          setChangedSubmissionIds={setChangedSubmitionIds}
          handleSaveSession={handleSaveSession}
          onStudentUpdate={handleStudentUpdate} // Pass the new handler
        />
      ) : null}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Rubric Editor
              </ModalHeader>
              <ModalBody>
                <Rubric
                  testcases={testcases}
                  students={students}
                  rubric={rubricData.rubric}
                  setRubric={setRubricData}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
