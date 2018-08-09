module.exports = {
  FORMULAS: ['$1 + var1 * -(1 + var2) + var3 + 3', '$2 + 1', '2'],
  RESOLVED_FORMULA: '2 + 1 + var1 * -(1 + var2) + var3 + 3',
  PARSED_DATA: [
    {
      type: 'var',
      name: '$1'
    },
    {
      type: 'var',
      name: 'variable1',
      op: '+'
    },
    {
      type: 'op',
      name: '*',
      negtive: true
    },
    [
      {
        type: 'const',
        name: 1
      },
      {
        type: 'var',
        name: 'var2',
        op: '+'
      }
    ],
    {
      type: 'var',
      name: 'var3',
      op: '+'
    },
    {
      type: 'const',
      name: 3,
      op: '+'
    }
  ]
};
