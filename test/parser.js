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

  it('expect start or operator before "("', function () {
    expect(formula.parse('var1 (1 + 1)').code).to.equal(
      formula.PARSER_ERRS.EXPECT_OPERATOR_BEFORE.code
    );
  });

  it('expect operand before ")"', function () {
    expect(formula.parse('(1 + )').code).to.equal(
      formula.PARSER_ERRS.EXPECT_OPERAND_BEFORE_PARNTHESIS_CLOSE.code
    );
  });

  it('unexpected parenthesis close', function () {
    expect(formula.parse('(1 + 1))').code).to.equal(
      formula.PARSER_ERRS.UNEXPECTED_PARENTHESIS_CLOSE.code
    );
  });

  it('unclosed parenthesis', function () {
    expect(formula.parse('(1 + 1').code).to.equal(
      formula.PARSER_ERRS.UNCLOSED_PARENTHESIS.code
    );
  });

  it('unexpected operator at start', function () {
    expect(formula.parse('* 1 + 1').code).to.equal(
      formula.PARSER_ERRS.UNEXPECTED_OPERATOR.code
    );
  });

  it('unexpected operator after operator', function () {
    expect(formula.parse('1 * * 1').code).to.equal(
      formula.PARSER_ERRS.UNEXPECTED_OPERATOR.code
    );
  });

  it('expect operator before operand', function () {
    expect(formula.parse('1 + 1 2').code).to.equal(
      formula.PARSER_ERRS.EXPECT_OPERATOR_BEFORE.code
    );
  });

  it('expect operand after operator', function () {
    expect(formula.parse('1 + 1 +').code).to.equal(
      formula.PARSER_ERRS.EXPECT_OPERAND_AFTER_OPERATOR.code
    );
  });

  it('invalid variable', function () {
    expect(
      formula.parse('var1 + 1', {
        varValidator: function (name) {
          return false;
        }
      }).code
    ).to.equal(formula.PARSER_ERRS.INVALID_VAR.code);
  });
});
