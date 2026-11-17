'use strict';

// Run:  node --test lint/rules/jsdoc-backtick-params/test.cjs

require( '../../lib/fixture-test.cjs' )( 'jsdoc-backtick-params', require( './rule.cjs' ), __dirname );
