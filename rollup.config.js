import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output: {
    format: 'es',
    file: 'dist/bundle.js',
  },
  plugins: [
    commonjs(),
    json(),
    nodeResolve({
      browser: true,
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
