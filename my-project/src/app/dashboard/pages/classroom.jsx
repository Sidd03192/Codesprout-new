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
export const Classroom = ({ session, classes }) => {
  const [selectedClassroom, setSelectedClassroom] = React.useState(null);
  const [selectedTab, setSelectedTab] = React.useState("students");
  const [term, setTerm] = useState([]);
  const [classroomName, setClassroomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tostMessage, setTostMessage] = useState("");
  const supabase = createClient();
  useEffect(() => {
    setDates([
      { key: `Fall ${new Date().getFullYear()}` },
      { key: `Spring ${new Date().getFullYear()}` },
      { key: `Fall ${new Date().getFullYear() + 1}` },
      { key: `Spring ${new Date().getFullYear() + 1}` },
    ]);
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleClose = () => {
    // reset form data when modal is closed
    setClassroomName("");
    setJoinId(null);
    setTerm([]);
    onClose();
  };

  const handleSelectionChange = (keys) => {
    console.log(keys);
    setTerm(new Set(keys));
  };

  // Mock data for multiple classrooms
  const [classrooms, setClassrooms] = React.useState([
    {
      id: 1,
      name: "Science 202",
      subject: "Science",
      grade: "10th",
      students: 28,
      term: "Fall 2023",
    },
    {
      id: 2,
      name: "Math 101",
      subject: "Mathematics",
      grade: "9th",
      students: 32,
      term: "Fall 2023",
    },
    {
      id: 3,
      name: "English Literature",
      subject: "English",
      grade: "11th",
      students: 25,
      term: "Fall 2023",
    },
  ]);

  // State for new classroom

  const students = [
    {
      id: 1,
      name: "Emma Thompson",
      email: "emma.t@example.com",
      grade: "A",
      attendance: 95,
      status: "active",
    },
    {
      id: 2,
      name: "James Wilson",
      email: "james.w@example.com",
      grade: "B",
      attendance: 92,
      status: "active",
    },
    {
      id: 3,
      name: "Sophia Garcia",
      email: "sophia.g@example.com",
      grade: "A-",
      attendance: 98,
      status: "active",
    },
    {
      id: 4,
      name: "Liam Johnson",
      email: "liam.j@example.com",
      grade: "C+",
      attendance: 85,
      status: "warning",
    },
    {
      id: 5,
      name: "Olivia Brown",
      email: "olivia.b@example.com",
      grade: "B+",
      attendance: 90,
      status: "active",
    },
    {
      id: 6,
      name: "Noah Davis",
      email: "noah.d@example.com",
      grade: "A",
      attendance: 94,
      status: "active",
    },
    {
      id: 7,
      name: "Ava Miller",
      email: "ava.m@example.com",
      grade: "B-",
      attendance: 88,
      status: "warning",
    },
    {
      id: 8,
      name: "Lucas Smith",
      email: "lucas.s@example.com",
      grade: "A-",
      attendance: 96,
      status: "active",
    },
  ];

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
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={() => setSelectedClassroom(classroom)}
              >
                View Details
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

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
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => setSelectedClassroom(null)}
                  startContent={<Icon icon="lucide:chevron-left" />}
                >
                  Back to All Classrooms
                </Button>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {students.map((student) => (
                          <Card
                            key={student.id}
                            className="border border-divider"
                          >
                            <CardBody>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={`https://img.heroui.chat/image/avatar?w=64&h=64&u=student${student.id}`}
                                  className="h-12 w-12"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-medium">
                                      {student.name}
                                    </h3>
                                    <Chip
                                      size="sm"
                                      color={getStatusColor(student.status)}
                                      variant="dot"
                                    >
                                      {student.status === "active"
                                        ? "Active"
                                        : "At Risk"}
                                    </Chip>
                                  </div>
                                  <p className="text-xs text-foreground-500">
                                    {student.email}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs">
                                      Grade: <strong>{student.grade}</strong>
                                    </span>
                                    <span className="text-xs">
                                      Attendance:{" "}
                                      <strong>{student.attendance}%</strong>
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
                      {/* <Input
                      isRequired
                      label="School Name"
                      placeholder="Enter school name"
                      variant="bordered"
                    /> */}

                      <Select
                        selectionMode="multiple"
                        label="Terms"
                        placeholder="Select Terms"
                        selectedKeys={term}
                        variant="bordered"
                        onSelectionChange={setTerm}
                      >
                        {dates.map((date) => (
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
    </div>
  );
};
