/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../lib/dgbtrf.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random number generator on `[-0.5, 0.5)`.
*
* @private
* @param {integer} seed - seed
* @returns {Function} generator
*/
function generator( seed ) {
	let s = seed;
	return function next() {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		return ( s / 2147483648 ) - 0.5;
	};
}

/**
* Returns a column-major band array (`ldab`-by-`N`, `kl` fill rows on top) holding a random `M`-by-`N` band matrix with a dominant diagonal.
*
* @private
* @param {integer} seed - seed
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {NonNegativeInteger} kl - subdiagonals
* @param {NonNegativeInteger} ku - superdiagonals
* @returns {Float64Array} interleaved band array (1 values per element)
*/
function bandColumnMajor( seed, M, N, kl, ku ) {
	const rnd = generator( seed );
	const ldab = ( 2 * kl ) + ku + 1;
	const out = new Float64Array( 1 * ldab * N );
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - ku ); i <= Math.min( M - 1, j + kl ); i++ ) {
			for ( k = 0; k < 1; k++ ) {
				out[ ( 1 * ( kl + ku + i - j + ( j * ldab ) ) ) + k ] = rnd() + ( ( i === j && k === 0 ) ? 0.5 : 0.0 );
			}
		}
	}
	return out;
}

/**
* Transposes an interleaved `R`-by-`C` column-major array into row-major storage with leading dimension `ld`.
*
* @private
* @param {Float64Array} x - column-major interleaved array
* @param {NonNegativeInteger} R - rows
* @param {NonNegativeInteger} C - columns
* @param {PositiveInteger} ld - row-major leading dimension
* @returns {Float64Array} row-major interleaved array
*/
function toRowMajor( x, R, C, ld ) {
	const out = new Float64Array( 1 * R * ld );
	let i;
	let j;
	let k;
	for ( i = 0; i < R; i++ ) {
		for ( j = 0; j < C; j++ ) {
			for ( k = 0; k < 1; k++ ) {
				out[ ( 1 * ( ( i * ld ) + j ) ) + k ] = x[ ( 1 * ( i + ( j * R ) ) ) + k ];
			}
		}
	}
	return out;
}


// TESTS //

test( 'dgbtrf is a function', function t() {
	assert.strictEqual( typeof dgbtrf, 'function', 'is a function' );
});

test( 'dgbtrf has expected arity', function t() {
	assert.strictEqual( dgbtrf.length, 9, 'has expected arity' );
});

test( 'dgbtrf throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		dgbtrf( 'invalid', 3, 3, 1, 1, new Float64Array( 12 ), 3, new Int32Array( 3 ), 1 );
	}, TypeError );
});

