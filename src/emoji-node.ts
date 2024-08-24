import { mergeAttributes, Node } from "@tiptap/core";
import { EmojiNodeData } from "./types";
import {
  isBrowser,
  isEmojiSupported,
  shouldInsertSpaceAfterCurrentCursor,
} from "./utils";

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

export const EmojiNode = Node.create({
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
          let attrs: false | Record<string, any> = false;

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
      mergeAttributes(restHTMLAttributes, {
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
          style: `${
            renderEmoji ? "display: none;" : "display: inline-block;"
          } width: 1em; height: 1em;`,
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
