/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlansp from './../lib/dlansp.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns a packed 4-by-4 test matrix.
*
* @private
* @returns {Float64Array} packed matrix
*/
function packed() {
	return new Float64Array( [ 1.5, -2.0, 0.25, -1.0, 2.5, -3.5, 0.5, 1.25, -0.75, 3.25 ] );
}


// TESTS //

test( 'dlansp is a function', function t() {
	assert.strictEqual( typeof dlansp, 'function', 'is a function' );
});

test( 'dlansp has expected arity', function t() {
	assert.strictEqual( dlansp.length, 6, 'has expected arity' );
});

test( 'dlansp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlansp( 'invalid', 'max', 'upper', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansp throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlansp( 'column-major', 'invalid', 'upper', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansp throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlansp( 'column-major', 'max', 'invalid', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlansp( 'column-major', 'max', 'upper', -1, packed(), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dlansp throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		dlansp( 'row-major', 'max', 'upper', 4, packed(), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dlansp (column-major) matches ndarray for all norms and triangles, with and without WORK', function t() {
	const norms = [ 'max', 'one-norm', 'inf-norm', 'frobenius' ];
	const uplos = [ 'upper', 'lower' ];
	let expected;
	let actual;
	let i;
	let j;
	for ( i = 0; i < norms.length; i++ ) {
		for ( j = 0; j < uplos.length; j++ ) {
			expected = ndarray( norms[ i ], uplos[ j ], 4, packed(), 1, 0, new Float64Array( 4 ), 1, 0 );
			actual = dlansp( 'column-major', norms[ i ], uplos[ j ], 4, packed(), new Float64Array( 4 ) );
			assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] );
			actual = dlansp( 'column-major', norms[ i ], uplos[ j ], 4, packed(), null );
			assert.strictEqual( actual, expected, norms[ i ] + ' ' + uplos[ j ] + ' (null WORK)' );
			assert.ok( expected > 0.0, 'nonzero norm' );
		}
	}
});

test( 'dlansp returns 0 for N=0', function t() {
	assert.strictEqual( dlansp( 'column-major', 'max', 'upper', 0, packed(), null ), 0.0 );
});
