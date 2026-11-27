/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zrot from './../lib/zrot.js';


// TESTS //

test( 'zrot is a function', function t() {
	assert.strictEqual( typeof zrot, 'function', 'is a function' );
});

test( 'zrot has expected arity', function t() {
	assert.strictEqual( zrot.length, 7, 'has expected arity' );
});

test( 'zrot throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zrot( -1, 2, 1, 2, 1, 2, 2 );
	}, RangeError );
});
