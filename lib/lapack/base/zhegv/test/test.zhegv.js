/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhegv from './../lib/zhegv.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'zhegv is a function', function t() {
	assert.strictEqual( typeof zhegv, 'function', 'is a function' );
});

test( 'zhegv has expected arity', function t() {
	assert.strictEqual( zhegv.length, 13, 'has expected arity' );
});

test( 'zhegv throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhegv( 'column-major', 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhegv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhegv( 'column-major', 2, 'no-vectors', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});


/**
* Returns an N-by-N column-major Hermitian matrix (diagonally dominant, so positive definite, when `shift` is large).
*
* @private
* @param {NonNegativeInteger} N - order
* @param {number} shift - diagonal shift
* @returns {Complex128Array} matrix
*/
function matrix( N, shift ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			v[ 2 * ( i + ( j * N ) ) ] = ( 1.0 / ( 1 + Math.abs( i - j ) ) ) + ( ( i === j ) ? shift + ( 0.1 * i ) : 0.0 );
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = 0.1 * ( i - j ) / ( 1 + Math.abs( i - j ) );
		}
	}
	return A;
}

/**
* Runs the routine at the given order with the given workspace.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {(Complex128Array|null)} WORK - workspace
* @returns {Object} outputs
*/
function run( N, WORK ) {
	const A = matrix( N, 2.0 );
	const w = new Float64Array( N );
	const Bm = matrix( N, N );
	const info = zhegv( 'column-major', 1, 'compute-vectors', 'lower', N, A, N, Bm, N, w, 1, WORK, null );
	return {
		'info': info,
		'w': w,
		'vectors': reinterpret( A, 0 )
	};
}

test( 'zhegv: computeOptimalWorkSize returns the reference LWKOPT (max( 1, (NB+1)*N ), NB = 32 from ILAENV)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'lower', 0 ), 1, 'lower, 0' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 1 ), 33, 'lower, 1' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 10 ), 330, 'lower, 10' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 40 ), 1320, 'lower, 40' );
	assert.strictEqual( computeOptimalWorkSize( 'upper', 40 ), 1320, 'upper, 40' );
});

test( 'zhegv: a null WORK allocates the reference LWKOPT, so the result is bit-identical to a caller-supplied LWKOPT workspace (N = 40, past the DSYTRD/ZHETRD crossover)', function t() {
	const N = 40;
	const expected = run( N, new Complex128Array( ( 32 + 1 ) * N ) );
	const actual = run( N, null );
	assert.strictEqual( actual.info, 0, 'info' );
	assert.strictEqual( expected.info, 0, 'expected info' );
	assert.deepStrictEqual( actual.w, expected.w, 'eigenvalues' );
	assert.deepStrictEqual( actual.vectors, expected.vectors, 'eigenvectors' );
});
