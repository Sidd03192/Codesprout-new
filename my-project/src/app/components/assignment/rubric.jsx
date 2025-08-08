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
export const Rubric = ({
  testcases,
  setRubricData,
  setDisplayNext,
  rubric,
}) => {
  // --- State Management ---
  const [sections, setSections] = useState([
    {
      id: "section_1_tests",
      title: "Automated Test Cases",
      items: [],
      isNameEditable: false,
      canAddItems: false,
      autograde: true, // Test cases are always autograded
    },
    {
      id: "section_2_styling",
      title: "Styling Criteria",
      items: [{ id: "style_1", name: "", maxPoints: 5 }],
      isNameEditable: true,
      canAddItems: true,
      autograde: false, // Default to manual grading
    },
    {
      id: "section_3_requirements",
      title: "Functional Requirements",
      items: [{ id: "req_1", name: "", maxPoints: 5 }],
      isNameEditable: true,
      canAddItems: true,
      autograde: false, // Default to manual grading
    },
  ]);

  // --- Data Loading Effect ---
  // This effect runs when the component mounts or when the `rubric` or `testcases` props change.
  // It correctly populates the editor for both new and existing rubrics.
  useEffect(() => {
    // If an existing rubric structure is passed in, load it into state.
    if (rubric?.rubric) {
      setSections(rubric.rubric);
    } else if (testcases) {
      // If it's a new rubric, parse the initial testcases from the prop.
      const parsedTestCases = testcases.map((test) => {
        const match = test.match(/_Points_(\d+)$/);
        const points = match ? parseInt(match[1], 10) : 1;
        const cleanName = match ? test.substring(0, match.index) : test;
        return {
          id: test,
          name: cleanName.replace(/_/g, " "),
          maxPoints: points,
        };
      });

      // Update only the test case section in the state.
      setSections((currentSections) =>
        currentSections.map((section) =>
          section.id === "section_1_tests"
            ? { ...section, items: parsedTestCases }
            : section
        )
      );
    }
  }, [rubric, testcases]);

  // --- Centralized Handler Functions ---
  // All logic for modifying the state now lives here.

  const handleAddItem = (sectionId) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id === sectionId) {
          const newItem = { id: `item_${Date.now()}`, name: "", maxPoints: 5 };
          return { ...section, items: [...section.items, newItem] };
        }
        return section;
      })
    );
  };

  const handleDeleteItem = (sectionId, itemId) => {
    setSections((current) =>
      current.map((section) => {
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
    setSections((current) =>
      current.map((section) => {
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

  const handleToggleAutograde = (sectionId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, autograde: !section.autograde }
          : section
      )
    );
  };

  const handleSaveRubric = () => {
    const dataToSave = {
      // Create the flat criteria lists that the GradingResults component expects.
      testCaseCriteria:
        sections.find((s) => s.id === "section_1_tests")?.items || [],
      stylingCriteria:
        sections.find((s) => s.id === "section_2_styling")?.items || [],
      requirementsCriteria:
        sections.find((s) => s.id === "section_3_requirements")?.items || [],
      // Also include the full sections object for re-editing.
      rubric: sections,
    };

    // Preserve other top-level keys from the original rubric prop (like 'students').
    const finalData = {
      ...rubric,
      ...dataToSave,
    };

    setRubricData(finalData);
    setDisplayNext("grading");
  };

  // --- Memoized Calculations ---
  const grandTotalPoints = useMemo(() => {
    return sections.reduce((total, section) => {
      const sectionTotal = section.items.reduce(
        (subTotal, item) => subTotal + (Number(item.maxPoints) || 0),
        0
      );
      return total + sectionTotal;
    }, 0);
  }, [sections]);

  return (
    <div className="bg-transparent min-h-screen flex flex-col items-center p-6 pt-4 font-sans">
      <div className="text-white rounded-lg w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">Rubric Editor</h2>
          <div className="text-right">
            <p className="text-3xl font-bold">{grandTotalPoints}</p>
            <p className="text-sm text-gray-400">Total Possible Points</p>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section) => {
            const sectionTotalPoints = section.items.reduce(
              (total, item) => total + (Number(item.maxPoints) || 0),
              0
            );

            return (
              <div
                key={section.id}
                className="bg-gray-zinc/50 p-6 rounded-xl border border-divider"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                    {section.id !== "section_1_tests" && (
                      <Chip
                        size="sm"
                        color={section.autograde ? "secondary" : "default"}
                        variant="flat"
                        className="cursor-pointer"
                        onPress={() => handleToggleAutograde(section.id)}
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
                    )}
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
                        placeholder="Criterion description..."
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
                            {section.canAddItems &&
                              section.items.length > 1 && (
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
                      <Plus size={16} /> Add Criterion
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 flex justify-end">
          <Button onClick={handleSaveRubric} color="secondary" variant="flat">
            Grade Submissions <ArrowRight size={16} />
          </Button>
        </div>
      </div>
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
