import {parse} from './parser';

function genExpression(items) {
  let parts = [];
  let vars = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      const res = genExpression(item);
      vars = vars.concat(res.vars);
      parts.push('(' + res.expression + ') ');
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
      vars.push(item.name);
      parts.push(
        (item.op ? item.op + ' ' : '')
          + (item.negtive ? '-' : '')
          + 'getVar("'
          + item.name
          + '") '
      );
    }
  }
  return {
    vars: vars,
    expression: parts.join('').trim()
  };
}

function genCalculator(items = []) {
  if (typeof items == 'string') {
    items = parse(items).data;
  }
  const exp = genExpression(items);
  const has = {};
  const vars = exp.vars.filter(function (v) {
    if (!has[v]) {
      has[v] = true;
      return true;
    }
    return false;
  });
  const body = `
    params = params || {};
    function getVar(name) {
      return params[name] || 0;
    }
    return ${exp.expression};
  `;
  return {
    vars: vars,
    calculate: new Function('params', body)
  };
}

export {genCalculator};
