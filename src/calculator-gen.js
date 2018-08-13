import {parse} from './parser';

const CALCULATOR_GEN_ERRS = {
  UNEXPECTED_START_TOKEN: {
    code: 301,
    msg: 'Unexpected start token'
  }
};

function genExpression(items) {
  let parts = [];
  let vars = [];
  for (let i = 0, l = items.length; i < l; i++) {
    const item = items[i];
    if (Array.isArray(item)) {
      const res = genExpression(item);
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
    } else if (item.type == 'func') {
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + 'Math.'
          + item.name
      );
    } else if (item.type == 'const') {
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + item.name
          + ' '
      );
    } else {
      vars.push(item.name);
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + '(params["'
          + item.name
          + '"] || 0) '
      );
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

function genCalculator(items = []) {
  if (typeof items == 'string') {
    items = parse(items).data;
  }
  const exp = genExpression(items);
  if (exp.code !== 0) {
    return exp;
  }
  const has = {};
  const vars = exp.data.vars.filter(function (v) {
    if (!has[v]) {
      has[v] = true;
      return true;
    }
    return false;
  });
  const body = `
    params = params || {};
    return ${exp.data.expression};
  `;
  return {
    code: 0,
    data: {
      vars: vars,
      calculator: new Function('params', body)
    }
  };
}

export {CALCULATOR_GEN_ERRS, genCalculator};
