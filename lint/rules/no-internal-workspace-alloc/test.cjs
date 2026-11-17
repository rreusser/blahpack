'use strict';

// Run:  node --test lint/rules/no-internal-workspace-alloc/test.cjs

require( '../../lib/fixture-test.cjs' )( 'no-internal-workspace-alloc', require( './rule.cjs' ), __dirname );
