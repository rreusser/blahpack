'use strict';

// Run:  node --test lint/rules/z-prefix-reinterpret/test.cjs

require( '../../lib/fixture-test.cjs' )( 'z-prefix-reinterpret', require( './rule.cjs' ), __dirname );
