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
    if (
      searchValue &&
      !assignment.title.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });

  const handleRefreshClick = () => {
    console.log("Refreshing assignments...");
    handleRefresh();
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
                {filteredAssignments &&
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

                {/* Empty state for all assignments view */}
                {filteredAssignments.length === 0 && (
                  <div className="text-center py-8">
                    <Icon
                      icon="lucide:clipboard-list"
                      className="mx-auto text-4xl text-foreground-400 mb-2"
                    />
                    <p className="text-foreground-500">
                      {searchValue
                        ? "No assignments match your search"
                        : `No ${selected} assignments found`}
                    </p>
                    <p className="text-sm text-foreground-400">
                      {searchValue
                        ? "Try adjusting your search terms"
                        : "Your assignments will appear here when they're available"}
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
