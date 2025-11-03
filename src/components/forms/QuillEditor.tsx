import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { toast } from "sonner";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import CodeBlock from "@tiptap/extension-code-block";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import BlogService from "@/services/api/BlogService";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  Unlink,
  Palette,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  Save,
  Eye,
  EyeOff,
  Indent,
  Outdent,
} from "lucide-react";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  showWordCount?: boolean;
  maxLength?: number;
  onSave?: () => void;
  isSaving?: boolean;
  disableImageUpload?: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
  showPreview = false,
  showWordCount = true,
  maxLength,
  onSave,
  isSaving = false,
  disableImageUpload = false,
}) => {
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-teal-600 underline hover:text-teal-800",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Superscript,
      Subscript,
      Highlight.configure({
        multicolor: true,
      }),
      CodeBlock,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-2 break-words text-sm leading-relaxed",
        placeholder: placeholder,
      },
    },
  });

  // Update editor content when value changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Helper functions
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
          toast.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
        }
      }
      document.body.removeChild(input);
    });

    input.click();
  };

  const addLink = () => {
    const url = window.prompt("Nhập URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  const setTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  const resetTextColor = () => {
    editor?.chain().focus().unsetColor().run();
  };

  const setHighlight = (color: string) => {
    editor?.chain().focus().setHighlight({ color }).run();
  };

  const resetHighlight = () => {
    editor?.chain().focus().unsetHighlight().run();
  };

  // Note: Table extension would need to be added separately
  // const insertTable = () => {
  //   editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  // };

  const insertCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  const insertHorizontalRule = () => {
    editor?.chain().focus().setHorizontalRule().run();
  };

  const indentList = () => {
    if (editor?.isActive("bulletList") || editor?.isActive("orderedList")) {
      editor?.chain().focus().sinkListItem("listItem").run();
    } else {
      // Nếu không phải danh sách, tạo bullet list trước
      editor?.chain().focus().toggleBulletList().run();
    }
  };

  const outdentList = () => {
    if (editor?.isActive("bulletList") || editor?.isActive("orderedList")) {
      editor?.chain().focus().liftListItem("listItem").run();
    }
  };

  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const getCharacterCount = () => {
    if (!editor) return 0;
    return editor.getText().length;
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
    disabled = false,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? "bg-teal-100 text-teal-700 border border-teal-200"
          : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  if (!editor) {
    return (
      <div className={`tiptap-editor ${className}`}>
        <div className="h-[400px] border border-gray-300 rounded-lg p-4 flex items-center justify-center">
          <div className="text-gray-500">Đang tải editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`tiptap-editor relative z-20 ${className}`}>
      {/* Main Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-white shadow-sm">
        {/* Top Toolbar */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="In đậm (Ctrl+B)"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="In nghiêng (Ctrl+I)"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Gạch chân (Ctrl+U)"
              >
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Gạch ngang"
              >
                <Strikethrough className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                isActive={editor.isActive("heading", { level: 1 })}
                title="Tiêu đề 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                isActive={editor.isActive("heading", { level: 2 })}
                title="Tiêu đề 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                isActive={editor.isActive("heading", { level: 3 })}
                title="Tiêu đề 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Danh sách có dấu đầu dòng"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Danh sách có số"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={indentList}
                title="Thụt dòng danh sách (tự động tạo danh sách nếu cần)"
              >
                <Indent className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={outdentList}
                disabled={
                  !editor.isActive("bulletList") &&
                  !editor.isActive("orderedList")
                }
                title="Bỏ thụt dòng danh sách"
              >
                <Outdent className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                isActive={editor.isActive({ textAlign: "left" })}
                title="Căn trái"
              >
                <AlignLeft className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                isActive={editor.isActive({ textAlign: "center" })}
                title="Căn giữa"
              >
                <AlignCenter className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                isActive={editor.isActive({ textAlign: "right" })}
                title="Căn phải"
              >
                <AlignRight className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                isActive={editor.isActive({ textAlign: "justify" })}
                title="Căn đều"
              >
                <AlignJustify className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Media & Links */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              {!disableImageUpload && (
                <ToolbarButton onClick={addImage} title="Chèn hình ảnh">
                  <ImageIcon className="h-4 w-4" />
                </ToolbarButton>
              )}
              <ToolbarButton
                onClick={addLink}
                isActive={editor.isActive("link")}
                title="Chèn liên kết"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={removeLink}
                disabled={!editor.isActive("link")}
                title="Xóa liên kết"
              >
                <Unlink className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Code & Special */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                title="Mã nguồn"
              >
                <Code className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={insertCodeBlock}
                isActive={editor.isActive("codeBlock")}
                title="Khối mã nguồn"
              >
                <Code2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Trích dẫn"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={insertHorizontalRule}
                title="Đường kẻ ngang"
              >
                <Minus className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* History */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Hoàn tác (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Làm lại (Ctrl+Y)"
              >
                <Redo className="h-4 w-4" />
              </ToolbarButton>
            </div>

            {/* Color Picker */}
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Màu chữ"
              >
                <Type className="h-4 w-4" />
              </ToolbarButton>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="space-y-3">
                    {/* Reset Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Màu chữ:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          resetTextColor();
                          setShowColorPicker(false);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        title="Reset về màu mặc định"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-6 gap-1">
                      {[
                        "#000000",
                        "#374151",
                        "#6B7280",
                        "#9CA3AF",
                        "#D1D5DB",
                        "#F3F4F6",
                        "#DC2626",
                        "#EF4444",
                        "#F87171",
                        "#FCA5A5",
                        "#FECACA",
                        "#FEE2E2",
                        "#D97706",
                        "#F59E0B",
                        "#FBBF24",
                        "#FCD34D",
                        "#FDE68A",
                        "#FEF3C7",
                        "#059669",
                        "#10B981",
                        "#34D399",
                        "#6EE7B7",
                        "#A7F3D0",
                        "#D1FAE5",
                        "#2563EB",
                        "#3B82F6",
                        "#60A5FA",
                        "#93C5FD",
                        "#BFDBFE",
                        "#DBEAFE",
                        "#7C3AED",
                        "#8B5CF6",
                        "#A78BFA",
                        "#C4B5FD",
                        "#DDD6FE",
                        "#EDE9FE",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setTextColor(color);
                            setShowColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Highlight */}
            <div className="relative">
              <ToolbarButton
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                title="Tô sáng"
              >
                <Palette className="h-4 w-4" />
              </ToolbarButton>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-1 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="space-y-3">
                    {/* Reset Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        Tô sáng:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          resetHighlight();
                          setShowHighlightPicker(false);
                        }}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                        title="Xóa tô sáng"
                      >
                        Xóa
                      </button>
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-6 gap-1">
                      {[
                        "#FEF3C7",
                        "#FDE68A",
                        "#FCD34D",
                        "#FBBF24",
                        "#F59E0B",
                        "#D97706",
                        "#D1FAE5",
                        "#A7F3D0",
                        "#6EE7B7",
                        "#34D399",
                        "#10B981",
                        "#059669",
                        "#DBEAFE",
                        "#BFDBFE",
                        "#93C5FD",
                        "#60A5FA",
                        "#3B82F6",
                        "#2563EB",
                        "#EDE9FE",
                        "#DDD6FE",
                        "#C4B5FD",
                        "#A78BFA",
                        "#8B5CF6",
                        "#7C3AED",
                        "#FEE2E2",
                        "#FECACA",
                        "#FCA5A5",
                        "#F87171",
                        "#EF4444",
                        "#DC2626",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setHighlight(color);
                            setShowHighlightPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview & Save */}
            {showPreview && (
              <div className="flex items-center gap-1 ml-auto">
                <ToolbarButton
                  onClick={() => setShowPreviewMode(!showPreviewMode)}
                  isActive={showPreviewMode}
                  title="Xem trước"
                >
                  {showPreviewMode ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </ToolbarButton>
                {onSave && (
                  <ToolbarButton
                    onClick={onSave}
                    disabled={isSaving}
                    title="Lưu bài viết"
                  >
                    <Save className="h-4 w-4" />
                  </ToolbarButton>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Word Count & Status */}
        {showWordCount && (
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Từ: {getWordCount()}</span>
              <span>Ký tự: {getCharacterCount()}</span>
              {maxLength && (
                <span
                  className={
                    getCharacterCount() > maxLength ? "text-red-500" : ""
                  }
                >
                  Giới hạn: {maxLength}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="text-teal-600 flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                  Đang lưu...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="border border-t-0 border-gray-300 rounded-b-lg overflow-hidden bg-white">
        {showPreviewMode ? (
          <div className="p-6 min-h-[400px] prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: value }} />
          </div>
        ) : (
          <EditorContent
            editor={editor}
            className="min-h-[400px] max-h-[600px] overflow-y-auto"
          />
        )}
      </div>
    </div>
  );
};

export default QuillEditor;
