import type { MarkedOptions } from 'marked';
import type mermaid from 'mermaid';

export type MarkdownRendererTheme = 'light' | 'dark';

export interface MarkdownRendererConfig {
  theme?: MarkdownRendererTheme;
  markedOptions?: MarkedOptions;
  mermaidConfig?: mermaid.Config;
  plugins?: MarkdownRendererPlugin[];
  onRender?: (html: string, el?: HTMLElement) => void;
  mathjaxUrl?: string;
  mermaidUrl?: string;
  sanitize?: boolean;
}

export interface MarkdownRendererPlugin {
  name: string;
  setup: (instance: MarkdownRenderer) => void;
}

export interface RenderResult {
  html: string;
  element?: HTMLElement;
}