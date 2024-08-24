import type { Editor } from "@tiptap/core";

export const isEmojiSupported = (char: string) => {
  const ctx = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;

  const CANVAS_HEIGHT = 25;
  const CANVAS_WIDTH = 20;
  const textSize = Math.floor(CANVAS_HEIGHT / 2);

  // Initialize canvas context
  ctx.font = textSize + "px Arial, Sans-Serif";
  ctx.textBaseline = "top";
  ctx.canvas.width = CANVAS_WIDTH * 2;
  ctx.canvas.height = CANVAS_HEIGHT;

  ctx.clearRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT);

  // Draw in red on the left
  ctx.fillStyle = "#FF0000";
  ctx.fillText(char, 0, 22);

  // Draw in blue on right
  ctx.fillStyle = "#0000FF";
  ctx.fillText(char, CANVAS_WIDTH, 22);

  const a = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
  const count = a.length;
  let i = 0;

  // Search the first visible pixel
  for (; i < count && !a[i + 3]; i += 4);

  // No visible pixel
  if (i >= count) {
    return false;
  }

  // Emoji has immutable color, so we check the color of the emoji in two different colors
  // the result show be the same.
  const x = CANVAS_WIDTH + ((i / 4) % CANVAS_WIDTH);
  const y = Math.floor(i / 4 / CANVAS_WIDTH);
  const b = ctx.getImageData(x, y, 1, 1).data;

  if (a[i] !== b[0] || a[i + 2] !== b[2]) {
    return false;
  }

  // Some emojis are a contraction of different ones, so if it's not
  // supported, it will show multiple characters
  if (ctx.measureText(char).width >= CANVAS_WIDTH) {
    return false;
  }

  return true;
};

export const isBrowser = () =>
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  "createElement" in document;

const isSpaceAfterCursor = (editor: Editor) => {
  let hasFollowingSpace = false;

  const { $to } = editor.view.state.selection;

  /**
   * to + 1: It is immediate next position from point of insertion where cursor will go.
   * Will cursor go at end of document
   */

  const nodeAfterCursor = $to?.nodeAfter;

  hasFollowingSpace = nodeAfterCursor?.text?.startsWith(" ") || false;

  return hasFollowingSpace;
};

const isAtEndOfDocument = (editor: Editor) => {
  let isAtEnd = false;
  const { to } = editor.view.state.selection;

  const contentSize = editor.state.doc.content.size;
  /**
   * to + 1: It is immediate next position from point of insertion where cursor will go.
   * Will cursor go at end of document
   */
  isAtEnd = contentSize === to + 1;

  return isAtEnd;
};

/**
 * Should insert the space after the cursor before inserting the node.
 * @param editor
 * @returns
 */
export const shouldInsertSpaceAfterCurrentCursor = (editor: Editor) => {
  const hasSpace = isSpaceAfterCursor(editor);
  const isAtEnd = isAtEndOfDocument(editor);
  return !hasSpace || isAtEnd;
};
