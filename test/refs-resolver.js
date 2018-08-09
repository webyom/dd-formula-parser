const expect = require('chai').expect;
const formula = require('../dist/dd-formula-parser.umd');
const common = require('./common');

describe('refs-resolver', function () {
  it('success', function () {
    expect(formula.resolveRefs(common.FORMULAS, 0)).to.deep.equal({
      code: 0,
      data: common.RESOLVED_FORMULA
    });
  });
});
