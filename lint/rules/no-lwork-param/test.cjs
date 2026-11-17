'use strict';

// Run:  node --test lint/rules/no-lwork-param/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-lwork-param', require( './rule.cjs' ), __dirname );
