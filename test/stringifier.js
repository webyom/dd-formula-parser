const expect = require('chai').expect;
const formula = require('../dist/dd-formula-parser.umd');
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
});
