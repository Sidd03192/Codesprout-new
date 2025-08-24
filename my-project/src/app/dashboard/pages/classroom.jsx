"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Avatar,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Select,
  SelectItem,
  Form,
  Autocomplete,
  AutocompleteItem,
  addToast,
  Spinner,
  Snippet,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { BookOpenCheck } from "lucide-react";
import { createClient } from "../../../../utils/supabase/client";
import { BookMarked } from "lucide-react";
import {
  generateJoinLink,
  getEnrolledStudents,
  removeStudentFromClassroom,
} from "../api";
export const Classroom = ({ session, classes }) => {
  const [selectedClassroom, setSelectedClassroom] = React.useState(null);
  const [selectedTab, setSelectedTab] = React.useState("students");
  const [term, setTerm] = useState([]);
  const [classroomName, setClassroomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tostMessage, setTostMessage] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [generatingShare, setGeneratingShare] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deleteStudentModal, setDeleteStudentModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const currentYear = new Date().getFullYear();
    setDates([
      { key: `Fall ${currentYear}` },
      { key: `Spring ${currentYear}` },
      { key: `Fall ${currentYear + 1}` },
      { key: `Spring ${currentYear + 1}` },
    ]);
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchEnrolledStudents();
    }
  }, [selectedClassroom]);

  const fetchEnrolledStudents = async () => {
    if (!selectedClassroom || !getEnrolledStudents) return;

    setLoadingStudents(true);
    try {
      const result = await getEnrolledStudents(selectedClassroom.id);
      console.log("Enrolled students result:", JSON.stringify(result, null, 2));
      if (result.success) {
        setEnrolledStudents(
          Array.isArray(result.students) ? result.students : []
        );
      } else {
        console.error("Failed to fetch students:", result.error);
        addToast({
          title: "Error",
          description:
            typeof result.error === "string"
              ? result.error
              : "Failed to fetch enrolled students",
          color: "danger",
          duration: 3000,
          placement: "top-center",
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error.message || error);
      if (addToast && typeof addToast === "function") {
        addToast({
          title: "Error",
          description: "Failed to fetch enrolled students",
          color: "danger",
          duration: 3000,
          placement: "top-center",
        });
      }
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToDelete || !selectedClassroom || !removeStudentFromClassroom)
      return;

    setDeletingStudent(true);
    try {
      const result = await removeStudentFromClassroom(
        selectedClassroom.id,
        studentToDelete.student_id
      );

      if (result.success) {
        addToast({
          title: "Success",
          description: "Student removed from classroom successfully",
          color: "success",
          duration: 3000,
          placement: "top-center",
        });

        // Remove student from local state
        setEnrolledStudents((prev) =>
          prev.filter(
            (student) => student.student_id !== studentToDelete.student_id
          )
        );

        // Close modal and reset state
        setDeleteStudentModal(false);
        setStudentToDelete(null);
      } else {
        addToast({
          title: "Error",
          description:
            typeof result.error === "string"
              ? result.error
              : "Failed to remove student",
          color: "danger",
          duration: 5000,
          placement: "top-center",
        });
      }
    } catch (error) {
      console.error("Error removing student:", error.message || error);
      addToast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        color: "danger",
        duration: 5000,
        placement: "top-center",
      });
    } finally {
      setDeletingStudent(false);
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleClose = () => {
    // reset form data when modal is closed
    setClassroomName("");
    setJoinId(null);
    setTerm([]);
    onClose();
  };

  const announcements = [
    {
      id: 1,
      title: "Quiz Postponed",
      content:
        "The science quiz scheduled for tomorrow has been postponed to next Monday.",
      date: "Today, 9:15 AM",
      important: true,
    },
    {
      id: 2,
      title: "Field Trip Permission Forms",
      content:
        "Please remind your parents to sign the permission forms for next week's museum visit.",
      date: "Yesterday",
      important: true,
    },
    {
      id: 3,
      title: "New Study Resources",
      content:
        "I've uploaded new study materials for the upcoming math test. Check the resources section.",
      date: "Sep 22, 2023",
      important: false,
    },
    {
      id: 4,
      title: "Parent-Teacher Conference",
      content:
        "Parent-teacher conferences will be held next Thursday and Friday. Sign-up sheet is in the office.",
      date: "Sep 20, 2023",
      important: false,
    },
  ];

  const resources = [
    {
      id: 1,
      title: "Chapter 5 Study Guide",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "Sep 23, 2023",
    },
    {
      id: 2,
      title: "Lab Safety Guidelines",
      type: "PDF",
      size: "1.8 MB",
      uploadDate: "Sep 20, 2023",
    },
    {
      id: 3,
      title: "Essay Writing Tips",
      type: "DOCX",
      size: "850 KB",
      uploadDate: "Sep 18, 2023",
    },
    {
      id: 4,
      title: "Math Formula Sheet",
      type: "PDF",
      size: "1.2 MB",
      uploadDate: "Sep 15, 2023",
    },
    {
      id: 5,
      title: "Periodic Table Reference",
      type: "PDF",
      size: "3.1 MB",
      uploadDate: "Sep 10, 2023",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF":
        return "lucide:file-text";
      case "DOCX":
        return "lucide:file";
      case "XLSX":
        return "lucide:file-spreadsheet";
      case "PPTX":
        return "lucide:file-presentation";
      default:
        return "lucide:file";
    }
  };

  const generateShareLink = async (classId) => {
    try {
      setGeneratingShare(true);

      const result = await generateJoinLink(classId);

      if (!result.success) {
        addToast({
          title: "Failed to Generate Link",
          description: result.error || "An error occurred",
          color: "danger",
          duration: 5000,
          placement: "top-center",
        });
        return;
      }

      setShareLink(result.join_url);
      setShowShareModal(true);

      // Copy to clipboard automatically
      await copyToClipboard(result.join_url);
    } catch (error) {
      console.error("Error generating share link:", error);
      addToast({
        title: "Error",
        description: "Failed to generate share link",
        color: "danger",
        duration: 5000,
        placement: "top-center",
      });
    } finally {
      setGeneratingShare(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      // Check if clipboard API is available (browser-only)
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        addToast({
          title: "Copied!",
          description: "Link copied to clipboard",
          color: "success",
          duration: 2000,
          placement: "top-center",
        });
      } else {
        console.warn("Clipboard API not available");
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/deleteClassroom?id=${classroomToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        addToast({
          title: "Delete Failed",
          description: data.error || "Failed to delete classroom",
          color: "danger",
          duration: 5000,
          placement: "top-center",
        });
        return;
      }

      // Success - show success message
      addToast({
        title: "Success",
        description: data.message || "Classroom deleted successfully",
        color: "success",
        duration: 3000,
        placement: "top-center",
      });

      // Close modal and reset state
      setDeleteModalOpen(false);
      setClassroomToDelete(null);

      // If we were viewing the deleted classroom, go back to overview
      if (selectedClassroom && selectedClassroom.id === classroomToDelete.id) {
        setSelectedClassroom(null);
      }

      // Refresh the page or update the classes list
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting classroom:", error);
      addToast({
        title: "Error",
        description:
          "An unexpected error occurred while deleting the classroom",
        color: "danger",
        duration: 5000,
        placement: "top-center",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateClassroom = async () => {
    const name = classroomName;
    setIsLoading(true);

    // Check if user is authenticated
    if (!session || !session.user) {
      alert("You must be logged in to create a classroom.");
      console.error("No authenticated session found");
      return;
    }

    // Validate required fields
    if (!name || term.size === 0) {
      alert("Classroom name and term are required.");
      return;
    }
    let dat = null;
    try {
      let updated = false;
      let num = 0; // Change to 'let' so it can be incremented
      let lastError = null; // Track the last error for reporting

      while (!updated && num < 6) {
        const randomNumber =
          Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

        console.log("Creating classroom:", {
          name,
          term: Array.from(term),
          userId: session.user.id,
        });

        const { data, error } = await supabase.from("classes").insert([
          {
            name,
            term: Array.from(term),
            created_at: new Date().toISOString(),
            teacher_id: session.user.id,
            join_id: randomNumber,
          },
        ]);

        if (error) {
          updated = false;
          lastError = error; // Store the last error
          console.warn("Attempt failed:", error.message);
        } else {
          updated = true;
          setJoinId(randomNumber);
        }

        num++;
      }

      // Handle case where all attempts failed
      if (!updated) {
        console.error("Supabase error:", lastError);
        addToast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          color: "danger",
          duration: 5000,
          placement: "top-center",
          variant: "solid",
        });
        return;
      }

      setIsLoading(false);
      // Success
      addToast({
        title: "Success",
        placement: "top-center",

        description: "Classroom created successfully. Join Code: " + joinId,
        duration: 3000,
        color: "success",
      });
      // toast
    } catch (error) {
      console.error("Unexpected error creating classroom:", error);
      addToast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        color: "danger",
        duration: 3000,
        placement: "top-center",
      });
    }
  };

  const renderClassroomOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {classes.map((classroom) => (
        <Card key={classroom.id} className="border border-divider">
          <CardBody>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{classroom.name}</h3>
              <Chip size="sm" color="primary" variant="flat">
                {classroom.term}
              </Chip>
            </div>
            <p className="text-sm text-foreground-500 mb-4">
              {classroom.subject} - Grade {classroom.grade}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon icon="lucide:users" className="mr-2" />
                <span>{classroom.students} Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={() => setSelectedClassroom(classroom)}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  isIconOnly
                  onPress={() => {
                    setClassroomToDelete(classroom);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Icon icon="lucide:trash-2" />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  // Prevent hydration errors by waiting for client-side mounting
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:users" className="text-lg" />
            <h2 className="text-lg font-medium">Classrooms</h2>
          </div>
          <Button color="primary" onPress={onOpen}>
            <Icon icon="lucide:plus" className="mr-1" />
            Create Classroom
          </Button>
        </CardHeader>
        <CardBody>
          {selectedClassroom ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedClassroom.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => generateShareLink(selectedClassroom.id)}
                    isLoading={generatingShare}
                    startContent={<Icon icon="lucide:share-2" />}
                  >
                    Share Class Code
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => {
                      setClassroomToDelete(selectedClassroom);
                      setDeleteModalOpen(true);
                    }}
                    startContent={<Icon icon="lucide:trash-2" />}
                  >
                    Delete Classroom
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setSelectedClassroom(null)}
                    startContent={<Icon icon="lucide:chevron-left" />}
                  >
                    Back to All Classrooms
                  </Button>
                </div>
              </div>
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                aria-label="Classroom tabs"
                className="w-full"
              >
                <Tab
                  key="students"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:users" />
                      <span>Students</span>
                    </div>
                  }
                >
                  <Card>
                    <CardBody>
                      {loadingStudents ? (
                        <div className="flex justify-center items-center py-8">
                          <Spinner size="lg" />
                        </div>
                      ) : enrolledStudents.length === 0 ? (
                        <div className="text-center py-8 text-foreground-500">
                          <Icon
                            icon="lucide:users"
                            className="mx-auto mb-2 text-4xl"
                          />
                          <p>No students enrolled in this classroom yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {enrolledStudents
                            .filter((student) => student && student.student_id)
                            .map((student) => (
                              <Card
                                key={student.student_id}
                                className="border border-divider"
                              >
                                <CardBody>
                                  <div className="flex items-center gap-3">
                                    <Avatar
                                      name={
                                        student.full_name
                                          ?.charAt(0)
                                          .toUpperCase() || "S"
                                      }
                                      className="h-12 w-12 bg-primary text-white"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-medium">
                                          {student.full_name || "Student"}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                          <Chip
                                            size="sm"
                                            color="success"
                                            variant="dot"
                                          >
                                            Active
                                          </Chip>
                                          <Button
                                            size="sm"
                                            color="danger"
                                            variant="light"
                                            isIconOnly
                                            onPress={() => {
                                              setStudentToDelete(student);
                                              setDeleteStudentModal(true);
                                            }}
                                          >
                                            <Icon icon="lucide:user-minus" />
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-foreground-500">
                                        {student.email}
                                      </p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs">
                                          Enrolled:{" "}
                                          <strong>
                                            {student.enrolled_at
                                              ? new Date(
                                                  student.enrolled_at
                                                ).toLocaleDateString()
                                              : "Unknown"}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </Tab>
                <Tab
                  key="announcements"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:megaphone" />
                      <span>Announcements</span>
                    </div>
                  }
                >
                  <Card>
                    <CardBody className="flex flex-col gap-4">
                      <div className="flex justify-end">
                        <Button color="primary">
                          <Icon icon="lucide:plus" className="mr-1" />
                          New Announcement
                        </Button>
                      </div>

                      {announcements.map((announcement) => (
                        <Card
                          key={announcement.id}
                          className="border border-divider"
                        >
                          <CardBody>
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  announcement.important
                                    ? "bg-danger-100 text-danger"
                                    : "bg-default-100 text-default-600"
                                }`}
                              >
                                <Icon
                                  icon={
                                    announcement.important
                                      ? "lucide:alert-circle"
                                      : "lucide:bell"
                                  }
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">
                                    {announcement.title}
                                  </h3>
                                  <span className="text-xs text-foreground-500">
                                    {announcement.date}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm">
                                  {announcement.content}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </CardBody>
                  </Card>
                </Tab>
                <Tab
                  key="resources"
                  title={
                    <div className="flex items-center gap-2">
                      <Icon icon="lucide:book" />
                      <span>Resources</span>
                    </div>
                  }
                >
                  <Card>
                    <CardBody className="flex flex-col gap-4">
                      <div className="flex justify-end">
                        <Button color="primary">
                          <Icon icon="lucide:upload" className="mr-1" />
                          Upload Resource
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.map((resource) => (
                          <Card
                            key={resource.id}
                            className="border border-divider"
                          >
                            <CardBody>
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-md bg-content2">
                                  <Icon
                                    icon={getFileIcon(resource.type)}
                                    className="text-xl"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium">
                                    {resource.title}
                                  </h3>
                                  <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2 text-xs text-foreground-500">
                                      <span>{resource.type}</span>
                                      <span>•</span>
                                      <span>{resource.size}</span>
                                    </div>
                                    <span className="text-xs text-foreground-500">
                                      {resource.uploadDate}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </Tab>
              </Tabs>
            </>
          ) : (
            renderClassroomOverview()
          )}
        </CardBody>
      </Card>

      {/* Create Classroom Modal */}

      <Modal isOpen={isOpen} onClose={handleClose} size="lg" backdrop="blur">
        <ModalContent className="w-full">
          <ModalHeader className="flex border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <BookMarked className="text-2xl" color="white" />
                <h1 className="text-xl font-semibold">Create Classroom</h1>
              </div>
            </div>
          </ModalHeader>

          <div className="bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]  text-zinc-100">
            <main className="mx-auto w-full p-4 pb-5">
              {joinId ? (
                <Snippet
                  symbol=""
                  codeString={joinId}
                  color="default"
                  className=" w-full"
                >
                  <h1 className="text-lg font-bold">
                    Classroom code: {joinId}
                  </h1>
                  <p className="text-sm">Share this code with your students </p>
                </Snippet>
              ) : (
                <Form className="">
                  <Card className="bg-zinc-800/40 p-6 w-full h-full">
                    <div className=" flex flex-col gap-2">
                      <Input
                        isRequired
                        label="Classroom Name"
                        placeholder="Enter classroom name"
                        variant="bordered"
                        value={classroomName}
                        onChange={(e) => setClassroomName(e.target.value)}
                      />

                      <Select
                        selectionMode="multiple"
                        label="Terms"
                        placeholder="Select Terms"
                        selectedKeys={term}
                        variant="bordered"
                        onSelectionChange={setTerm}
                      >
                        {mounted &&
                          dates.map((date) => (
                            <SelectItem key={date.key} value={date.key}>
                              {date.key}
                            </SelectItem>
                          ))}
                      </Select>
                    </div>
                  </Card>

                  <div className="flex justify-end w-full mt-4">
                    <Button
                      color="primary"
                      size="lg"
                      onPress={handleCreateClassroom}
                      isLoading={isLoading}
                      spinner={<Spinner size="sm" />}
                    >
                      <Icon icon="lucide:plus"></Icon>
                      Create Classroom
                    </Button>
                  </div>
                </Form>
              )}
            </main>
          </div>
        </ModalContent>
      </Modal>

      {/* Share Class Code Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        size="md"
        backdrop="blur"
      >
        <ModalContent className="w-full">
          <ModalHeader className="flex border-zinc-800 bg-zinc-900">
            <div className="flex items-center gap-3">
              <Icon icon="lucide:share-2" className="text-2xl" color="white" />
              <h1 className="text-xl font-semibold">Share Class Code</h1>
            </div>
          </ModalHeader>

          <div className="bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] text-zinc-100">
            <main className="mx-auto w-full p-6 pb-8">
              <div className="text-center space-y-4">
                <div className="p-4 bg-zinc-800/40 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Class Code</p>
                  <div className="text-2xl font-bold text-primary mb-3">
                    {selectedClassroom?.join_id || "Loading..."}
                  </div>
                  <p className="text-xs text-zinc-500">
                    Students can join using this code
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-zinc-400">Share Link</p>
                  <Snippet
                    symbol=""
                    className="w-full"
                    codeString={shareLink}
                    onCopy={() => copyToClipboard(shareLink)}
                  >
                    <span className="text-xs">{shareLink}</span>
                  </Snippet>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button
                    color="primary"
                    onPress={() => copyToClipboard(shareLink)}
                    startContent={<Icon icon="lucide:copy" />}
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="light"
                    onPress={() => setShowShareModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </ModalContent>
      </Modal>

      {/* Delete Classroom Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-danger">
              Delete Classroom
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete{" "}
                <strong>"{classroomToDelete?.name}"</strong>?
              </p>
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="lucide:alert-triangle"
                    className="text-danger mt-0.5"
                  />
                  <div className="text-sm text-danger-700">
                    <p className="font-medium">This action cannot be undone!</p>
                    <p className="mt-1">
                      Deleting this classroom will also remove:
                    </p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>All student enrollments</li>
                      <li>All assignments in this classroom</li>
                      <li>All student submissions</li>
                      <li>All classroom data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
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
              onPress={handleDeleteClassroom}
              isLoading={deleting}
              disabled={deleting}
            >
              Delete Classroom
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Student Confirmation Modal */}
      <Modal
        isOpen={deleteStudentModal}
        onClose={() => setDeleteStudentModal(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-danger">
              Remove Student
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              <p>
                Are you sure you want to remove{" "}
                <strong>
                  "{studentToDelete?.full_name || "this student"}"
                </strong>{" "}
                from the classroom?
              </p>
              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="lucide:alert-triangle"
                    className="text-warning mt-0.5"
                  />
                  <div className="text-sm text-warning-700">
                    <p className="font-medium">This action will:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Remove the student from this classroom</li>
                      <li>Remove access to classroom assignments</li>
                      <li>The student can rejoin using the class code</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setDeleteStudentModal(false)}
              disabled={deletingStudent}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              variant="solid"
              onPress={handleRemoveStudent}
              isLoading={deletingStudent}
              disabled={deletingStudent}
            >
              Remove Student
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
