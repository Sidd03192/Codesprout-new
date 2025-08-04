"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "../../../utils/supabase/client";
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
} from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  fetchStudentsForAssignment,
  fetchTestcasesForAssignment,
} from "../dashboard/api";
import { ArrowRight, Save, ArrowLeft } from "lucide-react";
import { Rubric } from "./assignment/rubric";
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

// --- Reusable Accordion Section ---
const AccordionSection = ({
  title,
  items,
  itemOverrides,
  onOverrideChange,
  viewMode,
  icon,
}) => {
  const [openItems, setOpenItems] = useState({});

  useEffect(() => {
    const initialOpenState = {};
    items.forEach((item, index) => {
      if (item.status === "failed" || item.status === "errored") {
        initialOpenState[index] = true;
      }
    });
    setOpenItems(initialOpenState);
  }, [items]);

  const toggleItem = (index) => {
    setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const sectionPoints = items.reduce(
    (acc, item, index) =>
      acc + (parseFloat(itemOverrides[index]) || item.pointsAchieved),
    0
  );
  const sectionMaxPoints = items.reduce((acc, item) => acc + item.maxPoints, 0);

  return (
    <Accordion className="mb-4">
      <AccordionItem
        className="border border-divider rounded-2xl px-3"
        startContent={
          <Icon icon="lucide-list" className="text-xl text-secondary " />
        }
        title={
          <>
            <h3 className="text-lg font-semibold ">{title}</h3>
          </>
        }
      >
        {items.map((item, index) => (
          <Accordion
            isCompact
            key={index}
            className="border border-divider  rounded-lg overflow-hidden mb-2"
          >
            <AccordionItem
              hideIndicator={title != "Test Cases"}
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.status === "passed" &&
                      item.pointsAchieved == item.maxPoints && (
                        <Icon
                          icon="lucide-check"
                          color="green"
                          className="text-xl"
                        ></Icon>
                      )}
                    {item.pointsAchieved > 0 &&
                      item.pointsAchieved < item.maxPoints && (
                        <Icon
                          icon="lucide-circle-alert"
                          color="yellow"
                          className="text-xl"
                        />
                      )}
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
                    <span className="font-medium ">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {viewMode === "teacher" ? (
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="number"
                          max={item.maxPoints}
                          value={itemOverrides[index] ?? item.pointsAchieved}
                          onChange={(e) =>
                            onOverrideChange(index, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="bg-zinc-700/60 border-[.5px] border-zinc-600 rounded-xl max-w-12 p-1 text-center font-semibold focus:border-default "
                        />
                        <span className="text-gray-400">
                          / {item.maxPoints} pts
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold">
                        {item.pointsAchieved} / {item.maxPoints} pts
                      </span>
                    )}
                  </div>{" "}
                </div>
              }
            >
              {title === "Test Cases" && (
                <div className="p-4 ">
                  {item.status === "errored" ? (
                    <div>
                      <h4 className="font-semibold text-red-300 mb-2">
                        Error Log
                      </h4>
                      <CodeBlock
                        content={item.message}
                        className="bg-red-900/40 border border-red-800"
                      />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold  mb-2">Expected Output</h4>
                        <CodeBlock
                          className="border border-default-700"
                          content={item.expected}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold  mb-2">
                          Your Output (Got)
                        </h4>
                        <CodeBlock
                          content={item.actual}
                          className={
                            item.status === "failed"
                              ? "border border-danger"
                              : "border border-success"
                          }
                        />
                      </div>
                      {item.status === "failed" && item.message && (
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-yellow-300 mb-2">
                            Failure Details
                          </h4>
                          <CodeBlock
                            content={item.message}
                            className="bg-yellow-900/40 border border-yellow-800"
                          />
                        </div>
                      )}
                    </div>
                  )}
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
  setCurrentView,
  nextStudent,
}) => {
  if (viewMode === "teacher") {
    if (!student) {
      console.error("No student selected for grading.");
    }
    grading_data = student?.grading_data;
  }
  const [feedback, setFeedback] = useState(grading_data?.teacherFeedback || "");
  const [overallOverrideScore, setOverallOverrideScore] = useState(
    grading_data.gradeOverride != null ? String(grading_data.gradeOverride) : ""
  );
  const [rubricContent, setRubricContent] = useState(grading_data.rubric || "");
  const [testPointOverrides, setTestPointOverrides] = useState({});
  const [stylingPointOverrides, setStylingPointOverrides] = useState({});
  const [reqPointOverrides, setReqPointOverrides] = useState({});

  const stylingResults = useMemo(() => {
    return (
      rubricData?.stylingCriteria?.map((item) => ({
        name: item.name,
        maxPoints: item.maxPoints,
        pointsAchieved: 0, // Default value
        status: "ungraded",
        message: "",
        expected: "",
        actual: "",
      })) || []
    );
  }, [rubricData, grading_data.stylingResults]);

  const requirementsResults = useMemo(() => {
    return (
      rubricData?.requirementsCriteria?.map((item) => ({
        name: item.name,
        maxPoints: item.maxPoints,
        pointsAchieved: 0, // Default value
        status: "ungraded",
        message: "",
        expected: "",
        actual: "",
      })) ||
      grading_data.requirementsResults ||
      []
    );
  }, [rubricData, grading_data.requirementsResults]);

  const testResults = useMemo(() => {
    if (!rubricData?.testCaseCriteria) {
      return grading_data.testResults || [];
    }
    return (grading_data.testResults || []).map((result) => {
      const rubricItem = rubricData.testCaseCriteria.find(
        (item) => item.name === result.name
      );
      return {
        ...result,
        maxPoints: rubricItem ? Number(rubricItem.maxPoints) : result.maxPoints,
      };
    });
  }, [grading_data.testResults, rubricData]);

  const calculatedTotalPoints = useMemo(() => {
    const sumPoints = (items, overrides) =>
      items.reduce((acc, item, index) => {
        const overriddenValue = parseFloat(overrides[index]);
        return (
          acc + (isNaN(overriddenValue) ? item.pointsAchieved : overriddenValue)
        );
      }, 0);

    const testPoints = sumPoints(testResults, testPointOverrides);
    const stylingPoints = sumPoints(stylingResults, stylingPointOverrides);
    const reqPoints = sumPoints(requirementsResults, reqPointOverrides);

    return testPoints + stylingPoints + reqPoints;
  }, [
    testResults,
    stylingResults,
    requirementsResults,
    testPointOverrides,
    stylingPointOverrides,
    reqPointOverrides,
  ]);

  const maxTotalPoints = useMemo(() => {
    return [...testResults, ...stylingResults, ...requirementsResults].reduce(
      (acc, item) => acc + (item.maxPoints || 0),
      0
    );
  }, [testResults, stylingResults, requirementsResults]);

  // --- MODIFICATION START ---
  const finalScore =
    overallOverrideScore !== "" && !isNaN(parseFloat(overallOverrideScore))
      ? parseFloat(overallOverrideScore)
      : calculatedTotalPoints;
  // --- MODIFICATION END ---

  const scorePercentage =
    maxTotalPoints > 0 ? (finalScore / maxTotalPoints) * 100 : 0;

  const getStatusBadge = () => {
    if (grading_data.error) {
      return (
        <span className="inline-block bg-red-800 text-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          Error
        </span>
      );
    }
    if (scorePercentage >= 80) {
      return (
        <span className="inline-block bg-green-800 text-green-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          Passed
        </span>
      );
    }
    if (scorePercentage > 0) {
      return (
        <span className="inline-block bg-yellow-800 text-yellow-200 text-xs font-semibold px-2.5 py-1 rounded-full">
          Partial Credit
        </span>
      );
    }
    return (
      <span className="inline-block bg-red-800 text-red-200 text-xs font-semibold px-2.5 py-1 rounded-full">
        Failed
      </span>
    );
  };

  return (
    <div className="font-sans  mx-auto">
      {/* Header */}
      <div className="p-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-100">
            {student.name + "'s Submission"}
          </h2>
          <p className="text-sm text-gray-400 mt-1 ml-1">
            Graded on: {new Date(grading_data.gradedAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <div className="text-3xl font-bold \">
              {viewMode === "teacher" ? (
                <div className="flex items-baseline ">
                  <input
                    type="number"
                    max={maxTotalPoints}
                    value={overallOverrideScore}
                    onChange={(e) => setOverallOverrideScore(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={calculatedTotalPoints.toFixed(0)}
                    className="bg-zinc-700/60 border-[.5px] border-zinc-600 rounded-xl max-w-20 p-1 text-center font-semibold focus:border-default mr-2 "
                  />
                  <span className="text-xl \">/ {maxTotalPoints}</span>
                </div>
              ) : (
                <div className="text-3xl font-bold \">
                  {finalScore.toFixed(2)}{" "}
                  <span className="text-xl \">/ {maxTotalPoints}</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2">{getStatusBadge()}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        {/* ... (rest of the component remains the same) ... */}
        {grading_data.error && (
          <div className="bg-red-900/50 border border-red-700 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-red-300">Compilation Error</h3>
            <CodeBlock
              content={grading_data.error}
              className="mt-2 bg-red-900/70"
            />
          </div>
        )}

        {viewMode === "teacher" && (
          <div className="">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-2 ">Teacher Controls</h3>
            </div>

            <div className="">
              <div className=" ">
                <label className="block text-md font-medium  ">Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback..."
                  variant="bordered"
                  size="lg"
                  className="w-full p-4 ounded-lg  min-h-32 text-xl"
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === "student" && grading_data.teacherFeedback && (
          <div className="mb-8 bg-zinc-800/30 border border-divider p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Feedback from Instructor
            </h3>
            <p className="whitespace-pre-wrap">
              {grading_data.teacherFeedback}
            </p>
          </div>
        )}

        {viewMode === "student" && rubricContent && (
          <div className="mb-8 bg-gray-zinc/30 border border-divider p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">
              Grading Rubric
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap">{rubricContent}</p>
          </div>
        )}
        {viewMode === "teacher" && (
          <div className="flex justify-between items-center  mb-4">
            <label className="block text-lg font-medium  mb-1">Testcases</label>
            <Button variant="flat" color="primary">
              View Raw Logs
            </Button>
          </div>
        )}

        <AccordionSection
          title="Test Cases"
          items={grading_data.testResults}
          itemOverrides={testPointOverrides}
          onOverrideChange={(index, value) =>
            setTestPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
          icon="test-tube"
        />
        <AccordionSection
          title="Styling"
          items={stylingResults}
          itemOverrides={stylingPointOverrides}
          onOverrideChange={(index, value) =>
            setStylingPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
          icon="braces"
        />
        <AccordionSection
          title="Requirements"
          items={requirementsResults}
          itemOverrides={reqPointOverrides}
          onOverrideChange={(index, value) =>
            setReqPointOverrides((prev) => ({ ...prev, [index]: value }))
          }
          viewMode={viewMode}
          icon="list-check"
        />

        <div className="flex items-center justify-between  py-5 mb-10">
          <Button
            variant="flat"
            color="secondary"
            onPress={() => setCurrentView("rubric")}
          >
            <ArrowLeft size={16} /> Rubric
          </Button>
          <div className=" flex  gap-2">
            <Button variant="flat" color="primary">
              <Save size={16} />
              Save Session
            </Button>
            <Button variant="flat" color="secondary" onPress={nextStudent}>
              Next
              <ArrowRight size={16} />
            </Button>
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
      return "danger";
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
                  variant={selected?.name === student.name ? "solid" : "ghost"}
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
export const Results = ({ editorRef, role, rubric, id }) => {
  const [grading_data, setGrading_data] = useState();
  const students = rubric?.students || [];
  const testcases = rubric?.testcases || [];
  const [rubricData, setRubricData] = useState(rubric.rubric);
  const [selected, setSelected] = useState(students[0] || null);

  // // edit testcases based on rubric
  // useEffect(() => {
  //   if (rubricData?.testCaseCriteria) {
  //     const newTestResults = grading_data.testResults.map((test) => {
  //       const matchingRubricItem =
  //         rubricData.testCaseCriteria.find((item) => item.name === test.name) ||
  //         {};
  //       const maxPoints = matchingRubricItem.maxPoints || 0;

  //       return {
  //         ...test,
  //         maxPoints: maxPoints,
  //         pointsAchieved:
  //           test.status == "passed" ? maxPoints : test.pointsAchieved,
  //       };
  //     });
  //     setGrading_data((prevGradingData) => ({
  //       ...prevGradingData,
  //       testResults: newTestResults,
  //     }));
  //   }
  // }, [rubricData]);

  const [currentView, setCurrentView] = useState("grading");

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

  return (
    <div className=" pb-10 h-full overflow-auto  custom-scrollbar ">
      {currentView === "grading" && role === "teacher" && (
        <StudentScrollSection
          students={students}
          selected={selected}
          setSelected={setSelected}
        />
      )}
      {(selected && currentView === "grading" && rubricData) || (
        <GradingResults
          nextStudent={setNextSelected}
          student={selected}
          rubricData={rubricData}
          grading_data={grading_data} // get data from
          viewMode={role}
          setCurrentView={setCurrentView}
        />
      )}
      {/* {currentView === "rubric" && (
        <>
          <Rubric
            testcases={testcases}
            setRubricData={setRubricData}
            setDisplayNext={setCurrentView}
          />
        </>
      )} */}
    </div>
  );
};
