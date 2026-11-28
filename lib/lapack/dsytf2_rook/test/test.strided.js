/* eslint-disable no-restricted-syntax, max-len */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytf2Rook from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dsytf2_rook.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Find a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Assert that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays are element-wise approximately equal.
*
* @private
* @param {Object} actual - actual array
* @param {Array} expected - expected array
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
* Convert Fortran 1-based IPIV to 0-based JS IPIV. Positive values are decremented; negative values are preserved (they already encode `~(p-1) = -p` in both conventions).
*
* @private
* @param {Array} fipiv - Fortran IPIV values
* @returns {Array} JS IPIV values
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

/**
* Convert a typed array to a plain array.
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

test( 'dsytf2Rook: 4x4_lower', function t() {

	const tc = findCase( '4x4_lower' );
	const ipiv = new Int32Array( 4 );
	const A = new Float64Array([
		2,
		-1,
		0,
		0,
		0,
		2,
		-1,
		0,
		0,
		0,
		2,
		-1,
		0,
		0,
		0,
		2
	]);
	const info = dsytf2Rook( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 4x4_upper', function t() {

	const tc = findCase( '4x4_upper' );
	const ipiv = new Int32Array( 4 );
	const A = new Float64Array([
		2,
		0,
		0,
		0,
		-1,
		2,
		0,
		0,
		0,
		-1,
		2,
		0,
		0,
		0,
		-1,
		2
	]);
	const info = dsytf2Rook( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 4x4_indef_lower', function t() {

	const tc = findCase( '4x4_indef_lower' );
	const ipiv = new Int32Array( 4 );
	const A = new Float64Array([
		0,
		1,
		2,
		3,
		0,
		0,
		4,
		5,
		0,
		0,
		0,
		6,
		0,
		0,
		0,
		0
	]);
	const info = dsytf2Rook( 'lower', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 4x4_indef_upper', function t() {

	const tc = findCase( '4x4_indef_upper' );
	const ipiv = new Int32Array( 4 );
	const A = new Float64Array([
		0,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		2,
		4,
		0,
		0,
		3,
		5,
		6,
		0
	]);
	const info = dsytf2Rook( 'upper', 4, A, 1, 4, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: n_zero', function t() {

	const ipiv = new Int32Array( 1 );
	const A = new Float64Array( 1 );
	const info = dsytf2Rook( 'lower', 0, A, 1, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytf2Rook: n_one', function t() {

	const tc = findCase( 'n_one' );
	const ipiv = new Int32Array( 1 );
	const A = new Float64Array([ 5.0 ]);
	const info = dsytf2Rook( 'lower', 1, A, 1, 1, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: singular', function t() {

	const tc = findCase( 'singular' );
	const ipiv = new Int32Array( 2 );
	const A = new Float64Array([ 0, 0, 0, 0 ]);
	const info = dsytf2Rook( 'lower', 2, A, 1, 2, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_lower', function t() {

	const tc = findCase( '5x5_lower' );
	const ipiv = new Int32Array( 5 );
	const A = new Float64Array([
		1,
		-2,
		0,
		3,
		1,
		0,
		0,
		4,
		-1,
		2,
		0,
		0,
		-3,
		2,
		0,
		0,
		0,
		0,
		1,
		-2,
		0,
		0,
		0,
		0,
		4
	]);
	const info = dsytf2Rook( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_upper', function t() {

	const tc = findCase( '5x5_upper' );
	const ipiv = new Int32Array( 5 );
	const A = new Float64Array( 25 );
	A[ 0 ] = 1;
	A[ 5 ] = -2;
	A[ 10 ] = 0;
	A[ 11 ] = 4;
	A[ 12 ] = -3;
	A[ 15 ] = 3;
	A[ 16 ] = -1;
	A[ 17 ] = 2;
	A[ 18 ] = 1;
	A[ 20 ] = 1;
	A[ 21 ] = 2;
	A[ 22 ] = 0;
	A[ 23 ] = -2;
	A[ 24 ] = 4;
	const info = dsytf2Rook( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 6x6_rook_lower', function t() {

	const tc = findCase( '6x6_rook_lower' );
	const ipiv = new Int32Array( 6 );
	const A = new Float64Array([
		0.5,
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		0.0,
		0.5,
		1.5,
		2.5,
		3.5,
		4.5,
		0.0,
		0.0,
		0.5,
		1.2,
		2.2,
		3.2,
		0.0,
		0.0,
		0.0,
		0.5,
		1.1,
		2.1,
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		1.3,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.5
	]);
	const info = dsytf2Rook( 'lower', 6, A, 1, 6, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 6x6_rook_upper', function t() {

	const tc = findCase( '6x6_rook_upper' );
	const ipiv = new Int32Array( 6 );
	const A = new Float64Array( 36 );
	A[ 0 ] = 0.5;
	A[ 6 ] = 1.0;
	A[ 7 ] = 0.5;
	A[ 12 ] = 2.0;
	A[ 13 ] = 1.5;
	A[ 14 ] = 0.5;
	A[ 18 ] = 3.0;
	A[ 19 ] = 2.5;
	A[ 20 ] = 1.2;
	A[ 21 ] = 0.5;
	A[ 24 ] = 4.0;
	A[ 25 ] = 3.5;
	A[ 26 ] = 2.2;
	A[ 27 ] = 1.1;
	A[ 28 ] = 0.5;
	A[ 30 ] = 5.0;
	A[ 31 ] = 4.5;
	A[ 32 ] = 3.2;
	A[ 33 ] = 2.1;
	A[ 34 ] = 1.3;
	A[ 35 ] = 0.5;
	const info = dsytf2Rook( 'upper', 6, A, 1, 6, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-13, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 3x3_indef_lower', function t() {

	const tc = findCase( '3x3_indef_lower' );
	const ipiv = new Int32Array( 3 );
	const A = new Float64Array([
		0,
		1,
		2,
		0,
		0,
		3,
		0,
		0,
		0
	]);
	const info = dsytf2Rook( 'lower', 3, A, 1, 3, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: singular_upper', function t() {

	const tc = findCase( 'singular_upper' );
	const ipiv = new Int32Array( 2 );
	const A = new Float64Array([ 0, 0, 0, 0 ]);
	const info = dsytf2Rook( 'upper', 2, A, 1, 2, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_chase_upper', function t() {

	const tc = findCase( '5x5_chase_upper' );
	const ipiv = new Int32Array( 5 );
	const A = new Float64Array( 25 );
	A[ 0 ] = 0.1;
	A[ 5 ] = 1.0;
	A[ 6 ] = 0.1;
	A[ 10 ] = 2.0;
	A[ 11 ] = 5.0;
	A[ 12 ] = 0.1;
	A[ 15 ] = 3.0;
	A[ 16 ] = 10.0;
	A[ 17 ] = 50.0;
	A[ 18 ] = 0.1;
	A[ 20 ] = 4.0;
	A[ 21 ] = 20.0;
	A[ 22 ] = 100.0;
	A[ 23 ] = 500.0;
	A[ 24 ] = 0.1;
	const info = dsytf2Rook( 'upper', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-12, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 5x5_chase_lower', function t() {

	const tc = findCase( '5x5_chase_lower' );
	const ipiv = new Int32Array( 5 );
	const A = new Float64Array([
		0.1,
		1.0,
		2.0,
		3.0,
		4.0,
		0.0,
		0.1,
		5.0,
		10.0,
		20.0,
		0.0,
		0.0,
		0.1,
		50.0,
		100.0,
		0.0,
		0.0,
		0.0,
		0.1,
		500.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.1
	]);
	const info = dsytf2Rook( 'lower', 5, A, 1, 5, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-12, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'dsytf2Rook: 3x3_indef_upper', function t() {

	const tc = findCase( '3x3_indef_upper' );
	const ipiv = new Int32Array( 3 );
	const A = new Float64Array([
		0,
		0,
		0,
		1,
		0,
		0,
		2,
		3,
		0
	]);
	const info = dsytf2Rook( 'upper', 3, A, 1, 3, 0, ipiv, 1, 0 );
	assertArrayClose( A, tc.a, 1e-14, 'a' );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), 'ipiv' );
});


// PROPERTY-BASED TESTS //

/**
* Returns a deterministic pseudo-random number generator (LCG) returning values in `[0,1)`.
*
* @private
* @param {integer} seed - seed
* @returns {Function} generator
*/
function lcg( seed ) {
	let s = seed >>> 0;
	return function next() {
		s = ( ( Math.imul( s, 1664525 ) + 1013904223 ) >>> 0 );
		return s / 4294967296;
	};
}

