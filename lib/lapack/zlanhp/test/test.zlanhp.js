/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlanhp from './../lib/zlanhp.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Returns a packed 4-by-4 test matrix.
*
* @private
* @returns {Complex128Array} packed matrix
*/
function packed() {
	return new Complex128Array( [ 1.5, -0.5, -2.0, 3.0, 0.25, 4.0, -1.0, -1.5, 2.5, 0.75, -3.5, 1.0, 0.5, -2.25, 1.25, 0.0, -0.75, 2.0, 3.25, -1.25 ] );
}


// TESTS //

test( 'zlanhp is a function', function t() {
	assert.strictEqual( typeof zlanhp, 'function', 'is a function' );
});

test( 'zlanhp has expected arity', function t() {
	assert.strictEqual( zlanhp.length, 6, 'has expected arity' );
});

test( 'zlanhp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlanhp( 'invalid', 'max', 'upper', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlanhp( 'column-major', 'invalid', 'upper', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlanhp( 'column-major', 'max', 'invalid', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlanhp( 'column-major', 'max', 'upper', -1, packed(), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zlanhp throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zlanhp( 'row-major', 'max', 'upper', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zlanhp (column-major) matches strided for all norms and triangles, with and without WORK', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const uplos = [ 'upper', 'lower' ];
	let expected;
	let actual;
	let i;
	let j;
	for ( i = 0; i < norms.length; i++ ) {
		for ( j = 0; j < uplos.length; j++ ) {
			expected = strided( norms[ i ], uplos[ j ], 4, packed(), 1, 0, new Float64Array( 4 ), 1, 0 );
			actual = zlanhp( 'column-major', norms[ i ], uplos[ j ], 4, packed(), new Float64Array( 4 ) );
			assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] );
			actual = zlanhp( 'column-major', norms[ i ], uplos[ j ], 4, packed(), null );
			assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] + ' (null WORK)' );
			assert.ok( expected > 0.0, 'nonzero norm' );
		}
	}
});

test( 'zlanhp returns 0 for N=0', function t() {
	assert.strictEqual( zlanhp( 'column-major', 'max', 'upper', 0, packed(), null ), 0.0 );
});
