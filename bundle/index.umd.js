(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@tiptap/core')) :
  typeof define === 'function' && define.amd ? define(['exports', '@tiptap/core'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["@tiptap/extension-emoji-node"] = {}, global.core));
})(this, (function (exports, core) { 'use strict';

  const isEmojiSupported = (char) => {
      const ctx = document
          .createElement("canvas")
          .getContext("2d");
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
      for (; i < count && !a[i + 3]; i += 4)
          ;
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
  const isBrowser = () => typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      "createElement" in document;
  const isSpaceAfterCursor = (editor) => {
      var _a;
      let hasFollowingSpace = false;
      const { $to } = editor.view.state.selection;
      /**
       * to + 1: It is immediate next position from point of insertion where cursor will go.
       * Will cursor go at end of document
       */
      const nodeAfterCursor = $to === null || $to === void 0 ? void 0 : $to.nodeAfter;
      hasFollowingSpace = ((_a = nodeAfterCursor === null || nodeAfterCursor === void 0 ? void 0 : nodeAfterCursor.text) === null || _a === void 0 ? void 0 : _a.startsWith(" ")) || false;
      return hasFollowingSpace;
  };
  const isAtEndOfDocument = (editor) => {
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
  const shouldInsertSpaceAfterCurrentCursor = (editor) => {
      const hasSpace = isSpaceAfterCursor(editor);
      const isAtEnd = isAtEndOfDocument(editor);
      return !hasSpace || isAtEnd;
  };

  const EmojiNode = core.Node.create({
      name: "emoji",
      group: "inline",
      inline: true,
      atom: true,
      selectable: true,
      addAttributes() {
          return {
              emoji: { default: null },
              annotation: { default: null },
              url: { default: null },
          };
      },
      parseHTML() {
          return [
              {
                  tag: 'span[data-node="emoji"]',
                  getAttrs(node) {
                      let attrs = false;
                      const annotation = node.getAttribute("data-annotation");
                      const emoji = node.getAttribute("data-emoji");
                      const url = node.getAttribute("data-url");
                      if (annotation && (emoji || url)) {
                          attrs = {
                              annotation,
                              emoji,
                              url,
                          };
                      }
                      return attrs;
                  },
              },
          ];
      },
      renderHTML({ HTMLAttributes, node }) {
          let renderEmoji = false;
          const isBrowserEnv = isBrowser();
          if (isBrowserEnv) {
              renderEmoji = isEmojiSupported(node.attrs.emoji);
          }
          const { emoji, annotation, ...restHTMLAttributes } = HTMLAttributes;
          return [
              "span",
              core.mergeAttributes(restHTMLAttributes, {
                  "data-node": "emoji",
                  "data-emoji": node.attrs.emoji,
                  "data-annotation": node.attrs.annotation,
                  "data-url": node.attrs.url,
                  style: `user-select: text; font-family: "Twemoji Mozilla", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", "EmojiOne Color", "Android Emoji", sans-serif;`,
              }),
              [
                  "img",
                  {
                      src: node.attrs.url,
                      alt: node.attrs.annotation,
                      style: `${renderEmoji ? "display: none;" : "display: inline-block;"} width: 1em; height: 1em;`,
                  },
              ],
              [
                  "span",
                  {
                      role: "img",
                      "aria-label": node.attrs.annotation,
                      style: `${renderEmoji ? "display: inline-block;" : "display: none;"}`,
                  },
                  node.attrs.emoji,
              ],
          ];
      },
      renderText({ node }) {
          return node.attrs.emoji;
      },
      addCommands() {
          return {
              insertEmoji({ annotation, url, emoji }) {
                  return ({ editor, chain }) => {
                      const shouldInsertSpace = shouldInsertSpaceAfterCurrentCursor(editor);
                      return chain()
                          .insertContent({
                          type: "emoji",
                          attrs: {
                              annotation,
                              url,
                              emoji,
                          },
                      })
                          .insertContent(shouldInsertSpace ? " " : "")
                          .run();
                  };
              },
          };
      },
  });

  exports.EmojiNode = EmojiNode;
  exports.isEmojiSupported = isEmojiSupported;

}));
//# sourceMappingURL=index.umd.js.map
