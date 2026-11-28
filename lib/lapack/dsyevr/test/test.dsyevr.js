/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyevr from './../lib/dsyevr.js';
import { computeOptimalWorkSize } from './../lib/base.js';


// TESTS //

test( 'dsyevr is a function', function t() {
	assert.strictEqual( typeof dsyevr, 'function', 'is a function' );
});

test( 'dsyevr has expected arity', function t() {
	assert.strictEqual( dsyevr.length, 21, 'has expected arity' );
});

test( 'dsyevr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dsyevr( 'column-major', 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'dsyevr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const m = new Int32Array( 1 );
		dsyevr( 'column-major', 'no-vectors', 'all', 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, m, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});


/**
* Returns an N-by-N column-major symmetric matrix.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {number} shift - diagonal shift
* @returns {Float64Array} matrix
*/
function matrix( N, shift ) {
	const A = new Float64Array( N * N );
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
	const Z = new Float64Array( N * N );
	const m = new Int32Array( 1 );
	const ISUPPZ = new Int32Array( 2 * N );
	const info = dsyevr( 'column-major', 'compute-vectors', 'all', 'lower', N, A, N, 0.0, 0.0, 0, 0, 0.0, m, w, 1, Z, N, ISUPPZ, 1, WORK, null );
	return {
		'info': info,
		'w': w,
		'vectors': Z
	};
}

test( 'dsyevr: computeOptimalWorkSize returns the reference LWKOPT (max( (NB+1)*N, 26*N ), NB = 32 from ILAENV)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'lower', 0 ), 1, 'lower, 0' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 1 ), 33, 'lower, 1' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 10 ), 330, 'lower, 10' );
	assert.strictEqual( computeOptimalWorkSize( 'lower', 40 ), 1320, 'lower, 40' );
	assert.strictEqual( computeOptimalWorkSize( 'upper', 40 ), 1320, 'upper, 40' );
});

test( 'dsyevr: a null WORK allocates the reference LWKOPT, so the result is bit-identical to a caller-supplied LWKOPT workspace (N = 40, past the DSYTRD/ZHETRD crossover)', function t() {
	const N = 40;
	const expected = run( N, new Float64Array( ( 32 + 1 ) * N ) );
	const actual = run( N, null );
	assert.strictEqual( actual.info, 0, 'info' );
	assert.strictEqual( expected.info, 0, 'expected info' );
	assert.deepStrictEqual( actual.w, expected.w, 'eigenvalues' );
	assert.deepStrictEqual( actual.vectors, expected.vectors, 'eigenvectors' );
});

test( 'dsyevr: range "index" with IL = 1 and IU = N takes the reference\'s all-eigenvalues path (dsterf), bit-identical to range "all"', function t() {
	const N = 12;
	const results = [];
	let info;
	let k;
	for ( k = 0; k < 2; k++ ) {
		const A = matrix( N, 2.0 );
		const w = new Float64Array( N );
		const m = new Int32Array( 1 );
		info = dsyevr( 'column-major', 'no-vectors', ( k === 0 ) ? 'all' : 'index', 'upper', N, A, N, 0.0, 0.0, 1, N, 0.0, m, w, 1, new Float64Array( N ), N, new Int32Array( 2 * N ), 1, null, null );
		assert.strictEqual( info, 0, 'info' );
		assert.strictEqual( m[ 0 ], N, 'M' );
		results.push( w );
	}
	assert.deepStrictEqual( results[ 1 ], results[ 0 ], 'eigenvalues' );
});
