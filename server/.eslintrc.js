module.exports = {
    parser: '@babel/eslint-parser',
    env: {
      node: true,
      commonjs: true,
      es6: true,
      jest: true,
    },
    extends: [
      'airbnb-base',
    ],
    plugins: [
      'jsdoc',
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
      ecmaVersion: 2018,
    },
    rules: {
      'no-return-await': 'off',
      'class-methods-use-this': 'off',
      'no-unused-expressions': [2, {
        allowShortCircuit: true,
        allowTernary: true,
      }],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'jsdoc/no-undefined-types': 1,
      'no-console': 0, // We need to use console.log() in our code for debugging purposes. will remove in the future
    },
  };
  