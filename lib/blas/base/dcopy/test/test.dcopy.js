/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dcopy from './../lib/dcopy.js';


// TESTS //

test( 'dcopy is a function', function t() {
	assert.strictEqual( typeof dcopy, 'function', 'is a function' );
});

test( 'dcopy has expected arity', function t() {
	assert.strictEqual( dcopy.length, 5, 'has expected arity' );
});

test( 'dcopy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dcopy( -1, 2, 1, 2, 1 );
	}, RangeError );
});
