import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BlogService from "@/services/api/BlogService";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-xs focus:outline-none min-h-[300px] p-4 break-words text-sm",
        placeholder: placeholder,
      },
    },
  });

  const addImage = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const imageUrl = await BlogService.uploadImage(file);
          editor?.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
        }
      }
      document.body.removeChild(input);
    });

    input.click();
  };

  if (!editor) {
    return (
      <div className={`tiptap-editor ${className}`}>
        <div className="h-[300px] border border-gray-300 rounded-md p-4 flex items-center justify-center">
          <div className="text-gray-500">Đang tải editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tiptap-editor relative z-20 ${className}`}>
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-md p-2 bg-gray-50 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("strike") ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          <s>S</s>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-200"
              : "hover:bg-gray-100"
          }`}
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={addImage}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100"
        >
          📷 Image
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-sm rounded ${
            editor.isActive("blockquote") ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
        >
          Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 text-sm rounded hover:bg-gray-100"
        >
          —
        </button>
      </div>

      {/* Editor Content */}
      <div className="border border-t-0 border-gray-300 rounded-b-md overflow-hidden">
        <EditorContent
          editor={editor}
          style={{
            minHeight: "300px",
            height: "300px",
            overflow: "auto",
            wordWrap: "break-word",
            overflowWrap: "anywhere",
          }}
        />
      </div>
    </div>
  );
};

export default QuillEditor;
