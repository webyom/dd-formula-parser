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

  it('undefined reference', function () {
    expect(formula.resolveRefs([], 0).code).to.equal(
      formula.REFS_RESOLVER_ERRS.UNDEFINED_REF.code
    );
  });

  it('self reference', function () {
    expect(formula.resolveRefs(['$0 + 1'], 0).code).to.equal(
      formula.REFS_RESOLVER_ERRS.CIRCULAR_REF.code
    );
  });

  it('circular reference', function () {
    expect(
      formula.resolveRefs(['$1 + 1', '$2 + 2', '$0 + 3'], 0).code
    ).to.equal(formula.REFS_RESOLVER_ERRS.CIRCULAR_REF.code);
  });
});
