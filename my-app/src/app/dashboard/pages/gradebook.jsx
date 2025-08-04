import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { AddGradePanel } from "./AddGradePanel.jsx";

export const Gradebook = () => {
  const [selectedClass, setSelectedClass] = React.useState("all");
  const [searchValue, setSearchValue] = React.useState("");
  const [isAddGradeOpen, setIsAddGradeOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState(null);
  const [isAbsent, setIsAbsent] = React.useState(false);
  const [openPopoverId, setOpenPopoverId] = React.useState(null);

  const assignments = [
    "Assignment 1",
    "Assignment 2",
    "Assignment 3",
    "Assignment 4",
    "Midterm",
    "Final Exam",
  ];

  const [studentList, setStudentList] = React.useState([
    {
      id: 1,
      name: "Emma Thompson",
      email: "emma.t@example.com",
      attendance: 95,
      grades: [95, 88, 90, 93, 87, 91],
    },
    {
      id: 2,
      name: "James Wilson",
      email: "james.w@example.com",
      attendance: 92,
      grades: [85, 82, 78, 89, 90, 86],
    },
    {
      id: 3,
      name: "Sophia Garcia",
      email: "sophia.g@example.com",
      attendance: 98,
      grades: [99, 97, 96, 94, 93, 92],
    },
    {
      id: 4,
      name: "Liam Johnson",
      email: "liam.j@example.com",
      attendance: 85,
      grades: [70, 75, 80, 72, 68, 74],
    },
  ]);

  const classes = [
    { id: "all", name: "All Classes" },
    { id: "math101", name: "Mathematics 101" },
    { id: "sci202", name: "Science 202" },
    { id: "eng303", name: "English 303" },
  ];

  const filteredStudents = studentList.filter((student) =>
    student.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 90) return "success";
    if (score >= 80) return "primary";
    if (score >= 70) return "warning";
    return "danger";
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return "success";
    if (attendance >= 90) return "primary";
    if (attendance >= 80) return "warning";
    return "danger";
  };

  const handleDeleteStudent = (id) => {
    setStudentList((prev) => prev.filter((s) => s.id !== id));
    setOpenPopoverId(null);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-divider">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon icon="lucide:bar-chart-2" className="text-lg" />
            <h2 className="text-lg font-medium">Gradebook</h2>
          </div>
          <div className="flex gap-2">
            <Button color="primary" variant="flat">
              <Icon icon="lucide:download" className="mr-1" />
              Export
            </Button>
            <Button color="primary" onClick={() => setIsAddGradeOpen(true)}>
              <Icon icon="lucide:plus" className="mr-1" />
              Add Grade
            </Button>
          </div>
        </CardHeader>

        {/* Remove white background by using bg-transparent */}
        <CardBody className="bg-transparent">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Input
              placeholder="Search students..."
              startContent={<Icon icon="lucide:search" />}
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full sm:max-w-xs"
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                  {classes.find((c) => c.id === selectedClass)?.name || "All Classes"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Class selection"
                onAction={(key) => setSelectedClass(key)}
                selectedKeys={[selectedClass]}
                selectionMode="single"
              >
                {classes.map((cls) => (
                  <DropdownItem key={cls.id}>{cls.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              {/* Header without background */}
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">STUDENT</th>
                  {assignments.map((title, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 text-left">
                      {title}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-4 py-2 text-left">ATTENDANCE
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={`https://img.heroui.chat/image/avatar?w=32&h=32&u=student${student.id}`}
                          className="h-8 w-8"
                        />
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-foreground-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    {student.grades.map((score, i) => (
                      <td key={i} className="border border-gray-300 px-4 py-2">
                        <Chip size="sm" color={getScoreColor(score)} variant="flat">
                          {score}%
                        </Chip>
                      </td>
                    ))}
                    <td className="border border-gray-300 px-4 py-2">
                      <Chip size="sm" color={getAttendanceColor(student.attendance)} variant="flat">
                        {student.attendance}%
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => {
                            setEditingStudent(student);
                            setIsAbsent(false);
                          }}
                        >
                          <Icon icon="lucide:edit" className="mr-1" />
                          Edit
                        </Button>
                      </Chip>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <Popover
                          isOpen={openPopoverId === student.id}
                          onOpenChange={(isOpen) => setOpenPopoverId(isOpen ? student.id : null)}
                        >
                          <PopoverTrigger>
                            <Button size="sm" variant="light" isIconOnly>
                            
                              <Icon icon="lucide:more-vertical" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-2 w-[140px]">
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              fullWidth
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Icon icon="lucide:trash" className="mr-1" />
                              Delete
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Attendance Panel */}
      {editingStudent && (
        <Card className="border border-primary-200 bg-primary-50 p-4 space-y-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold">
                Mark Attendance for {editingStudent.name}
              </h3>
              <Button variant="light" size="sm" onClick={() => setEditingStudent(null)}>
                <Icon icon="lucide:x" className="mr-1" />
                Close
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-foreground-600">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </p>
            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={isAbsent}
                onChange={() => setIsAbsent(!isAbsent)}
              />
              <span>{editingStudent.name} is absent today</span>
            </label>
          </CardBody>
        </Card>
      )}

      {/* Add Grade Panel */}
      <AddGradePanel
        isOpen={isAddGradeOpen}
        onClose={() => setIsAddGradeOpen(false)}
        students={studentList}
        classes={classes}
      />
    </div>
  );
};
