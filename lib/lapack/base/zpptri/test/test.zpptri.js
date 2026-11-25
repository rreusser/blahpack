/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptri from './../lib/zpptri.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarray from './../lib/ndarray.js';
import zpptrfNd from './../../zpptrf/lib/ndarray.js';


// TESTS //

test( 'zpptri is a function', function t() {
	assert.strictEqual( typeof zpptri, 'function', 'is a function' );
});

test( 'zpptri has expected arity', function t() {
	assert.strictEqual( zpptri.length, 4, 'has expected arity' );
});

test( 'zpptri throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zpptri( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zpptri throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zpptri( 'column-major', 'upper', -1, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zpptri throws TypeError for row-major order', function t() {
	assert.throws( function throws() {
		zpptri( 'row-major', 'upper', 3, new Complex128Array( 6 ) );
	}, TypeError );
});

test( 'zpptri throws TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zpptri( 'invalid', 'upper', 3, new Complex128Array( 6 ) );
	}, TypeError );
});

test( 'zpptri (column-major) matches ndarray for upper and lower', function t() {
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
		zpptrfNd( cases[ i ][ 0 ], 3, actual, 1, 0 );
		zpptrfNd( cases[ i ][ 0 ], 3, expected, 1, 0 );
		infoA = zpptri( 'column-major', cases[ i ][ 0 ], 3, actual );
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
