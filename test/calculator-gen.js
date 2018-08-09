const expect = require('chai').expect;
const formula = require('../');
const common = require('./common');

describe('calculator-gen', function () {
  it('get variables', function () {
    expect(formula.genCalculator(common.FORMULAS[0]).data.vars).to.deep.equal([
      '$1',
      'var1',
      'var2',
      'var3',
      'var4',
      'var5'
    ]);
  });

  it('calculate', function () {
    expect(
      formula.genCalculator(common.FORMULAS[0]).data.calculator({
        var1: 3
      })
    ).to.equal(-3);
  });

  it('calculate refs resolved', function () {
    expect(
      formula
        .genCalculator(formula.resolveRefs(common.FORMULAS, 0).data)
        .data.calculator({
          var1: 3
        })
    ).to.equal(-6);
  });

  it('unexpected start token', function () {
    expect(
      formula.genCalculator([{type: 'var', name: 'var1'}, {type: 'start'}]).code
    ).to.equal(formula.CALCULATOR_GEN_ERRS.UNEXPECTED_START_TOKEN.code);
  });
});
