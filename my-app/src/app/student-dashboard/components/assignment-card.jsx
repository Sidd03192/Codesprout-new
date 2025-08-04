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

  return (
    <Card key={assignment.id} className="border border-divider  ">
      <CardBody>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{assignment.title}</h3>
              <Chip size="sm" variant="flat" color="primary">
                {assignment.class_name}
              </Chip>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-foreground-500">
              <span>Due: {getDueDate(assignment.due_date)}</span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {assignment.submitted_at ? (
                <>
                  <span className=" text-sm">Grade: </span>
                  <Chip size="sm" variant="flat" color="secondary">
                    {assignment.grade || "awaiting grade"}
                  </Chip>
                </>
              ) : (
                <Chip size="sm" variant="flat" color="warning">
                  {assignment.status || "Pending"}
                </Chip>
              )}
              {isOverDue(assignment.due_date) && !assignment.submitted_at && (
                <Chip size="sm" variant="flat" color="danger">
                  Overdue
                </Chip>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              color="secondary"
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
