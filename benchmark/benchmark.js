const Benchmark = require('benchmark');
const formula = require('../');
const data = require('../test/common');

const calculator = formula.genCalculator(data.FORMULAS[0]).data;
const calculaterParams = {};
calculator.vars.forEach(function (name) {
  calculaterParams[name] = Math.random();
});

new Benchmark.Suite()
  .add('parse', function () {
    formula.parse(data.FORMULAS[0]);
  })
  .add('stringify', function () {
    formula.stringify(data.PARSED_DATA);
  })
  .add('genCalculator', function () {
    formula.genCalculator(data.FORMULAS[0]);
  })
  .add('calculate', function () {
    calculator.calculator(calculaterParams);
  })
  .add('resolveRefs', function () {
    formula.resolveRefs(data.FORMULAS, 0);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .run({async: true});
