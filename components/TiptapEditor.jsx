"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Icon } from "@iconify/react";
import { useCallback } from "react";

// ── Toolbar Button ────────────────────────────────────────────
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick?.(); }}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all border-2
        ${active
          ? "bg-indigo-500 border-indigo-700 text-white border-b-[3px]"
          : "bg-white border-gray-200 text-gray-600 border-b-[3px] hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

// ── Main Editor ───────────────────────────────────────────────
export default function TiptapEditor({ content, onChange, placeholder = "Tulis konten blog di sini..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-indigo-600 underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-2xl max-w-full my-4 border-2 border-gray-200" } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose max-w-none focus:outline-none min-h-[320px] px-5 py-4 font-[family-name:var(--font-nunito)]",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL Gambar:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() ?? 0;
  const wordCount = editor.storage.characterCount?.words() ?? 0;

  return (
    <div className="rounded-3xl border-4 border-b-[6px] border-gray-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2.5 border-b-2 border-gray-100 bg-gray-50/80">

        {/* History */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Icon icon="solar:undo-left-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Icon icon="solar:undo-right-bold" />
        </ToolBtn>

        <Divider />

        {/* Headings */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <span className="font-black text-[11px]">H1</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <span className="font-black text-[11px]">H2</span>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <span className="font-black text-[11px]">H3</span>
        </ToolBtn>

        <Divider />

        {/* Inline formatting */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Icon icon="solar:text-bold-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Icon icon="solar:text-italic-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <Icon icon="solar:text-underline-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Icon icon="solar:text-cross-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
          <Icon icon="solar:pen-bold" />
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <Icon icon="solar:align-left-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <Icon icon="solar:align-center-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <Icon icon="solar:align-right-bold" />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <Icon icon="solar:list-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <Icon icon="solar:list-check-bold" />
        </ToolBtn>

        <Divider />

        {/* Block */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Icon icon="solar:quote-up-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Icon icon="solar:code-bold" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Icon icon="solar:minus-bold" />
        </ToolBtn>

        <Divider />

        {/* Link & Image */}
        <ToolBtn onClick={setLink} active={editor.isActive("link")} title="Insert Link">
          <Icon icon="solar:link-bold" />
        </ToolBtn>
        <ToolBtn onClick={addImage} title="Insert Image URL">
          <Icon icon="solar:gallery-add-bold" />
        </ToolBtn>

        <Divider />

        {/* Clear */}
        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
          <Icon icon="solar:eraser-bold" />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Footer stats */}
      <div className="flex items-center justify-between px-5 py-2 border-t-2 border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
          <span className="flex items-center gap-1">
            <Icon icon="solar:text-bold" className="text-sm" />
            {wordCount} kata
          </span>
          <span className="flex items-center gap-1">
            <Icon icon="solar:keyboard-bold" className="text-sm" />
            {charCount} karakter
          </span>
        </div>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-wider">Tiptap Editor</span>
      </div>
    </div>
  );
}
