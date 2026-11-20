'use strict';

// Fixture-driven tests for the spec-prologue rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/spec-prologue/test.cjs

require( '../../lib/fixture-test.cjs' )( 'spec-prologue', require( './rule.cjs' ), __dirname );
