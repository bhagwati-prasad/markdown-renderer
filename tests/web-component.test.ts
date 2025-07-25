import '../src/web-component';

describe('<markdown-renderer>', () => {
  it('renders markdown when placed in DOM', (done) => {
    document.body.innerHTML = `<markdown-renderer># Hello world</markdown-renderer>`;
    setTimeout(() => {
      const el = document.querySelector('markdown-renderer')!;
      const shadow = (el as any).shadowRoot;
      expect(shadow.querySelector('.markdown-body').innerHTML).toContain('Hello world');
      done();
    }, 100);
  });
});