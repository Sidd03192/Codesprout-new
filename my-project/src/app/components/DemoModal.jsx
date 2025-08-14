import React from "react";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

export const DemoModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Request a Demo</ModalHeader>
        <ModalBody>
          <p>Please fill out the form below to request a demo.</p>
          {/* Add your form fields here */}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
          <Button color="primary">Submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};