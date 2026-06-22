/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zupmtr from './../lib/zupmtr.js';


// TESTS //

test( 'zupmtr is a function', function t() {
	assert.strictEqual( typeof zupmtr, 'function', 'is a function' );
});

test( 'zupmtr has expected arity', function t() {
	assert.strictEqual( zupmtr.length, 10, 'has expected arity' );
});

test( 'zupmtr throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zupmtr( 'invalid', 'upper', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zupmtr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zupmtr( 'left', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zupmtr throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zupmtr( 'left', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zupmtr throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zupmtr( 'left', 'upper', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zupmtr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zupmtr( 'left', 'upper', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});
