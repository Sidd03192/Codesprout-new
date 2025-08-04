const EditAttendancePanel = ({ student, onClose, onSave }) => {
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [status, setStatus] = React.useState("present");
  
    const handleSave = () => {
      onSave(student.id, selectedDate, status);
    };
  
    return (
      <Modal isOpen={true} onClose={onClose}>
        <ModalHeader>Edit Attendance - {student.name}</ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <DatePicker selected={selectedDate} onChange={setSelectedDate} className="w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <RadioGroup value={status} onValueChange={setStatus} orientation="horizontal">
              <Radio value="present">Present</Radio>
              <Radio value="absent">Absent</Radio>
            </RadioGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button color="primary" onClick={handleSave}>Save</Button>
        </ModalFooter>
      </Modal>
    );
  };