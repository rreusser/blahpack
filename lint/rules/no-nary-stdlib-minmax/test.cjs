'use strict';

// Run:  node --test lint/rules/no-nary-stdlib-minmax/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-nary-stdlib-minmax', require( './rule.cjs' ), __dirname );
