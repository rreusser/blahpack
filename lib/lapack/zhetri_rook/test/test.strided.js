/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrfRook from './../../zhetrf_rook/lib/strided.js';
import zhetriRook from './../lib/strided.js';


// FIXTURES //

import fix3x3UpperF from './fixtures/3x3_upper_factored.json' with { type: 'json' };
import fix3x3UpperI from './fixtures/3x3_upper.json' with { type: 'json' };
import fix3x3LowerF from './fixtures/3x3_lower_factored.json' with { type: 'json' };
import fix3x3LowerI from './fixtures/3x3_lower.json' with { type: 'json' };
import fix4x4UpperIndefF from './fixtures/4x4_upper_indef_factored.json' with { type: 'json' };
import fix4x4UpperIndefI from './fixtures/4x4_upper_indef.json' with { type: 'json' };
import fix4x4LowerIndefF from './fixtures/4x4_lower_indef_factored.json' with { type: 'json' };
import fix4x4LowerIndefI from './fixtures/4x4_lower_indef.json' with { type: 'json' };
import fix4x4UpperSwapF from './fixtures/4x4_upper_swap_factored.json' with { type: 'json' };
import fix4x4UpperSwapI from './fixtures/4x4_upper_swap.json' with { type: 'json' };
import fix4x4LowerSwapF from './fixtures/4x4_lower_swap_factored.json' with { type: 'json' };
import fix4x4LowerSwapI from './fixtures/4x4_lower_swap.json' with { type: 'json' };
import fixN1UpperF from './fixtures/n1_upper_factored.json' with { type: 'json' };
import fixN1UpperI from './fixtures/n1_upper.json' with { type: 'json' };
import fixN1LowerF from './fixtures/n1_lower_factored.json' with { type: 'json' };
import fixN1LowerI from './fixtures/n1_lower.json' with { type: 'json' };


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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
* Converts Fortran 1-based IPIV to JS 0-based IPIV (with bitwise NOT for negatives).
*
* @private
* @param {Array} ipiv - Fortran 1-based pivot indices
* @returns {Int32Array} 0-based pivot indices
*/
function convertIPIV( ipiv ) {
	let i;
	const out = new Int32Array( ipiv.length );
	for ( i = 0; i < ipiv.length; i++ ) {
		if ( ipiv[ i ] >= 0 ) {
			out[ i ] = ipiv[ i ] - 1;
		} else {
			out[ i ] = ~( ( -ipiv[ i ] ) - 1 );
		}
	}
	return out;
}

/**
* Builds a Complex128Array from flat interleaved real/imag fixture data.
*
* @private
* @param {Array} arr - flat array (length `2*N*N`)
* @param {NonNegativeInteger} N - matrix order
* @returns {Complex128Array} complex matrix
*/
function complexMatFromFixture( arr, N ) {
	let i;
	const out = new Complex128Array( N * N );
	const view = reinterpret( out, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		view[ i ] = arr[ i ];
	}
	return out;
}

/**
* Slices and copies the first `2*N*N` entries of a fixture array.
*
* @private
* @param {Array} arr - source array
* @param {NonNegativeInteger} N - matrix order
* @returns {Array} sliced expected values
*/
function expectedFromFixture( arr, N ) {
	return arr.slice( 0, 2 * N * N );
}

/**
* Runs a fixture-based test.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Object} fact - factored fixture (input)
* @param {Object} inv - inverse fixture (expected)
*/
function runFixture( uplo, N, fact, inv ) {

	const A = complexMatFromFixture( fact.a, N );
	const ipiv = convertIPIV( fact.ipiv.slice( 0, N ) );
	const expected = expectedFromFixture( inv.a, N );
	const work = new Complex128Array( N );
	const info = zhetriRook( uplo, N, A, 1, N, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, inv.info, 'info' );
	const view = reinterpret( A, 0 );
	assertArrayClose( Array.prototype.slice.call( view ), expected, 1e-12, 'A' );
}


// TESTS //

