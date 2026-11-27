/* eslint-disable no-restricted-syntax, max-len, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zsytrfRook from './../lib/ndarray.js';
import zsytrsRook from './../../zsytrs_rook/lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zsytrf_rook.jsonl' ), 'utf8' ).trim().split( '\n' );
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
* Extract an n-by-n submatrix from a Fortran LDA-strided complex output array.
*
* @private
* @param {Array} data - interleaved re/im values with leading dimension `lda`
* @param {integer} n - matrix order
* @param {integer} lda - Fortran leading dimension
* @returns {Array} interleaved re/im for the n-by-n submatrix
*/
function extractSubmatrix( data, n, lda ) {
	const out = [];
	let i, j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			out.push( data[ ( ( j * lda ) + i ) * 2 ] );
			out.push( data[ ( ( ( j * lda ) + i ) * 2 ) + 1 ] );
		}
	}
	return out;
}

/**
* Convert Fortran 1-based IPIV to 0-based bitwise-NOT convention.
*
* @private
* @param {Array} fipiv - Fortran-style pivot array
* @returns {Array} converted pivot array
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i++ ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			// Fortran negative is 1-based: -p_1based; JS encoding is `~(p-1) = -p`, which is the same numeric value.
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
* @returns {Array} plain array
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

test( 'zsytrf_rook: ndarray export is a function', function t() {
	assert.strictEqual( typeof zsytrfRook, 'function', 'is a function' );
});

test( 'zsytrf_rook: upper_4x4', function t() {
	let Av;

	const tc = findCase( 'upper_4x4' );
	const n = 4;
	const A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );

	// Column-major (i,j) packing of the upper triangle
	Av[ 0 ] = 4;
	Av[ 1 ] = 1; // (0,0)
	Av[ 8 ] = 1;
	Av[ 9 ] = 2; // (0,1)
	Av[ 10 ] = 5;
	Av[ 11 ] = -1; // (1,1)
	Av[ 16 ] = 3;
	Av[ 17 ] = -1; // (0,2)
	Av[ 18 ] = 2;
	Av[ 19 ] = 1; // (1,2)
	Av[ 20 ] = 7;
	Av[ 21 ] = 2; // (2,2)
	Av[ 24 ] = 0.5;
	Av[ 25 ] = 0.5; // (0,3)
	Av[ 26 ] = 1;
	Av[ 27 ] = -2; // (1,3)
	Av[ 28 ] = 3;
	Av[ 29 ] = 1; // (2,3)
	Av[ 30 ] = 6;
	Av[ 31 ] = -2; // (3,3)
	const IPIV = new Int32Array( n );
	const info = zsytrfRook( 'upper', n, A, 1, n, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 50 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_rook: lower_4x4', function t() {
	let Av;

	const tc = findCase( 'lower_4x4' );
	const n = 4;
	const A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );
	Av[ 0 ] = 4;
	Av[ 1 ] = 1; // (0,0)
	Av[ 2 ] = 1;
	Av[ 3 ] = 2; // (1,0)
	Av[ 4 ] = 3;
	Av[ 5 ] = -1; // (2,0)
	Av[ 6 ] = 0.5;
	Av[ 7 ] = 0.5; // (3,0)
	Av[ 10 ] = 5;
	Av[ 11 ] = -1; // (1,1)
	Av[ 12 ] = 2;
	Av[ 13 ] = 1; // (2,1)
	Av[ 14 ] = 1;
	Av[ 15 ] = -2; // (3,1)
	Av[ 20 ] = 7;
	Av[ 21 ] = 2; // (2,2)
	Av[ 22 ] = 3;
	Av[ 23 ] = 1; // (3,2)
	Av[ 30 ] = 6;
	Av[ 31 ] = -2; // (3,3)
	const IPIV = new Int32Array( n );
	const info = zsytrfRook( 'lower', n, A, 1, n, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 50 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-12, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_rook: n0 quick return', function t() {
	const A = new Complex128Array( 0 );
	const IPIV = new Int32Array( 0 );
	const info = zsytrfRook( 'lower', 0, A, 1, 1, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrf_rook: n1', function t() {
	const tc = findCase( 'n1' );
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const IPIV = new Int32Array( 1 );
	const info = zsytrfRook( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_rook: singular_upper (zero matrix)', function t() {
	const tc = findCase( 'singular_upper' );
	const n = 3;
	const A = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const info = zsytrfRook( 'upper', n, A, 1, n, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_rook: lower_6x6_indef', function t() {
	let Av, i;

	const tc = findCase( 'lower_6x6_indef' );
	const n = 6;
	const A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );

	// Column-major (i,j) lower-triangular nonzero entries (0-based):
	const entries = [
		[ 1, 0, 1, 0.5 ],
		[ 2, 0, 2, -1 ],
		[ 3, 0, 3, 1 ],
		[ 4, 0, 1, 0 ],
		[ 5, 0, 2, -1 ],
		[ 2, 1, 4, 1 ],
		[ 3, 1, 1, 0.5 ],
		[ 4, 1, 2, -1 ],
		[ 5, 1, 1, 1 ],
		[ 3, 2, 5, -2 ],
		[ 4, 2, 1, 0 ],
		[ 5, 2, 2, 1 ],
		[ 4, 3, 3, 1 ],
		[ 5, 3, 1, -1 ],
		[ 5, 4, 4, 0.5 ]
	];
	for ( i = 0; i < entries.length; i++ ) {
		Av[ ( ( entries[ i ][ 1 ] * n ) + entries[ i ][ 0 ] ) * 2 ] = entries[ i ][ 2 ];
		Av[ ( ( ( entries[ i ][ 1 ] * n ) + entries[ i ][ 0 ] ) * 2 ) + 1 ] = entries[ i ][ 3 ];
	}
	const IPIV = new Int32Array( n );
	const info = zsytrfRook( 'lower', n, A, 1, n, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 50 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-11, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

test( 'zsytrf_rook: upper_6x6_indef', function t() {
	let Av, i;

	const tc = findCase( 'upper_6x6_indef' );
	const n = 6;
	const A = new Complex128Array( n * n );
	Av = reinterpret( A, 0 );
	const entries = [
		[ 0, 1, 1, 0.5 ],
		[ 0, 2, 2, -1 ],
		[ 0, 3, 3, 1 ],
		[ 0, 4, 1, 0 ],
		[ 0, 5, 2, -1 ],
		[ 1, 2, 4, 1 ],
		[ 1, 3, 1, 0.5 ],
		[ 1, 4, 2, -1 ],
		[ 1, 5, 1, 1 ],
		[ 2, 3, 5, -2 ],
		[ 2, 4, 1, 0 ],
		[ 2, 5, 2, 1 ],
		[ 3, 4, 3, 1 ],
		[ 3, 5, 1, -1 ],
		[ 4, 5, 4, 0.5 ]
	];
	for ( i = 0; i < entries.length; i++ ) {
		Av[ ( ( entries[ i ][ 1 ] * n ) + entries[ i ][ 0 ] ) * 2 ] = entries[ i ][ 2 ];
		Av[ ( ( ( entries[ i ][ 1 ] * n ) + entries[ i ][ 0 ] ) * 2 ) + 1 ] = entries[ i ][ 3 ];
	}
	const IPIV = new Int32Array( n );
	const info = zsytrfRook( 'upper', n, A, 1, n, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	const expected = extractSubmatrix( tc.A, n, 50 );
	Av = reinterpret( A, 0 );
	assertArrayClose( toArray( Av ), expected, 1e-11, 'A' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
});

/**
* Build the dense complex symmetric N-by-N matrix used by the 40x40 blocked tests.
* Same arithmetic as the Fortran test (1-based input formulas).
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {boolean} upper - whether to fill the upper triangle (true) or lower (false)
* @param {boolean} indef - whether to zero the diagonal (forcing 2x2 pivots)
* @returns {Complex128Array} matrix
*/
function buildBlockedMatrix( N, upper, indef ) {
	let i1, j1, hi, lo, oi, i, j;
	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	for ( j = 0; j < N; j++ ) {
		if ( upper ) {
			lo = 0;
			hi = j;
		} else {
			lo = j + 1;
			hi = N - 1;
		}
		// Diagonal (only for non-indef cases): vary by index to avoid tied
		// Pivot magnitudes (Fortran/JS tie-breaking divergence).
		if ( !indef ) {
			oi = ( ( j * N ) + j ) * 2;
			j1 = j + 1;
			Av[ oi ] = ( 3 * N ) + j1;
			Av[ oi + 1 ] = 0.5 + ( 0.1 * j1 );
		}
		for ( i = lo; i <= hi; i++ ) {
			if ( i === j ) {
				continue;
			}
			oi = ( ( j * N ) + i ) * 2;
			i1 = i + 1;
			j1 = j + 1;
			if ( indef ) {
				Av[ oi ] = Math.sin( ( i1 * 0.7 ) + ( j1 * 1.3 ) );
				Av[ oi + 1 ] = Math.cos( ( i1 * 0.4 ) - ( j1 * 0.9 ) );
			} else {
				Av[ oi ] = ( ( ( i1 + j1 ) % 7 ) - 3 );
				Av[ oi + 1 ] = ( ( ( i1 * j1 ) % 5 ) - 2 );
			}
		}
	}
	return A;
}

