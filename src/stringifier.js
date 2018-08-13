const STRINGIFIER_ERRS = {
  UNEXPECTED_START_TOKEN: {
    code: 201,
    msg: 'Unexpected start token'
  },
  INVALID_VAR: {
    code: 202,
    msg: 'Invalid variable'
  }
};

function _stringify(items, opt, _lv = 0) {
  let arrayData = false;
  let parts = [];
  for (const [i, item] of items.entries()) {
    if (Array.isArray(item)) {
      const res = _stringify(item, opt, _lv + 1);
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
    } else if (item.type == 'func') {
      parts.push(
        (item.op ? item.op + ' ' : '') + (item.negtive ? '-' : '') + item.name
      );
    } else if (item.type == 'const') {
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + item.name
          + ' '
      );
    } else {
      let newToken = item.name;
      if (opt.varValidator) {
        const res = opt.varValidator(item.name);
        if (res === false) {
          return {
            token: item.name,
            ...STRINGIFIER_ERRS.INVALID_VAR
          };
        }
        const resType = typeof res;
        if (resType == 'string' || (res && resType == 'object')) {
          newToken = res;
        }
      }
      if (typeof newToken == 'object') {
        arrayData = true;
        parts.push(
          (item.op ? item.op + ' ' : '') + (item.negtive ? '-' : ''),
          newToken,
          ' '
        );
      } else {
        parts.push(
          (item.op ? item.op + ' ' : '')
            + (item.negtive ? '-' : '')
            + newToken
            + ' '
        );
      }
    }
  }
  if (arrayData) {
    const newParts = [];
    let tmp = '';
    for (let i = 0, l = parts.length; i < l; i++) {
      const part = parts[i];
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

function stringify(items = [], opt = {}) {
  return _stringify(items, opt);
}

export {STRINGIFIER_ERRS, stringify};
