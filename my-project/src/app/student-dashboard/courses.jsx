import React, { useEffect, useState } from "react";
import {
  addToast,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  InputOtp,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { getUserCourses, joinClassroom, getCourseDetails, leaveClassroom } from "./api";

export const StudentCourses = ({ user_id }) => {
  const [selected, setSelected] = useState("current");
  const [searchValue, setSearchValue] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [joinCode, setJoinCode] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("assignments");
  const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure();
  const [courseToLeave, setCourseToLeave] = useState(null);

  const loadCourses = async () => {
    const courses = await getUserCourses(user_id);
    console.log("courses:", courses);
    setCourses(courses);
  };

  const loadCourseDetails = async (courseId) => {
    setLoading(true);
    try {
      const result = await getCourseDetails(courseId, user_id);
      if (result.success) {
        setCourseData(result.data);
      } else {
        console.error("Failed to load course details:", result.error);
      }
    } catch (error) {
      console.error("Error loading course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCourse = (course) => {
    setSelectedCourse(course);
    loadCourseDetails(course.id);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setCourseData(null);
    setActiveTab("assignments");
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleJoinClassroom = async () => {
    const result = await joinClassroom(joinCode, user_id);
    if (!result) {
      addToast({
        title: "Join Failed",
        description: "Invalid code or you already joined this classroom.",
        status: "danger",
      });
      return; // Stop here, don’t try to reload courses
    }

    addToast({
      title: "Joined Successfully",
      description: `You have joined ${result.name || "a new course"}!`,
      status: "success",
    });

    await loadCourses(); // reload from DB
    onClose();
    setJoinCode("");
  };

  const handleLeaveClassroom = async () => {
    if (!courseToLeave) return;
    
    const result = await leaveClassroom(courseToLeave.id, user_id);
    if (result.success) {
      addToast({
        title: "Left Successfully",
        description: `You have left ${courseToLeave.name}`,
        status: "success",
      });
      await loadCourses();
    } else {
      addToast({
        title: "Leave Failed",
        description: result.error || "Failed to leave classroom",
        status: "danger",
      });
    }
    
    setCourseToLeave(null);
    onLeaveClose();
  };

  const handleLeaveClick = (course) => {
    setCourseToLeave(course);
    onLeaveOpen();
  };
  console.log("user id id:", user_id);
  const filteredCourses = courses.filter((course) => {
    course.status = "current"; //need to change this
    if (selected === "current" && course.status !== "current") return false;
    if (selected === "past" && course.status !== "past") return false;
    if (
      searchValue &&
      !course.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      !course.code.toLowerCase().includes(searchValue.toLowerCase())
    )
      return false;
    return true;
  });
  console.log("filteredCourses:", filteredCourses);
  
  // If a course is selected, show the detail view
  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {loading ? (
          <Card className="border border-divider">
            <CardBody className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading course details...</p>
              </div>
            </CardBody>
          </Card>
        ) : courseData ? (
          <>
            {/* Back Button - Outside hero for better visibility */}
            <div className="flex items-center justify-between">
              <Button
                variant="flat"
                color="primary"
                startContent={<Icon icon="lucide:arrow-left" />}
                onPress={handleBackToCourses}
              >
                Back to Courses
              </Button>
            </div>

            {/* Hero Section */}
            <Card className="border border-divider overflow-hidden">
              <div className="relative h-64 w-full">
                <img
                  src={selectedCourse.image || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800"}
                  alt={selectedCourse.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Hero Content Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-end mb-4">
                    <Chip size="sm" color="primary" variant="solid">
                      {selectedCourse.code || courseData.course.name}
                    </Chip>
                  </div>
                  
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-2">{courseData.course.name}</h1>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className="flex items-center gap-1">
                        <Icon icon="lucide:users" />
                        {courseData.assignments.length} Assignments
                      </span>
                    </div>
                    
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabbed Content */}
            <Card className="border border-divider">
              <CardBody>
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  aria-label="Course content"
                  classNames={{
                    base: "w-full",
                    tabList: "gap-2 mb-6",
                  }}
                >
                  <Tab 
                    key="assignments" 
                    title={
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:file-text" />
                        <span>Assignments</span>
                        <Chip size="sm" variant="flat" color="primary">
                          {courseData.assignments.length}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      {courseData.assignments.length > 0 ? (
                        courseData.assignments.map((assignment) => (
                          <Card key={assignment.id} className="border border-divider">
                            <CardBody>
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-medium text-lg">
                                      {assignment.assignments?.title || assignment.title}
                                    </h3>
                                    <Chip
                                      size="sm"
                                      color={assignment.submitted_at ? "success" : 
                                             new Date(assignment.assignments?.due_at) < new Date() ? "danger" : "warning"}
                                      variant="flat"
                                    >
                                      {assignment.submitted_at ? "Submitted" : 
                                       new Date(assignment.assignments?.due_at) < new Date() ? "Overdue" : "Pending"}
                                    </Chip>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 text-sm text-foreground-500">
                                    <span className="flex items-center gap-1">
                                      <Icon icon="lucide:calendar" />
                                      Due: {new Date(assignment.assignments?.due_at).toLocaleDateString()}
                                    </span>
                                    {assignment.grading_data && assignment.grading_data.totalPointsAchieved !== undefined && (
                                      <span className="flex items-center gap-1">
                                        <Icon icon="lucide:award" />
                                        Grade: {assignment.grading_data.totalPointsAchieved}/{assignment.grading_data.maxTotalPoints}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Icon icon="lucide:code" />
                                      {assignment.assignments?.language}
                                    </span>
                                  </div>
                                </div>
                                
                                <Button size="sm" color="primary" variant="flat">
                                  <Icon icon="lucide:eye" className="mr-1" />
                                  View Assignment
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Icon icon="lucide:file-text" className="mx-auto text-4xl text-foreground-400 mb-2" />
                          <p className="text-foreground-500">No assignments found</p>
                        </div>
                      )}
                    </div>
                  </Tab>

                  <Tab 
                    key="documents" 
                    title={
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:folder" />
                        <span>Documents</span>
                        <Chip size="sm" variant="flat" color="secondary">
                          {courseData.documents.length}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      {courseData.documents.length > 0 ? (
                        courseData.documents.map((doc) => (
                          <Card key={doc.id} className="border border-divider">
                            <CardBody>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-3 rounded-md bg-content2">
                                    <Icon
                                      icon={
                                        doc.type === "PDF" ? "lucide:file-text" :
                                        doc.type === "PPTX" ? "lucide:presentation" :
                                        doc.type === "DOCX" ? "lucide:file-text" : "lucide:file"
                                      }
                                      className="text-xl"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{doc.name}</h3>
                                    <div className="flex items-center gap-4 text-sm text-foreground-500">
                                      <span>{doc.type}</span>
                                      <span>{doc.size}</span>
                                      <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button size="sm" color="primary" variant="flat">
                                  <Icon icon="lucide:download" className="mr-1" />
                                  Download
                                </Button>
                              </div>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Icon icon="lucide:folder" className="mx-auto text-4xl text-foreground-400 mb-2" />
                          <p className="text-foreground-500">No documents available</p>
                        </div>
                      )}
                    </div>
                  </Tab>

                  <Tab 
                    key="announcements" 
                    title={
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:megaphone" />
                        <span>Announcements</span>
                        <Chip size="sm" variant="flat" color="warning">
                          {courseData.announcements.length}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      {courseData.announcements.length > 0 ? (
                        courseData.announcements.map((announcement) => (
                          <Card key={announcement.id} className="border border-divider">
                            <CardBody>
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${
                                  announcement.priority === "high" ? "bg-danger-100 text-danger" : "bg-default-100 text-default-600"
                                }`}>
                                  <Icon
                                    icon={announcement.priority === "high" ? "lucide:alert-circle" : "lucide:bell"}
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">{announcement.title}</h3>
                                    <span className="text-xs text-foreground-500">
                                      {new Date(announcement.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground-600 mb-2">
                                    {announcement.content}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-foreground-500">
                                    <Icon icon="lucide:user" />
                                    <span>Posted by {announcement.author}</span>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Icon icon="lucide:megaphone" className="mx-auto text-4xl text-foreground-400 mb-2" />
                          <p className="text-foreground-500">No announcements yet</p>
                        </div>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </>
        ) : null}
      </div>
    );
  }

  // Default course list view
  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:book" className="text-lg" />
            <h2 className="text-lg font-medium">My Courses</h2>
          </div>
          <div className="flex gap-2">
            <Button color="primary" variant="flat">
              <Icon icon="lucide:filter" className="mr-1" />
              Filter
            </Button>
            <Button color="primary" variant="flat">
              <Icon icon="lucide:calendar" className="mr-1" />
              Schedule
            </Button>
            <Button
              color="primary"
              startContent={<Icon icon="lucide:plus" />}
              onPress={onOpen}
            >
              Join Course
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Input
              placeholder="Search courses..."
              startContent={<Icon icon="lucide:search" />}
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full sm:max-w-xs"
            />
            <Tabs
              selectedKey={selected}
              onSelectionChange={setSelected}
              aria-label="Course status"
              classNames={{
                base: "w-full sm:w-auto",
                tabList: "gap-2",
              }}
            >
              <Tab key="current" title="Current Courses" />
              <Tab key="past" title="Past Courses" />
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Card key={course.id} className="border border-divider">
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={course.image || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=400&fit=crop&auto=format`}
                      alt={course.name}
                      className="h-full w-full object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=400&fit=crop&auto=format`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-3 left-4">
                      <Chip size="sm" color="primary" variant="solid">
                        {course.code}
                      </Chip>
                    </div>
                  </div>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{course.name}</h3>
                        <p className="text-sm text-foreground-500 mt-1">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Avatar
                          name={course.name?.charAt(0).toUpperCase() || "C"}
                          className="h-10 w-10 bg-primary text-white"
                        />
                        <div>
                          <p className="font-medium">Instructor</p>
                          <p className="text-xs text-foreground-500">
                            Teaching Staff
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between gap-2">
                        <Button 
                          size="sm" 
                          color="danger" 
                          variant="flat"
                          onPress={() => handleLeaveClick(course)}
                        >
                          <Icon icon="lucide:log-out" className="mr-1" />
                          Leave
                        </Button>
                        <div className="flex gap-2">
                          <Button size="sm" variant="flat">
                            <Icon icon="lucide:book-open" className="mr-1" />
                            Materials
                          </Button>
                          <Button size="sm" color="primary" onPress={() => handleGoToCourse(course)}>
                            <Icon icon="lucide:log-in" className="mr-1" />
                            Go to Course
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Icon
                  icon="lucide:search-x"
                  className="mx-auto text-4xl text-foreground-400 mb-2"
                />
                <p className="text-foreground-500">No courses found</p>
                <p className="text-sm text-foreground-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Join Course Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Join a Course
              </ModalHeader>
              <ModalBody>
                <p className="text-center mb-4">
                  Enter the 5-digit course code provided by your instructor.
                </p>
                <div className="flex justify-center">
                  <InputOtp
                    length={5}
                    value={joinCode}
                    onValueChange={setJoinCode}
                    classNames={{
                      input: "w-12 h-12 text-2xl",
                      inputWrapper: "gap-2",
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleJoinClassroom}
                  isDisabled={joinCode.length !== 5}
                >
                  Join Course
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Leave Course Confirmation Modal */}
      <Modal isOpen={isLeaveOpen} onClose={onLeaveClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Leave Course
              </ModalHeader>
              <ModalBody>
                <p className="text-center mb-4">
                  Are you sure you want to leave <strong>{courseToLeave?.name}</strong>?
                </p>
                <p className="text-sm text-foreground-500 text-center">
                  You will lose access to all course materials and assignments. You can rejoin using the course code if needed.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onPress={handleLeaveClassroom}
                >
                  Leave Course
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
