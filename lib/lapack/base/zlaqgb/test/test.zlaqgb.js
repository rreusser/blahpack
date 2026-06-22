/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqgb from './../lib/zlaqgb.js';


// TESTS //

test( 'zlaqgb is a function', function t() {
	assert.strictEqual( typeof zlaqgb, 'function', 'is a function' );
});

test( 'zlaqgb has expected arity', function t() {
	assert.strictEqual( zlaqgb.length, 13, 'has expected arity' );
});

test( 'zlaqgb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlaqgb( -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});

test( 'zlaqgb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqgb( new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});
