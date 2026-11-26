/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsygvx from './../lib/dsygvx.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dsygvx is a function', function t() {
	assert.strictEqual( typeof dsygvx, 'function', 'is a function' );
});

test( 'dsygvx has expected arity', function t() {
	assert.strictEqual( dsygvx.length, 24, 'has expected arity' );
});

test( 'dsygvx throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dsygvx( 'column-major', 2, 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dsygvx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dsygvx( 'column-major', 2, 'no-vectors', 'all', 'upper', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 1 );
	}, RangeError );
});


/**
* Returns an N-by-N column-major symmetric matrix (diagonally dominant, so positive definite, when `shift` is large).
*
* @private
* @param {NonNegativeInteger} N - order
* @param {number} shift - diagonal shift
* @returns {Float64Array} matrix
*/
function matrix( N, shift ) {
	const A = new Float64Array( N * N );
	const v = A;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ i + ( j * N ) ] = ( 1.0 / ( 1 + Math.abs( i - j ) ) ) + ( ( i === j ) ? shift + ( 0.1 * i ) : 0.0 );
		}
	}
	return A;
}

/**
* Runs the routine at the given order with the given workspace.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {(Float64Array|null)} WORK - workspace
* @returns {Object} outputs
*/
function run( N, WORK ) {
	const A = matrix( N, 2.0 );
	const w = new Float64Array( N );
	const Bm = matrix( N, N );
	const Z = new Float64Array( N * N );
	const m = new Int32Array( 1 );
	const IFAIL = new Int32Array( N );
	const info = dsygvx( 'column-major', 1, 'compute-vectors', 'all', 'lower', N, A, N, Bm, N, 0.0, 0.0, 0, 0, 0.0, m, w, 1, Z, N, WORK, null, IFAIL, 1 );
	return {
		'info': info,
		'w': w,
		'vectors': Z
	};
}

test( 'dsygvx: computeOptimalWorkSize returns the reference LWKOPT (max( 8*N, (NB+3)*N ), NB = 32 from ILAENV)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'lower', 0 ), 1, 'lower, 0' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 1 ), 35, 'lower, 1' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 10 ), 350, 'lower, 10' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 40 ), 1400, 'lower, 40' );
	assert.strictEqual( computeOptimalWorkSize( 'upper', 40 ), 1400, 'upper, 40' );
});

test( 'dsygvx: a null WORK allocates the reference LWKOPT, so the result is bit-identical to a caller-supplied LWKOPT workspace (N = 40, past the DSYTRD/ZHETRD crossover)', function t() {
	const N = 40;
	const expected = run( N, new Float64Array( ( 32 + 3 ) * N ) );
	const actual = run( N, null );
	assert.strictEqual( actual.info, 0, 'info' );
	assert.strictEqual( expected.info, 0, 'expected info' );
	assert.deepStrictEqual( actual.w, expected.w, 'eigenvalues' );
	assert.deepStrictEqual( actual.vectors, expected.vectors, 'eigenvectors' );
});
