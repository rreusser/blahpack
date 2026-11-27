/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dnrm2 from './../lib/dnrm2.js';


// TESTS //

test( 'dnrm2 is a function', function t() {
	assert.strictEqual( typeof dnrm2, 'function', 'is a function' );
});

test( 'dnrm2 has expected arity', function t() {
	assert.strictEqual( dnrm2.length, 3, 'has expected arity' );
});

test( 'dnrm2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dnrm2( -1, 2, 1 );
	}, RangeError );
});
