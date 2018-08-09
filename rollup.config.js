import babel from 'rollup-plugin-babel';

export default {
  input: 'src/main.js',
  output: {
    format: 'umd',
    name: 'DDFormulaParser',
    file: 'dist/dd-formula-parser.umd.js'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
