/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsysv from './../lib/strided.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import pivot_2x2_upper from './fixtures/pivot_2x2_upper.json' with { type: 'json' };
import pivot_2x2_lower from './fixtures/pivot_2x2_lower.json' with { type: 'json' };

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
* Convert Fortran 1-based IPIV to 0-based JS convention.
* Positive values: subtract 1 (1-based to 0-based).
* Negative values: stay the same (Fortran -k maps to JS ~(k-1) = -k).
*/
function ipivTo0Based( ipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] > 0 ) {
			out.push( ipiv[ i ] - 1 );
		} else {
			out.push( ipiv[ i ] );
		}
	}
	return out;
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

test( 'dsysv: upper_4x4 - solves symmetric system with upper storage', function t() { // eslint-disable-line max-len

	const tc = upper_4x4;
	const expectedIPIV = ipivTo0Based( tc.ipiv );
	const IPIV = new Int32Array( 4 );
	const A = new Float64Array([
		4,
		1,
		2,
		3,
		1,
		5,
		1,
		2,
		2,
		1,
		6,
		1,
		3,
		2,
		1,
		7
	]);
	const B = new Float64Array([ 24, 22, 26, 38 ]);
	const info = dsysv( 'upper', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Float64Array( 4 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: lower_4x4 - solves symmetric system with lower storage', function t() { // eslint-disable-line max-len

	const tc = lower_4x4;
	const expectedIPIV = ipivTo0Based( tc.ipiv );
	const IPIV = new Int32Array( 4 );
	const A = new Float64Array([
		4,
		1,
		2,
		3,
		1,
		5,
		1,
		2,
		2,
		1,
		6,
		1,
		3,
		2,
		1,
		7
	]);
	const B = new Float64Array([ 24, 22, 26, 38 ]);
	const info = dsysv( 'lower', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Float64Array( 4 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: multi_rhs - multiple right-hand sides', function t() {

	const tc = multi_rhs;
	const expectedIPIV = ipivTo0Based( tc.ipiv );
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array([
		2,
		-1,
		-1,
		3
	]);
	const B = new Float64Array([ 1, 5, 4, 7 ]);
	const info = dsysv( 'upper', 2, 2, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0, new Float64Array( 2 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: singular - returns info > 0 for singular matrix', function t() {

	const IPIV = new Int32Array( 2 );
	const A = new Float64Array([ 1, 2, 2, 4 ]);
	const B = new Float64Array([ 1, 2 ]);
	const info = dsysv( 'upper', 2, 1, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0, new Float64Array( 2 ), 1, 0 );
	assert.ok( info > 0, 'info should be > 0 for singular matrix' );
});

test( 'dsysv: n1 - N=1 edge case', function t() {

	const tc = n1;
	const expectedIPIV = ipivTo0Based( tc.ipiv );
	const IPIV = new Int32Array( 1 );
	const A = new Float64Array([ 3 ]);
	const B = new Float64Array([ 9 ]);
	const info = dsysv( 'upper', 1, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: pivot_2x2_upper - matrix triggering 2x2 pivots (upper)', function t() { // eslint-disable-line max-len

	const tc = pivot_2x2_upper;
	const expectedIPIV = ipivTo0Based( tc.ipiv );
	const IPIV = new Int32Array( 4 );
	const A = new Float64Array([
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		4,
		1,
		0,
		0,
		1,
		4
	]);
	const B = new Float64Array([ 1, 1, 5, 5 ]);
	const info = dsysv( 'upper', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Float64Array( 4 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: pivot_2x2_lower - matrix triggering 2x2 pivots (lower)', function t() { // eslint-disable-line max-len

	const tc = pivot_2x2_lower;
	const expectedIPIV = ipivTo0Based( tc.ipiv );
	const IPIV = new Int32Array( 4 );
	const A = new Float64Array([
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,
		4,
		1,
		0,
		0,
		1,
		4
	]);
	const B = new Float64Array([ 1, 1, 5, 5 ]);
	const info = dsysv( 'lower', 4, 1, A, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0, new Float64Array( 4 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( B ), tc.x, 1e-14, 'x' );
	assert.deepStrictEqual( toArray( IPIV ), expectedIPIV, 'ipiv' );
});

test( 'dsysv: n_zero - N=0 quick return', function t() {

	const IPIV = new Int32Array( 1 );
	const A = new Float64Array([ 1 ]);
	const B = new Float64Array([ 1 ]);
	const info = dsysv( 'upper', 0, 1, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsysv: nrhs_zero - NRHS=0 quick return', function t() {

	const IPIV = new Int32Array( 1 );
	const A = new Float64Array([ 5 ]);
	const B = new Float64Array([ 10 ]);
	const info = dsysv( 'upper', 1, 0, A, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, new Float64Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

/**
* Returns a deterministic symmetric indefinite N-by-N matrix (column-major, both triangles filled).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Float64Array} matrix
*/
function symmetricMatrix( N ) {
	const A = new Float64Array( N * N );
	let seed = 12345;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			seed = ( ( seed * 1103515245 ) + 12345 ) % 2147483648;
			A[ i + ( j * N ) ] = ( seed / 1073741824 ) - 1.0;
			A[ j + ( i * N ) ] = A[ i + ( j * N ) ];
		}
	}
	return A;
}

/**
* Solves `A*X = B` at order `N` with a WORK of `lwork` elements and returns `X`.
*
* @private
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} solution
*/
function solveWith( uplo, N, lwork ) {
	const IPIV = new Int32Array( N );
	const A = symmetricMatrix( N );
	const B = new Float64Array( N * 2 );
	let info;
	let i;
	for ( i = 0; i < 2 * N; i++ ) {
		B[ i ] = ( ( i * 7 ) % 11 ) - 5;
	}
	info = dsysv( uplo, N, 2, A, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return B;
}

test( 'dsysv: at N=70 the minimum WORK (1), N-1 (dsytrs solve), N*8 (shrunk NB) and the optimum N*32 give the same X', function t() {
	const N = 70;
	[ 'upper', 'lower' ].forEach( function eachUplo( uplo ) {
		const expected = solveWith( uplo, N, 32 * N );
		[ 1, N - 1, 8 * N ].forEach( function eachLwork( lwork ) {
			const X = solveWith( uplo, N, lwork );
			let xmax = 0.0;
			let i;
			for ( i = 0; i < expected.length; i++ ) {
				xmax = Math.max( xmax, Math.abs( expected[ i ] ) );
			}
			for ( i = 0; i < expected.length; i++ ) {
				assert.ok( Math.abs( X[ i ] - expected[ i ] ) <= 1e-12 * xmax, uplo + ' LWORK=' + lwork + ' X[' + i + ']: expected ' + expected[ i ] + ', got ' + X[ i ] );
			}
		});
	});
});

test( 'dsysv: WORK below the minimum (length 0 from offsetWork) throws when N > 0', function t() {
	const IPIV = new Int32Array( 2 );
	assert.throws( function throws() {
		dsysv( 'upper', 2, 1, new Float64Array( 4 ), 1, 2, 0, IPIV, 1, 0, new Float64Array( 2 ), 1, 2, 0, new Float64Array( 3 ), 1, 3 );
	}, RangeError );
	assert.equal( dsysv( 'upper', 2, 1, new Float64Array( [ 2, 0, 1, 3 ] ), 1, 2, 0, IPIV, 1, 0, new Float64Array( [ 3, 4 ] ), 1, 2, 0, new Float64Array( 4 ), 1, 3 ), 0, 'one element from offsetWork suffices' );
});

test( 'dsysv: NRHS=0 still factorizes A, as the reference does', function t() {
	const IPIV = new Int32Array( 2 );
	const A = new Float64Array( [ 4, 0, 2, 3 ] );
	const info = dsysv( 'upper', 2, 0, A, 1, 2, 0, IPIV, 1, 0, new Float64Array( 2 ), 1, 2, 0, new Float64Array( 2 ), 1, 0 );
	assert.equal( info, 0, 'info' );

	// A = U*D*U^T with D = diag(4 - 2*2/3, 3), U(0,1) = 2/3:
	assertArrayClose( toArray( A ), [ 4 - ( 4 / 3 ), 0, 2 / 3, 3 ], 1e-15, 'A' );
	assert.deepStrictEqual( toArray( IPIV ), [ 0, 1 ], 'ipiv' );
});
