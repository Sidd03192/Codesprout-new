import { Button, Chip, Input } from "@heroui/react";
import {
  ArrowRight,
  PenTool,
  Plus,
  Trash,
  Trash2,
  Wand,
  WandIcon,
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";

// --- Main App Component (Contains all logic) ---
export const Rubric = ({ testcases, setRubricData, setDisplayNext }) => {
  // --- State Management ---
  const [autogradeStyles, setAutogradeStyles] = useState(false);
  const [autogradeRequirements, setAutogradeRequirements] = useState(false);
  const [testCaseItems, setTestCaseItems] = useState(testcases || []);
  const [stylingItems, setStylingItems] = useState([
    { id: "style_1", name: "", maxPoints: 0 },
  ]);
  const [requirementsItems, setRequirementsItems] = useState([
    { id: "req_1", name: "", maxPoints: 0 },
  ]);
  // --- Reusable Logic for Sections (kept inside the main component) ---
  const createSectionHandlers = (items, setItems) => ({
    handleAddItem: () => {
      setItems([
        ...items,
        { id: `item_${Date.now()}`, name: "", maxPoints: 5 },
      ]);
    },
    handleDeleteItem: (id) => {
      setItems(items.filter((item) => item.id !== id));
    },
    handleItemChange: (id, field, value) => {
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
    },
    sectionTotalPoints: useMemo(() => {
      return items.reduce(
        (total, item) => total + (Number(item.maxPoints) || 0),
        0
      );
    }, [items]),
  });
  const testCaseHandlers = createSectionHandlers(
    testCaseItems,
    setTestCaseItems
  );
  const stylingHandlers = createSectionHandlers(stylingItems, setStylingItems);
  const requirementsHandlers = createSectionHandlers(
    requirementsItems,
    setRequirementsItems
  );
  // local data storage.
  const sections = [
    {
      id: 1,
      title: "Automated Test Cases",
      items: testCaseItems,
      handlers: testCaseHandlers,
      isNameEditable: false,
      canAddItems: false,
      stateName: "autogradeTestCases",
    },
    {
      id: 2,
      title: "Styling Criteria",
      items: stylingItems,
      handlers: stylingHandlers,
      isNameEditable: true,
      canAddItems: true,
      stateName: "autogradeStyles",
    },
    {
      id: 3,
      title: "Functional Requirements",
      items: requirementsItems,
      handlers: requirementsHandlers,
      isNameEditable: true,
      canAddItems: true,
    },
  ];

  // update testcases once they exist. ( extract data from them )
  useEffect(() => {
    const parsedTestCases = testcases?.map((test, index) => {
      let points = 1; // Default points
      let cleanName = test;

      const match = test.match(/_Points_(\d+)$/);
      if (match) {
        points = parseInt(match[1], 10);
        cleanName = test.substring(0, match.index);
      }

      return {
        id: test,
        name: cleanName.replace(/_/g, " "), // Make it more readable
        maxPoints: points,
      };
    });
    setTestCaseItems(parsedTestCases);
  }, [testcases]); // Note: In a real app, you'd pass mockAutograderTests in the dependency array if it could change.

  const grandTotalPoints = useMemo(() => {
    const sumPoints = (items) =>
      items.reduce((total, item) => total + (Number(item.maxPoints) || 0), 0);
    return (
      sumPoints(testCaseItems) +
      sumPoints(stylingItems) +
      sumPoints(requirementsItems)
    );
  }, [testCaseItems, stylingItems, requirementsItems]);

  // --- Event Handlers ---

  const handleSaveRubric = () => {
    const rubricData = {
      testCaseCriteria: testCaseItems,
      stylingCriteria: stylingItems,
      requirementsCriteria: requirementsItems,
    };
    console.log("Saving rubric data:", rubricData);
    setRubricData(rubricData);
    setDisplayNext("grading");
  };

  return (
    <div className="bg-transparent min-h-screen flex flex-col items-center p-6 pt-4 font-sans sticky">
      {/* --- Main Rubric Creator UI --- */}
      <div className=" text-white rounded-lg w-full max-w-5xl mx-auto">
        <div className="">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Rubric Editor</h2>
            <div className="text-right">
              <p className="text-3xl font-bold ">{grandTotalPoints}</p>
              <p className="text-sm text-gray-400">Total Possible Points</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {sections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="bg-gray-zinc/50 p-6 rounded-xl border border-divider"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{section.title}</h3>
                  {section.canAddItems && (
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-fit flex "
                    >
                      <WandIcon className="mr-2" size={6} />
                      Autograde
                    </Chip>
                  )}
                </div>

                <span className="text-lg font-bold text-gray-300">
                  {section.handlers.sectionTotalPoints} pts
                </span>
              </div>
              <div className="space-y-2 ">
                {section.items.length > 0 ? (
                  section.items.map((item, itemIndex) => (
                    <div className="">
                      <Input
                        type="text"
                        className="text- font-bold "
                        variant="bordered"
                        size="lg"
                        placeholder="Criterion description..."
                        value={item.name}
                        isReadOnly={!section.isNameEditable}
                        onValueChange={
                          section.isNameEditable
                            ? (value) =>
                                section.handlers.handleItemChange(
                                  item.id,
                                  "name",
                                  value
                                )
                            : undefined
                        }
                        endContent={
                          <>
                            <div className="py-2 flex items-center gap-0">
                              <input
                                className="bg-zinc-700/60 border-[.5px] border-zinc-600 h-[30px] rounded-xl max-w-12 text-center font-semibold focus:border-default mr-2 "
                                type="number"
                                value={item.maxPoints ? item.maxPoints : 0}
                                onChange={(e) =>
                                  section.handlers.handleItemChange(
                                    item.id,
                                    "maxPoints",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            {section.canAddItems &&
                              section.items.length > 1 && (
                                <button
                                  variant="light"
                                  onClick={() =>
                                    section.handlers.handleDeleteItem(item.id)
                                  }
                                  className="
                                  ml-0 p-2 rounded-full hover:bg-red-600/30"
                                  color="danger"
                                >
                                  <Trash2 size={16} color="red" />
                                </button>
                              )}
                          </>
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    No items in this section. You can add one below.
                  </div>
                )}
              </div>
              {section.canAddItems && (
                <div className="mt-4">
                  <Button
                    onClick={section.handlers.handleAddItem}
                    variant="flat"
                    color="primary"
                  >
                    <Plus size={16} />
                    Add Criterion
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6  flex justify-end">
          <Button onClick={handleSaveRubric} color="secondary" variant="flat">
            Grade Submissions <ArrowRight size={16} />
          </Button>
        </div>
      </div>
      {/* --- Final JSON Output Preview --- */}
    </div>
  );
};

export const MiniRubric = ({
  sections,
  handleAddItem,
  handleDeleteItem,
  handleItemChange,
  handleToggleSectionAutograde,
}) => {
  // --- Render Logic ---
  return (
    <div>
      <h3 className="pt-0 pb-4 text-lg font-medium">Assignment Rubric</h3>
      <div className="space-y-8">
        {sections.map((section) => {
          // 3. Calculate total points dynamically for each section
          const sectionTotalPoints = section.items.reduce(
            (total, item) => total + (Number(item.maxPoints) || 0),
            0
          );

          return (
            <div
              key={section.id}
              className="bg-gray-zinc/50 p-3 rounded-xl border border-divider"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <Chip
                    size="sm"
                    color={section.autograde ? "secondary" : "default"}
                    variant="flat"
                    // 4. The onPress now correctly calls the right handler!
                    onClick={() => handleToggleSectionAutograde(section.id)}
                    className="cursor-pointer"
                  >
                    {section.autograde ? (
                      <div className="flex items-center">
                        <WandIcon className="mr-2" size={16} />
                        Autograde
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <PenTool className="mr-2" size={16} />
                        Manual
                      </div>
                    )}
                  </Chip>
                </div>
                <span className="text-lg font-bold text-gray-300">
                  {sectionTotalPoints} pts
                </span>
              </div>

              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.id}>
                    <Input
                      type="text"
                      variant="bordered"
                      size="lg"
                      placeholder="Description..."
                      value={item.name}
                      isReadOnly={!section.isNameEditable}
                      onValueChange={(value) =>
                        handleItemChange(section.id, item.id, "name", value)
                      }
                      endContent={
                        <>
                          <div className="py-2 flex items-center gap-0">
                            <input
                              className="bg-zinc-700/60 border-[.5px] border-zinc-600 h-[30px] rounded-xl max-w-12 text-center font-semibold focus:border-default mr-2"
                              type="number"
                              value={item.maxPoints || 0}
                              onChange={(e) =>
                                handleItemChange(
                                  section.id,
                                  item.id,
                                  "maxPoints",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          {section.canAddItems && section.items.length > 1 && (
                            <button
                              onClick={() =>
                                handleDeleteItem(section.id, item.id)
                              }
                              className="ml-0 p-2 rounded-full hover:bg-red-600/30"
                            >
                              <Trash2 size={16} color="red" />
                            </button>
                          )}
                        </>
                      }
                    />
                  </div>
                ))}
              </div>

              {section.canAddItems && (
                <div className="mt-4">
                  <Button
                    onClick={() => handleAddItem(section.id)}
                    variant="flat"
                    color="primary"
                  >
                    <Plus size={16} />
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
