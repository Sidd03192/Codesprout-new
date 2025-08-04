import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem,
  Input,
  Card,
  CardBody,
} from "@heroui/react";

export const AddGradePanel = ({ isOpen, onClose, students, classes }) => {
  const [selectedStudent, setSelectedStudent] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState("");
  const [selectedAssignment, setSelectedAssignment] = React.useState("");
  const [grade, setGrade] = React.useState("");

  const assignments = [
    { id: "assign1", name: "Midterm Exam" },
    { id: "assign2", name: "Final Project" },
    { id: "assign3", name: "Homework 1" },
    { id: "assign4", name: "Quiz 1" },
  ];

  const handleSubmit = () => {
    console.log("Updating grade:", {
      selectedStudent,
      selectedClass,
      selectedAssignment,
      grade,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Add Grade</ModalHeader>
        <ModalBody>
          <div className="flex gap-4">
            <div className="flex-grow space-y-4">
              <Select
                label="Student"
                placeholder="Select a student"
                selectedKeys={selectedStudent ? [selectedStudent] : []}
                onSelectionChange={(keys) => setSelectedStudent(Array.from(keys)[0])}
              >
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Class"
                placeholder="Select a class"
                selectedKeys={selectedClass ? [selectedClass] : []}
                onSelectionChange={(keys) => setSelectedClass(Array.from(keys)[0])}
              >
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Assignment"
                placeholder="Select an assignment"
                selectedKeys={selectedAssignment ? [selectedAssignment] : []}
                onSelectionChange={(keys) => setSelectedAssignment(Array.from(keys)[0])}
              >
                {assignments.map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    {assignment.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Card className="w-64">
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Enter Grade</h3>
                <Input
                  type="number"
                  label="Grade"
                  placeholder="e.g. 85"
                  value={grade}
                  onValueChange={setGrade}
                />
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Save Grade
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};