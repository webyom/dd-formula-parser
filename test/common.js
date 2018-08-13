module.exports = {
  FORMULAS: {
    '$:0':
      '-$:1 + var1 * -(-(1 + var2) * (var3 - (-var4 - 1) * var5 / 2)) + var3 + -round(-3.3) + floor((-1 * 1) + -1.5) - -ceil(2.2)',
    '$:1': '$:2 + 1',
    '$:2': '2'
  },
  RESOLVED_FORMULA:
    '-((2) + 1) + var1 * -(-(1 + var2) * (var3 - (-var4 - 1) * var5 / 2)) + var3 + -round(-3.3) + floor((-1 * 1) + -1.5) - -ceil(2.2)',
  ARRAY_STRINGIFY_RESULT: [
    '-$:1 + variable1 * -(-(1 + var2) * (',
    {var3: 1},
    ' - (-var4 - 1) * var5 / 2)) + ',
    {var3: 1},
    ' + -round(-3.3) + floor((-1 * 1) + -1.5) - -ceil(2.2)'
  ],
  PARSED_DATA: [
    {
      type: 'var',
      name: '$:1',
      negtive: true
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
        type: 'start',
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
        type: 'op',
        name: '*'
      },
      [
        {
          type: 'var',
          name: 'var3'
        },
        {
          type: 'op',
          name: '-'
        },
        [
          {
            type: 'var',
            name: 'var4',
            negtive: true
          },
          {
            type: 'const',
            name: 1,
            op: '-'
          }
        ],
        {
          type: 'var',
          name: 'var5',
          op: '*'
        },
        {
          type: 'const',
          name: 2,
          op: '/'
        }
      ]
    ],
    {
      type: 'var',
      name: 'var3',
      op: '+'
    },
    {
      type: 'func',
      name: 'round',
      op: '+',
      negtive: true
    },
    [
      {
        type: 'const',
        name: -3.3
      }
    ],
    {
      type: 'func',
      name: 'floor',
      op: '+'
    },
    [
      [
        {
          type: 'const',
          name: -1
        },
        {
          type: 'const',
          name: 1,
          op: '*'
        }
      ],
      {
        type: 'const',
        name: -1.5,
        op: '+'
      }
    ],
    {
      type: 'func',
      name: 'ceil',
      op: '-',
      negtive: true
    },
    [
      {
        type: 'const',
        name: 2.2
      }
    ]
  ]
};
