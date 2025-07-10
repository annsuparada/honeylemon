"use client";

import { useCurrentEditor } from "@tiptap/react";
import { CSSProperties } from "react";

const MenuBar = () => {
    const { editor } = useCurrentEditor();

    if (!editor) {
        return null;
    }

    const addImage = () => {
        if (!editor) return;

        const url = window.prompt("Enter Image URL");
        if (!url) return;

        const alt = window.prompt("Enter Alt Text (optional)", "");

        editor.chain()
            .focus()
            .setImage({ src: url, alt: alt || "" })
            .run();
    };

    const addLink = () => {
        if (!editor) return;

        const url = window.prompt("Enter the URL");

        if (url) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };

    const removeLink = () => {
        if (!editor) return;
        editor.chain().focus().unsetLink().run();
    };
    const menuBarStyles: { [key: string]: CSSProperties } = {
        controlGroup: {
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
        },
        buttonGroup: {
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "8px",
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: "25px"
        },
        button: {
            padding: "6px 12px",
            border: "none",
            background: "#f3f3f3",
            color: "#333",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background 0.2s ease, transform 0.1s ease",
        },
        activeButton: {
            background: "#1d4ed8",
            color: "white",
        },
        disabledButton: {
            background: "#d1d5db",
            cursor: "not-allowed",
        },
    };

    return (
        <div style={{
            position: "sticky",
            top: "0",
            zIndex: 1000
        }}>
            <div className="flex flex-wrap gap-2" style={menuBarStyles.controlGroup}>
                <div style={menuBarStyles.buttonGroup}>
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("bold") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Bold
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("italic") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Italic
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("strike") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Strike
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("code") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Code
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("paragraph") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Paragraph
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("heading", { level: 1 }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        H1
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("heading", { level: 2 }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        H2
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("heading", { level: 3 }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        H3
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("heading", { level: 4 }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        H4
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("heading", { level: 5 }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        H5
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("heading", { level: 6 }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        H6
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("bulletList") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Bullet List
                    </button>

                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("orderedList") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Ordered List
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("codeBlock") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Code block
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive("blockquote") ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Blockquote
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        style={menuBarStyles.button}
                    >
                        Horizontal rule
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setHardBreak().run()}
                        style={menuBarStyles.button}
                    >
                        Hard break
                    </button>
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .undo()
                                .run()
                        }
                        style={menuBarStyles.button}
                    >
                        Undo
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={
                            !editor.can()
                                .chain()
                                .focus()
                                .redo()
                                .run()
                        }
                        style={menuBarStyles.button}
                    >
                        Redo
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setColor('#958DF1').run()}
                        style={{
                            ...menuBarStyles.button,
                            ...(editor.isActive('textStyle', { color: '#958DF1' }) ? menuBarStyles.activeButton : {}),
                        }}
                    >
                        Purple
                    </button>
                    <button onClick={addImage} style={menuBarStyles.button}>
                        Add Image 🖼️
                    </button>
                    <button onClick={addLink} style={menuBarStyles.button}>
                        🔗 Add Link
                    </button>
                    <button onClick={removeLink} style={menuBarStyles.button}>
                        ❌ Remove Link
                    </button>
                    <button
                        onClick={() => {
                            if (editor.isActive('table')) {
                                alert("You cannot insert a table inside another table.");
                                return;
                            }

                            editor.chain().focus().insertContent({
                                type: 'table',
                                content: [
                                    {
                                        type: 'tableRow',
                                        content: [
                                            {
                                                type: 'tableHeader',
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [{ type: 'text', text: 'Resort Name' }],
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'tableHeader',
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [{ type: 'text', text: 'Type' }],
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'tableHeader',
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [{ type: 'text', text: 'Starting Rate' }],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        type: 'tableRow',
                                        content: [
                                            {
                                                type: 'tableCell',
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [{ type: 'text', text: 'Grand Velas' }],
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'tableCell',
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [{ type: 'text', text: 'Luxury' }],
                                                    },
                                                ],
                                            },
                                            {
                                                type: 'tableCell',
                                                content: [
                                                    {
                                                        type: 'paragraph',
                                                        content: [{ type: 'text', text: '$900/night' }],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            }).run();
                        }}
                        style={menuBarStyles.button}
                    >
                        ➕ Insert Sample Table
                    </button>


                    <button onClick={() => editor.chain().focus().addColumnBefore().run()} style={menuBarStyles.button} disabled={!editor.can().addColumnBefore()}>
                        ⬅️ Add Column Before
                    </button>
                    <button onClick={() => editor.chain().focus().addColumnAfter().run()} style={menuBarStyles.button} disabled={!editor.can().addColumnAfter()}>
                        ➡️ Add Column After
                    </button>
                    <button onClick={() => editor.chain().focus().deleteColumn().run()} style={menuBarStyles.button} disabled={!editor.can().deleteColumn()}>
                        🗑️ Delete Column
                    </button>
                    <button onClick={() => editor.chain().focus().addRowBefore().run()} style={menuBarStyles.button} disabled={!editor.can().addRowBefore()}>
                        ⬆️ Add Row Before
                    </button>
                    <button onClick={() => editor.chain().focus().addRowAfter().run()} style={menuBarStyles.button} disabled={!editor.can().addRowAfter()}>
                        ⬇️ Add Row After
                    </button>
                    <button onClick={() => editor.chain().focus().deleteRow().run()} style={menuBarStyles.button} disabled={!editor.can().deleteRow()}>
                        🗑️ Delete Row
                    </button>
                    <button onClick={() => editor.chain().focus().deleteTable().run()} style={menuBarStyles.button} disabled={!editor.can().deleteTable()}>
                        ❌ Delete Table
                    </button>
                    <button
                        onClick={() => {
                            const { state, view } = editor;
                            const { $from } = state.selection;

                            // Traverse up the node tree to find the top-level `table` node and its position
                            let tablePos = null;
                            for (let depth = $from.depth; depth >= 0; depth--) {
                                const node = $from.node(depth);
                                if (node.type.name === 'table') {
                                    tablePos = $from.before(depth);
                                    break;
                                }
                            }

                            if (tablePos !== null) {
                                // Insert a paragraph AFTER the table node
                                editor
                                    .chain()
                                    .insertContentAt(tablePos + editor.state.doc.nodeAt(tablePos)!.nodeSize, {
                                        type: 'paragraph',
                                        content: [{ type: 'text', text: '' }],
                                    })
                                    .setTextSelection(tablePos + editor.state.doc.nodeAt(tablePos)!.nodeSize + 1)
                                    .focus()
                                    .run();
                            } else {
                                alert('No table node found in selection context.');
                            }
                        }}
                        style={menuBarStyles.button}
                    >
                        ⬇️ Exit Table
                    </button>





                </div>
            </div>
        </div>
    );
};

export default MenuBar;
