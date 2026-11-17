'use strict';

// Run:  node --test lint/rules/workspace-addressing-honored/test.cjs

require( '../../lib/fixture-test.cjs' )( 'workspace-addressing-honored', require( './rule.cjs' ), __dirname );
