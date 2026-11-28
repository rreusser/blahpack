'use strict';

// Fixture-driven tests for the wrapper-calls-ndarray rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/wrapper-calls-ndarray/test.cjs

require( '../../lib/fixture-test.cjs' )( 'wrapper-calls-ndarray', require( './rule.cjs' ), __dirname );