test( 'dgbtrf throws a RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgbtrf( 'column-major', -1, 3, 1, 1, new Float64Array( 12 ), 4, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgbtrf throws a RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbtrf( 'column-major', 3, -1, 1, 1, new Float64Array( 12 ), 4, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgbtrf throws a RangeError for negative kl', function t() {
	assert.throws( function throws() {
		dgbtrf( 'column-major', 3, 3, -1, 1, new Float64Array( 12 ), 4, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgbtrf throws a RangeError for negative ku', function t() {
	assert.throws( function throws() {
		dgbtrf( 'column-major', 3, 3, 1, -1, new Float64Array( 12 ), 4, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgbtrf throws a RangeError for LDAB < 2*kl+ku+1 (column-major)', function t() {
	assert.throws( function throws() {
		dgbtrf( 'column-major', 3, 3, 1, 1, new Float64Array( 12 ), 3, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgbtrf throws a RangeError for LDAB < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		dgbtrf( 'row-major', 3, 3, 1, 1, new Float64Array( 12 ), 2, new Int32Array( 3 ), 1 );
	}, RangeError );
});

test( 'dgbtrf (column-major) matches strided on the same data', function t() {
	[ [ 5, 5, 2, 1 ], [ 6, 4, 1, 2 ], [ 4, 6, 2, 2 ] ].forEach( function each( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const kl = c[ 2 ];
		const ku = c[ 3 ];
		const ldab = ( 2 * kl ) + ku + 1;
		const raw = bandColumnMajor( 7 + M + N, M, N, kl, ku );
		const AB1 = new Float64Array( raw );
		const AB2 = new Float64Array( raw );
		const IPIV1 = new Int32Array( Math.min( M, N ) );
		const IPIV2 = new Int32Array( Math.min( M, N ) );
		const info1 = dgbtrf( 'column-major', M, N, kl, ku, AB1, ldab, IPIV1, 1 );
		const info2 = strided( M, N, kl, ku, AB2, 1, ldab, 0, IPIV2, 1, 0 );
		assert.strictEqual( info1, info2, 'info' );
		assert.deepStrictEqual( AB1, AB2, 'AB' );
		assert.deepStrictEqual( IPIV1, IPIV2, 'IPIV' );
		assert.notDeepStrictEqual( AB1, raw, 'AB was factored in place' );
	});
});

test( 'dgbtrf (row-major) matches strided on the same data and the transposed column-major result', function t() {
	[ [ 5, 5, 2, 1 ], [ 6, 4, 1, 2 ], [ 4, 6, 2, 2 ] ].forEach( function each( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const kl = c[ 2 ];
		const ku = c[ 3 ];
		const ldab = ( 2 * kl ) + ku + 1;
		const ld = N + 1;
		const raw = bandColumnMajor( 7 + M + N, M, N, kl, ku );
		const rowRaw = toRowMajor( raw, ldab, N, ld );
		const AB1 = new Float64Array( rowRaw );
		const AB2 = new Float64Array( rowRaw );
		const ABc = new Float64Array( raw );
		const IPIV1 = new Int32Array( Math.min( M, N ) );
		const IPIV2 = new Int32Array( Math.min( M, N ) );
		const IPIVc = new Int32Array( Math.min( M, N ) );
		const info1 = dgbtrf( 'row-major', M, N, kl, ku, AB1, ld, IPIV1, 1 );
		const info2 = strided( M, N, kl, ku, AB2, ld, 1, 0, IPIV2, 1, 0 );
		const infoc = strided( M, N, kl, ku, ABc, 1, ldab, 0, IPIVc, 1, 0 );
		assert.strictEqual( info1, info2, 'info' );
		assert.strictEqual( info1, infoc, 'info (column-major)' );
		assert.deepStrictEqual( AB1, AB2, 'AB' );
		assert.deepStrictEqual( IPIV1, IPIV2, 'IPIV' );
		assert.deepStrictEqual( IPIV1, IPIVc, 'IPIV (column-major)' );
		assert.deepStrictEqual( AB1, toRowMajor( ABc, ldab, N, ld ), 'AB equals the transposed column-major factorization' );
	});
});

test( 'dgbtrf locates a negative-stride IPIV of length min(M,N) (ticket 0068)', function t() {
	// With N > M, IPIV has min(M,N) = M entries; the wrapper must start a
	// negative-stride IPIV at (min(M,N)-1)*|stride|, not (N-1)*|stride|.
	[ [ 4, 6, 2, 1 ], [ 3, 7, 1, 2 ], [ 6, 4, 1, 2 ] ].forEach( function each( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const kl = c[ 2 ];
		const ku = c[ 3 ];
		const mn = Math.min( M, N );
		const ldab = ( 2 * kl ) + ku + 1;
		const raw = bandColumnMajor( 11 + M + N, M, N, kl, ku );
		const AB1 = new Float64Array( raw );
		const AB2 = new Float64Array( raw );
		const IPIV1 = new Int32Array( mn );
		const IPIV2 = new Int32Array( mn );
		const info1 = dgbtrf( 'column-major', M, N, kl, ku, AB1, ldab, IPIV1, -1 );
		const info2 = strided( M, N, kl, ku, AB2, 1, ldab, 0, IPIV2, -1, mn - 1 );
		let i;
		assert.strictEqual( info1, info2, 'info' );
		assert.deepStrictEqual( AB1, AB2, 'AB' );
		for ( i = 0; i < mn; i++ ) {
			assert.strictEqual( IPIV1[ i ], IPIV2[ i ], 'IPIV[' + i + ']' );
		}
	});
});
