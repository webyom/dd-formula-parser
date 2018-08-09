const expect = require('chai').expect;
const formula = require('../dist/dd-formula-parser.umd');
const common = require('./common');

describe('calculator-gen', function () {
  it('calculate success', function () {
    expect(
      formula.genCalculator(common.FORMULAS[0]).calculate({
        var1: 3
      })
    ).to.equal(0);
  });
  it('get variables', function () {
    expect(formula.genCalculator(common.FORMULAS[0]).vars).to.deep.equal([
      '$1',
      'var1',
      'var2',
      'var3'
    ]);
  });
});
