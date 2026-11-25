/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dpptrf from './../lib/dpptrf.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dpptrf is a function', function t() {
	assert.strictEqual( typeof dpptrf, 'function', 'is a function' );
});

test( 'dpptrf has expected arity', function t() {
	assert.strictEqual( dpptrf.length, 4, 'has expected arity' );
});

test( 'dpptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpptrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dpptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpptrf( 'column-major', 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dpptrf throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		dpptrf( 'row-major', 'upper', 3, new Float64Array( 6 ) );
	}, TypeError );
});

test( 'dpptrf throws TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		dpptrf( 'invalid', 'upper', 3, new Float64Array( 6 ) );
	}, TypeError );
});

test( 'dpptrf (column-major) matches ndarray for upper and lower', function t() {
	var expected;
	var actual;
	var infoA;
	var infoE;
	var cases;
	var i;
	var j;
	cases = [
		[ 'upper', [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] ],
		[ 'lower', [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] ]
	];
	for ( i = 0; i < cases.length; i++ ) {
		actual = new Float64Array( cases[ i ][ 1 ] );
		expected = new Float64Array( cases[ i ][ 1 ] );
		infoA = dpptrf( 'column-major', cases[ i ][ 0 ], 3, actual );
		infoE = ndarray( cases[ i ][ 0 ], 3, expected, 1, 0 );
		assert.strictEqual( infoA, 0, 'returns expected info' );
		assert.strictEqual( infoA, infoE, 'info matches ndarray' );
		for ( j = 0; j < actual.length; j++ ) {
			assert.strictEqual( actual[ j ], expected[ j ], 'element ' + j + ' matches ndarray' );
		}
	}
});
