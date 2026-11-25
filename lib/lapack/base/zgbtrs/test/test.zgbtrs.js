/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbtrs from './../lib/zgbtrs.js';
import ndarray from './../lib/ndarray.js';
import zgbtrf from '../../zgbtrf/lib/ndarray.js';


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
* @returns {Float64Array} interleaved band array (2 values per element)
*/
function bandColumnMajor( seed, M, N, kl, ku ) {
	const rnd = generator( seed );
	const ldab = ( 2 * kl ) + ku + 1;
	const out = new Float64Array( 2 * ldab * N );
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - ku ); i <= Math.min( M - 1, j + kl ); i++ ) {
			for ( k = 0; k < 2; k++ ) {
				out[ ( 2 * ( kl + ku + i - j + ( j * ldab ) ) ) + k ] = rnd() + ( ( i === j && k === 0 ) ? 0.5 : 0.0 );
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
	const out = new Float64Array( 2 * R * ld );
	let i;
	let j;
	let k;
	for ( i = 0; i < R; i++ ) {
		for ( j = 0; j < C; j++ ) {
			for ( k = 0; k < 2; k++ ) {
				out[ ( 2 * ( ( i * ld ) + j ) ) + k ] = x[ ( 2 * ( i + ( j * R ) ) ) + k ];
			}
		}
	}
	return out;
}


// TESTS //

test( 'zgbtrs is a function', function t() {
	assert.strictEqual( typeof zgbtrs, 'function', 'is a function' );
});

test( 'zgbtrs has expected arity', function t() {
	assert.strictEqual( zgbtrs.length, 12, 'has expected arity' );
});

test( 'zgbtrs throws a TypeError for an invalid order', function t() {
	assert.throws( function throws() {
		zgbtrs( 'invalid', 'no-transpose', 3, 1, 1, 2, new Complex128Array( 12 ), 3, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 2 );
	}, TypeError );
});

test( 'zgbtrs throws a TypeError for an invalid trans', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'invalid', 3, 1, 1, 2, new Complex128Array( 12 ), 4, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 3 );
	}, TypeError );
});

test( 'zgbtrs throws a RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'no-transpose', -1, 1, 1, 2, new Complex128Array( 12 ), 4, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 3 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for negative kl', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'no-transpose', 3, -1, 1, 2, new Complex128Array( 12 ), 4, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 3 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for negative ku', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'no-transpose', 3, 1, -1, 2, new Complex128Array( 12 ), 4, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 3 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'no-transpose', 3, 1, 1, -1, new Complex128Array( 12 ), 4, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 3 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for LDAB < 2*kl+ku+1 (column-major)', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'no-transpose', 3, 1, 1, 2, new Complex128Array( 12 ), 3, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 3 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for LDAB < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		zgbtrs( 'row-major', 'no-transpose', 3, 1, 1, 2, new Complex128Array( 12 ), 2, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 2 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for LDB < max(1,N) (column-major)', function t() {
	assert.throws( function throws() {
		zgbtrs( 'column-major', 'no-transpose', 3, 1, 1, 2, new Complex128Array( 12 ), 4, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 2 );
	}, RangeError );
});

test( 'zgbtrs throws a RangeError for LDB < max(1,nrhs) (row-major)', function t() {
	assert.throws( function throws() {
		zgbtrs( 'row-major', 'no-transpose', 3, 1, 1, 2, new Complex128Array( 12 ), 3, new Int32Array( [ 0, 1, 2 ] ), 1, new Complex128Array( 6 ), 1 );
	}, RangeError );
});

/**
* Factors a random band matrix and returns the factored column-major band array, pivots and a random column-major right-hand side.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kl - subdiagonals
* @param {NonNegativeInteger} ku - superdiagonals
* @param {NonNegativeInteger} nrhs - right-hand sides
* @returns {Object} problem
*/
function problem( N, kl, ku, nrhs ) {
	const ldab = ( 2 * kl ) + ku + 1;
	const AB = new Complex128Array( bandColumnMajor( 11 + N, N, N, kl, ku ) );
	const IPIV = new Int32Array( N );
	const rnd = generator( 31 + N + nrhs );
	const B = new Float64Array( 2 * N * nrhs );
	let i;
	zgbtrf( N, N, kl, ku, AB, 1, ldab, 0, IPIV, 1, 0 );
	for ( i = 0; i < B.length; i++ ) {
		B[ i ] = rnd();
	}
	return {
		'AB': reinterpret( AB, 0 ),
		'IPIV': IPIV,
		'B': B,
		'ldab': ldab
	};
}

