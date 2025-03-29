import { mergeAttributes, Node } from '@tiptap/core';

export interface ImageOptions {
    inline: boolean;
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageWithAlt: {
            setImage: (options: { src: string; alt?: string }) => ReturnType;
        };
    }
}

export const ImageWithAlt = Node.create<ImageOptions>({
    name: 'imageWithAlt',

    inline: false,
    group: 'block',

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'img[src]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addCommands() {
        return {
            setImage:
                options =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: options,
                        });
                    },
        };
    },
});
