(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.DDFormulaParser = {})));
}(this, (function (exports) { 'use strict';

  var RESERVES = ['+', '-', '*', '/', '(', ')'];

  function tokenize() {
    var src = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    var tokens = [];
    var l = src.length;
    var pending = '';
    for (var i = 0; i < l; i++) {
      var c = src.charAt(i);
      if (/\s/.test(c)) {
        if (pending) {
          tokens.push({
            token: pending,
            position: i - pending.length
          });
          pending = '';
        }
        continue;
      }
      if (RESERVES.indexOf(c) >= 0) {
        if (pending) {
          tokens.push({
            token: pending,
            position: i - pending.length
          });
          pending = '';
        }
        tokens.push({
          token: c,
          position: i
        });
      } else {
        pending += c;
      }
    }
    if (pending) {
      tokens.push({
        token: pending,
        position: l - pending.length
      });
    }
    return tokens;
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var OPERATORS = ['+', '-', '*', '/'];

  var PARSER_ERRS = {
    UNEXPECTED_TOKEN: {
      code: 1,
      msg: 'Unexpected token'
    },
    EXPECT_OPERATOR_BEFORE: {
      code: 2,
      msg: 'Expect operator before'
    },
    UNCLOSED_PARENTHESIS: {
      code: 3,
      msg: 'Unclosed parenthesis'
    },
    INVALID_VAR: {
      code: 3,
      msg: 'Invalid variable'
    }
  };

  function _parse(tokens, opt) {
    var _pos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var _lv = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    var data = [];
    var l = tokens.length;
    var pendding = {
      start: true
    };
    var t = void 0,
        token = void 0;
    while (_pos < l) {
      t = tokens[_pos];
      token = t.token;
      if (token == '(') {
        if (!pendding.op && !pendding.start) {
          // expect start or operator before '('
          return _extends({
            token: token,
            position: t.position
          }, PARSER_ERRS.EXPECT_OPERATOR_BEFORE);
        }
        var res = _parse(tokens, opt, _pos + 1, _lv + 1);
        if (res.code === 0) {
          var nestedData = res.data;
          if (nestedData.length > 0) {
            if (nestedData.length === 1) {
              var item = nestedData[0];
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
            return _extends({
              token: token,
              position: t.position
            }, PARSER_ERRS.UNEXPECTED_TOKEN);
          }
          return {
            code: 0,
            data: data,
            pos: _pos + 1
          };
        } else {
          // ')' should be already processed by inner level
          return _extends({
            token: token,
            position: t.position
          }, PARSER_ERRS.UNEXPECTED_TOKEN);
        }
      } else if (OPERATORS.indexOf(token) >= 0) {
        if (pendding.op || pendding.start) {
          if (token == '*' || token == '/') {
            return _extends({
              token: token,
              position: t.position
            }, PARSER_ERRS.UNEXPECTED_TOKEN);
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
          return _extends({
            token: token,
            position: t.position
          }, PARSER_ERRS.EXPECT_OPERATOR_BEFORE);
        }
        var num = +token;
        var _item = void 0;
        if (isNaN(num)) {
          var newToken = void 0;
          if (opt.varValidator) {
            var _res = opt.varValidator(token);
            if (_res === false) {
              return _extends({
                token: token,
                position: t.position
              }, PARSER_ERRS.INVALID_VAR);
            }
            newToken = typeof _res == 'string' ? _res : '';
          }
          _item = {
            type: 'var',
            name: newToken || token
          };
        } else {
          _item = {
            type: 'const',
            name: num
          };
        }
        if (pendding.op) {
          _item.op = pendding.op;
        }
        if (pendding.negtive) {
          _item.negtive = true;
        }
        data.push(_item);
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
      return _extends({
        token: token,
        position: t.position
      }, PARSER_ERRS.UNCLOSED_PARENTHESIS);
    }
    if (pendding.op) {
      // expect operand after operator
      return _extends({
        token: token,
        position: t.position
      }, PARSER_ERRS.UNEXPECTED_TOKEN);
    }
    return {
      code: 0,
      data: data
    };
  }

  function parse(src) {
    var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var tokens = tokenize(src);
    return _parse(tokens, opt);
  }

  var STRINGIFIER_ERRS = {
    INVALID_VAR: {
      code: 1,
      msg: 'Invalid variable'
    }
  };

  function _stringify(items, opt) {
    var parts = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (Array.isArray(item)) {
          var res = _stringify(item, opt);
          if (res.code !== 0) {
            return res;
          }
          parts.push('(' + res.data + ') ');
        } else if (item.type == 'op') {
          parts.push(item.name + ' ' + (item.negtive ? '-' : ''));
        } else if (item.type == 'const') {
          parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + item.name + ' ');
        } else {
          var newToken = void 0;
          if (opt.varValidator) {
            var _res = opt.varValidator(item.name);
            if (_res === false) {
              return _extends({
                token: item.name
              }, STRINGIFIER_ERRS.INVALID_VAR);
            }
            newToken = typeof _res == 'string' ? _res : '';
          }
          parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + (newToken || item.name) + ' ');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      code: 0,
      data: parts.join('').trim()
    };
  }

  function stringify() {
    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return _stringify(items, opt);
  }

  var REFS_RESOLVER_ERRS = {
    UNDEFINED_REF: {
      code: 1,
      msg: 'Undefined reference'
    },
    CIRCULAR_REF: {
      code: 2,
      msg: 'Circular reference'
    }
  };

  function resolveRefs() {
    var refs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var n = arguments[1];

    var data = refs[n];
    if (!data) {
      return _extends({
        ref: '$' + n
      }, REFS_RESOLVER_ERRS.UNDEFINED_REF);
    } else if (new RegExp('\\$' + n + '(\\D|$)').test(data)) {
      return _extends({
        ref: '$' + n
      }, REFS_RESOLVER_ERRS.CIRCULAR_REF);
    }
    var err = void 0;
    while (!err && /\$\d+/.test(data)) {
      data = data.replace(/\$(\d+)/g, function (all, i) {
        if (i == n) {
          err = _extends({
            ref: '$' + i
          }, REFS_RESOLVER_ERRS.CIRCULAR_REF);
          return all;
        }
        if (!refs[i]) {
          err = _extends({
            ref: '$' + i
          }, REFS_RESOLVER_ERRS.UNDEFINED_REF);
          return all;
        }
        if (new RegExp('\\$' + i + '(\\D|$)').test(refs[i])) {
          err = _extends({
            ref: '$' + i
          }, REFS_RESOLVER_ERRS.CIRCULAR_REF);
        }
        return refs[i];
      });
    }
    return err || {
      code: 0,
      data: data
    };
  }

  function genExpression(items) {
    var parts = [];
    var vars = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (Array.isArray(item)) {
          var res = genExpression(item);
          vars = vars.concat(res.vars);
          parts.push('(' + res.expression + ') ');
        } else if (item.type == 'op') {
          parts.push(item.name + ' ' + (item.negtive ? '-' : ''));
        } else if (item.type == 'const') {
          parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + item.name + ' ');
        } else {
          vars.push(item.name);
          parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + 'getVar("' + item.name + '") ');
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return {
      vars: vars,
      expression: parts.join('').trim()
    };
  }

  function genCalculator() {
    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (typeof items == 'string') {
      items = parse(items).data;
    }
    var exp = genExpression(items);
    var has = {};
    var vars = exp.vars.filter(function (v) {
      if (!has[v]) {
        has[v] = true;
        return true;
      }
      return false;
    });
    var body = '\n    params = params || {};\n    function getVar(name) {\n      return params[name] || 0;\n    }\n    return ' + exp.expression + ';\n  ';
    return {
      vars: vars,
      calculate: new Function('params', body)
    };
  }

  exports.PARSER_ERRS = PARSER_ERRS;
  exports.parse = parse;
  exports.STRINGIFIER_ERRS = STRINGIFIER_ERRS;
  exports.stringify = stringify;
  exports.REFS_RESOLVER_ERRS = REFS_RESOLVER_ERRS;
  exports.resolveRefs = resolveRefs;
  exports.genCalculator = genCalculator;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
