'use strict';

// Fixture-driven tests for the workspace-length-guard rule (see lint/lib/fixture-test.cjs).
//
// Run:  node --test lint/rules/workspace-length-guard/test.cjs

require( '../../lib/fixture-test.cjs' )( 'workspace-length-guard', require( './rule.cjs' ), __dirname );
