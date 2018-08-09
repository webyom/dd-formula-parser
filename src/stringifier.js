const STRINGIFIER_ERRS = {
  INVALID_VAR: {
    code: 1,
    msg: 'Invalid variable'
  }
};

function _stringify(items, opt) {
  let parts = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      const res = _stringify(item, opt);
      if (res.code !== 0) {
        return res;
      }
      parts.push('(' + res.data + ') ');
    } else if (item.type == 'op') {
      parts.push(item.name + ' ' + (item.negtive ? '-' : ''));
    } else if (item.type == 'const') {
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + item.name
          + ' '
      );
    } else {
      let newToken;
      if (opt.varValidator) {
        const res = opt.varValidator(item.name);
        if (res === false) {
          return {
            token: item.name,
            ...STRINGIFIER_ERRS.INVALID_VAR
          };
        }
        newToken = typeof res == 'string' ? res : '';
      }
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + (newToken || item.name)
          + ' '
      );
    }
  }
  return {
    code: 0,
    data: parts.join('').trim()
  };
}

function stringify(items = [], opt = {}) {
  return _stringify(items, opt);
}

export {STRINGIFIER_ERRS, stringify};