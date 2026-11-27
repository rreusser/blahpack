/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import drot from './../lib/drot.js';


// TESTS //

test( 'drot is a function', function t() {
	assert.strictEqual( typeof drot, 'function', 'is a function' );
});

test( 'drot has expected arity', function t() {
	assert.strictEqual( drot.length, 7, 'has expected arity' );
});

test( 'drot throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		drot( -1, 2, 1, 2, 1, 2, 2 );
	}, RangeError );
});
