/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptrf from './../lib/zpptrf.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zpptrf is a function', function t() {
	assert.strictEqual( typeof zpptrf, 'function', 'is a function' );
});

test( 'zpptrf has expected arity', function t() {
	assert.strictEqual( zpptrf.length, 4, 'has expected arity' );
});

test( 'zpptrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpptrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpptrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpptrf( 'column-major', 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zpptrf throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		zpptrf( 'row-major', 'upper', 3, new Complex128Array( 6 ) );
	}, TypeError );
});

test( 'zpptrf throws TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zpptrf( 'invalid', 'upper', 3, new Complex128Array( 6 ) );
	}, TypeError );
});

test( 'zpptrf (column-major) matches ndarray for upper and lower', function t() {
	var expected;
	var actual;
	var infoA;
	var infoE;
	var cases;
	var av;
	var ev;
	var i;
	var j;
	cases = [
		[ 'upper', [ 4.0, 0.0, 1.0, 1.0, 5.0, 0.0, 0.0, 0.0, 0.0, 2.0, 6.0, 0.0 ] ],
		[ 'lower', [ 4.0, 0.0, 1.0, -1.0, 0.0, 0.0, 5.0, 0.0, 0.0, -2.0, 6.0, 0.0 ] ]
	];
	for ( i = 0; i < cases.length; i++ ) {
		actual = new Complex128Array( cases[ i ][ 1 ] );
		expected = new Complex128Array( cases[ i ][ 1 ] );
		infoA = zpptrf( 'column-major', cases[ i ][ 0 ], 3, actual );
		infoE = ndarray( cases[ i ][ 0 ], 3, expected, 1, 0 );
		assert.strictEqual( infoA, 0, 'returns expected info' );
		assert.strictEqual( infoA, infoE, 'info matches ndarray' );
		av = reinterpret( actual, 0 );
		ev = reinterpret( expected, 0 );
		for ( j = 0; j < av.length; j++ ) {
			assert.strictEqual( av[ j ], ev[ j ], 'element ' + j + ' matches ndarray' );
		}
	}
});
