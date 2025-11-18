import { useState, useCallback } from "react";

/**
 * Simple replacement for NextUI's useDisclosure hook
 * Returns state and handlers for controlling open/close of dialogs, modals, etc.
 */
export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const onOpenChange = useCallback((open) => setIsOpen(open), []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    onOpenChange,
    setIsOpen,
  };
}