test( 'zsytrf_rook: lower_40x40_blocked (N < NB = 64: unblocked, as in the reference)', function t() {
	let i;

	const N = 40;
	const tc = findCase( 'lower_40x40_blocked' );
	const A = buildBlockedMatrix( N, false, false );
	const IPIV = new Int32Array( N );
	const info = zsytrfRook( 'lower', N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	const Av = reinterpret( A, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		assert.ok( !Number.isNaN( Av[ i ] ), 'A[' + i + '] not NaN' );
	}
});

test( 'zsytrf_rook: upper_40x40_blocked (N < NB = 64: unblocked, as in the reference)', function t() {
	let i;

	const N = 40;
	const tc = findCase( 'upper_40x40_blocked' );
	const A = buildBlockedMatrix( N, true, false );
	const IPIV = new Int32Array( N );
	const info = zsytrfRook( 'upper', N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	const Av = reinterpret( A, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		assert.ok( !Number.isNaN( Av[ i ] ), 'A[' + i + '] not NaN' );
	}
});

test( 'zsytrf_rook: lower_40x40_indef_blocked (forces 2x2 pivots; N < NB = 64: unblocked, as in the reference)', function t() {
	let seen2x2, i;

	const N = 40;
	const tc = findCase( 'lower_40x40_indef_blocked' );
	const A = buildBlockedMatrix( N, false, true );
	const IPIV = new Int32Array( N );
	const info = zsytrfRook( 'lower', N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	seen2x2 = false;
	for ( i = 0; i < N; i++ ) {
		if ( IPIV[ i ] < 0 ) {
			seen2x2 = true;
		}
	}
	assert.ok( seen2x2, 'at least one 2x2 pivot encountered (negative IPIV entry)' );
});

test( 'zsytrf_rook: upper_40x40_indef_blocked (forces 2x2 pivots; N < NB = 64: unblocked, as in the reference)', function t() {
	let seen2x2, i;

	const N = 40;
	const tc = findCase( 'upper_40x40_indef_blocked' );
	const A = buildBlockedMatrix( N, true, true );
	const IPIV = new Int32Array( N );
	const info = zsytrfRook( 'upper', N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( 1280 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.deepEqual( toArray( IPIV ), convertIPIV( tc.ipiv ), 'ipiv' );
	seen2x2 = false;
	for ( i = 0; i < N; i++ ) {
		if ( IPIV[ i ] < 0 ) {
			seen2x2 = true;
		}
	}
	assert.ok( seen2x2, 'at least one 2x2 pivot encountered (negative IPIV entry)' );
});

test( 'zsytrf_rook: stride/offset support (lower)', function t() {

	// Place a 3x3 matrix at offset 2 inside a larger Complex128Array, with

	// IPIV at offset 1 with stride 2.
	const A = new Complex128Array( 2 + ( 3 * 3 ) );
	const Av = reinterpret( A, 0 );

	// Column 0
	Av[ ( 2 + 0 ) * 2 ] = 4.0;
	Av[ ( 2 + 1 ) * 2 ] = 1.0;
	Av[ ( ( 2 + 1 ) * 2 ) + 1 ] = -0.5;
	Av[ ( 2 + 2 ) * 2 ] = 0.5;
	Av[ ( ( 2 + 2 ) * 2 ) + 1 ] = 0.25;

	// Column 1
	Av[ ( 2 + 4 ) * 2 ] = 3.0;
	Av[ ( 2 + 5 ) * 2 ] = 0.5;
	Av[ ( ( 2 + 5 ) * 2 ) + 1 ] = -1;

	// Column 2
	Av[ ( 2 + 8 ) * 2 ] = 5.0;

	const IPIV = new Int32Array( 1 + ( 3 * 2 ) );
	const info = zsytrfRook( 'lower', 3, A, 1, 3, 2, IPIV, 2, 1, new Complex128Array( 96 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrf_rook: throws RangeError when it is given no WORK', function t() {
	const N = 40;
	const A = buildBlockedMatrix( N, false, false );
	const IPIV = new Int32Array( N );
	assert.throws( function throws() {
		zsytrfRook( 'lower', N, A, 1, N, 0, IPIV, 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'zsytrf_rook: throws RangeError when it is given an undersized WORK (below the minimum of 1)', function t() {
	const N = 40;
	const A = buildBlockedMatrix( N, true, false );
	const IPIV = new Int32Array( N );
	assert.throws( function throws() {
		zsytrfRook( 'upper', N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( 1 ), 1, 1 );
	}, RangeError );
	assert.throws( function throws() {
		zsytrfRook( 'upper', N, A, 1, N, 0, IPIV, 1, 0, new Complex128Array( 0 ), 1, 0 );
	}, RangeError );
});


// WORKSPACE REGRESSION (ticket 0100) //

/**
* Builds a dense indefinite symmetric test matrix (column-major, both triangles filled).
*
* ## Notes
*
* -   The matrix needs heavy rook pivoting (many 2x2 pivots with `p != k`), so the blocked path exercises the panel kernel's copy of column K into column P (ticket 0102).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} matrix
*/
function wsMatrix( N ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let idx, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = 2 * ( i + ( j * N ) );
			v[ idx ] = Math.sin( ( ( i + 1 ) * ( j + 1 ) ) + i + j );
			v[ idx + 1 ] = Math.cos( ( i * j ) + i + j );
		}
	}
	return A;
}

/**
* Returns the normwise relative residual `||A*x - b|| / ( ||A|| * ||x|| )` (infinity norms) for a full column-major `A`.
*
* @private
* @param {Float64Array} a - matrix (real view)
* @param {Float64Array} x - solution (real view)
* @param {Float64Array} b - right-hand side (real view)
* @param {NonNegativeInteger} N - order
* @returns {number} relative residual
*/
function wsResidual( a, x, b, N ) {
	let rr, ri, xm, am, rm, s, i, j, k;
	rm = 0.0;
	xm = 0.0;
	am = 0.0;
	for ( i = 0; i < N; i++ ) {
		rr = -b[ 2 * i ];
		ri = -b[ ( 2 * i ) + 1 ];
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			k = 2 * ( i + ( j * N ) );
			rr += ( a[ k ] * x[ 2 * j ] ) - ( a[ k + 1 ] * x[ ( 2 * j ) + 1 ] );
			ri += ( a[ k ] * x[ ( 2 * j ) + 1 ] ) + ( a[ k + 1 ] * x[ 2 * j ] );
			s += Math.abs( a[ k ] ) + Math.abs( a[ k + 1 ] );
		}
		am = Math.max( am, s );
		rm = Math.max( rm, Math.abs( rr ) + Math.abs( ri ) );
		xm = Math.max( xm, Math.abs( x[ 2 * i ] ) + Math.abs( x[ ( 2 * i ) + 1 ] ) );
	}
	return rm / ( am * xm );
}

/**
* Factors the test matrix with a WORK of the given length, solves `A*x = b` with the matching solver, and returns the solution and its residual.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} lwork - WORK length
* @returns {Object} solution (real view), relative residual, and the (real view of the) NaN-poisoned WORK after the factorization
*/
function wsSolve( uplo, N, lwork ) {
	const A0 = wsMatrix( N );
	const a = reinterpret( A0, 0 );
	const A = new Complex128Array( a );
	const B = new Complex128Array( N );
	const b = reinterpret( B, 0 );
	const ipiv = new Int32Array( N );
	let info, b0, W, w, i;
	for ( i = 0; i < N; i++ ) {
		b[ 2 * i ] = 1.0 + ( i / N );
		b[ ( 2 * i ) + 1 ] = 0.5 - ( i / N );
	}
	b0 = b.slice();
	W = new Complex128Array( lwork );
	w = reinterpret( W, 0 );
	for ( i = 0; i < w.length; i++ ) {
		w[ i ] = NaN; // poisoned: a read of unwritten WORK would spoil the solution
	}
	info = zsytrfRook( uplo, N, A, 1, N, 0, ipiv, 1, 0, W, 1, 0 );
	assert.equal( info, 0, 'info' );
	zsytrsRook( uplo, N, 1, A, 1, N, 0, ipiv, 1, 0, B, 1, N, 0 );
	return {
		'x': b,
		'residual': wsResidual( a, b, b0, N ),
		'work': w
	};
}

/**
* Asserts that a WORK of length `lwork` gives a solution with a small residual that agrees with the optimal-WORK solution.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} lwork - WORK length
*/
function wsCompare( N, lwork ) {
	const uplos = [ 'upper', 'lower' ];
	let opt, got, d, s, u, i;
	for ( u = 0; u < uplos.length; u++ ) {
		opt = wsSolve( uplos[ u ], N, N * 64 );
		got = wsSolve( uplos[ u ], N, lwork );
		assert.ok( opt.residual < 1e-11, uplos[ u ] + ': optimal-WORK residual ' + opt.residual );
		assert.ok( got.residual < 1e-11, uplos[ u ] + ': lwork=' + lwork + ' residual ' + got.residual );
		d = 0.0;
		s = 0.0;
		for ( i = 0; i < 2 * N; i++ ) {
			d = Math.max( d, Math.abs( got.x[ i ] - opt.x[ i ] ) );
			s = Math.max( s, Math.abs( opt.x[ i ] ) );
		}
		assert.ok( d / s < 1e-8, uplos[ u ] + ': solution differs from the optimal-WORK one by ' + ( d / s ) );
	}
}

test( 'zsytrf_rook: WORK of the reference minimum (1) past the blocking threshold falls back to the unblocked path (N = 70)', function t() {
	wsCompare( 70, 1 );
});

test( 'zsytrf_rook: an intermediate WORK (N*8) past the blocking threshold shrinks the block size (N = 70)', function t() {
	wsCompare( 70, 70 * 8 );
});

test( 'zsytrf_rook: a WORK just below the optimum (N*64 - 1) shrinks the block size to 63 (N = 70)', function t() {
	wsCompare( 70, ( 70 * 64 ) - 1 );
});

/**
* Asserts that factoring the test matrix with a NaN-poisoned WORK of length `lwork` takes the unblocked path: the unblocked kernel uses no workspace, so WORK is left untouched, and the solution's residual is small.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} lwork - WORK length
*/
function wsUntouched( N, lwork ) {
	const uplos = [ 'upper', 'lower' ];
	let got, u, i;
	for ( u = 0; u < uplos.length; u++ ) {
		got = wsSolve( uplos[ u ], N, lwork );
		assert.ok( got.residual < 1e-11, uplos[ u ] + ': residual ' + got.residual );
		for ( i = 0; i < got.work.length; i++ ) {
			assert.ok( Number.isNaN( got.work[ i ] ), uplos[ u ] + ': WORK[ ' + i + ' ] was written' );
		}
	}
}

test( 'zsytrf_rook: between the old block size (32) and the reference NB = ILAENV( 1 ) = 64, the optimal WORK takes the unblocked path, as in the reference, leaving WORK untouched (N = 50)', function t() {
	wsUntouched( 50, 50 * 64 );
});

test( 'zsytrf_rook: a WORK of N*7, below the reference NBMIN = ILAENV( 2 ) = 8, takes the unblocked path, leaving WORK untouched (N = 70)', function t() {
	wsUntouched( 70, 70 * 7 );
});
