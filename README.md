# markdown-renderer

A complete, extensible Markdown renderer for the browser and SSR:

- Renders Markdown to HTML (uses [marked](https://marked.js.org/))
- Highlights code with [highlight.js](https://highlightjs.org/)
- Supports [Mermaid](https://mermaid-js.github.io/) diagrams
- Renders MathJax LaTeX
- Detects `<script type="text/markdown">` and `<template data-type="markdown">` blocks
- Live preview (`renderMarkdownLive`)
- Copy-to-clipboard buttons on code blocks
- Collapsible sections (`<details><summary>`)
- Light/dark themes (with [Tailwind CSS v4+](https://tailwindcss.com/), [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography))
- Output sanitized with [DOMPurify](https://github.com/cure53/DOMPurify)
- User config: themes, plugin system, onRender callback, on-demand MathJax/Mermaid loading
- LLM-output cleanup utilities (strip backticks, normalize, fix escapes)
- Fault-tolerant code rendering
- SSR/static render (`renderToHtml`)
- `<markdown-renderer>` web component
- Examples and Jest unit tests included
- Output: UMD, ESM, standalone UMD+CSS (no code-splitting)
- **No external dependencies bundled**; all peer deps externalized

## Install

```
npm install markdown-renderer marked highlight.js mermaid mathjax dompurify
```

## Usage

### In Browser

```js
import { MarkdownRenderer } from 'markdown-renderer';
import 'markdown-renderer/dist/themes.css';

const renderer = new MarkdownRenderer({ theme: 'dark' });

renderer.render('# Hello **Markdown**', document.getElementById('preview'));
```

### SSR

```js
import { MarkdownRenderer } from 'markdown-renderer';
const html = await renderer.renderToHtml('Some *markdown*');
```

### Web Component

```html
<markdown-renderer theme="dark">
  # Hello world

  ```js
  console.log("Hi!");
  ```
</markdown-renderer>
<link rel="stylesheet" href="themes.css">
```

### Live Preview

```js
renderer.renderMarkdownLive(textareaEl, previewEl);
```

### Mermaid & MathJax

Mermaid and MathJax are loaded on-demand from CDN by default.

### LLM Output Cleaning

```js
import { stripTripleBackticks, normalizeIndentation, fixEscapes } from 'markdown-renderer';
```

## API

See [types.ts](./src/types.ts) for full config and plugin API.

## Theming

- Uses Tailwind CSS v4+, with [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography).
- Light/dark mode supported.
- Use `[data-theme="dark"]` or `.dark` on `<html>` or `<body>` to toggle.

## Examples

See [examples/](./examples/).

## Tests

Run:

```
npm test
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md).