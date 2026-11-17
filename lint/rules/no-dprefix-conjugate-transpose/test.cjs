'use strict';

// Run:  node --test lint/rules/no-dprefix-conjugate-transpose/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-dprefix-conjugate-transpose', require( './rule.cjs' ), __dirname );
