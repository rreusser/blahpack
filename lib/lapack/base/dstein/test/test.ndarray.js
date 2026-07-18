/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dstein from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_all from './fixtures/basic_5x5_all.json' with { type: 'json' };
import partial_2of5 from './fixtures/partial_2of5.json' with { type: 'json' };
import two_blocks from './fixtures/two_blocks.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extract column j (0-based) from column-major flat array with N rows.
*/
function getColumn( flat, N, j ) {
	const col = new Float64Array( N );
	let i;
	for ( i = 0; i < N; i++ ) {
		col[ i ] = flat[ j * N + i ];
	}
	return col;
}

/**
* Compute dot product of two arrays.
*/
function dot( a, b ) {
	let s = 0.0;
	let i;
	for ( i = 0; i < a.length; i++ ) {
		s += a[ i ] * b[ i ];
	}
	return s;
}

/**
* Check orthogonality of eigenvectors: Z^T * Z should be identity.
*/
function checkOrthogonality( Zflat, N, M, tol ) {
	let expected, ci, cj, v, i, j;
	for ( i = 0; i < M; i++ ) {
		ci = getColumn( Zflat, N, i );
		for ( j = i; j < M; j++ ) {
			cj = getColumn( Zflat, N, j );
			v = dot( ci, cj );
			expected = ( i === j ) ? 1.0 : 0.0;
			assertClose( v, expected, tol, 'Z(:,' + i + ')^T * Z(:,' + j + ')' );
		}
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dstein: basic 5x5, all eigenvectors', function t() {
	let i, j;

	const tc = basic_5x5_all;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( tc.iblock );
	const ISPLIT = new Int32Array( tc.isplit );
	const Z = new Float64Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );
	checkOrthogonality( Z, N, M, 1e-12 );
	for ( j = 0; j < M; j++ ) {
		const colActual = getColumn( Z, N, j );
		const colExpected = getColumn( tc.Z, N, j );

		// Determine sign: compare first significant element
		let sign = 1.0;
		for ( i = 0; i < N; i++ ) {
			if ( Math.abs( colExpected[ i ] ) > 1e-10 ) {
				sign = ( colActual[ i ] * colExpected[ i ] > 0 ) ? 1.0 : -1.0;
				break;
			}
		}
		for ( i = 0; i < N; i++ ) {
			assertClose( colActual[ i ] * sign, colExpected[ i ], 1e-12, 'Z[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
});

test( 'dstein: partial 2 of 5 eigenvectors', function t() {

	const tc = partial_2of5;
	const N = 5;
	const M = 2;
	const d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0, 2.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( [ 1, 1 ] );
	const ISPLIT = new Int32Array( [ 5 ] );
	const Z = new Float64Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0 ], 'ifail' );
	checkOrthogonality( Z, N, M, 1e-12 );
});

test( 'dstein: N=1', function t() {

	const N = 1;
	const M = 1;
	const d = new Float64Array( [ 3.0 ] );
	const e = new Float64Array( 0 );
	const w = new Float64Array( [ 3.0 ] );
	const IBLOCK = new Int32Array( [ 1 ] );
	const ISPLIT = new Int32Array( [ 1 ] );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 5 );
	const IWORK = new Int32Array( 1 );
	const IFAIL = new Int32Array( 1 );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertClose( Z[ 0 ], 1.0, 1e-14, 'Z[0]' );
});

test( 'dstein: N=0', function t() {

	const d = new Float64Array( 0 );
	const e = new Float64Array( 0 );
	const w = new Float64Array( 0 );
	const IBLOCK = new Int32Array( 0 );
	const ISPLIT = new Int32Array( 0 );
	const Z = new Float64Array( 0 );
	const WORK = new Float64Array( 0 );
	const IWORK = new Int32Array( 0 );
	const IFAIL = new Int32Array( 0 );
	const info = dstein( 0, d, 1, 0, e, 1, 0, 0, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, 0, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dstein: two blocks', function t() {
	let i, j;

	const tc = two_blocks;
	const N = 5;
	const M = 5;
	const d = new Float64Array( [ 4.0, 4.0, 4.0, 3.0, 3.0 ] );
	const e = new Float64Array( [ 1.0, 1.0, 0.0, 0.5 ] );
	const w = new Float64Array( tc.w );
	const IBLOCK = new Int32Array( tc.iblock );
	const ISPLIT = new Int32Array( tc.isplit );
	const Z = new Float64Array( N * M );
	const WORK = new Float64Array( 5 * N );
	const IWORK = new Int32Array( N );
	const IFAIL = new Int32Array( M );
	const info = dstein( N, d, 1, 0, e, 1, 0, M, w, 1, 0, IBLOCK, 1, 0, ISPLIT, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assert.deepEqual( toArray( IFAIL ), [ 0, 0, 0, 0, 0 ], 'ifail' );
	checkOrthogonality( Z, N, 3, 1e-12 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 3; i < 5; i++ ) {
			assertClose( Z[ j * N + i ], 0.0, 1e-14, 'Z[' + i + ',' + j + '] should be zero' ); // eslint-disable-line max-len
		}
	}
	for ( j = 3; j < 5; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			assertClose( Z[ j * N + i ], 0.0, 1e-14, 'Z[' + i + ',' + j + '] should be zero' ); // eslint-disable-line max-len
		}
	}
});
