'use strict';

// Run:  node --test lint/rules/no-todo-params/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-todo-params', require( './rule.cjs' ), __dirname );
