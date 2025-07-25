import { stripTripleBackticks, normalizeIndentation, fixEscapes } from '../src/llm-utils';

describe('llm-utils', () => {
  it('strips triple backticks', () => {
    expect(stripTripleBackticks('```js\ncode\n```')).toBe('code\n');
  });
  it('normalizes indentation', () => {
    expect(normalizeIndentation('    code')).toBe('code');
  });
  it('fixes escapes', () => {
    expect(fixEscapes('\\*foo\\*')).toBe('*foo*');
  });
});