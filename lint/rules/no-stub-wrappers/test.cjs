'use strict';

// Run:  node --test lint/rules/no-stub-wrappers/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-stub-wrappers', require( './rule.cjs' ), __dirname );
