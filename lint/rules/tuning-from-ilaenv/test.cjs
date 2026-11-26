'use strict';

// Run:  node --test lint/rules/tuning-from-ilaenv/test.cjs

require( '../../lib/fixture-test.cjs' )( 'tuning-from-ilaenv', require( './rule.cjs' ), __dirname );
