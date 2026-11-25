
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbbrd from './../lib/zgbbrd.js';
import ndarray from './../lib/ndarray.js';
import main from './../lib/index.js';


// FUNCTIONS //

/**
* Returns deterministic pseudo-random values on `[-0.5, 0.5)`.
*
* @private
* @param {integer} seed - seed
* @param {NonNegativeInteger} n - number of values
* @returns {Float64Array} values
*/
function randoms( seed, n ) {
	const out = new Float64Array( n );
	let s = seed;
	let i;
	for ( i = 0; i < n; i++ ) {
		s = ( ( s * 1103515245 ) + 12345 ) % 2147483648;
		out[ i ] = ( s / 2147483648 ) - 0.5;
	}
	return out;
}

/**
* Transposes an interleaved complex `R`-by-`C` column-major array into row-major storage.
*
* @private
* @param {Float64Array} x - column-major interleaved array
* @param {NonNegativeInteger} R - rows
* @param {NonNegativeInteger} C - columns
* @returns {Float64Array} row-major interleaved array
*/
function transpose( x, R, C ) {
	const out = new Float64Array( 2 * R * C );
	let i;
	let j;
	for ( i = 0; i < R; i++ ) {
		for ( j = 0; j < C; j++ ) {
			out[ 2 * ( ( i * C ) + j ) ] = x[ 2 * ( i + ( j * R ) ) ];
			out[ ( 2 * ( ( i * C ) + j ) ) + 1 ] = x[ ( 2 * ( i + ( j * R ) ) ) + 1 ];
		}
	}
	return out;
}

/**
* Allocates output arrays.
*
* @private
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @returns {Object} outputs
*/
function outputs( M, N ) {
	return {
		'd': new Float64Array( Math.min( M, N ) ),
		'e': new Float64Array( Math.min( M, N ) ),
		'Q': new Complex128Array( M * M ),
		'PT': new Complex128Array( N * N )
	};
}

