'use strict';

// Run:  node --test lint/rules/stride-provenance/test.cjs

require( '../../lib/fixture-test.cjs' )( 'stride-provenance', require( './rule.cjs' ), __dirname );
