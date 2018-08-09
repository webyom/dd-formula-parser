const REFS_RESOLVER_ERRS = {
  UNDEFINED_REF: {
    code: 1,
    msg: 'Undefined reference'
  },
  CIRCULAR_REF: {
    code: 2,
    msg: 'Circular reference'
  }
};

function resolveRefs(refs = [], n) {
  let data = refs[n];
  if (!data) {
    return {
      ref: '$' + n,
      ...REFS_RESOLVER_ERRS.UNDEFINED_REF
    };
  } else if (new RegExp('\\$' + n + '(\\D|$)').test(data)) {
    return {
      ref: '$' + n,
      ...REFS_RESOLVER_ERRS.CIRCULAR_REF
    };
  }
  let err;
  while (!err && (/\$\d+/).test(data)) {
    data = data.replace(/\$(\d+)/g, function (all, i) {
      if (i == n) {
        err = {
          ref: '$' + i,
          ...REFS_RESOLVER_ERRS.CIRCULAR_REF
        };
        return all;
      }
      if (!refs[i]) {
        err = {
          ref: '$' + i,
          ...REFS_RESOLVER_ERRS.UNDEFINED_REF
        };
        return all;
      }
      if (new RegExp('\\$' + i + '(\\D|$)').test(refs[i])) {
        err = {
          ref: '$' + i,
          ...REFS_RESOLVER_ERRS.CIRCULAR_REF
        };
      }
      return '(' + refs[i] + ')';
    });
  }
  return (
    err || {
      code: 0,
      data: data
    }
  );
}

export {REFS_RESOLVER_ERRS, resolveRefs};
