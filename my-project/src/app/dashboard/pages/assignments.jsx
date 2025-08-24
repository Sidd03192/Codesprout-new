"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Code, CircleX } from "lucide-react";
import CodeEditor from "../../components/editor/code-editor";
import { executeCode } from "../../components/editor/api";
import CreateAssignmentPage from "../../components/assignment/create-assignment";
import EditAssignmentPage from "../../components/assignment/edit-assignment";
import Link from "next/link";
import { createClient } from "../../../../utils/supabase/client";
const supabase = createClient();
export const Assignments = ({ session, classes, initialAssignments }) => {
  const [assignments, setAssignments] = useState(initialAssignments || []);
  const [selected, setSelected] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("public:assignments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "assignments" },
        (payload) => {
          setAssignments((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
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

  const determineStatus = (assignment) => {
    const now = new Date();
    const openAt = new Date(assignment.open_at);
    const dueAt = new Date(assignment.due_at);
    if (now < openAt) return "inactive";
    if (now > dueAt) return "completed";
    return "active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "primary";
      case "inactive":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const filteredAssignments = assignments?.filter((assignment) => {
    const dynamicStatus = determineStatus(assignment);
    if (selected !== "all" && dynamicStatus !== selected) return false;
    if (
      searchValue &&
      !assignment.title?.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });

  const groupAssignmentsByClassroom = (assignments) => {
    const grouped = {};
    assignments.forEach((assignment) => {
      const classId = assignment.class_id;
      if (!grouped[classId]) {
        grouped[classId] = [];
      }
      grouped[classId].push(assignment);
    });
    return grouped;
  };

  const getClassroomName = (classId) => {
    const classroom = classes?.find((c) => c.id === classId);
    return classroom ? classroom.name : `Class ${classId}`;
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignmentToDelete.id)
        .eq("teacher_id", session?.user?.id);

      if (error) {
        console.error("Error deleting assignment:", error);
        alert("Failed to delete assignment");
        return;
      }

      setAssignments((prev) => 
        prev.filter((assignment) => assignment.id !== assignmentToDelete.id)
      );
      
      setDeleteModalOpen(false);
      setAssignmentToDelete(null);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment");
    } finally {
      setDeleting(false);
    }
  };

  const renderAssignmentCard = (assignment) => {
    const status = determineStatus(assignment);
    return (
      <Card key={assignment.id} className="border border-divider">
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{assignment.title}</h3>
                <Chip
                  size="sm"
                  color={getStatusColor(status)}
                  variant="flat"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Chip>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-foreground-500">
                {viewMode === "list" && <span>Class: {getClassroomName(assignment.class_id)}</span>}
                <span>
                  Opens: {formatDateTime(assignment.open_at)}
                </span>
                <span>
                  Due: {formatDateTime(assignment.due_at)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
              {status.toLowerCase() !== "draft" && (
                <Button
                  as={Link}
                  href={`/dashboard/grade-assignment/${assignment.id}`}
                  size="sm"
                  color="primary"
                  variant="flat"
                >
                  <Icon
                    icon="lucide:folder-open"
                    className="mr-1"
                  />
                  View Submissions
                </Button>
              )}
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  setAssignmentToEdit(assignment);
                  setEditModalOpen(true);
                }}
              >
                <Icon icon="lucide:edit" className="mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                onPress={() => {
                  setAssignmentToDelete(assignment);
                  setDeleteModalOpen(true);
                }}
              >
                <Icon icon="lucide:trash-2" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderClassroomView = () => {
    const groupedAssignments = groupAssignmentsByClassroom(filteredAssignments);
    
    if (selectedClassroom) {
      const classroomAssignments = groupedAssignments[selectedClassroom.id] || [];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:school" className="text-xl text-primary" />
              <div>
                <h3 className="text-xl font-semibold">{selectedClassroom.name}</h3>
                <p className="text-sm text-foreground-500">
                  {classroomAssignments.length} assignment{classroomAssignments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="light"
              onPress={() => setSelectedClassroom(null)}
              startContent={<Icon icon="lucide:chevron-left" />}
            >
              Back to All Classrooms
            </Button>
          </div>
          
          <div className="space-y-4">
            {classroomAssignments.length > 0 ? (
              classroomAssignments.map(renderAssignmentCard)
            ) : (
              <div className="text-center py-8">
                <Icon
                  icon="lucide:file-question"
                  className="mx-auto text-4xl text-foreground-400 mb-2"
                />
                <p className="text-foreground-500">No assignments found for this classroom</p>
                <p className="text-sm text-foreground-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedAssignments).map(([classId, classAssignments]) => {
          const classroom = classes?.find((c) => c.id === parseInt(classId));
          const assignmentCount = classAssignments.length;
          const activeCount = classAssignments.filter(a => determineStatus(a) === 'active').length;
          const completedCount = classAssignments.filter(a => determineStatus(a) === 'completed').length;
          
          return (
            <Card 
              key={classId} 
              className="border border-divider hover:border-primary/50 transition-colors cursor-pointer"
              isPressable
              onPress={() => setSelectedClassroom(classroom || { id: parseInt(classId), name: `Class ${classId}` })}
            >
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <Icon icon="lucide:school" className="text-primary text-lg" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{getClassroomName(parseInt(classId))}</h3>
                        <p className="text-sm text-foreground-500">
                          {assignmentCount} assignment{assignmentCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Icon icon="lucide:chevron-right" className="text-foreground-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>{activeCount} Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      <span>{completedCount} Completed</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {classAssignments.slice(0, 2).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-2 bg-content2 rounded-md">
                        <span className="text-sm font-medium truncate flex-1 mr-2">{assignment.title}</span>
                        <Chip size="sm" color={getStatusColor(determineStatus(assignment))} variant="dot">
                          {determineStatus(assignment)}
                        </Chip>
                      </div>
                    ))}
                    {classAssignments.length > 2 && (
                      <div className="text-center text-sm text-foreground-500">
                        +{classAssignments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
        
        {Object.keys(groupedAssignments).length === 0 && (
          <div className="col-span-full text-center py-8">
            <Icon
              icon="lucide:school"
              className="mx-auto text-4xl text-foreground-400 mb-2"
            />
            <p className="text-foreground-500">No classrooms with assignments found</p>
            <p className="text-sm text-foreground-400">
              Create some assignments to see them organized by classroom
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:file-text" className="text-lg" />
            <h2 className="text-lg font-medium">Assignments</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-content2 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "list" ? "solid" : "light"}
                color={viewMode === "list" ? "primary" : "default"}
                onPress={() => {
                  setViewMode("list");
                  setSelectedClassroom(null);
                }}
                className="min-w-unit-12"
              >
                <Icon icon="lucide:list" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "classroom" ? "solid" : "light"}
                color={viewMode === "classroom" ? "primary" : "default"}
                onPress={() => setViewMode("classroom")}
                className="min-w-unit-12"
              >
                <Icon icon="lucide:school" />
              </Button>
            </div>
            <Button
              color="secondary"
              variant="flat"
              onPress={() => setOpen(true)}
              className="flex items-center"
            >
              <Icon icon="lucide:plus" className="mr-1" />
              Create Assignment
            </Button>
          </div>

          {/* Create Assignment Modal */}
          <Modal
            isOpen={open}
            onClose={() => setOpen(false)}
            closeButton={
              <Button isIconOnly variant="light" color="danger">
                <CircleX color="red" />
              </Button>
            }
            className="max-h-[90vh] max-w-[90vw] overflow-y-auto"
          >
            <ModalContent className="w-full">
              <ModalHeader className="flex border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Code className="text-2xl" color="white" />
                  <h1 className="text-xl font-semibold">Assignment Creator</h1>
                </div>
              </ModalHeader>
              <CreateAssignmentPage
                session={session}
                classes={classes}
                onClose={() => setOpen(false)}
              />
            </ModalContent>
          </Modal>
          {/* Edit Assignment Modal */}
          <Modal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            closeButton={
              <Button isIconOnly variant="light" color="danger">
                <CircleX color="red" />
              </Button>
            }
            className="max-h-[90vh] max-w-[90vw] overflow-y-auto"
          >
            <ModalContent className="w-full">
              <ModalHeader className="flex border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-3">
                  <Code className="text-2xl" color="white" />
                  <h1 className="text-xl font-semibold">Assignment Editor</h1>
                </div>
              </ModalHeader>
              <CreateAssignmentPage
                session={session}
                classes={classes}
                assignmentData={assignmentToEdit}
                setOpen={setEditModalOpen}
                isEdit={true}
              />
            </ModalContent>
          </Modal>

          {/* Delete Assignment Modal */}
          <Modal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            size="sm"
          >
            <ModalContent>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-danger">Delete Assignment</h2>
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete "{assignmentToDelete?.title}"?
                </p>
                <p className="text-sm text-foreground-500">
                  This action cannot be undone and will permanently delete the assignment and all its data.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => setDeleteModalOpen(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  color="danger"
                  variant="solid"
                  onPress={handleDeleteAssignment}
                  isLoading={deleting}
                  disabled={deleting}
                >
                  Delete
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </CardHeader>
        <CardBody>
          {viewMode === "classroom" && !selectedClassroom ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Classroom View</h3>
                  <p className="text-sm text-foreground-500">
                    Assignments organized by classroom
                  </p>
                </div>
              </div>
              {renderClassroomView()}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
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
                  classNames={{ base: "w-full sm:w-auto", tabList: "gap-2" }}
                >
                  <Tab key="all" title="All" />
                  <Tab key="active" title="Active" />
                  <Tab key="draft" title="Draft" />
                  <Tab key="inactive" title="Inactive" />
                  <Tab key="completed" title="Completed" />
                </Tabs>
              </div>

              {viewMode === "classroom" && selectedClassroom ? (
                renderClassroomView()
              ) : (
                <div className="space-y-4">
                  {filteredAssignments.length > 0 ? (
                    filteredAssignments.map(renderAssignmentCard)
                  ) : (
                    <div className="text-center py-8">
                      <Icon
                        icon="lucide:file-question"
                        className="mx-auto text-4xl text-foreground-400 mb-2"
                      />
                      <p className="text-foreground-500">No assignments found</p>
                      <p className="text-sm text-foreground-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
