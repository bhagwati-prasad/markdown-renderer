import { MarkdownRenderer, type MarkdownRendererConfig } from './renderer';

class MarkdownRendererElement extends HTMLElement {
  static get observedAttributes() {
    return ['theme'];
  }

  private renderer: MarkdownRenderer;
  private config: MarkdownRendererConfig;
  private shadow: ShadowRoot;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.config = {};
    this.renderer = new MarkdownRenderer(this.config);
  }

  connectedCallback() {
    this._applyTheme();
    this._render();
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (name === 'theme' && oldValue !== newValue) {
      this.config.theme = newValue as 'light' | 'dark';
      this.renderer.setTheme(this.config.theme);
      this._applyTheme();
      this._render();
    }
  }

  set value(md: string) {
    this._render(md);
  }

  get value() {
    return this.textContent || '';
  }

  _applyTheme() {
    // Add tailwind themes.css (inline for shadow DOM)
    if (!this.shadow.querySelector('link[data-tailwind]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'themes.css';
      link.dataset.tailwind = '1';
      this.shadow.appendChild(link);
    }
    if (this.config.theme === 'dark') {
      this.shadow.host.classList.add('dark');
    } else {
      this.shadow.host.classList.remove('dark');
    }
  }

  async _render(md?: string) {
    const markdown = md ?? this.textContent ?? '';
    this.shadow.innerHTML = `<div class="markdown-body"></div>`;
    const container = this.shadow.querySelector('.markdown-body') as HTMLElement;
    await this.renderer.render(markdown, container);
  }
}

customElements.define('markdown-renderer', MarkdownRendererElement);

export { MarkdownRendererElement };