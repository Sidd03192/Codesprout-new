// Toolbar.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input,
} from "@heroui/react";
import {
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
  DropdownItem,
} from "@heroui/react";
import { WandSparkles } from "lucide-react";
import { Icon } from "@iconify/react";

export const Toolbar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Dummy state
  const [_, setRender] = useState(0);
  const [isAILoading, setIsAILoading] = useState(false);
  const [originalContent, setOriginalContent] = useState(null);
  const [showAIActions, setShowAIActions] = useState(false);
  const [followUpInput, setFollowUpInput] = useState("");
  const [showFollowUp, setShowFollowUp] = useState(false);

  // Define available colors
  const colors = [
    { name: "Default", value: "#ffffff" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Yellow", value: "#eab308" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Gray", value: "#6b7280" },
  ];

  // Function to set text color
  const setTextColor = (color) => {
    if (color === "#000000") {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  };

  // Get current text color or default
  const getCurrentColor = () => {
    const currentColor = editor.getAttributes("textStyle").color;
    return currentColor || "#ffffff";
  };

  const handleStreamingResponse = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let isFirstChunk = true;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                
                if (data.partial) {
                  // Stream raw markdown text for live preview
                  if (data.content) {
                    if (isFirstChunk) {
                      // Clear editor and add first chunk
                      editor.commands.setContent('');
                      editor.commands.insertContent(data.content, { parseOptions: { preserveWhitespace: 'full' } });
                      isFirstChunk = false;
                    } else {
                      // Append subsequent markdown chunks
                      editor.commands.insertContent(data.content, { parseOptions: { preserveWhitespace: 'full' } });
                    }
                  }
                } else {
                  // Final complete response - replace with rendered HTML
                  if (data.html) {
                    editor.commands.setContent(data.html, "html");
                  }
                }
              }
            } catch (e) {
              console.log('Skipping malformed JSON:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const enhanceWithAI = async () => {
    if (!editor || isAILoading) return;

    const currentText = editor.getText().trim();
    if (!currentText) {
      alert("Please enter some content to enhance.");
      return;
    }

    setIsAILoading(true);
    setOriginalContent(editor.getHTML());
    editor.setEditable(false);

    try {
      const res = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentText }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      await handleStreamingResponse(res);
      setShowAIActions(true);
      
      console.log("AI Enhancement completed with streaming");
    } catch (error) {
      console.error("AI enhancement failed:", error);
      alert("Enhancement failed. Please try again.");
      editor.setEditable(true);
    } finally {
      setIsAILoading(false);
    }
  };

  const acceptChanges = () => {
    setOriginalContent(null);
    setShowAIActions(false);
    setShowFollowUp(false);
    editor.setEditable(true);
  };

  const undoChanges = () => {
    if (originalContent) {
      editor.commands.setContent(originalContent, "html");
    }
    setOriginalContent(null);
    setShowAIActions(false);
    setShowFollowUp(false);
    editor.setEditable(true);
  };

  const handleFollowUp = async () => {
    if (!followUpInput.trim() || !editor || isAILoading) return;

    setIsAILoading(true);
    setShowFollowUp(false);

    try {
      const currentContent = editor.getText();
      const res = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentContent,
          followUp: followUpInput
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      await handleStreamingResponse(res);
      setFollowUpInput("");
      
      console.log("Follow-up enhancement completed with streaming");
    } catch (error) {
      console.error("Follow-up enhancement failed:", error);
      alert("Follow-up enhancement failed. Please try again.");
    } finally {
      setIsAILoading(false);
    }
  };

  useEffect(() => {
    if (editor) {
      // sid ahh fix... need to look into this and make more efficient.
      const forceUpdate = () => setRender((n) => n + 1);
      editor.on("transaction", forceUpdate);
      editor.on("selectionUpdate", forceUpdate);
      return () => {
        editor.off("transaction", forceUpdate);
        editor.off("selectionUpdate", forceUpdate);
      };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }
  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
    }
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 p-2 bg-content1"
      style={{ opacity: isAILoading ? 0.7 : 1 }}
    >
      {/* Heading 1 */}

      <Tooltip content="Heading 1" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "solid" : "light"}
          color={
            editor.isActive("heading", { level: 1 }) ? "primary" : "default"
          }
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          aria-label="Heading 1"
        >
          <Icon icon="lucide:heading-1" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Heading 2 */}
      <Tooltip content="Heading 2" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "solid" : "light"}
          color={
            editor.isActive("heading", { level: 2 }) ? "primary" : "default"
          }
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
        >
          <Icon icon="lucide:heading-2" className="text-lg" />
        </Button>
      </Tooltip>

      <Tooltip content="Heading 3" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "solid" : "light"}
          color={
            editor.isActive("heading", { level: 3 }) ? "primary" : "default"
          }
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          aria-label="Heading 2"
        >
          <Icon icon="lucide:heading-2" className="text-lg" />
        </Button>
      </Tooltip>
      <div className="h-6 w-px bg-divider mx-1"></div>

      {/* Bold */}
      <Tooltip content="Bold" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bold") ? "solid" : "light"}
          color={editor.isActive("bold") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <Icon icon="lucide:bold" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Italic */}
      <Tooltip content="Italic" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("italic") ? "solid" : "light"}
          color={editor.isActive("italic") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <Icon icon="lucide:italic" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Underline */}
      <Tooltip content="Underline" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("underline") ? "solid" : "light"}
          color={editor.isActive("underline") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <Icon icon="lucide:underline" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Superscript */}
      <Tooltip content="Superscript" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("superscript") ? "solid" : "light"}
          color={editor.isActive("superscript") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleSuperscript().run()}
          aria-label="Superscript"
        >
          <Icon icon="lucide:superscript" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Text Color */}
      <Popover>
        <PopoverTrigger>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="Text Color"
            className="relative"
          >
            <div
              className="w-6 h-6 rounded-full border border-divider cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: getCurrentColor() }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          aria-label="Text Color Options"
          className="p-2"
          itemClasses={{
            base: "p-0 min-w-0",
          }}
        >
          <div key="colors" className="p-2">
            <div className="grid grid-cols-4 gap-2">
              {" "}
              {/* Adjust cols as needed */}
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setTextColor(color.value)}
                  className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-divider mx-1"></div>

      {/* Link (with Popover) */}
      <Popover placement="bottom">
        <PopoverTrigger>
          <Button
            isIconOnly
            size="sm"
            variant={editor.isActive("link") ? "solid" : "light"}
            color={editor.isActive("link") ? "primary" : "default"}
            aria-label="Link"
          >
            <Icon icon="lucide:link" className="text-lg" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2 flex flex-col gap-2">
            <Input
              label="URL"
              size="sm"
              placeholder="https://example.com"
              value={linkUrl}
              onValueChange={setLinkUrl}
            />
            <Button size="sm" color="primary" onPress={addLink}>
              {editor.isActive("link") ? "Update Link" : "Add Link"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Bullet List */}
      <Tooltip content="Bullet List" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bulletList") ? "solid" : "light"}
          color={editor.isActive("bulletList") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet List"
        >
          <Icon icon="lucide:list" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Code Block */}

      <Tooltip content="Code Block" placement="bottom">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("codeBlock") ? "solid" : "light"}
          color={editor.isActive("codeBlock") ? "primary" : "default"}
          onPress={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code Block"
        >
          <Icon icon="lucide:code" className="text-lg" />
        </Button>
      </Tooltip>

      {/* Image (with Popover) */}
      <Popover placement="bottom">
        <PopoverTrigger>
          <Button isIconOnly size="sm" variant="light" aria-label="Image">
            <Icon icon="lucide:image" className="text-lg" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="p-2 flex flex-col gap-2">
            <Input
              label="Image URL"
              size="sm"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onValueChange={setImageUrl}
            />
            <Button size="sm" color="primary" onPress={addImage}>
              Add Image
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <div className="h-6 w-[.5px] bg-divider mx-1"></div>

      <Tooltip content="Enhance with AI (Beta)" placement="top">
        <Button
          isIconOnly
          size="sm"
          onPress={enhanceWithAI}
          variant={"light"}
          color={"default"}
          aria-label="Enhance with AI"
          className="shadow-lg"
          isDisabled={isAILoading}
          isLoading={isAILoading}
        >
          {!isAILoading && (
            <Icon
              icon="lucide:wand-sparkles"
              className="text-lg"
              color="#8b5cf6"
            />
          )}
        </Button>
      </Tooltip>

      {/* AI Action Buttons */}
      {showAIActions && (
        <>
          <div className="h-6 w-[.5px] bg-divider mx-1"></div>

          <Tooltip content="Accept AI Changes" placement="top">
            <Button
              isIconOnly
              size="sm"
              onPress={acceptChanges}
              variant="light"
              color="success"
              aria-label="Accept Changes"
            >
              <Icon icon="lucide:check" className="text-lg" />
            </Button>
          </Tooltip>

          <Tooltip content="Undo AI Changes" placement="top">
            <Button
              isIconOnly
              size="sm"
              onPress={undoChanges}
              variant="light"
              color="danger"
              aria-label="Undo Changes"
            >
              <Icon icon="lucide:undo" className="text-lg" />
            </Button>
          </Tooltip>

          <Popover isOpen={showFollowUp} onOpenChange={setShowFollowUp}>
            <PopoverTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="primary"
                aria-label="Follow-up Question"
                onPress={() => setShowFollowUp(true)}
              >
                <Icon icon="lucide:message-circle" className="text-lg" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-3 flex flex-col gap-2 min-w-[250px]">
                <Input
                  label="Follow-up request"
                  size="sm"
                  placeholder="e.g., Make it more concise..."
                  value={followUpInput}
                  onValueChange={setFollowUpInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleFollowUp();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    onPress={handleFollowUp}
                    isDisabled={!followUpInput.trim() || isAILoading}
                    isLoading={isAILoading}
                    className="flex-1"
                  >
                    Enhance
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setShowFollowUp(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
};
