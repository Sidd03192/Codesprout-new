"use client";
import React, { use } from "react";

import {
  Card,
  CardBody,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
  ModalTrigger,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Calendar, GraduationCap } from "lucide-react";
export const AssignmentCard = ({
  assignment,
  getDueDate,
  isOverDue,
  onOpen,
  isOpen,
  onOpenChange,
}) => {
  const isAssignmentDone = (id, date) => Date.now() > new Date(date).getTime();
  const [selectedAssignment, setSelectedAssignment] = React.useState(null);

  const assignmentStatus = (assignment) => {
    const status = assignment.status;
    const now = new Date();
    const openAt = new Date(assignment.open_at);
    const dueAt = new Date(assignment.due_at);
    if (now < openAt) return "inactive";
    if (now > dueAt) return "completed";
  };
  return (
    <Card
      key={assignment.id}
      className="border border-divider border-1 border-l-4  border-l-purple-400 hover:bg-purple-400/10 transition ease-in duration-300"
    >
      <CardBody>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-lg">{assignment.title}</h2>
              <div className="flex  gap-2">
                {assignment.submitted_at ? (
                  <>
                    <span className=" text-sm">Grade: </span>
                    <Chip size="sm" variant="flat" color="secondary">
                      {assignment.grade || "awaiting grade"}
                    </Chip>
                  </>
                ) : (
                  <Chip size="sm" variant="flat" color="warning" radius="sm">
                    {assignment.status || "Pending Submission"}
                  </Chip>
                )}
                {isOverDue(assignment.due_date) && !assignment.submitted_at && (
                  <Chip size="sm" variant="flat" color="danger" radius="sm">
                    Overdue
                  </Chip>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-start items-center gap-4  text-sm text-foreground-500">
              <p className="font-medium text-primary items-center flex gap-1 ">
                <GraduationCap size={16} />
                {assignment.class_name}
              </p>

              <p className="font-medium flex items-center gap-1 text-red-400 text-md">
                <Calendar size={16} />
                Due: {getDueDate(assignment.due_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              color="secondary"
              radius="sm"
              size="sm"
              variant="flat"
              onPress={() => {
                setSelectedAssignment(assignment.assignment_id);
                onOpen();
              }}
              startContent={
                isAssignmentDone(assignment.id, assignment.due_date) ? (
                  <Icon icon="lucide:eye" />
                ) : (
                  <Icon icon="lucide:edit-3" />
                )
              }
            >
              {isAssignmentDone(assignment.id, assignment.due_date)
                ? "View Assignment"
                : "Start Assignment"}
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Submit Assignment
                    </ModalHeader>
                    <ModalBody>
                      <Card className="border-spacing-3 border-large border-yellow-400 p-5 bg-zinc-850">
                        <p className="text-yellow-500 ">
                          Are you sure you want to start this assignment? Once
                          you start, you cannot go back.
                        </p>
                      </Card>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="danger" variant="light" onPress={onClose}>
                        Close
                      </Button>

                      <Button
                        as={Link}
                        href={`/student-dashboard/assignments/${selectedAssignment}`}
                        color="secondary"
                        variant="flat"
                        className="min-w-[120px]"
                        onPress={() =>
                          console.log(
                            "Starting assignment",
                            assignment.assignment_id
                          )
                        }
                        startContent={
                          isAssignmentDone(
                            assignment.id,
                            assignment.due_date
                          ) ? (
                            <Icon icon="lucide:eye" />
                          ) : (
                            <Icon icon="lucide:edit-3" />
                          )
                        }
                      >
                        {isAssignmentDone(assignment.id, assignment.due_date)
                          ? "View Assignment"
                          : "Start Assignment"}
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
