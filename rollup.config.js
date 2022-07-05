import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  external: ['log', 'http-request', 'cookies'],
  output: {
    format: 'es',
    dir: 'dist',
  },
  preserveModules: false,
  plugins: [
    commonjs(),
    json(),
    resolve({ browser: true }),
    copy({
      targets: [
        {
          src: 'src/bundle.json',
          dest: 'dist',
        },
      ],
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
