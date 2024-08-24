import type { Editor } from "@tiptap/core";
export declare const isEmojiSupported: (char: string) => boolean;
export declare const isBrowser: () => boolean;
/**
 * Should insert the space after the cursor before inserting the node.
 * @param editor
 * @returns
 */
export declare const shouldInsertSpaceAfterCurrentCursor: (editor: Editor) => boolean;
