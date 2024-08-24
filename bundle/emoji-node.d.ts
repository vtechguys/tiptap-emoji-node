import { Node } from "@tiptap/core";
import { EmojiNodeData } from "./types";
declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        emoji: {
            /**
             * insert the emoji in the editor
             */
            insertEmoji: (emoji: EmojiNodeData) => ReturnType;
        };
    }
}
export declare const EmojiNode: Node<any, any>;
