const expect = require('chai').expect;
const formula = require('../');
const common = require('./common');

describe('stringifier', function () {
  it('success', function () {
    expect(
      formula.stringify(common.PARSED_DATA, {
        varValidator: function (name) {
          if (name == 'variable1') {
            return 'var1';
          }
        }
      })
    ).to.deep.equal({
      code: 0,
      data: common.FORMULAS[0]
    });
  });

  it('back and forth', function () {
    expect(
      formula.stringify(formula.parse(common.FORMULAS[0]).data, {
        varValidator: function (name) {
          if (name == 'variable1') {
            return 'var1';
          }
        }
      })
    ).to.deep.equal({
      code: 0,
      data: common.FORMULAS[0]
    });
  });

  it('unexpected start token', function () {
    expect(
      formula.stringify([{type: 'var', name: 'var1'}, {type: 'start'}]).code
    ).to.equal(formula.STRINGIFIER_ERRS.UNEXPECTED_START_TOKEN.code);
  });

  it('invalid variable', function () {
    expect(
      formula.stringify([{type: 'var', name: 'var1'}], {
        varValidator: function (name) {
          return false;
        }
      }).code
    ).to.equal(formula.STRINGIFIER_ERRS.INVALID_VAR.code);
  });
});
