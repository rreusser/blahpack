/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggsvd3 from './../lib/dggsvd3.js';


// TESTS //

test( 'dggsvd3 is a function', function t() {
	assert.strictEqual( typeof dggsvd3, 'function', 'is a function' );
});

test( 'dggsvd3 has expected arity', function t() {
	assert.strictEqual( dggsvd3.length, 27, 'has expected arity' );
});

test( 'dggsvd3 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dggsvd3( 2, 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dggsvd3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggsvd3( 2, 2, 2, new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dggsvd3 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dggsvd3( 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
