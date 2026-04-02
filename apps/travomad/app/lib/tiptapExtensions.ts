import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import LinkExtension from "@tiptap/extension-link";
import BulletList from '@tiptap/extension-bullet-list'
import { ImageWithAlt } from '@honeylemon/ui/tiptap/ImageWithAlt'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import { TableCell as DefaultTableCell } from '@tiptap/extension-table-cell'



export const extensions = [
    Color,
    TextStyle,
    Placeholder.configure({
        placeholder: "Start writing here...",
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:absolute before:text-gray-400 before:italic before:pointer-events-none",
    }),

    StarterKit.configure({
        bulletList: false,  // Disable default bullet list
        orderedList: false, // Disable default ordered list
        listItem: false,
    }),
    ListItem.configure({
        HTMLAttributes: {
            class: "ml-6",
        },
    }),
    BulletList.configure({
        HTMLAttributes: {
            class: "list-disc",
        },
    }),
    OrderedList.configure({
        HTMLAttributes: {
            class: "list-decimal",
        },
    }),
    ImageWithAlt.configure({
        HTMLAttributes: {
            class: 'my-image-class',
        },
    }),
    LinkExtension.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
            class: "tiptap-link",
        },
    }),
    Table,
    TableRow,
    TableHeader,
    DefaultTableCell
]