'use strict';

// Fixture-driven tests for the no-nan-blind-comparison rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/no-nan-blind-comparison/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-nan-blind-comparison', require( './rule.cjs' ), __dirname );
