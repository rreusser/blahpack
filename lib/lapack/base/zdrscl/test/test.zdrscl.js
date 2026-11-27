/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import zdrscl from './../lib/zdrscl.js';


// TESTS //

test( 'zdrscl is a function', function t() {
	assert.strictEqual( typeof zdrscl, 'function', 'is a function' );
});

test( 'zdrscl has expected arity', function t() {
	assert.strictEqual( zdrscl.length, 4, 'has expected arity' );
});

test( 'zdrscl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zdrscl( -1, 2, 2, 1 );
	}, RangeError );
});
