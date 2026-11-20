'use strict';

// Fixture-driven tests for the spec-jsdoc rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/spec-jsdoc/test.cjs

require( '../../lib/fixture-test.cjs' )( 'spec-jsdoc', require( './rule.cjs' ), __dirname );
