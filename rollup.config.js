import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output: {
    format: 'es',
    file: 'dist/bundle.js',
  },
  plugins: [
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
