/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dlasrt from './../lib/dlasrt.js';


// TESTS //

test( 'dlasrt is a function', function t() {
	assert.strictEqual( typeof dlasrt, 'function', 'is a function' );
});

test( 'dlasrt has expected arity', function t() {
	assert.strictEqual( dlasrt.length, 4, 'has expected arity' );
});

test( 'dlasrt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlasrt( 'increasing', -1, 2, 1 );
	}, RangeError );
});
