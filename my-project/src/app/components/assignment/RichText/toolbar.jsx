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
  const [isLoading, setIsLoading] = useState(false);
  const enhanceWithAI = async () => {
    if (!editor) return;
    const userInput = editor.getText();
    const res = await fetch("/api/enhance-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userInput }),
    });

    const { html } = await res.json();

    editor.commands.setContent(html, "html");
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
    <div className="flex flex-wrap items-center gap-0.5 p-2 bg-content1">
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
          aria-label="Code Block"
          className="shadow-lg"
        >
          <Icon
            icon="lucide:wand-sparkles"
            className="text-lg"
            color="#8b5cf6"
          />
        </Button>
      </Tooltip>
    </div>
  );
};
