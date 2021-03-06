import {PARSER_ERRS, parse} from './parser';
import {STRINGIFIER_ERRS, stringify} from './stringifier';

const REFS_RESOLVER_ERRS = {
  CIRCULAR_REF: {
    code: 401,
    msg: 'Circular reference'
  },
  PARSE_ERR: {
    code: 402,
    msg: 'Parse error'
  }
};

function resolveRefs(refMap = {}, refName) {
  let exp = refMap[refName];
  if (!exp) {
    return {
      ref: refName,
      ...REFS_RESOLVER_ERRS.UNDEFINED_REF
    };
  }
  let err;
  let next = true;
  while (next) {
    err = null;
    next = false;
    const res = parse(exp, {
      varValidator: function (name) {
        if (refMap[name]) {
          next = true;
          if (name == refName) {
            err = {
              ref: name,
              ...REFS_RESOLVER_ERRS.CIRCULAR_REF
            };
          } else {
            return '(' + refMap[name] + ')';
          }
        }
      }
    });
    if (res.code !== 0) {
      err = {
        ...REFS_RESOLVER_ERRS.PARSE_ERR
      };
    }
    if (err) {
      return err;
    }
    if (next) {
      exp = stringify(res.data).data;
    }
  }
  return {
    code: 0,
    data: exp
  };
}

export {REFS_RESOLVER_ERRS, resolveRefs};
