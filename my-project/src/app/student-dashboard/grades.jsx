import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Input,
  Chip,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export const StudentGrades = () => {
  const [selectedTerm, setSelectedTerm] = React.useState("current");
  const [searchValue, setSearchValue] = React.useState("");

  const terms = [
    { id: "current", name: "Current Term (Fall 2023)" },
    { id: "spring2023", name: "Spring 2023" },
    { id: "fall2022", name: "Fall 2022" },
    { id: "spring2022", name: "Spring 2022" },
  ];

  const courses = [
    {
      id: 1,
      name: "Mathematics 101",
      instructor: "Dr. Robert Chen",
      credits: 4,
      currentGrade: "A-",
      gradePoints: 3.7,
      assignments: [
        { name: "Quiz 1", grade: "B+", weight: 10 },
        { name: "Midterm", grade: "A", weight: 30 },
        { name: "Problem Set 1-3", grade: "A-", weight: 15 },
        { name: "Problem Set 4-5", grade: "B+", weight: 15 },
        { name: "Final Project", grade: "In Progress", weight: 30 },
      ],
    },
    {
      id: 2,
      name: "Science 202",
      instructor: "Dr. Sarah Williams",
      credits: 4,
      currentGrade: "B+",
      gradePoints: 3.3,
      assignments: [
        { name: "Lab Report 1", grade: "A-", weight: 15 },
        { name: "Quiz 1", grade: "B", weight: 10 },
        { name: "Midterm", grade: "B+", weight: 25 },
        { name: "Lab Report 2", grade: "B+", weight: 15 },
        { name: "Final Exam", grade: "In Progress", weight: 35 },
      ],
    },
    {
      id: 3,
      name: "English 303",
      instructor: "Prof. James Miller",
      credits: 3,
      currentGrade: "A",
      gradePoints: 4.0,
      assignments: [
        { name: "Essay 1", grade: "A", weight: 20 },
        { name: "Participation", grade: "A", weight: 10 },
        { name: "Midterm Paper", grade: "A", weight: 30 },
        { name: "Presentation", grade: "A-", weight: 15 },
        { name: "Final Paper", grade: "In Progress", weight: 25 },
      ],
    },
    {
      id: 4,
      name: "History 101",
      instructor: "Dr. Emily Thompson",
      credits: 3,
      currentGrade: "B",
      gradePoints: 3.0,
      assignments: [
        { name: "Quiz 1", grade: "B-", weight: 10 },
        { name: "Research Paper", grade: "B+", weight: 25 },
        { name: "Midterm", grade: "B", weight: 25 },
        { name: "Presentation", grade: "B", weight: 15 },
        { name: "Final Exam", grade: "In Progress", weight: 25 },
      ],
    },
    {
      id: 5,
      name: "Art & Design",
      instructor: "Prof. Lisa Chen",
      credits: 3,
      currentGrade: "A-",
      gradePoints: 3.7,
      assignments: [
        { name: "Project 1", grade: "A", weight: 20 },
        { name: "Sketch Portfolio", grade: "A-", weight: 15 },
        { name: "Midterm Project", grade: "A-", weight: 30 },
        { name: "Participation", grade: "B+", weight: 10 },
        { name: "Final Portfolio", grade: "In Progress", weight: 25 },
      ],
    },
  ];

  const filteredCourses = courses.filter((course) => {
    if (
      searchValue &&
      !course.name.toLowerCase().includes(searchValue.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getGradeColor = (grade) => {
    if (grade?.startsWith("A")) return "success";
    if (grade?.startsWith("B")) return "primary";
    if (grade?.startsWith("C")) return "warning";
    if (grade === "In Progress") return "default";
    return "danger";
  };

  // Calculate GPA
  const totalCredits = filteredCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );
  const totalGradePoints = filteredCourses.reduce(
    (sum, course) => sum + course.gradePoints * course.credits,
    0
  );
  const gpa = totalGradePoints / totalCredits;

  // Expanded course state
  const [expandedCourse, setExpandedCourse] = React.useState(null);

  return (
    <div className="space-y-6">
      {/* GPA Card */}
      <Card className="border border-divider">
        <CardBody className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-4 bg-success-100 text-success">
              <Icon icon="lucide:award" className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Current GPA</h3>
              <p className="text-sm text-foreground-500">Fall 2023 Semester</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-center md:text-right">
            <h2 className="text-3xl font-bold">{gpa.toFixed(2)}</h2>
            <p className="text-sm text-foreground-500">
              {totalCredits} Credits
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Grades Table */}
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:bar-chart-2" className="text-lg" />
            <h2 className="text-lg font-medium">Course Grades</h2>
          </div>
          <div className="flex gap-2">
            <Button color="primary" variant="flat">
              <Icon icon="lucide:download" className="mr-1" />
              Export
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
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  endContent={<Icon icon="lucide:chevron-down" />}
                >
                  {terms.find((t) => t.id === selectedTerm)?.name ||
                    "Current Term"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Term selection"
                onAction={(key) => setSelectedTerm(key)}
                selectedKeys={[selectedTerm]}
                selectionMode="single"
              >
                {terms.map((term) => (
                  <DropdownItem key={term.id}>{term.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="space-y-4">
            {/* {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="border border-divider overflow-hidden"
                isPressable
                onPress={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              >
                <CardBody>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{course.name}</h3>
                        <Chip 
                          size="sm" 
                          color={getGradeColor(course.currentGrade)}
                          variant="flat"
                        >
                          {course.currentGrade}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-foreground-500">
                        <span>{course.instructor}</span>
                        <span>{course.credits} Credits</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="light" 
                        endContent={
                          <Icon 
                            icon={expandedCourse === course.id ? "lucide:chevron-up" : "lucide:chevron-down"} 
                          />
                        }
                      >
                        {expandedCourse === course.id ? "Hide Details" : "Show Details"}
                      </Button>
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="mt-4 pt-4 border-t border-divider">
                      <h4 className="text-sm font-medium mb-3">Assignment Grades</h4>
                      <Table 
                        removeWrapper
                        aria-label="Assignment grades"
                        classNames={{
                          table: "min-w-full",
                        }}
                      >
                        <TableHeader>
                          <TableColumn>ASSIGNMENT</TableColumn>
                          <TableColumn>GRADE</TableColumn>
                          <TableColumn>WEIGHT</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {course.assignments.map((assignment, index) => (
                            <TableRow key={index}>
                              <TableCell>{assignment.name}</TableCell>
                              <TableCell>
                                <Chip 
                                  size="sm" 
                                  color={getGradeColor(assignment.grade)}
                                  variant="flat"
                                >
                                  {assignment.grade}
                                </Chip>
                              </TableCell>
                              <TableCell>{assignment.weight}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))} */}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
