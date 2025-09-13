

"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type TiptapEditorProps = {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content = "",
  onChange,
  placeholder,
}) => {
  const [toolbarOpen, setToolbarOpen] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "Add a reply...",
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-[120px] max-h-[400px] overflow-y-auto w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      },
    },
  });

  // Re-sync content if it changes from outside
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-1">
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setToolbarOpen(!toolbarOpen)}
            className={cn(
                "h-8 w-8 transition-transform",
                toolbarOpen && "rotate-180"
            )}
        >
            <ChevronRight className="h-4 w-4" />
        </Button>
        <div 
            className={cn(
                "flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden",
                toolbarOpen ? "max-w-full opacity-100" : "max-w-0 opacity-0"
            )}
        >
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
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
