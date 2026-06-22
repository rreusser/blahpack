/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlacpy from './../lib/dlacpy.js';


// TESTS //

test( 'dlacpy is a function', function t() {
	assert.strictEqual( typeof dlacpy, 'function', 'is a function' );
});

test( 'dlacpy has expected arity', function t() {
	assert.strictEqual( dlacpy.length, 8, 'has expected arity' );
});

test( 'dlacpy throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlacpy( 'invalid', 'upper', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlacpy throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlacpy( 'row-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlacpy throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlacpy( 'row-major', 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlacpy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlacpy( 'row-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
