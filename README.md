# Emoji Node

This repo provides you schema for creating a emoji-node in your tiptap editor.

The node renders your specified emoji, and if not supported in given environment it renders fallback image from provided url.

Since it can render fallback images you can use it to add your custom of emojis.

An emoji needs following data:

```ts

{
// emoji name, label
annotation: string;

// unicode character
// if empty use `url`
emoji: string; 

// an optional fallback url that should be rendered when,
// 1. given unicode character is not supported in running env
// 2. the data is for custom emoji and emoji: '' is intentionally left blank
//    so that fallback-url can be rendered
url?: string;

}
```

![](/assests/file.gif)