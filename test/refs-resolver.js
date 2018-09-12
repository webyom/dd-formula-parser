const expect = require('chai').expect;
const formula = require('../');
const common = require('./common');

describe('refs-resolver', function () {
  it('success', function () {
    expect(formula.resolveRefs(common.FORMULAS, '$:0')).to.deep.equal({
      code: 0,
      data: common.RESOLVED_FORMULA
    });
  });

  it('self reference', function () {
    expect(formula.resolveRefs({'$:0': '$:0 + 1'}, '$:0').code).to.equal(
      formula.REFS_RESOLVER_ERRS.CIRCULAR_REF.code
    );
  });

  it('parse error', function () {
    expect(formula.resolveRefs({'$:0': '$:0 +'}, '$:0').code).to.equal(
      formula.REFS_RESOLVER_ERRS.PARSE_ERR.code
    );
  });

  it('circular reference', function () {
    expect(
      formula.resolveRefs(
        {'$:0': '$:1 + 1', '$:1': '$:2 + 2', '$:2': '$:0 + 3'},
        '$:0'
      ).code
    ).to.equal(formula.REFS_RESOLVER_ERRS.CIRCULAR_REF.code);
  });
});
