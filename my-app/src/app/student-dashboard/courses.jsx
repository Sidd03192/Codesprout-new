import React, { useEffect, useState } from "react";
import { addToast,Card, CardBody, CardHeader, Button, Input, Tabs, Tab, Chip, Avatar, Progress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, InputOtp } from "@heroui/react";
import { Icon } from "@iconify/react";
import { getUserCourses, joinClassroom } from "./api";

export const StudentCourses = ({user_id}) => {
  const [selected, setSelected] = useState("current");
  const [searchValue, setSearchValue] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [joinCode, setJoinCode] = useState("");
  const [courses, setCourses] = useState([]);

  const loadCourses = async () => {
      const courses = await getUserCourses(user_id);
      console.log("courses:", courses);
      setCourses(courses);
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
  console.log("user id id:", user_id);
  const filteredCourses = courses.filter(course => {
    course.status = "current"; //need to change this
    if (selected === "current" && course.status !== "current") return false;
    if (selected === "past" && course.status !== "past") return false;
    if (searchValue && !course.name.toLowerCase().includes(searchValue.toLowerCase()) &&
        !course.code.toLowerCase().includes(searchValue.toLowerCase())) return false;
    return true;
  });
  console.log("filteredCourses:", filteredCourses);
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
                tabList: "gap-2"
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
                  <div className="relative h-40 w-full">
                    <img 
                      src={course.image} 
                      alt={course.name} 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-3 left-4">
                      <Chip 
                        size="sm" 
                        color="primary" 
                        variant="solid"
                      >
                        {course.code}
                      </Chip>
                    </div>
                  </div>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{course.name}</h3>
                        <p className="text-sm text-foreground-500 mt-1">{course.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Avatar src={course.instructorAvatar} className="h-10 w-10" />
                        <div>
                          <p className="font-medium">{course.instructor}</p>
                          <p className="text-xs text-foreground-500">Instructor</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:clock" className="text-foreground-500" />
                          <span className="text-sm">{course.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:map-pin" className="text-foreground-500" />
                          <span className="text-sm">{course.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:award" className="text-foreground-500" />
                          <span className="text-sm">{course.credits} Credits</span>
                        </div>
                      </div>
                      
                      {course.status === "current" && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Course Progress</span>
                            <span className="text-sm font-medium">{course.progress}%</span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            color={course.progress > 75 ? "success" : "primary"} 
                            className="h-2"
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="flat">
                          <Icon icon="lucide:book-open" className="mr-1" />
                          Materials
                        </Button>
                        <Button size="sm" color="primary">
                          <Icon icon="lucide:log-in" className="mr-1" />
                          Go to Course
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Icon icon="lucide:search-x" className="mx-auto text-4xl text-foreground-400 mb-2" />
                <p className="text-foreground-500">No courses found</p>
                <p className="text-sm text-foreground-400">Try adjusting your search or filters</p>
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
              <ModalHeader className="flex flex-col gap-1">Join a Course</ModalHeader>
              <ModalBody>
                <p className="text-center mb-4">Enter the 5-digit course code provided by your instructor.</p>
                <InputOtp 
                  length={5}
                  value={joinCode}
                  onValueChange={setJoinCode}
                  classNames={{
                    input: "w-12 h-12 text-2xl",
                    inputWrapper: "gap-2"
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleJoinClassroom} isDisabled={joinCode.length !== 5}>
                  Join Course
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};