const expect = require('chai').expect;
const formula = require('../dist/dd-formula-parser.umd');
const common = require('./common');

describe('parser', function () {
  it('success', function () {
    expect(
      formula.parse(common.FORMULAS[0], {
        varValidator: function (name) {
          if (name == 'var1') {
            return 'variable1';
          }
        }
      })
    ).to.deep.equal({
      code: 0,
      data: common.PARSED_DATA
    });
  });
});