/**
* Swaps rows and columns `i` and `j` of a dense row-of-rows matrix.
*
* @private
* @param {Array} M - matrix (array of row arrays)
* @param {integer} i - first index
* @param {integer} j - second index
*/
function symSwap( M, i, j ) {
	let tmp;
	let r;
	if ( i === j ) {
		return;
	}
	tmp = M[ i ];
	M[ i ] = M[ j ];
	M[ j ] = tmp;
	for ( r = 0; r < M.length; r++ ) {
		tmp = M[ r ][ i ];
		M[ r ][ i ] = M[ r ][ j ];
		M[ r ][ j ] = tmp;
	}
}

/**
* Computes `X * M * X^T` where `X` is the identity except for columns `cols`, whose off-block entries (rows `rows`) are given by the factor.
*
* @private
* @param {Array} M - matrix (modified in place)
* @param {Function} get - accessor `get(i,j)` into the factored matrix
* @param {Array} cols - block column indices
* @param {Array} rows - row indices holding the multipliers
*/
function applyBlock( M, get, cols, rows ) {
	const N = M.length;
	const X = [];
	const T = [];
	let i;
	let j;
	let l;
	let s;
	for ( i = 0; i < N; i++ ) {
		X.push( new Array( N ).fill( 0.0 ) );
		X[ i ][ i ] = 1.0;
	}
	for ( l = 0; l < cols.length; l++ ) {
		for ( i = 0; i < rows.length; i++ ) {
			X[ rows[ i ] ][ cols[ l ] ] = get( rows[ i ], cols[ l ] );
		}
	}
	for ( i = 0; i < N; i++ ) {
		T.push( new Array( N ).fill( 0.0 ) );
		for ( j = 0; j < N; j++ ) {
			s = 0.0;
			for ( l = 0; l < N; l++ ) {
				s += X[ i ][ l ] * M[ l ][ j ];
			}
			T[ i ][ j ] = s;
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			s = 0.0;
			for ( l = 0; l < N; l++ ) {
				s += T[ i ][ l ] * X[ j ][ l ];
			}
			M[ i ][ j ] = s;
		}
	}
}

