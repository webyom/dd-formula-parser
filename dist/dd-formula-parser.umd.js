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

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var OPERATORS = ['+', '-', '*', '/'];

  var PARSER_ERRS = {
    EXPECT_OPERAND_AFTER_OPERATOR: {
      code: 1,
      msg: 'Expect operand after operator'
    },
    EXPECT_OPERAND_BEFORE_PARNTHESIS_CLOSE: {
      code: 2,
      msg: 'Expect operand before parenthesis close'
    },
    UNEXPECTED_PARENTHESIS_CLOSE: {
      code: 3,
      msg: 'Unexpected parenthesis close'
    },
    UNEXPECTED_OPERATOR: {
      code: 4,
      msg: 'Unexpected operator'
    },
    EXPECT_OPERATOR_BEFORE_OPERAND: {
      code: 5,
      msg: 'Expect operator before operand'
    },
    UNCLOSED_PARENTHESIS: {
      code: 6,
      msg: 'Unclosed parenthesis'
    },
    INVALID_VAR: {
      code: 7,
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
          }, PARSER_ERRS.EXPECT_OPERATOR_BEFORE_OPERAND);
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
            return _extends({
              token: token,
              position: t.position
            }, PARSER_ERRS.EXPECT_OPERAND_BEFORE_PARNTHESIS_CLOSE);
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
          }, PARSER_ERRS.UNEXPECTED_PARENTHESIS_CLOSE);
        }
      } else if (OPERATORS.indexOf(token) >= 0) {
        if (pendding.op || pendding.start) {
          if (token == '*' || token == '/') {
            return _extends({
              token: token,
              position: t.position
            }, PARSER_ERRS.UNEXPECTED_OPERATOR);
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
          }, PARSER_ERRS.EXPECT_OPERATOR_BEFORE_OPERAND);
        }
        var num = +token;
        var _item = void 0;
        if (isNaN(num)) {
          var newToken = token;
          if (opt.varValidator) {
            var _res = opt.varValidator(token);
            if (_res === false) {
              return _extends({
                token: token,
                position: t.position
              }, PARSER_ERRS.INVALID_VAR);
            }
            if (typeof _res == 'string') {
              newToken = _res;
            }
          }
          _item = {
            type: 'var',
            name: newToken
          };
          if (pendding.negtive) {
            _item.negtive = true;
          }
        } else {
          _item = {
            type: 'const',
            name: pendding.negtive ? -num : num
          };
        }
        if (pendding.op) {
          _item.op = pendding.op;
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
      }, PARSER_ERRS.EXPECT_OPERAND_AFTER_OPERATOR);
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
    UNEXPECTED_START_TOKEN: {
      code: 1,
      msg: 'Unexpected start token'
    },
    INVALID_VAR: {
      code: 2,
      msg: 'Invalid variable'
    }
  };

  function _stringify(items, opt) {
    var _lv = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var arrayData = false;
    var parts = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = items.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ref = _step.value;

        var _ref2 = slicedToArray(_ref, 2);

        var i = _ref2[0];
        var item = _ref2[1];

        if (Array.isArray(item)) {
          var res = _stringify(item, opt, _lv + 1);
          if (res.code !== 0) {
            return res;
          }
          if (res.arrayData) {
            arrayData = true;
            parts.push('(');
            parts = parts.concat(res.data);
            parts.push(') ');
          } else {
            parts.push('(' + res.data + ') ');
          }
        } else if (item.type == 'start') {
          if (i !== 0) {
            return STRINGIFIER_ERRS.UNEXPECTED_START_TOKEN;
          }
          if (item.negtive) {
            parts.push('-');
          }
        } else if (item.type == 'op') {
          parts.push(item.name + ' ' + (item.negtive ? '-' : ''));
        } else if (item.type == 'const') {
          parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + item.name + ' ');
        } else {
          var newToken = item.name;
          if (opt.varValidator) {
            var _res = opt.varValidator(item.name);
            if (_res === false) {
              return _extends({
                token: item.name
              }, STRINGIFIER_ERRS.INVALID_VAR);
            }
            var resType = typeof _res === 'undefined' ? 'undefined' : _typeof(_res);
            if (resType == 'string' || _res && resType == 'object') {
              newToken = _res;
            }
          }
          if ((typeof newToken === 'undefined' ? 'undefined' : _typeof(newToken)) == 'object') {
            arrayData = true;
            parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : ''), newToken, ' ');
          } else {
            parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + newToken + ' ');
          }
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

    if (arrayData) {
      var newParts = [];
      var tmp = '';
      for (var _i = 0, l = parts.length; _i < l; _i++) {
        var part = parts[_i];
        if (typeof part == 'string') {
          tmp += part;
        } else if (tmp) {
          if (!newParts.length) {
            tmp = tmp.trimLeft();
          }
          newParts.push(tmp, part);
          tmp = '';
        } else {
          newParts.push(part);
        }
      }
      if (tmp) {
        tmp = tmp.trimRight();
        newParts.push(tmp);
      }
      return {
        code: 0,
        arrayData: true,
        data: newParts
      };
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
        return '(' + refs[i] + ')';
      });
    }
    return err || {
      code: 0,
      data: data
    };
  }

  var CALCULATOR_GEN_ERRS = {
    UNEXPECTED_START_TOKEN: {
      code: 1,
      msg: 'Unexpected start token'
    }
  };

  function genExpression(items) {
    var parts = [];
    var vars = [];
    for (var i = 0, l = items.length; i < l; i++) {
      var item = items[i];
      if (Array.isArray(item)) {
        var res = genExpression(item);
        if (res.code !== 0) {
          return res;
        }
        vars = vars.concat(res.data.vars);
        parts.push('(' + res.data.expression + ') ');
      } else if (item.type == 'start') {
        if (i !== 0) {
          return CALCULATOR_GEN_ERRS.UNEXPECTED_START_TOKEN;
        }
        if (item.negtive) {
          parts.push('-');
        }
      } else if (item.type == 'op') {
        parts.push(item.name + ' ' + (item.negtive ? '-' : ''));
      } else if (item.type == 'const') {
        parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + item.name + ' ');
      } else {
        vars.push(item.name);
        parts.push((item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + '(params["' + item.name + '"] || 0) ');
      }
    }
    return {
      code: 0,
      data: {
        vars: vars,
        expression: parts.join('').trim()
      }
    };
  }

  function genCalculator() {
    var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    if (typeof items == 'string') {
      items = parse(items).data;
    }
    var exp = genExpression(items);
    if (exp.code !== 0) {
      return exp;
    }
    var has = {};
    var vars = exp.data.vars.filter(function (v) {
      if (!has[v]) {
        has[v] = true;
        return true;
      }
      return false;
    });
    var body = '\n    params = params || {};\n    return ' + exp.data.expression + ';\n  ';
    return {
      code: 0,
      data: {
        vars: vars,
        calculator: new Function('params', body)
      }
    };
  }

  exports.PARSER_ERRS = PARSER_ERRS;
  exports.parse = parse;
  exports.STRINGIFIER_ERRS = STRINGIFIER_ERRS;
  exports.stringify = stringify;
  exports.REFS_RESOLVER_ERRS = REFS_RESOLVER_ERRS;
  exports.resolveRefs = resolveRefs;
  exports.CALCULATOR_GEN_ERRS = CALCULATOR_GEN_ERRS;
  exports.genCalculator = genCalculator;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
