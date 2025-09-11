

// 'use client';

// import { useEditor, EditorContent, Editor } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Placeholder from '@tiptap/extension-placeholder';
// import Link from '@tiptap/extension-link';
// import Image from '@tiptap/extension-image';
// import TextAlign from '@tiptap/extension-text-align';
// import {
//   Bold,
//   Strikethrough,
//   Italic,
//   List,
//   ListOrdered,
//   Heading2,
//   Quote,
//   Link2,
//   ImageIcon,
//   AlignLeft,
//   AlignCenter,
//   AlignRight,
// } from 'lucide-react';
// import { Toggle } from '@/components/ui/toggle';
// import { Separator } from './ui/separator';
// import { useCallback, useRef } from 'react';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
// import { storage } from '@/lib/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/auth-context';

// interface TiptapEditorProps {
//   editor: Editor | null;
//   content: string;
//   onChange: (richText: string) => void;
//   placeholder?: string;
// }

// export function TiptapEditor({ editor, content, onChange, placeholder }: TiptapEditorProps) {
//   const { firebaseUser } = useAuth();
//   const { toast } = useToast();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (!editor || !event.target.files || event.target.files.length === 0 || !firebaseUser) {
//       return;
//     }

//     const file = event.target.files[0];
//     const toastId = toast({ title: 'Uploading image...', description: 'Please wait.' }).id;

//     try {
//       const storageRef = ref(storage, `editor-uploads/${firebaseUser.uid}/${Date.now()}-${file.name}`);
//       const uploadResult = await uploadBytes(storageRef, file);
//       const downloadURL = await getDownloadURL(uploadResult.ref);
      
//       editor.chain().focus().setImage({ src: downloadURL }).run();
//       toast({ id: toastId, title: 'Upload complete!', description: 'Image has been inserted.' });
//     } catch (error) {
//       console.error("Image upload failed:", error);
//       toast({ id: toastId, title: 'Upload failed', description: 'Could not upload the image.', variant: 'destructive' });
//     } finally {
//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const addImage = useCallback(() => {
//     fileInputRef.current?.click();
//   }, []);

//   const setLink = useCallback(() => {
//     if (!editor) return;
//     const previousUrl = editor.getAttributes('link').href;
//     const url = window.prompt('URL', previousUrl);

//     if (url === null) {
//       return;
//     }
//     if (url === '') {
//       editor.chain().focus().extendMarkRange('link').unsetLink().run();
//       return;
//     }
//     editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
//   }, [editor]);

//   if (!editor) {
//     return null;
//   }

//   return (
//     <div className="flex flex-col gap-2 w-full max-w-4xl">
//        <input
//         type="file"
//         ref={fileInputRef}
//         onChange={handleFileSelect}
//         className="hidden"
//         accept="image/*"
//       />
//       <TooltipProvider>
//         <div className="flex flex-wrap items-center gap-1 rounded-md border p-1">
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('bold')}
//                 onPressedChange={() => editor.chain().focus().toggleBold().run()}
//               >
//                 <Bold className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Bold</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('italic')}
//                 onPressedChange={() => editor.chain().focus().toggleItalic().run()}
//               >
//                 <Italic className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Italic</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('strike')}
//                 onPressedChange={() => editor.chain().focus().toggleStrike().run()}
//               >
//                 <Strikethrough className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Strikethrough</TooltipContent>
//           </Tooltip>
//           <Separator orientation="vertical" className="h-8 w-[1px]" />
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive({ textAlign: 'left' })}
//                 onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
//               >
//                 <AlignLeft className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Align Left</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive({ textAlign: 'center' })}
//                 onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
//               >
//                 <AlignCenter className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Align Center</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive({ textAlign: 'right' })}
//                 onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
//               >
//                 <AlignRight className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Align Right</TooltipContent>
//           </Tooltip>
//           <Separator orientation="vertical" className="h-8 w-[1px]" />
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('heading', { level: 2 })}
//                 onPressedChange={() =>
//                   editor.chain().focus().toggleHeading({ level: 2 }).run()
//                 }
//               >
//                 <Heading2 className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Heading</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('bulletList')}
//                 onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
//               >
//                 <List className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Bullet List</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('orderedList')}
//                 onPressedChange={() =>
//                   editor.chain().focus().toggleOrderedList().run()
//                 }
//               >
//                 <ListOrdered className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Ordered List</TooltipContent>
//           </Tooltip>
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('blockquote')}
//                 onPressedChange={() =>
//                   editor.chain().focus().toggleBlockquote().run()
//                 }
//               >
//                 <Quote className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Blockquote</TooltipContent>
//           </Tooltip>
//           <Separator orientation="vertical" className="h-8 w-[1px]" />
//           <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 pressed={editor.isActive('link')}
//                 onPressedChange={setLink}
//               >
//                 <Link2 className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Add Link</TooltipContent>
//           </Tooltip>
//            <Tooltip>
//             <TooltipTrigger asChild>
//               <Toggle
//                 size="sm"
//                 onPressedChange={addImage}
//               >
//                 <ImageIcon className="h-4 w-4" />
//               </Toggle>
//             </TooltipTrigger>
//             <TooltipContent>Add Image</TooltipContent>
//           </Tooltip>
//         </div>
//       </TooltipProvider>
//       <EditorContent editor={editor} />
//     </div>
//   );
// }

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
  Image as ImageIcon,
} from "lucide-react";

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
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "Add a reply...",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
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
          "ProseMirror min-h-[150px] max-h-[400px] overflow-y-auto w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      },
    },
  });

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
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 rounded"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
