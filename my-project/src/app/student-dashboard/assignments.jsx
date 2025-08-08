import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Progress,
  Spinner,
  DropdownMenu,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { getAssignmentsData } from "./api";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@heroui/react";
import { AssignmentCard } from "./components/assignment-card";
export const StudentAssignments = ({
  session,
  assignments,
  isLoading,
  setIsLoading,
  error,
  setError,
  handleRefresh,
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [completedAssignments, setCompletedAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [selected, setSelected] = useState("upcoming");
  const [showClasroom, setShowClasroom] = useState(false);

  const updateAssignments = (assignments) => {
    const completed = assignments.filter(
      (assignment) => !!assignment.submitted_at
    );
    const upcoming = assignments.filter(
      (assignment) => !assignment.submitted_at
    );
    const sortedCompleted = [...completed].sort(
      (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
    );
    setCompletedAssignments(sortedCompleted);

    const sortedUpcoming = [...upcoming].sort(
      (a, b) => new Date(a.due_date) - new Date(b.due_date)
    );
    setUpcomingAssignments(sortedUpcoming);
    console.log("copmleted", completed);
  };

  useEffect(() => {
    if (assignments) {
      updateAssignments(assignments);
    }
  }, [assignments]);

  const filteredAssignments = (
    selected === "upcoming" ? upcomingAssignments : completedAssignments
  ).filter((assignment) => {
    // add filter functionaity TODO

    if (
      searchValue &&
      !assignment.title.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });
  const isAssignmentDone = (id, date) => Date.now() > new Date(date).getTime();

  const handleRefreshClick = () => {
    console.log("Refreshing assignments...");
    handleRefresh();
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getDueDate = (dueDate) => {
    const date = new Date(dueDate);
    // re format to make it more readable
    return date.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // group assignments by class_name
  const groupedAssignments = useMemo(() => {
    const assignments =
      (selected === "upcoming" ? upcomingAssignments : completedAssignments) ||
      [];
    if (!assignments) return {};
    return assignments.reduce((acc, assignment) => {
      const groupKey = assignment.class_name || "Uncategorized"; /// TODO make sure this becomes by class_id

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }

      acc[groupKey].push(assignment);

      return acc;
    }, {});
  }, [selected, upcomingAssignments, completedAssignments]);

  const isOverDue = (dueDate) => {
    const date = new Date(dueDate);
    const now = new Date();
    return date < now;
  };
  return (
    <div className="space-y-6">
      <Card className="border border-divider ">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:file-text" className="text-lg" />
            <h2 className="text-lg font-medium">My Assignments</h2>
          </div>
          <div className="flex gap-2">
            <Button
              color="secondary"
              variant="flat"
              onPress={() => setShowClasroom(!showClasroom)}
            >
              {showClasroom ? (
                <Icon icon="lucide:shapes" />
              ) : (
                <Icon icon="lucide:list" />
              )}
              {showClasroom ? "Classroom View" : "All Assignments"}
            </Button>

            <Button
              color="secondary"
              variant="flat"
              isIconOnly
              onClick={handleRefreshClick}
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 w-full">
            <Input
              placeholder="Search assignments..."
              startContent={<Icon icon="lucide:search" />}
              value={searchValue}
              onValueChange={setSearchValue}
              isDisabled={showClasroom === true}
              className="w-full sm:max-w-xs"
            />
            <Tabs
              selectedKey={selected}
              onSelectionChange={setSelected}
              aria-label="Assignment status"
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "gap-2",
              }}
            >
              <Tab key="upcoming" title="Upcoming" />
              <Tab key="completed" title="Completed" />
            </Tabs>
          </div>

          <div className="space-y-4 ">
            {isLoading ? (
              <div className="text-center">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2">
                {showClasroom &&
                  Object.keys(groupedAssignments).map((className) => (
                    <div
                      key={className}
                      className="space-y-2  border-divider p-1 rounded-lg  mb-3 "
                    >
                      <Chip
                        variant="flat"
                        color="primary"
                        className="text-lg  font-bold "
                      >
                        {className}
                      </Chip>

                      {groupedAssignments[className].map((assignment) => (
                        <div className="mb-3" key={assignment.id}>
                          <AssignmentCard
                            assignment={assignment}
                            key={assignment.id}
                            getDueDate={getDueDate}
                            OnOpenChange={onOpenChange}
                            isOpen={isOpen}
                            onOpen={onOpen}
                            setIsLoading={setIsLoading}
                            isAssignmentDone={isAssignmentDone}
                            isOverDue={isOverDue}
                          />
                        </div>
                      ))}
                    </div>
                  ))}

                {!showClasroom &&
                  filteredAssignments &&
                  filteredAssignments.length > 0 &&
                  filteredAssignments.map((assignment) => (
                    <AssignmentCard
                      assignment={assignment}
                      key={assignment.id}
                      getDueDate={getDueDate}
                      OnOpenChange={onOpenChange}
                      isOpen={isOpen}
                      onOpen={onOpen}
                      isOverDue={isOverDue}
                    />
                  ))}

                {!assignments && (
                  <div className="text-center py-8">
                    <Icon
                      icon="lucide:file-check"
                      className="mx-auto text-4xl text-foreground-400 mb-2"
                    />
                    <p className="text-foreground-500">No assignments found</p>
                    <p className="text-sm text-foreground-400">
                      Please try again by clickin the refresh button above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