/**
* Asserts that two arrays agree elementwise to a tolerance (row-major traversal may round differently).
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
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 1e-12 * Math.max( 1.0, Math.abs( expected[ i ] ) ), msg + ': index ' + i + ', ' + actual[ i ] + ' vs ' + expected[ i ] );
	}
}


// TESTS //

test( 'zgbbrd is a function', function t() {
	assert.strictEqual( typeof zgbbrd, 'function', 'is a function' );
});

test( 'zgbbrd has expected arity', function t() {
	assert.strictEqual( zgbbrd.length, 21, 'has expected arity' );
});

test( 'zgbbrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgbbrd( 'invalid', 'no-vectors', 2, 2, 0, 1, 1, new Complex128Array( 12 ), 3, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgbbrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', -1, 2, 0, 1, 1, new Complex128Array( 12 ), 3, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', 2, -1, 0, 1, 1, new Complex128Array( 12 ), 3, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws RangeError for LDAB < KL+KU+1', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', 2, 2, 0, 1, 1, new Complex128Array( 12 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 1 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a TypeError for an invalid vect', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'invalid', 2, 2, 0, 0, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgbbrd throws a RangeError for negative ncc', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', 2, 2, -1, 0, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for negative kl', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', 2, 2, 0, -1, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for negative ku', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', 2, 2, 0, 0, -1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for LDAB < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		zgbbrd( 'row-major', 'no-vectors', 2, 2, 0, 0, 1, new Complex128Array( 12 ), 1, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for LDQ < max(1,M) when Q is requested', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'q-only', 2, 2, 0, 0, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for LDPT < max(1,N) when P**H is requested', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'p-only', 2, 2, 0, 0, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for LDC < max(1,M) (column-major)', function t() {
	assert.throws( function throws() {
		zgbbrd( 'column-major', 'no-vectors', 2, 2, 2, 0, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd throws a RangeError for LDC < max(1,ncc) (row-major)', function t() {
	assert.throws( function throws() {
		zgbbrd( 'row-major', 'no-vectors', 2, 2, 2, 0, 1, new Complex128Array( 12 ), 2, new Float64Array( 2 ), 1, new Float64Array( 1 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgbbrd (column-major) matches ndarray on the same data, with and without provided workspace', function t() {
	[ [ 5, 4, 2, 1 ], [ 4, 5, 1, 2 ] ].forEach( function each( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const kl = c[ 2 ];
		const ku = c[ 3 ];
		const ncc = 2;
		const ldab = kl + ku + 1;
		const raw = randoms( 5 + M, 2 * ldab * N );
		const Craw = randoms( 9 + M, 2 * M * ncc );
		const r1 = outputs( M, N );
		const r2 = outputs( M, N );
		const r3 = outputs( M, N );
		const AB1 = new Complex128Array( raw );
		const AB2 = new Complex128Array( raw );
		const AB3 = new Complex128Array( raw );
		const C1 = new Complex128Array( Craw );
		const C2 = new Complex128Array( Craw );
		const C3 = new Complex128Array( Craw );
		const mx = Math.max( M, N );
		const info1 = zgbbrd( 'column-major', 'both', M, N, ncc, kl, ku, AB1, ldab, r1.d, 1, r1.e, 1, r1.Q, M, r1.PT, N, C1, M, new Complex128Array( mx ), new Float64Array( mx ) );
		const info2 = ndarray( 'both', M, N, ncc, kl, ku, AB2, 1, ldab, 0, r2.d, 1, 0, r2.e, 1, 0, r2.Q, 1, M, 0, r2.PT, 1, N, 0, C2, 1, M, 0, new Complex128Array( mx ), 1, 0, new Float64Array( mx ), 1, 0 );
		const info3 = zgbbrd( 'column-major', 'both', M, N, ncc, kl, ku, AB3, ldab, r3.d, 1, r3.e, 1, r3.Q, M, r3.PT, N, C3, M, null, null );
		assert.strictEqual( info1, 0, 'info' );
		assert.strictEqual( info2, 0, 'info' );
		assert.strictEqual( info3, 0, 'info' );
		assert.deepStrictEqual( r1.d, r2.d, 'd' );
		assert.deepStrictEqual( r1.e, r2.e, 'e' );
		assert.deepStrictEqual( reinterpret( r1.Q, 0 ), reinterpret( r2.Q, 0 ), 'Q' );
		assert.deepStrictEqual( reinterpret( r1.PT, 0 ), reinterpret( r2.PT, 0 ), 'PT' );
		assert.deepStrictEqual( reinterpret( C1, 0 ), reinterpret( C2, 0 ), 'C' );
		assert.deepStrictEqual( reinterpret( AB1, 0 ), reinterpret( AB2, 0 ), 'AB' );
		assert.deepStrictEqual( r3.d, r2.d, 'd (allocated workspace)' );
		assert.deepStrictEqual( r3.e, r2.e, 'e (allocated workspace)' );
		assert.deepStrictEqual( reinterpret( r3.Q, 0 ), reinterpret( r2.Q, 0 ), 'Q (allocated workspace)' );
		assert.deepStrictEqual( reinterpret( r3.PT, 0 ), reinterpret( r2.PT, 0 ), 'PT (allocated workspace)' );
		assert.deepStrictEqual( reinterpret( C3, 0 ), reinterpret( C2, 0 ), 'C (allocated workspace)' );
		assert.ok( r1.d.some( function nz( v ) {
			return v !== 0.0;
		}), 'd is populated' );
	});
});

test( 'zgbbrd (row-major) matches ndarray on the same data, with and without provided workspace, and the column-major result', function t() {
	[ [ 5, 4, 2, 1 ], [ 4, 5, 1, 2 ] ].forEach( function each( c ) {
		const M = c[ 0 ];
		const N = c[ 1 ];
		const kl = c[ 2 ];
		const ku = c[ 3 ];
		const ncc = 2;
		const ldab = kl + ku + 1;
		const raw = randoms( 5 + M, 2 * ldab * N );
		const Craw = randoms( 9 + M, 2 * M * ncc );
		const rowAB = transpose( raw, ldab, N );
		const rowC = transpose( Craw, M, ncc );
		const r1 = outputs( M, N );
		const r2 = outputs( M, N );
		const r3 = outputs( M, N );
		const rc = outputs( M, N );
		const C1 = new Complex128Array( rowC );
		const C2 = new Complex128Array( rowC );
		const C3 = new Complex128Array( rowC );
		const Cc = new Complex128Array( Craw );
		const mx = Math.max( M, N );
		const info1 = zgbbrd( 'row-major', 'both', M, N, ncc, kl, ku, new Complex128Array( rowAB ), N, r1.d, 1, r1.e, 1, r1.Q, M, r1.PT, N, C1, ncc, new Complex128Array( mx ), new Float64Array( mx ) );
		const info2 = ndarray( 'both', M, N, ncc, kl, ku, new Complex128Array( rowAB ), N, 1, 0, r2.d, 1, 0, r2.e, 1, 0, r2.Q, M, 1, 0, r2.PT, N, 1, 0, C2, ncc, 1, 0, new Complex128Array( mx ), 1, 0, new Float64Array( mx ), 1, 0 );
		const info3 = zgbbrd( 'row-major', 'both', M, N, ncc, kl, ku, new Complex128Array( rowAB ), N, r3.d, 1, r3.e, 1, r3.Q, M, r3.PT, N, C3, ncc, null, null );
		ndarray( 'both', M, N, ncc, kl, ku, new Complex128Array( raw ), 1, ldab, 0, rc.d, 1, 0, rc.e, 1, 0, rc.Q, 1, M, 0, rc.PT, 1, N, 0, Cc, 1, M, 0, new Complex128Array( mx ), 1, 0, new Float64Array( mx ), 1, 0 );
		assert.strictEqual( info1, 0, 'info' );
		assert.strictEqual( info2, 0, 'info' );
		assert.strictEqual( info3, 0, 'info' );
		assert.deepStrictEqual( r1.d, r2.d, 'd' );
		assert.deepStrictEqual( r1.e, r2.e, 'e' );
		assert.deepStrictEqual( reinterpret( r1.Q, 0 ), reinterpret( r2.Q, 0 ), 'Q' );
		assert.deepStrictEqual( reinterpret( r1.PT, 0 ), reinterpret( r2.PT, 0 ), 'PT' );
		assert.deepStrictEqual( reinterpret( C1, 0 ), reinterpret( C2, 0 ), 'C' );
		assert.deepStrictEqual( r3.d, r2.d, 'd (allocated workspace)' );
		assert.deepStrictEqual( r3.e, r2.e, 'e (allocated workspace)' );
		assert.deepStrictEqual( reinterpret( r3.Q, 0 ), reinterpret( r2.Q, 0 ), 'Q (allocated workspace)' );
		assert.deepStrictEqual( reinterpret( r3.PT, 0 ), reinterpret( r2.PT, 0 ), 'PT (allocated workspace)' );
		assert.deepStrictEqual( reinterpret( C3, 0 ), reinterpret( C2, 0 ), 'C (allocated workspace)' );
		assertClose( r1.d, rc.d, 'd matches column-major' );
		assertClose( r1.e, rc.e, 'e matches column-major' );
		assertClose( reinterpret( r1.Q, 0 ), transpose( reinterpret( rc.Q, 0 ), M, M ), 'Q matches column-major' );
		assertClose( reinterpret( r1.PT, 0 ), transpose( reinterpret( rc.PT, 0 ), N, N ), 'PT matches column-major' );
		assertClose( reinterpret( C1, 0 ), transpose( reinterpret( Cc, 0 ), M, ncc ), 'C matches column-major' );
	});
});

test( 'zgbbrd exposes ndarray method', function t() {
	assert.strictEqual( typeof main.ndarray, 'function', 'has ndarray method' );
});