test( 'zhetri_rook: n1_upper', function t() {
	runFixture( 'upper', 1, fixN1UpperF, fixN1UpperI );
});

test( 'zhetri_rook: n1_lower', function t() {
	runFixture( 'lower', 1, fixN1LowerF, fixN1LowerI );
});

test( 'zhetri_rook: 3x3_upper', function t() {
	runFixture( 'upper', 3, fix3x3UpperF, fix3x3UpperI );
});

test( 'zhetri_rook: 3x3_lower', function t() {
	runFixture( 'lower', 3, fix3x3LowerF, fix3x3LowerI );
});

test( 'zhetri_rook: 4x4_upper_indef', function t() {
	runFixture( 'upper', 4, fix4x4UpperIndefF, fix4x4UpperIndefI );
});

test( 'zhetri_rook: 4x4_lower_indef', function t() {
	runFixture( 'lower', 4, fix4x4LowerIndefF, fix4x4LowerIndefI );
});

test( 'zhetri_rook: 4x4_upper_swap', function t() {
	runFixture( 'upper', 4, fix4x4UpperSwapF, fix4x4UpperSwapI );
});

test( 'zhetri_rook: 4x4_lower_swap', function t() {
	runFixture( 'lower', 4, fix4x4LowerSwapF, fix4x4LowerSwapI );
});

test( 'zhetri_rook: n_zero', function t() {

	const A = new Complex128Array( 1 );
	const ipiv = new Int32Array( 1 );
	const work = new Complex128Array( 1 );
	const info = zhetriRook( 'upper', 0, A, 1, 1, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetri_rook: singular upper returns positive info', function t() {

	// Diagonal D(2,2) = 0
	const A = new Complex128Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	const ipiv = new Int32Array( [ 0, 1 ] );
	const work = new Complex128Array( 2 );
	const info = zhetriRook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 2, 'info should be 2' );
});

test( 'zhetri_rook: singular lower returns positive info', function t() {

	const A = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ] );
	const ipiv = new Int32Array( [ 0, 1 ] );
	const work = new Complex128Array( 2 );
	const info = zhetriRook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, 1, 'info should be 1' );
});


// 1x1 ROOK PIVOT WITH INTERCHANGE //

/**
* Builds a full 5-by-5 Hermitian matrix whose rook factorization takes a 1x1 pivot with a row/column interchange.
*
* The diagonal entry at index 4 is tiny and is strongly coupled to index 1, whose diagonal is large; `rev` reverses the index order so the tiny diagonal is at index 0 (which the lower factorization processes first).
*
* @private
* @param {boolean} rev - whether to reverse the index order
* @returns {Array} real and imaginary parts as nested arrays
*/
function rookSwapMatrix( rev ) {
	const entries = [
		[ 0, 0, 4, 0 ], [ 1, 1, 20, 0 ], [ 2, 2, 6, 0 ], [ 3, 3, 7, 0 ],
		[ 4, 4, 0.1, 0 ], [ 1, 4, 5, 1 ], [ 0, 1, 1, 0.5 ], [ 0, 2, 0.5, -0.5 ],
		[ 2, 3, 1, 1 ], [ 0, 4, 0.3, 0.2 ], [ 2, 4, 0.4, 0 ], [ 3, 4, -0.2, 0.3 ],
		[ 1, 2, 0.6, 0.1 ], [ 1, 3, -0.7, 0.2 ], [ 0, 3, 0.2, 0 ]
	];
	const R = [];
	const I = [];
	let e;
	let i;
	let j;
	let k;
	for ( i = 0; i < 5; i++ ) {
		R.push( [ 0, 0, 0, 0, 0 ] );
		I.push( [ 0, 0, 0, 0, 0 ] );
	}
	for ( k = 0; k < entries.length; k++ ) {
		e = entries[ k ];
		i = ( rev ) ? 4 - e[ 0 ] : e[ 0 ];
		j = ( rev ) ? 4 - e[ 1 ] : e[ 1 ];
		R[ i ][ j ] = e[ 2 ];
		R[ j ][ i ] = e[ 2 ];
		I[ i ][ j ] = e[ 3 ];
		I[ j ][ i ] = ( i === j ) ? 0 : -e[ 3 ];
	}
	return [ R, I ];
}

