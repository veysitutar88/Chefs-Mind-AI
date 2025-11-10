module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Добавляем правила по необходимости
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.min.js'],
};