// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahef from './../lib/ndarray.js';

// FIXTURES //

import lower_6x6_nb3 from './fixtures/lower_6x6_nb3.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function extractSubmatrix( data, n, lda ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			out.push( data[ (j * lda * 2) + (i * 2) ] );
			out.push( data[ (j * lda * 2) + (i * 2) + 1 ] );
		}
	}
	return out;
}

// TESTS //

test( 'zlahef: lower_6x6_nb3 (2x2 pivot in lower, fixture)', function t() {
	var expected;
	var result;
	var IPIV;
	var tc;
	var Av;
	var A;
	var W;
	var n;
	var nb;

	tc = lower_6x6_nb3;
	n = 6;
	nb = 3;

	// Same 6x6 lower Hermitian as Fortran test
	A = new Complex128Array([
		// col 0
		0.01, 0,  5, -1,  1, 1,  0.5, -0.5,  2, 0,  1, -1,
		// col 1
		0, 0,  0.02, 0,  2, -1,  1, 1,  1.5, -0.5,  0, -3,
		// col 2
		0, 0,  0, 0,  8, 0,  3, 0,  0, 2,  1, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  7, 0,  1, 0.5,  2, -2,
		// col 4
		0, 0,  0, 0,  0, 0,  0, 0,  6, 0,  0.5, 1,
		// col 5
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  5, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'lower', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.equal( result.info, tc.info );
	assert.equal( result.kb, tc.kb );

	// Compare the A output for the factored columns (kb=2 columns)
	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	// Only compare the first kb columns and the updated trailing matrix
	assertArrayClose( Array.from( Av ), expected, 1e-12, 'A' );
});

test( 'zlahef: lower 6x6 nb=3 diag dominant (all 1x1 pivots)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;
	var i;

	n = 6;
	nb = 3;

	// Diagonally dominant lower Hermitian -> all 1x1 pivots
	A = new Complex128Array([
		// col 0
		100, 0,  1, -1,  0.5, 0.5,  0.3, -0.3,  0.2, 0.2,  0.1, -0.1,
		// col 1
		0, 0,  100, 0,  1, -0.5,  0.4, 0.4,  0.3, -0.3,  0.2, 0.2,
		// col 2
		0, 0,  0, 0,  100, 0,  0.5, 0,  0.4, -0.4,  0.3, 0.3,
		// col 3
		0, 0,  0, 0,  0, 0,  100, 0,  0.5, 0.5,  0.4, -0.4,
		// col 4
		0, 0,  0, 0,  0, 0,  0, 0,  100, 0,  0.5, 0.5,
		// col 5
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  100, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'lower', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.equal( result.info, 0 );
	assert.ok( result.kb > 0, 'kb > 0' );
	assert.ok( result.kb <= nb, 'kb <= nb' );

	// All 1x1 pivots: IPIV should be non-negative
	for ( i = 0; i < result.kb; i++ ) {
		assert.ok( IPIV[ i ] >= 0, 'IPIV[' + i + '] >= 0 for 1x1 pivot' );
	}
});

test( 'zlahef: upper 6x6 nb=3 (upper triangle path)', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 6;
	nb = 3;

	// Upper Hermitian 6x6 diag dominant
	A = new Complex128Array([
		// col 0
		100, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		1, 1,  100, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		// col 2
		0.5, -0.5,  1, -0.5,  100, 0,  0, 0,  0, 0,  0, 0,
		// col 3
		0.3, 0.3,  0.4, 0.4,  0.5, 0,  100, 0,  0, 0,  0, 0,
		// col 4
		0.2, -0.2,  0.3, 0.3,  0.4, -0.4,  0.5, 0.5,  100, 0,  0, 0,
		// col 5
		0.1, 0.1,  0.2, -0.2,  0.3, 0.3,  0.4, -0.4,  0.5, 0.5,  100, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'upper', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.equal( result.info, 0 );
	assert.ok( result.kb > 0, 'kb > 0' );
});

test( 'zlahef: upper 6x6 nb=3 with 2x2 pivots', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 6;
	nb = 3;

	// Upper Hermitian with small diagonal at (4,4) and (5,5) to force 2x2 pivots
	A = new Complex128Array([
		// col 0
		10, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		0.5, 0.5,  10, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		// col 2
		0.3, -0.3,  0.4, 0.4,  10, 0,  0, 0,  0, 0,  0, 0,
		// col 3
		0.2, 0.1,  0.1, -0.2,  0.5, 0,  10, 0,  0, 0,  0, 0,
		// col 4
		1, 1,  2, -1,  3, 0.5,  1.5, -0.5,  0.01, 0,  0, 0,
		// col 5
		2, -1,  1, 1,  0.5, 0.5,  2, 0,  5, 1,  0.02, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'upper', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info >= 0 );
	assert.ok( result.kb > 0 );
});

test( 'zlahef: lower 6x6 nb=2 with 1x1 interchange pivot', function t() {
	// Force 1x1 pivot with interchange (kp != k) in lower
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 6;
	nb = 2;

	// Small diagonal at (0,0), large off-diag -> interchange
	A = new Complex128Array([
		// col 0
		0.01, 0,  5, -1,  1, 1,  0.5, -0.5,  2, 0,  1, -1,
		// col 1
		0, 0,  100, 0,  2, -1,  1, 1,  1.5, -0.5,  0, -3,
		// col 2
		0, 0,  0, 0,  100, 0,  3, 0,  0, 2,  1, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  100, 0,  1, 0.5,  2, -2,
		// col 4
		0, 0,  0, 0,  0, 0,  0, 0,  100, 0,  0.5, 1,
		// col 5
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  100, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'lower', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info >= 0 );
	assert.ok( result.kb > 0 );
});

test( 'zlahef: upper 8x8 nb=3 with interchanges', function t() {
	// Larger upper matrix to exercise the trailing update and pending row swaps
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 8;
	nb = 3;

	// Upper Hermitian 8x8 with small corners
	A = new Complex128Array( n * n );
	var Av = reinterpret( A, 0 );
	var i;
	var j;
	// Fill upper triangle
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				Av[ (j * n + i) * 2 ] = ( i < 2 ) ? 0.01 : 10;
				Av[ (j * n + i) * 2 + 1 ] = 0;
			} else {
				Av[ (j * n + i) * 2 ] = (j - i) * 0.5 + 0.1;
				Av[ (j * n + i) * 2 + 1 ] = (j - i) * 0.3 - 0.2;
			}
		}
	}

	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'upper', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info >= 0 );
	assert.ok( result.kb > 0 );
	assert.ok( result.kb <= nb + 1, 'kb should be at most nb+1' );
});

test( 'zlahef: lower 8x8 nb=3 with interchanges', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 8;
	nb = 3;

	A = new Complex128Array( n * n );
	var Av = reinterpret( A, 0 );
	var i;
	var j;
	// Fill lower triangle with small diagonal at start
	for ( j = 0; j < n; j++ ) {
		for ( i = j; i < n; i++ ) {
			if ( i === j ) {
				Av[ (j * n + i) * 2 ] = ( j < 2 ) ? 0.01 : 10;
				Av[ (j * n + i) * 2 + 1 ] = 0;
			} else {
				Av[ (j * n + i) * 2 ] = (i - j) * 0.5 + 0.1;
				Av[ (j * n + i) * 2 + 1 ] = (i - j) * 0.3 - 0.2;
			}
		}
	}

	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'lower', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info >= 0 );
	assert.ok( result.kb > 0 );
});

