const RESERVES = ['+', '-', '*', '/', '(', ')'];

function tokenize(src = '') {
  const tokens = [];
  const l = src.length;
  let pending = '';
  for (let i = 0; i < l; i++) {
    let c = src.charAt(i);
    if ((/\s/).test(c)) {
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

export {tokenize};
