'use strict';

// Fixture-driven tests for the spec-messages rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/spec-messages/test.cjs

require( '../../lib/fixture-test.cjs' )( 'spec-messages', require( './rule.cjs' ), __dirname );
