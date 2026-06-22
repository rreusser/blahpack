/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqgb from './../lib/dlaqgb.js';


// TESTS //

test( 'dlaqgb is a function', function t() {
	assert.strictEqual( typeof dlaqgb, 'function', 'is a function' );
});

test( 'dlaqgb has expected arity', function t() {
	assert.strictEqual( dlaqgb.length, 13, 'has expected arity' );
});

test( 'dlaqgb throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlaqgb( -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});

test( 'dlaqgb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlaqgb( new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 2 );
	}, RangeError );
});
