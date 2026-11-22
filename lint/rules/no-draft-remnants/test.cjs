'use strict';

// Run:  node --test lint/rules/no-draft-remnants/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-draft-remnants', require( './rule.cjs' ), __dirname );
