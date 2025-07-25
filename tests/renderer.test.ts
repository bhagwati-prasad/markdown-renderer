import { MarkdownRenderer } from '../src/renderer';

describe('MarkdownRenderer', () => {
  let renderer: MarkdownRenderer;
  beforeEach(() => {
    renderer = new MarkdownRenderer({ theme: 'light' });
  });

  it('renders basic markdown', async () => {
    const html = await renderer.renderToHtml('# Hello');
    expect(html).toContain('<h1');
    expect(html).toContain('Hello');
  });

  it('renders code blocks with copy button', async () => {
    document.body.innerHTML = `<div id="target"></div>`;
    await renderer.render('```js\nconsole.log(1)\n```', '#target');
    expect(document.querySelector('.copy-btn')).toBeTruthy();
  });

  it('renders details/summary', async () => {
    const html = await renderer.renderToHtml('<details><summary>See</summary>Details</details>');
    expect(html).toContain('<details');
    expect(html).toContain('<summary');
  });
});