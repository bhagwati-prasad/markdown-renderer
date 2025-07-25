/**
 * Utilities for cleaning up LLM output to valid markdown.
 */

/**
 * Remove triple/fenced backticks from a markdown string.
 */
export function stripTripleBackticks(md: string): string {
  return md.replace(/```+[\w-]*\n?/g, '').replace(/```+$/gm, '');
}

/**
 * Normalize code block indentation.
 */
export function normalizeIndentation(md: string): string {
  // Remove leading spaces/tabs based on the minimum indentation in code blocks
  return md.replace(/(^|\n)( {2,}|\t+)(.*)/g, (m, p1, p2, p3) => p1 + p3);
}

/**
 * Fix escaped entities common in LLM output.
 */
export function fixEscapes(md: string): string {
  // Replace things like \* with *
  return md.replace(/\\([*_`~[\](){}<>])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}