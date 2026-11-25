'use strict';

// Fixture-driven tests for the spec-ld-bounds rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/spec-ld-bounds/test.cjs

require( '../../lib/fixture-test.cjs' )( 'spec-ld-bounds', require( './rule.cjs' ), __dirname );
