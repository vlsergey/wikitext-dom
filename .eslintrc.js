'use strict';

module.exports = {
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 999,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true,
      "impliedStrict": true,
      "modules": true,
    },
  },
  "env": {
    "browser": true,
    "es6": true,
  },
  "extends": [
      "eslint:recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
  ],
  "globals": {
    "mw": true,
    "require": true,

    // for test:
    "describe": true,
    "it": true,
  },
  "plugins": [ "promise" ],

  "rules": {
    // TODO: temporary!
    "no-useless-escape": 0,

    /* Require braces in arrow function body */
    "arrow-body-style": [1, "as-needed"],
    "array-bracket-spacing": [1, "always"],
    /* Require parens in arrow function arguments */
    "arrow-parens": [1, "as-needed" ],
    /* Require space before/after arrow function’s arrow */
    "arrow-spacing": 1,

    "comma-dangle": [1, "always-multiline"],
    "comma-spacing": 1,
    "computed-property-spacing": [1, "always"],

    "indent": [1, 2, { "ignoreComments": false }],

    "keyword-spacing": 1,
    "key-spacing": 1,

    "newline-per-chained-call": 0,
    "no-console": 0,
    /* Disallow duplicate imports */
    "no-duplicate-imports": 1,
    "no-extra-parens": 1,
    "no-invalid-this": 2,
    "no-multi-spaces": 1,
    "no-multiple-empty-lines": 1,
    "no-trailing-spaces": 1,
    /* Disallow unnecessary computed property keys on objects */
    "no-useless-computed-key": 1,
    /* Disallow renaming import, export, and destructured assignments to the same name */
    "no-useless-rename": 1,
    /* require let or const instead of var */
    "no-var": 1,
    /* disallow whitespace before properties */
    "no-whitespace-before-property": 1,

    "object-curly-spacing": [1, "always"],
    /* require or disallow method and property shorthand syntax for object literals */
    "object-shorthand": 1,

    /* Require using arrow functions for callbacks */
    "prefer-arrow-callback": 1,
    "prefer-const": 1,
    /* Suggest using the spread operator instead of .apply() */
    "prefer-spread": 1,

    /* require quotes around object literal property names */
    "quote-props": [1, "consistent-as-needed"],
    "quotes": [1, "single"],

    /* Enforce spacing between rest and spread operators and their expressions */
    "rest-spread-spacing": 1,

    "semi": [1, "always"],
    "semi-spacing": 1,
    /* Import Sorting */
    "sort-imports": [1, {"ignoreCase" : true}],
    "space-before-function-paren": [1, "never"],
    "space-in-parens": [1, "always"],
    "space-infix-ops": [1, {"int32Hint": false} ],
    "strict": [1, "never"],
  },
  settings: {
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules", "src"],
      }
    }
  }
}