/**
* Reconstructs `P*U*D*U^T*P^T` (or the `L` analogue) from the output of `dsytf2Rook` (column-major, leading dimension `N`), validating the IPIV encoding along the way.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {integer} N - order
* @param {Float64Array} F - factored matrix
* @param {Int32Array} ipiv - pivot indices
* @returns {Object} reconstructed matrix and block sizes
*/
function reconstruct( uplo, N, F, ipiv ) {
	const blocks = [];
	const M = [];
	let rows;
	let b;
	let i;
	let k;
	function get( r, c ) {
		return F[ r + ( c * N ) ];
	}
	for ( i = 0; i < N; i++ ) {
		M.push( new Array( N ).fill( 0.0 ) );
	}
	// Parse blocks in factorization order:
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( ipiv[ k ] >= 0 ) {
				assert.ok( ipiv[ k ] <= k, 'ipiv[' + k + '] in range' );
				blocks.push( [ k ] );
				k -= 1;
			} else {
				assert.ok( k > 0 && ipiv[ k - 1 ] < 0, 'ipiv 2x2 pair at ' + k );
				assert.ok( ~ipiv[ k ] <= k && ~ipiv[ k - 1 ] <= k - 1, 'ipiv 2x2 range at ' + k );
				blocks.push( [ k - 1, k ] );
				k -= 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( ipiv[ k ] >= 0 ) {
				assert.ok( ipiv[ k ] >= k && ipiv[ k ] < N, 'ipiv[' + k + '] in range' );
				blocks.push( [ k ] );
				k += 1;
			} else {
				assert.ok( k < N - 1 && ipiv[ k + 1 ] < 0, 'ipiv 2x2 pair at ' + k );
				assert.ok( ~ipiv[ k ] >= k && ~ipiv[ k + 1 ] >= k + 1, 'ipiv 2x2 range at ' + k );
				blocks.push( [ k, k + 1 ] );
				k += 2;
			}
		}
	}
	// D:
	for ( b = 0; b < blocks.length; b++ ) {
		const c = blocks[ b ];
		M[ c[ 0 ] ][ c[ 0 ] ] = get( c[ 0 ], c[ 0 ] );
		if ( c.length === 2 ) {
			M[ c[ 1 ] ][ c[ 1 ] ] = get( c[ 1 ], c[ 1 ] );
			M[ c[ 0 ] ][ c[ 1 ] ] = ( uplo === 'upper' ) ? get( c[ 0 ], c[ 1 ] ) : get( c[ 1 ], c[ 0 ] );
			M[ c[ 1 ] ][ c[ 0 ] ] = M[ c[ 0 ] ][ c[ 1 ] ];
		}
	}
	// Apply X_b = P_b * U_b, innermost being the last processed block:
	for ( b = blocks.length - 1; b >= 0; b-- ) {
		const c = blocks[ b ];
		rows = [];
		if ( uplo === 'upper' ) {
			for ( i = 0; i < c[ 0 ]; i++ ) {
				rows.push( i );
			}
		} else {
			for ( i = c[ c.length - 1 ] + 1; i < N; i++ ) {
				rows.push( i );
			}
		}
		applyBlock( M, get, c, rows );
		if ( c.length === 1 ) {
			symSwap( M, c[ 0 ], ipiv[ c[ 0 ] ] );
		} else if ( uplo === 'upper' ) {
			// Second swap (k-1 <-> kp) is undone first, then the first (k <-> p):
			symSwap( M, c[ 0 ], ~ipiv[ c[ 0 ] ] );
			symSwap( M, c[ 1 ], ~ipiv[ c[ 1 ] ] );
		} else {
			symSwap( M, c[ 1 ], ~ipiv[ c[ 1 ] ] );
			symSwap( M, c[ 0 ], ~ipiv[ c[ 0 ] ] );
		}
	}
	return {
		'M': M,
		'blocks': blocks
	};
}

