import { marked, type MarkedOptions } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import type mermaid from 'mermaid';
import type { MarkdownRendererConfig, RenderResult, MarkdownRendererPlugin } from './types';

const DEFAULT_MATHJAX_URL = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
const DEFAULT_MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@10.7.0/dist/mermaid.min.js";

export class MarkdownRenderer {
  config: MarkdownRendererConfig;
  _mermaidReady: boolean = false;
  _mathjaxReady: boolean = false;

  constructor(config: MarkdownRendererConfig = {}) {
    this.config = {
      theme: config.theme || 'light',
      markedOptions: config.markedOptions,
      mermaidConfig: config.mermaidConfig,
      plugins: config.plugins || [],
      onRender: config.onRender,
      mathjaxUrl: config.mathjaxUrl || DEFAULT_MATHJAX_URL,
      mermaidUrl: config.mermaidUrl || DEFAULT_MERMAID_URL,
      sanitize: config.sanitize !== false,
    };
    this._applyPlugins();
    this._setupTheme();
  }

  _applyPlugins() {
    for (const plugin of this.config.plugins!) {
      plugin.setup(this);
    }
  }

  _setupTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', this.config.theme === 'dark');
    }
  }

  setTheme(theme: 'light' | 'dark') {
    this.config.theme = theme;
    this._setupTheme();
  }

  async renderToHtml(md: string): Promise<string> {
    let parsed = await this._preprocessMarkdown(md);
    let html = marked(parsed, this.config.markedOptions);

    html = await this._renderSpecialBlocks(html);

    if (this.config.sanitize) html = DOMPurify.sanitize(html);

    html = this._postprocessHtml(html);

    return html;
  }

  /**
   * Renders markdown into an element, with all interactive features.
   */
  async render(md: string, el: HTMLElement | string): Promise<RenderResult> {
    let target: HTMLElement;
    if (typeof el === 'string') {
      target = document.querySelector(el)!;
      if (!target) throw new Error('Target element not found');
    } else {
      target = el;
    }
    target.classList.add('markdown-body');
    let html = await this.renderToHtml(md);
    target.innerHTML = html;
    await this._postRender(target);
    this.config.onRender?.(html, target);
    return { html, element: target };
  }

  /**
   * SSR/static render, no DOM features.
   */
  async renderToStaticHtml(md: string): Promise<string> {
    return await this.renderToHtml(md);
  }

  /**
   * Live/debounced preview: accepts a string, textarea, or input, and renders into a preview element.
   */
  renderMarkdownLive(
    src: string | HTMLTextAreaElement | HTMLInputElement,
    preview: HTMLElement,
    debounceMs: number = 200
  ) {
    let last = "";
    let timer: ReturnType<typeof setTimeout>;

    const getMd = () =>
      typeof src === 'string' ? src : (src as HTMLTextAreaElement | HTMLInputElement).value;

    const update = async () => {
      const md = getMd();
      if (md !== last) {
        last = md;
        await this.render(md, preview);
      }
    };

    const listener = () => {
      clearTimeout(timer);
      timer = setTimeout(update, debounceMs);
    };

    if (typeof src !== 'string') {
      src.addEventListener('input', listener);
      // Initial render
      update();
    } else {
      update();
    }

    return () => {
      if (typeof src !== 'string') {
        src.removeEventListener('input', listener);
      }
      clearTimeout(timer);
    };
  }

  /**
   * Preprocess markdown for LLM/quirks.
   */
  async _preprocessMarkdown(md: string): Promise<string> {
    // Example: strip triple-backticks, normalize indentation, fix escapes
    // Could import from llm-utils.ts if desired
    return md;
  }

  /**
   * Handles Mermaid diagrams, MathJax, code highlighting, copy buttons, collapsible sections.
   */
  async _postRender(el: HTMLElement) {
    // Highlight code blocks
    el.querySelectorAll('pre code').forEach((block) => {
      try {
        hljs.highlightElement(block as HTMLElement);
      } catch { /* fault-tolerant */ }
    });

    // Add copy-to-clipboard buttons
    el.querySelectorAll('pre code').forEach((block) => {
      const pre = block.parentElement!;
      if (!pre.querySelector('.copy-btn')) {
        const btn = document.createElement('button');
        btn.textContent = 'Copy';
        btn.className = 'copy-btn';
        btn.onclick = () => {
          navigator.clipboard.writeText(block.textContent || '');
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy'), 1000);
        };
        pre.appendChild(btn);
      }
    });

    // Render Mermaid diagrams
    await this._renderMermaid(el);

    // Render MathJax
    await this._renderMathJax(el);
  }

  async _renderMermaid(el: HTMLElement) {
    const mermaidBlocks = el.querySelectorAll('pre code.language-mermaid');
    if (mermaidBlocks.length === 0) return;
    await this._ensureMermaid();

    for (const block of mermaidBlocks) {
      const parent = block.parentElement!;
      const code = block.textContent || '';
      const container = document.createElement('div');
      container.className = 'mermaid';
      container.textContent = code;
      parent.replaceWith(container);
      // @ts-ignore
      window.mermaid?.init(undefined, container);
    }
  }

  async _renderMathJax(el: HTMLElement) {
    if (!el.querySelector('span.math') && !el.querySelector('div.math')) return;
    await this._ensureMathJax();
    // @ts-ignore
    if (window.MathJax && window.MathJax.typesetPromise) {
      // @ts-ignore
      await window.MathJax.typesetPromise([el]);
    }
  }

  async _ensureMermaid() {
    if (this._mermaidReady) return;
    if (!window.mermaid) {
      await this._loadScript(this.config.mermaidUrl!);
    }
    // @ts-ignore
    window.mermaid?.initialize?.(this.config.mermaidConfig || { theme: this.config.theme });
    this._mermaidReady = true;
  }

  async _ensureMathJax() {
    if (this._mathjaxReady) return;
    if (!window.MathJax) {
      await this._loadScript(this.config.mathjaxUrl!);
    }
    this._mathjaxReady = true;
  }

  _loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });
  }

  /**
   * Postprocess HTML for collapsible sections, math, etc.
   */
  _postprocessHtml(html: string): string {
    // Inline math: $...$ => <span class="math">...</span>
    // Block math: $$...$$ => <div class="math">...</div>
    html = html
      .replace(/(\$\$)([\s\S]+?)\1/g, (_, __, expr) => `<div class="math">${expr}</div>`)
      .replace(/(^|[^$])\$([^\n$]+?)\$/g, (m, p1, expr) => `${p1}<span class="math">${expr}</span>`);
    return html;
  }

  /**
   * Render all <script type="text/markdown"> and <template data-type="markdown">.
   */
  static autoRenderAll(config: MarkdownRendererConfig = {}) {
    const renderer = new MarkdownRenderer(config);
    // <script type="text/markdown">
    document.querySelectorAll('script[type="text/markdown"]').forEach(async (el) => {
      const target = document.createElement('div');
      el.parentElement!.insertBefore(target, el.nextSibling);
      await renderer.render(el.textContent || '', target);
    });
    // <template data-type="markdown">
    document.querySelectorAll('template[data-type="markdown"]').forEach(async (tpl) => {
      const target = document.createElement('div');
      tpl.parentElement!.insertBefore(target, tpl.nextSibling);
      await renderer.render(tpl.innerHTML, target);
    });
  }
}