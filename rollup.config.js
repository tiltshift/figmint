import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import json from 'rollup-plugin-json'
import builtins from 'rollup-plugin-node-builtins'
import babel from 'rollup-plugin-babel'
import typescript from 'rollup-plugin-typescript'

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH

export default {
  input: 'src/index.tsx',
  output: {
    file: 'bin/figmint.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: false,
  },
  external: ['figma-js'],
  plugins: [
    typescript(),
    json(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        '@babel/env',
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
      plugins: [
        '@babel/proposal-class-properties',
        '@babel/proposal-object-rest-spread',
      ],
    }),
    resolve({
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    builtins(),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/index.js': [
          'useRef',
          'useEffect',
          'useState,',
          'Children',
          'Component',
          'PropTypes',
          'createElement',
        ],
        'node_modules/ink/build/index.js': ['Box', 'Text', 'Color'],
      },
    }),
    production && terser(),
  ],
}
