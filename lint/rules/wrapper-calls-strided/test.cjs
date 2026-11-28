'use strict';

// Fixture-driven tests for the wrapper-calls-strided rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/wrapper-calls-strided/test.cjs

require( '../../lib/fixture-test.cjs' )( 'wrapper-calls-strided', require( './rule.cjs' ), __dirname );
