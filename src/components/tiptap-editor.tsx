

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "./ui/tooltip";

type TiptapEditorProps = {
  content?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  toolbarVisible?: boolean;
};

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content = "",
  onChange,
  placeholder,
  toolbarVisible = false,
}) => {

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
  
  const toolbarButtons = [
    { name: "bold", icon: Bold, action: () => editor.chain().focus().toggleBold().run(), tooltip: "Bold" },
    { name: "italic", icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), tooltip: "Italic" },
    { name: "strike", icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), tooltip: "Strikethrough" },
    { name: "bulletList", icon: List, action: () => editor.chain().focus().toggleBulletList().run(), tooltip: "Bullet List" },
    { name: "orderedList", icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), tooltip: "Numbered List" },
    { name: "heading", icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), tooltip: "Heading" },
    { name: "blockquote", icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), tooltip: "Blockquote" },
    { name: "link", icon: LinkIcon, action: () => { const url = prompt("Enter URL"); if(url) editor.chain().focus().setLink({ href: url }).run()}, tooltip: "Add Link" },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
       <div 
            className={cn(
                "flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden",
                toolbarVisible ? "h-10 opacity-100" : "h-0 opacity-0"
            )}
        >
            <TooltipProvider>
            {toolbarButtons.map(btn => {
                const Icon = btn.icon;
                return (
                    <Tooltip key={btn.name}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={btn.action}
                                className={cn("p-2 rounded hover:bg-muted", editor.isActive(btn.name) ? "bg-muted text-foreground" : "text-muted-foreground")}
                            >
                                <Icon className="w-4 h-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{btn.tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                )
            })}
            </TooltipProvider>
        </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
