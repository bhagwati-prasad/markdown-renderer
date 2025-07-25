import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';

const external = [
  'marked',
  'highlight.js',
  'mermaid',
  'mathjax',
  'dompurify'
];

export default [
  // ESM
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: false }),
      postcss({ extract: false, minimize: true }),
    ]
  },
  // UMD
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'MarkdownRenderer',
      sourcemap: true,
      globals: {
        marked: 'marked',
        'highlight.js': 'hljs',
        mermaid: 'mermaid',
        mathjax: 'MathJax',
        dompurify: 'DOMPurify'
      }
    },
    external,
    plugins: [
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: false }),
      postcss({ extract: false, minimize: true }),
    ]
  },
  // Standalone UMD (with inline CSS)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.standalone.js',
      format: 'umd',
      name: 'MarkdownRenderer',
      sourcemap: false,
      globals: {
        marked: 'marked',
        'highlight.js': 'hljs',
        mermaid: 'mermaid',
        mathjax: 'MathJax',
        dompurify: 'DOMPurify'
      }
    },
    external,
    plugins: [
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: false }),
      postcss({
        extract: false,
        minimize: true,
        inject: true
      }),
    ]
  }
];