import {tokenize} from './tokenizer';

const OPERATORS = ['+', '-', '*', '/'];

const PARSER_ERRS = {
  EXPECT_OPERAND_AFTER_OPERATOR: {
    code: 101,
    msg: 'Expect operand after operator'
  },
  EXPECT_OPERAND_BEFORE_PARNTHESIS_CLOSE: {
    code: 102,
    msg: 'Expect operand before parenthesis close'
  },
  UNEXPECTED_PARENTHESIS_CLOSE: {
    code: 103,
    msg: 'Unexpected parenthesis close'
  },
  UNEXPECTED_OPERATOR: {
    code: 104,
    msg: 'Unexpected operator'
  },
  EXPECT_OPERATOR_BEFORE_OPERAND: {
    code: 105,
    msg: 'Expect operator before operand'
  },
  UNCLOSED_PARENTHESIS: {
    code: 106,
    msg: 'Unclosed parenthesis'
  },
  INVALID_VAR: {
    code: 107,
    msg: 'Invalid variable'
  }
};

function _parse(tokens, opt, _pos = 0, _lv = 0) {
  const data = [];
  const l = tokens.length;
  let pendding = {
    start: true
  };
  let t, token;
  while (_pos < l) {
    t = tokens[_pos];
    token = t.token;
    if (token == '(') {
      if (!pendding.op && !pendding.start) {
        // expect start or operator before '('
        return {
          token: token,
          position: t.position,
          ...PARSER_ERRS.EXPECT_OPERATOR_BEFORE_OPERAND
        };
      }
      const res = _parse(tokens, opt, _pos + 1, _lv + 1);
      if (res.code === 0) {
        let nestedData = res.data;
        if (nestedData.length > 0) {
          if (nestedData.length === 1) {
            let item = nestedData[0];
            if (pendding.op) {
              item.op = pendding.op;
            }
            if (pendding.negtive) {
              item.negtive = true;
            }
            data.push(item);
          } else {
            if (pendding.op) {
              if (pendding.negtive) {
                data.push({
                  type: 'op',
                  name: pendding.op,
                  negtive: true
                });
              } else {
                data.push({
                  type: 'op',
                  name: pendding.op
                });
              }
            } else if (pendding.negtive) {
              // is start negtive
              data.push({
                type: 'start',
                negtive: true
              });
            }
            data.push(nestedData);
          }
          pendding = {};
        }
        _pos = res.pos;
      } else {
        return res;
      }
    } else if (token == ')') {
      if (_lv > 0) {
        if (pendding.op || pendding.start) {
          // expect operand before ')'
          return {
            token: token,
            position: t.position,
            ...PARSER_ERRS.EXPECT_OPERAND_BEFORE_PARNTHESIS_CLOSE
          };
        }
        return {
          code: 0,
          data: data,
          pos: _pos + 1
        };
      } else {
        // ')' should be already processed by inner level
        return {
          token: token,
          position: t.position,
          ...PARSER_ERRS.UNEXPECTED_PARENTHESIS_CLOSE
        };
      }
    } else if (OPERATORS.indexOf(token) >= 0) {
      if (pendding.op || pendding.start) {
        if (token == '*' || token == '/') {
          return {
            token: token,
            position: t.position,
            ...PARSER_ERRS.UNEXPECTED_OPERATOR
          };
        }
        if (token == '-') {
          if (pendding.negtive) {
            delete pendding.negtive;
          } else {
            pendding.negtive = true;
          }
        }
      } else {
        pendding = {
          op: token
        };
      }
      _pos++;
    } else {
      // operand
      if (!pendding.op && !pendding.start) {
        // expect start or operator before an operand
        return {
          token: token,
          position: t.position,
          ...PARSER_ERRS.EXPECT_OPERATOR_BEFORE_OPERAND
        };
      }
      const num = +token;
      let item;
      if (isNaN(num)) {
        let newToken = token;
        if (opt.varValidator) {
          const res = opt.varValidator(token);
          if (res === false) {
            return {
              token: token,
              position: t.position,
              ...PARSER_ERRS.INVALID_VAR
            };
          }
          if (typeof res == 'string') {
            newToken = res;
          }
        }
        item = {
          type: 'var',
          name: newToken
        };
        if (pendding.negtive) {
          item.negtive = true;
        }
      } else {
        item = {
          type: 'const',
          name: pendding.negtive ? -num : num
        };
      }
      if (pendding.op) {
        item.op = pendding.op;
      }
      data.push(item);
      pendding = {};
      _pos++;
    }
  }
  if (_lv > 0) {
    // should already returned before
    if (!t) {
      t = tokens[_pos - 1];
      token = t.token;
    }
    return {
      token: token,
      position: t.position,
      ...PARSER_ERRS.UNCLOSED_PARENTHESIS
    };
  }
  if (pendding.op) {
    // expect operand after operator
    return {
      token: token,
      position: t.position,
      ...PARSER_ERRS.EXPECT_OPERAND_AFTER_OPERATOR
    };
  }
  return {
    code: 0,
    data: data
  };
}

function parse(src, opt = {}) {
  const tokens = tokenize(src);
  return _parse(tokens, opt);
}

export {PARSER_ERRS, parse};