/**
* Factors the symmetric matrix `S` (array of rows) with `dsytf2Rook` and asserts that the factors reconstruct `S`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {Array} S - full symmetric matrix
* @param {number} tol - relative tolerance
* @param {string} msg - message
* @returns {Object} factorization output (`info`, `ipiv`, `A`, `blocks`)
*/
function factorAndCheck( uplo, S, tol, msg ) {
	const N = S.length;
	const A = new Float64Array( N * N );
	const ipiv = new Int32Array( N );
	let anorm = 0.0;
	let info;
	let rec;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			anorm = Math.max( anorm, Math.abs( S[ i ][ j ] ) );
			if ( ( uplo === 'upper' && i <= j ) || ( uplo === 'lower' && i >= j ) ) {
				A[ i + ( j * N ) ] = S[ i ][ j ];
			} else {
				// Poison the unreferenced triangle:
				A[ i + ( j * N ) ] = NaN;
			}
		}
	}
	info = dsytf2Rook( uplo, N, A, 1, N, 0, ipiv, 1, 0 );
	rec = reconstruct( uplo, N, A, ipiv );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assert.ok( Math.abs( rec.M[ i ][ j ] - S[ i ][ j ] ) <= tol * anorm, msg + ': reconstruction (' + i + ',' + j + '): expected ' + S[ i ][ j ] + ', got ' + rec.M[ i ][ j ] );
		}
	}
	return {
		'info': info,
		'ipiv': ipiv,
		'A': A,
		'blocks': rec.blocks
	};
}

/**
* Generates a random symmetric matrix with a weak diagonal and widely varying off-diagonal magnitudes (forces rook searches).
*
* @private
* @param {integer} N - order
* @param {Function} rand - generator
* @returns {Array} matrix
*/
function weakDiagonal( N, rand ) {
	const S = [];
	let v;
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		S.push( new Array( N ).fill( 0.0 ) );
	}
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			v = ( ( 2.0 * rand() ) - 1.0 ) * Math.pow( 10.0, ( 4.0 * rand() ) - 2.0 );
			if ( i === j ) {
				v *= 0.01;
			}
			S[ i ][ j ] = v;
			S[ j ][ i ] = v;
		}
	}
	return S;
}

