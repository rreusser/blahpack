'use strict';

// Fixture-driven tests for the spec-signature rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/spec-signature/test.cjs

require( '../../lib/fixture-test.cjs' )( 'spec-signature', require( './rule.cjs' ), __dirname );
