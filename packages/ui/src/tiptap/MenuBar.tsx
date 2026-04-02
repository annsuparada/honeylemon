"use client";

import { useState } from "react";
import { useCurrentEditor } from "@tiptap/react";
import type { Level } from "@tiptap/extension-heading";
import ImageUploadModal from "./ImageUploadModal";
import InternalLinkModal from "./InternalLinkModal";

interface ToolbarButton {
    label: string;
    command: () => void | boolean;
    isActive?: () => boolean;
    disabled?: () => boolean;
}

const headingLevels: Level[] = [1, 2, 3, 4, 5, 6];

const MenuBar = () => {
    const { editor } = useCurrentEditor();
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isInternalLinkModalOpen, setIsInternalLinkModalOpen] = useState(false);

    if (!editor) return null;

    const buttons: ToolbarButton[] = [
        // ---- Formatting ----
        {
            label: "Bold",
            isActive: () => editor.isActive("bold"),
            command: () => editor.chain().focus().toggleBold().run(),
        },
        {
            label: "Italic",
            isActive: () => editor.isActive("italic"),
            command: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            label: "Strike",
            isActive: () => editor.isActive("strike"),
            command: () => editor.chain().focus().toggleStrike().run(),
        },
        {
            label: "Code",
            isActive: () => editor.isActive("code"),
            command: () => editor.chain().focus().toggleCode().run(),
        },
        {
            label: "Paragraph",
            isActive: () => editor.isActive("paragraph"),
            command: () => editor.chain().focus().setParagraph().run(),
        },

        // ---- Headings ----
        ...headingLevels.map((level) => ({
            label: `H${level}`,
            isActive: () => editor.isActive("heading", { level }),
            command: () => editor.chain().focus().toggleHeading({ level }).run(),
        })),

        // ---- Lists ----
        {
            label: "Bullet List",
            isActive: () => editor.isActive("bulletList"),
            command: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            label: "Ordered List",
            isActive: () => editor.isActive("orderedList"),
            command: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            label: "Code Block",
            isActive: () => editor.isActive("codeBlock"),
            command: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
            label: "Blockquote",
            isActive: () => editor.isActive("blockquote"),
            command: () => editor.chain().focus().toggleBlockquote().run(),
        },

        // ---- Inserts ----
        {
            label: "Horizontal Rule",
            command: () => editor.chain().focus().setHorizontalRule().run(),
        },
        {
            label: "Hard Break",
            command: () => editor.chain().focus().setHardBreak().run(),
        },

        // ---- History ----
        {
            label: "Undo",
            disabled: () => !editor.can().chain().focus().undo().run(),
            command: () => editor.chain().focus().undo().run(),
        },
        {
            label: "Redo",
            disabled: () => !editor.can().chain().focus().redo().run(),
            command: () => editor.chain().focus().redo().run(),
        },

        // ---- Colors ----
        {
            label: "Purple",
            isActive: () => editor.isActive("textStyle", { color: "#958DF1" }),
            command: () => editor.chain().focus().setColor("#958DF1").run(),
        },

        // ---- Media ----
        {
            label: "🖼️ Add Image",
            command: () => {
                setIsImageModalOpen(true);
            },
        },
        {
            label: "🔗 Add Link",
            command: () => {
                const url = window.prompt("Enter URL");
                if (url) {
                    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }
            },
        },
        {
            label: "🔗 Internal Link",
            command: () => {
                setIsInternalLinkModalOpen(true);
            },
        },
        {
            label: "❌ Remove Link",
            command: () => editor.chain().focus().unsetLink().run(),
        },

        // ---- Tables ----
        {
            label: "➕ Insert Table",
            command: () => {
                if (editor.isActive("table")) {
                    alert("You cannot insert a table inside another table.");
                    return;
                }
                editor.chain().focus().insertTable({ rows: 2, cols: 3, withHeaderRow: true }).run();
            },
        },
        { label: "⬅️ Add Column Before", command: () => editor.chain().focus().addColumnBefore().run(), disabled: () => !editor.can().addColumnBefore() },
        { label: "➡️ Add Column After", command: () => editor.chain().focus().addColumnAfter().run(), disabled: () => !editor.can().addColumnAfter() },
        { label: "🗑️ Delete Column", command: () => editor.chain().focus().deleteColumn().run(), disabled: () => !editor.can().deleteColumn() },
        { label: "⬆️ Add Row Before", command: () => editor.chain().focus().addRowBefore().run(), disabled: () => !editor.can().addRowBefore() },
        { label: "⬇️ Add Row After", command: () => editor.chain().focus().addRowAfter().run(), disabled: () => !editor.can().addRowAfter() },
        { label: "🗑️ Delete Row", command: () => editor.chain().focus().deleteRow().run(), disabled: () => !editor.can().deleteRow() },
        { label: "❌ Delete Table", command: () => editor.chain().focus().deleteTable().run(), disabled: () => !editor.can().deleteTable() },
    ];

    return (
        <>
            <div className="sticky top-0 z-50 bg-white shadow p-2 rounded-md flex flex-wrap gap-2 mb-8">
                {buttons.map((btn) => (
                    <button
                        key={btn.label}
                        className={`btn btn-sm ${btn.isActive && btn.isActive() ? "btn-active btn-primary" : ""
                            }`}
                        onClick={btn.command}
                        disabled={btn.disabled?.() || false}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onInsert={(url, alt, showCredit, photographer, photographerUrl) => {
                    if (showCredit && photographer && photographerUrl) {
                        // Insert as figure with figcaption
                        const figureHtml = `
<figure class="article-image my-8">
    <img src="${url}" alt="${(alt || "").replace(/"/g, '&quot;')}" class="w-full rounded-lg" />
    <figcaption class="text-sm text-gray-600 mt-2 text-center">
        Photo by <a href="${photographerUrl}" target="_blank" rel="noopener noreferrer" class="underline">${photographer}</a> on <a href="https://unsplash.com/?utm_source=honeylemon&utm_medium=referral" target="_blank" rel="noopener noreferrer" class="underline">Unsplash</a>
    </figcaption>
</figure>`;
                        editor.chain().focus().insertContent(figureHtml).run();
                    } else {
                        // Insert as simple image
                        editor.chain().focus().setImage({ src: url, alt: alt || "" }).run();
                    }
                }}
            />
            <InternalLinkModal
                isOpen={isInternalLinkModalOpen}
                onClose={() => setIsInternalLinkModalOpen(false)}
                onInsert={(url) => {
                    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }}
            />
        </>
    );
};

export default MenuBar;