test( 'zlahef: lower singular column', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 4;
	nb = 2;

	// Lower with zero first column
	A = new Complex128Array([
		// col 0
		0, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		0, 0,  5, 0,  1, -1,  0.5, 0.5,
		// col 2
		0, 0,  0, 0,  3, 0,  1, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  2, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'lower', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info > 0, 'singular should have info > 0' );
});

test( 'zlahef: upper singular column', function t() {
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 4;
	nb = 2;

	// Upper with zero last column's diagonal
	A = new Complex128Array([
		// col 0
		5, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		1, 1,  3, 0,  0, 0,  0, 0,
		// col 2
		0.5, -0.5,  1, 0,  2, 0,  0, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  0, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'upper', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info > 0, 'singular should have info > 0' );
});

test( 'zlahef: lower with imax < N-1 branch (rowmax scan)', function t() {
	// In lower, when imax < N-1, another izamax scan happens for the lower part
	var result;
	var IPIV;
	var A;
	var W;
	var n;
	var nb;

	n = 6;
	nb = 2;

	// Small A(0,0), large A(2,0) so imax=2, and imax < N-1=5
	// so the imax < N-1 branch fires for the second rowmax scan
	A = new Complex128Array([
		// col 0
		0.01, 0,  0.5, -0.5,  5, -1,  0.5, 0.5,  0.3, -0.3,  0.2, 0.2,
		// col 1
		0, 0,  10, 0,  0.4, 0.4,  0.3, -0.3,  0.2, 0.2,  0.1, -0.1,
		// col 2
		0, 0,  0, 0,  0.01, 0,  1, 1,  2, -0.5,  1.5, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  10, 0,  0.5, 0.5,  0.4, -0.4,
		// col 4
		0, 0,  0, 0,  0, 0,  0, 0,  10, 0,  0.5, 0.5,
		// col 5
		0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  10, 0
	]);
	W = new Complex128Array( n * nb );
	IPIV = new Int32Array( n );

	result = zlahef( 'lower', n, nb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result.info >= 0 );
	assert.ok( result.kb > 0 );
});
