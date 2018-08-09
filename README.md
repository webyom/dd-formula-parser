# dd-formula-parser

[![Build Status](https://travis-ci.org/webyom/dd-formula-parser.svg?branch=master)](https://travis-ci.org/webyom/dd-formula-parser)
[![codecov](https://codecov.io/gh/webyom/dd-formula-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/webyom/dd-formula-parser)

## Reserved Tokens

### Operators

`+`, `-`, `*`, `/`,

### Parenthesis

`(`, `)`

### Negative Sign

`-`

## Operands

### Number Literals

Support decimal integer and float numbers, such as `18`, `1.5`

### Variables

Besides reserved tokens and number literals, all the tokens are treated as variables, such as `var1`

Variables start with `$` followd by zero and natural numbers such as `$1` can be used as placeholder for a reference to other formulas. We supply api for resolving these references.

## Api

## parse(src, opt)

### params

- `src` string of formula
- `opt` optional param
  - `varValidator` a function for validating variables, takes a single param of variable name. Returning boolean value `false` means the variable is invalid, and returning a string value to replace the variable name to what you returned.

### return

This function return an nested array of objects representing each tokens in the formala.

Parentheses are represented with array.

Each operator is grouped with the operand after it unless the token after the operator is parenthesis.

Negative sign is grouped with the literal or variable it decorating unless it is followed by parenthesis. Negative sign decorating parenthesis is grouped with the operator before parenthesis or a "start" token.

### Example
``` js
parse('-(var1 + 1) - -(-(var2 * 2) - 3) + -1.5', {
  varValidator: function (name) {
    if (name == var1) {
      return 'replaced';
    }
  }
});
```
``` js
{
  code: 0,
  data: [
    {type: 'start', negtive: true},
    [
      {type: 'var', name: 'replaced'},
      {type: 'const', name: 1, op: '+'}
    ],
    {type: 'op', name: '-', negtive: true},
    [
      {type: 'start', negtive: true},
      [
        {type: 'var', name: 'var2'},
        {type: 'const', name: 2, op: '*'}
      ],
      {type: 'const', name: 3, op: '-'}
    ],
    {type: 'const', name: -1.5, op: '+'}
  ]
}
```

### Description

- `type` type of token
  - `start` if a start of parenthesis contains negtive sign, we need this token to carry it.
  - `op` if an operator is followed by parenthesis, we need this token to carry it.
  - `const` number literals
  - `var` variables
- `name` representation of operators, number literals and variables.
- `op` the operator grouped with the operand.
- `negtive` boolean value indicating whether the variables and expression grouped by parenthesis have a negtive sign.

## stringify(items, opt)

This function is a negtive process of `parse` function. It takes an array param, and return an object with `data` property of formula string. It also accept the same optional param as `parse`.

### return

``` js
{
  code: 0,
  data: 'var1 + 2'
}
```

## genCalculator(src)

Generate calculator function for a formula string or the data returned by `parse`

### return

``` js
{
  code: 0,
  data: [
    vars: ['var1', 'var2'],
    calculator: function (params) {...}
  ]
}
```

### Description

- `vars` variable is in the formula
- `calculator` calculator function of the formula. The `params` must be supplied if the formula contains variables, it is a dictionary of variable name keys and the actual values of variables. This function returns a calculated number result.

## resolveRefs(refs, n)

Recursively resolve the `$1` like variables, replace them with the actual formula the are referring to.

### params

- `refs` an array of all the formulas, the index of formula in the array is associated with the number after `$` sign of the variable.
- `n` the index of the formula you want to resolve in the array.

### return

``` js
{
  code: 0,
  data: '1 + 1'
}
```

## Common Return Structure

All the functions return the same structure of data.

- `code` an integer for identifying the result. `0` zero means a success return, none zero means an error occurred.
- `msg` if code is none zero, this field indicates the reason.
- `data` the payload data

You can compare the `code` with error codes in `PARSER_ERRS`, `STRINGIFIER_ERRS`, `REFS_RESOLVER_ERRS` and `CALCULATOR_GEN_ERRS` exported to determin the error type.