/**
* Factors with `zhetrf_rook`, inverts with `zhetri_rook`, and checks `A * inv(A) = I`.
*
* @private
* @param {string} uplo - matrix triangle
* @param {Array} M - real and imaginary parts of the full Hermitian matrix
* @param {integer} swapK - 0-based column whose 1x1 pivot must interchange
* @param {integer} swapP - 0-based row it must interchange with
*/
function checkRookSwapInverse( uplo, M, swapK, swapP ) {
	const N = 5;
	const R = M[ 0 ];
	const I = M[ 1 ];
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	const IPIV = new Int32Array( N );
	let inT;
	let Xr;
	let Xi;
	let sr;
	let si;
	let i;
	let j;
	let k;
	let q;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			v[ 2 * ( i + ( j * N ) ) ] = R[ i ][ j ];
			v[ ( 2 * ( i + ( j * N ) ) ) + 1 ] = I[ i ][ j ];
		}
	}
	assert.strictEqual( zhetrfRook( uplo, N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( N * 64 ), 1, 0 ), 0, 'zhetrf_rook info' ); // eslint-disable-line max-len

	// The factorization must take a 1x1 pivot at `swapK` that interchanges with `swapP`:
	assert.strictEqual( IPIV[ swapK ], swapP, 'IPIV[' + swapK + ']' );

	assert.strictEqual( zhetriRook( uplo, N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( N ), 1, 0 ), 0, 'zhetri_rook info' ); // eslint-disable-line max-len

	// Expand the stored triangle of inv(A) to the full Hermitian matrix:
	Xr = [];
	Xi = [];
	for ( i = 0; i < N; i++ ) {
		Xr.push( [] );
		Xi.push( [] );
		for ( j = 0; j < N; j++ ) {
			inT = ( uplo === 'upper' ) ? i <= j : i >= j;
			q = ( inT ) ? 2 * ( i + ( j * N ) ) : 2 * ( j + ( i * N ) );
			Xr[ i ][ j ] = v[ q ];
			Xi[ i ][ j ] = ( inT ) ? v[ q + 1 ] : -v[ q + 1 ];
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sr = 0.0;
			si = 0.0;
			for ( k = 0; k < N; k++ ) {
				sr += ( R[ i ][ k ] * Xr[ k ][ j ] ) - ( I[ i ][ k ] * Xi[ k ][ j ] );
				si += ( R[ i ][ k ] * Xi[ k ][ j ] ) + ( I[ i ][ k ] * Xr[ k ][ j ] );
			}
			assertClose( sr, ( i === j ) ? 1.0 : 0.0, 1e-12, uplo + ': re(A*inv(A))[' + i + ',' + j + ']' ); // eslint-disable-line max-len
			assertClose( si, 0.0, 1e-12, uplo + ': im(A*inv(A))[' + i + ',' + j + ']' ); // eslint-disable-line max-len
		}
	}
}

test( 'zhetri_rook: upper 1x1 pivot with interchange (A*inv(A) = I)', function t() {
	checkRookSwapInverse( 'upper', rookSwapMatrix( false ), 4, 1 );
});

test( 'zhetri_rook: lower 1x1 pivot with interchange (A*inv(A) = I)', function t() {
	checkRookSwapInverse( 'lower', rookSwapMatrix( true ), 0, 3 );
});

test( 'zhetri_rook: N = 0 accepts an empty WORK (the reference declares WORK( N ); W3)', function t() {
	const info = zhetriRook( 'upper', 0, new Complex128Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.throws( function throws() {
		zhetriRook( 'upper', 2, new Complex128Array( 4 ), 1, 2, 0, new Int32Array( [ 1, 2 ] ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, /WORK array must have at least 2 elements/ );
});