test( 'dsytf2Rook: random weak-diagonal matrices reconstruct A = P*U*D*U^T*P^T and A = P*L*D*L^T*P^T (both uplo)', function t() {
	const counts = {
		'upper': [ 0, 0 ],
		'lower': [ 0, 0 ]
	};
	let rand;
	let out;
	let uplo;
	let seed;
	let N;
	let b;
	for ( seed = 1; seed <= 60; seed++ ) {
		rand = lcg( seed );
		N = 2 + ( seed % 7 );
		const S = weakDiagonal( N, rand );
		for ( uplo of [ 'upper', 'lower' ] ) {
			out = factorAndCheck( uplo, S, 1e-11, 'seed ' + seed + ' ' + uplo );
			assert.equal( out.info, 0, 'info' );
			for ( b = 0; b < out.blocks.length; b++ ) {
				counts[ uplo ][ out.blocks[ b ].length - 1 ] += 1;
			}
		}
	}
	// Both 1x1 and 2x2 pivots must have been exercised in both triangles:
	assert.ok( counts.upper[ 0 ] > 0 && counts.upper[ 1 ] > 0, 'upper pivot mix' );
	assert.ok( counts.lower[ 0 ] > 0 && counts.lower[ 1 ] > 0, 'lower pivot mix' );
});

test( 'dsytf2Rook: 1x1 pivot below SFMIN uses the divide-then-update path (lower)', function t() {
	const S = [
		[ 1e-310, 1e-311, 2e-311 ],
		[ 1e-311, 1.0, 0.5 ],
		[ 2e-311, 0.5, 2.0 ]
	];
	const out = factorAndCheck( 'lower', S, 1e-14, 'underflow lower' );
	assert.equal( out.info, 0, 'info' );
	assert.deepEqual( toArray( out.ipiv ), [ 0, 1, 2 ], 'ipiv (no interchanges)' );

	// D(0) is the denormal pivot itself; multipliers are A(i,0)/D(0):
	assert.equal( out.A[ 0 ], 1e-310, 'd(0)' );
	assertClose( out.A[ 1 ], 0.1, 1e-4, 'l(1,0)' );
	assertClose( out.A[ 2 ], 0.2, 1e-4, 'l(2,0)' );
});

test( 'dsytf2Rook: 1x1 pivot below SFMIN uses the divide-then-update path (upper)', function t() {
	const S = [
		[ 2.0, 0.5, 2e-311 ],
		[ 0.5, 1.0, 1e-311 ],
		[ 2e-311, 1e-311, 1e-310 ]
	];
	const out = factorAndCheck( 'upper', S, 1e-14, 'underflow upper' );
	assert.equal( out.info, 0, 'info' );
	assert.deepEqual( toArray( out.ipiv ), [ 0, 1, 2 ], 'ipiv (no interchanges)' );
	assert.equal( out.A[ 8 ], 1e-310, 'd(2)' );
	assertClose( out.A[ 6 ], 0.2, 1e-4, 'u(0,2)' );
	assertClose( out.A[ 7 ], 0.1, 1e-4, 'u(1,2)' );
});

test( 'dsytf2Rook: zero column sets info to the first zero column (1-based) and continues', function t() {
	const S = [
		[ 4.0, 0.0, 1.0, 2.0 ],
		[ 0.0, 0.0, 0.0, 0.0 ],
		[ 1.0, 0.0, 3.0, 0.5 ],
		[ 2.0, 0.0, 0.5, 0.0 ]
	];
	let out = factorAndCheck( 'lower', S, 1e-14, 'zero col lower' );
	assert.equal( out.info, 2, 'info lower' );
	assert.equal( out.ipiv[ 1 ], 1, 'ipiv lower (zero column: kp = k)' );
	out = factorAndCheck( 'upper', S, 1e-14, 'zero col upper' );
	assert.equal( out.info, 2, 'info upper' );
	assert.equal( out.ipiv[ 1 ], 1, 'ipiv upper (zero column: kp = k)' );
});