/**
* Asserts that two arrays agree elementwise to a relative tolerance (the BLAS kernels may traverse row-major storage in a different order, so the two layouts agree to rounding, not bit for bit).
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {string} msg - message
*/
function assertClose( actual, expected, msg ) {
	let i;
	assert.strictEqual( actual.length, expected.length, msg );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 1e-13 * Math.max( 1.0, Math.abs( expected[ i ] ) ), msg + ': index ' + i + ', ' + actual[ i ] + ' vs ' + expected[ i ] );
	}
}

test( 'zgbtrs (column-major) matches ndarray on the same data', function t() {
	[ 'no-transpose', 'transpose', 'conjugate-transpose' ].forEach( function each( trans ) {
		[ [ 5, 2, 1, 2 ], [ 6, 1, 2, 3 ], [ 4, 2, 2, 1 ] ].forEach( function each2( c ) {
			const N = c[ 0 ];
			const kl = c[ 1 ];
			const ku = c[ 2 ];
			const nrhs = c[ 3 ];
			const p = problem( N, kl, ku, nrhs );
			const B1 = new Complex128Array( new Float64Array( p.B ) );
			const B2 = new Complex128Array( new Float64Array( p.B ) );
			const info1 = zgbtrs( 'column-major', trans, N, kl, ku, nrhs, new Complex128Array( new Float64Array( p.AB ) ), p.ldab, p.IPIV, 1, B1, N );
			const info2 = ndarray( trans, N, kl, ku, nrhs, new Complex128Array( new Float64Array( p.AB ) ), 1, p.ldab, 0, p.IPIV, 1, 0, B2, 1, N, 0 );
			assert.strictEqual( info1, 0, 'info' );
			assert.strictEqual( info2, 0, 'info' );
			assert.deepStrictEqual( reinterpret( B1, 0 ), reinterpret( B2, 0 ), 'B' );
			assert.notDeepStrictEqual( reinterpret( B1, 0 ), p.B, 'B was overwritten with the solution' );
		});
	});
});

test( 'zgbtrs (row-major) matches ndarray on the same data and the transposed column-major solution', function t() {
	[ 'no-transpose', 'transpose', 'conjugate-transpose' ].forEach( function each( trans ) {
		[ [ 5, 2, 1, 2 ], [ 6, 1, 2, 3 ], [ 4, 2, 2, 1 ] ].forEach( function each2( c ) {
			const N = c[ 0 ];
			const kl = c[ 1 ];
			const ku = c[ 2 ];
			const nrhs = c[ 3 ];
			const p = problem( N, kl, ku, nrhs );
			const ld = N + 1;
			const ldb = nrhs + 1;
			const ABr = toRowMajor( p.AB, p.ldab, N, ld );
			const Br = toRowMajor( p.B, N, nrhs, ldb );
			const B1 = new Complex128Array( new Float64Array( Br ) );
			const B2 = new Complex128Array( new Float64Array( Br ) );
			const Bc = new Complex128Array( new Float64Array( p.B ) );
			const info1 = zgbtrs( 'row-major', trans, N, kl, ku, nrhs, new Complex128Array( new Float64Array( ABr ) ), ld, p.IPIV, 1, B1, ldb );
			const info2 = ndarray( trans, N, kl, ku, nrhs, new Complex128Array( new Float64Array( ABr ) ), ld, 1, 0, p.IPIV, 1, 0, B2, ldb, 1, 0 );
			ndarray( trans, N, kl, ku, nrhs, new Complex128Array( new Float64Array( p.AB ) ), 1, p.ldab, 0, p.IPIV, 1, 0, Bc, 1, N, 0 );
			assert.strictEqual( info1, 0, 'info' );
			assert.strictEqual( info2, 0, 'info' );
			assert.deepStrictEqual( reinterpret( B1, 0 ), reinterpret( B2, 0 ), 'B' );
			assertClose( reinterpret( B1, 0 ), toRowMajor( reinterpret( Bc, 0 ), N, nrhs, ldb ), 'B equals the transposed column-major solution' );
		});
	});
});
