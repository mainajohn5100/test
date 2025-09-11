
"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Link as LinkIcon,
} from "lucide-react";

type TiptapEditorProps = {
  editor: ReturnType<typeof useEditor>;
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  editor,
  placeholder,
}) => {

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${
            editor.isActive("strike") ? "bg-gray-200" : ""
          }`}
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
          }`}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded ${
            editor.isActive("blockquote") ? "bg-gray-200" : ""
          }`}
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
