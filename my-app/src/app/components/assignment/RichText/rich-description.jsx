"use client";

// RichTextEditor.jsx

// future features.: Include better table ui in the description.

import { useEffect } from "react";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Placeholder } from '@tiptap/extensions'
import Heading from '@tiptap/extension-heading';
import js from 'highlight.js/lib/languages/javascript'
import {Color, TextStyle} from '@tiptap/extension-text-style';

import { all, createLowlight } from 'lowlight';
import './editor-styles.css'; // Import highlight.js theme (see below)

const lowlight = createLowlight(all); // You can also use `common` or individual
lowlight.register("javascript", js);

import { Toolbar } from "./toolbar";

export const RichTextEditor = ({ editorRef }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        codeBlock: false,
        heading: false,
      }),
      Placeholder.configure({
        placeholder: "Enter assignment guidelines",
        showOnlyCurrent: true,
        HTMLAttributes: {
          class: "text-default-400 bg-red-500 italic",
        },
      }),

      // Inline formatting
      Underline,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),

      // Images (base64 allowed)
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-md max-w-full",
        },
      }),

      // Bullet list (we disabled it above, so re‐enable with custom styles)
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc pl-6",
        },
      }),
      ListItem,

      // Code block with syntax highlighting
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        languageClassPrefix: "language-",
        HTMLAttributes: {
          class:
            "bg-red-500 rounded-md p-4 my-2 font-mono text-sm overflow-x-auto",
        },
      }),

      Heading.configure({
        levels: [1, 2],
        HTMLAttributes: {
          class: "prose prose-slate dark:prose-invert",
        },
      }),
      TextStyle,
    Color.configure({
      types: ['textStyle'],
    }),
    ],

    content: "",

    editorProps: {
      attributes: {
        class:
          "prose  prose-slate dark:prose-invert max-w-none focus:outline-none px-4 py-3 min-h-[120px] placeholder-default-400",
      },
    },
  });

  useEffect(() => {
    if (editorRef) {
      // Assign the Tiptap editor instance to the .current property
      editorRef.current = editor;
    }

    // Optional but good practice: Cleanup function to nullify the ref
    // when the component unmounts, preventing potential memory leaks.
    return () => {
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [editorRef, editor]);
  return (
    <div className="md:col-span-2 ">
      <div className="mb-2">
        <label className="text-xs font-medium text-foreground flex items-center gap-1">
          Assignment Description
          <span className="text-danger">*</span>
        </label>
      </div>
      <div className="rich-text-editor rounded-large border border-default-200 bg-content1 relative">
        <div className="sticky top-0 z-10 border-divider border-b">
          <Toolbar editor={editor} />
        </div>
        <div className="editor-content-wrapper   bg-white max-h-[300px] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
