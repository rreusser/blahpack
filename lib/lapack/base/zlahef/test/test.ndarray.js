// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zlahef from './../lib/ndarray.js';

// FIXTURES //

import lower_6x6_nb3 from './fixtures/lower_6x6_nb3.json' with { type: 'json' };
import upper_66_nb64 from './fixtures/upper_66_nb64.json' with { type: 'json' };
import upper_66_nb8 from './fixtures/upper_66_nb8.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Fortran IPIV (1-based; -p for a 2x2 block) to the JS convention (0-based; ~p, which is the same -p).
function convertIPIV( fipiv ) {
	return fipiv.map( ( p ) => ( ( p > 0 ) ? p - 1 : p ) );
}

function extractSubmatrix( data, n, lda ) {
	const out = [];
	let i, j;
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
	const kb = new Int32Array( 1 );

	const tc = lower_6x6_nb3;
	const n = 6;
	const nb = 3;

	// Same 6x6 lower Hermitian as Fortran test
	const A = new Complex128Array([
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
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'lower', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.equal( result, tc.info );
	assert.equal( kb[ 0 ], tc.kb );

	// Compare the A output for the factored columns (kb=2 columns)
	const expected = extractSubmatrix( tc.A, n, 6 );
	const Av = reinterpret( A, 0 );
	// Only compare the first kb columns and the updated trailing matrix
	assertArrayClose( Array.from( Av ), expected, 1e-12, 'A' );
});

test( 'zlahef: lower 6x6 nb=3 diag dominant (all 1x1 pivots)', function t() {
	const kb = new Int32Array( 1 );
	let i;

	const n = 6;
	const nb = 3;

	// Diagonally dominant lower Hermitian -> all 1x1 pivots
	const A = new Complex128Array([
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
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'lower', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.equal( result, 0 );
	assert.ok( kb[ 0 ] > 0, 'kb > 0' );
	assert.ok( kb[ 0 ] <= nb, 'kb <= nb' );

	// All 1x1 pivots: IPIV should be non-negative
	for ( i = 0; i < kb[ 0 ]; i++ ) {
		assert.ok( IPIV[ i ] >= 0, 'IPIV[' + i + '] >= 0 for 1x1 pivot' );
	}
});

test( 'zlahef: upper 6x6 nb=3 (upper triangle path)', function t() {
	const kb = new Int32Array( 1 );

	const n = 6;
	const nb = 3;

	// Upper Hermitian 6x6 diag dominant
	const A = new Complex128Array([
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
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'upper', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.equal( result, 0 );
	assert.ok( kb[ 0 ] > 0, 'kb > 0' );
});

test( 'zlahef: upper 6x6 nb=3 with 2x2 pivots', function t() {
	const kb = new Int32Array( 1 );

	const n = 6;
	const nb = 3;

	// Upper Hermitian with small diagonal at (4,4) and (5,5) to force 2x2 pivots
	const A = new Complex128Array([
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
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'upper', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result >= 0 );
	assert.ok( kb[ 0 ] > 0 );
});

test( 'zlahef: lower 6x6 nb=2 with 1x1 interchange pivot', function t() {
	const kb = new Int32Array( 1 );
	// Force 1x1 pivot with interchange (kp != k) in lower

	const n = 6;
	const nb = 2;

	// Small diagonal at (0,0), large off-diag -> interchange
	const A = new Complex128Array([
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
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'lower', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result >= 0 );
	assert.ok( kb[ 0 ] > 0 );
});

test( 'zlahef: upper 8x8 nb=3 with interchanges', function t() {
	const kb = new Int32Array( 1 );
	// Larger upper matrix to exercise the trailing update and pending row swaps

	const n = 8;
	const nb = 3;

	// Upper Hermitian 8x8 with small corners
	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	let i, j;
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

	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'upper', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result >= 0 );
	assert.ok( kb[ 0 ] > 0 );
	assert.ok( kb[ 0 ] <= nb + 1, 'kb should be at most nb+1' );
});

test( 'zlahef: lower 8x8 nb=3 with interchanges', function t() {
	const kb = new Int32Array( 1 );

	const n = 8;
	const nb = 3;

	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	let i, j;
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

	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'lower', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result >= 0 );
	assert.ok( kb[ 0 ] > 0 );
});

test( 'zlahef: lower singular column', function t() {
	const kb = new Int32Array( 1 );

	const n = 4;
	const nb = 2;

	// Lower with zero first column
	const A = new Complex128Array([
		// col 0
		0, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		0, 0,  5, 0,  1, -1,  0.5, 0.5,
		// col 2
		0, 0,  0, 0,  3, 0,  1, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  2, 0
	]);
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'lower', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result > 0, 'singular should have info > 0' );
});

test( 'zlahef: upper singular column', function t() {
	const kb = new Int32Array( 1 );

	const n = 4;
	const nb = 2;

	// Upper with zero last column's diagonal
	const A = new Complex128Array([
		// col 0
		5, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		1, 1,  3, 0,  0, 0,  0, 0,
		// col 2
		0.5, -0.5,  1, 0,  2, 0,  0, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  0, 0
	]);
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'upper', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result > 0, 'singular should have info > 0' );
});

test( 'zlahef: lower with imax < N-1 branch (rowmax scan)', function t() {
	const kb = new Int32Array( 1 );
	// In lower, when imax < N-1, another izamax scan happens for the lower part

	const n = 6;
	const nb = 2;

	// Small A(0,0), large A(2,0) so imax=2, and imax < N-1=5
	// so the imax < N-1 branch fires for the second rowmax scan
	const A = new Complex128Array([
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
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );

	const result = zlahef( 'lower', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );

	assert.ok( result >= 0 );
	assert.ok( kb[ 0 ] > 0 );
});

test( 'zlahef: upper 5x5 nb=3 updates the leading block to the Schur complement', function t() {
	const kb = new Int32Array( 1 );
	const n = 5;
	const nb = 3;
	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	const W = new Complex128Array( n * nb );
	const IPIV = new Int32Array( n );
	const S = [];
	let sRe;
	let sIm;
	let aRe;
	let aIm;
	let bRe;
	let bIm;
	let d;
	let i;
	let j;
	let k;

	// Hermitian, diagonally dominant (1x1 pivots, no interchanges); the trailing 2x2 block A22 is diagonal.
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < j; i++ ) {
			Av[ ( ( j * n ) + i ) * 2 ] = 0.5 + ( 0.25 * i ) - ( 0.125 * j );
			Av[ ( ( ( j * n ) + i ) * 2 ) + 1 ] = 0.3 - ( 0.2 * i ) + ( 0.1 * j );
		}
		Av[ ( ( j * n ) + j ) * 2 ] = 10.0 + j;
	}
	Av[ ( ( 4 * n ) + 3 ) * 2 ] = 0.0;
	Av[ ( ( ( 4 * n ) + 3 ) * 2 ) + 1 ] = 0.0;

	// Schur complement of A22 = diag(d3, d4): S(i,j) = A(i,j) - sum_k A(i,k) * conj(A(j,k)) / d_k, for i <= j < 3.
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			sRe = Av[ ( ( j * n ) + i ) * 2 ];
			sIm = Av[ ( ( ( j * n ) + i ) * 2 ) + 1 ];
			for ( k = 3; k < n; k++ ) {
				d = Av[ ( ( k * n ) + k ) * 2 ];
				aRe = Av[ ( ( k * n ) + i ) * 2 ];
				aIm = Av[ ( ( ( k * n ) + i ) * 2 ) + 1 ];
				bRe = Av[ ( ( k * n ) + j ) * 2 ];
				bIm = -Av[ ( ( ( k * n ) + j ) * 2 ) + 1 ];
				sRe -= ( ( aRe * bRe ) - ( aIm * bIm ) ) / d;
				sIm -= ( ( aRe * bIm ) + ( aIm * bRe ) ) / d;
			}
			S.push( [ i, j, sRe, ( i === j ) ? 0.0 : sIm ] );
		}
	}

	const result = zlahef( 'upper', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, W, 1, n, 0 );
	assert.equal( result, 0, 'info' );
	assert.equal( kb[ 0 ], 2, 'kb' );
	assert.deepEqual( Array.from( IPIV.slice( 3 ) ), [ 3, 4 ], 'no interchanges' );
	for ( k = 0; k < S.length; k++ ) {
		i = S[ k ][ 0 ];
		j = S[ k ][ 1 ];
		assertClose( Av[ ( ( j * n ) + i ) * 2 ], S[ k ][ 2 ], 1e-14, 'S re(' + i + ',' + j + ')' );
		assertClose( Av[ ( ( ( j * n ) + i ) * 2 ) + 1 ], S[ k ][ 3 ], 1e-14, 'S im(' + i + ',' + j + ')' );
	}
});

// The seeded LCG input of test/fortran/test_zlahef.f90 (and test_zhetrf.f90):
// the upper triangle of an N-by-N Hermitian matrix, column by column, entries
// in [-0.5, 0.5), real diagonal.
function lcgHermitianUpper( n, seed ) {
	const A = new Complex128Array( n * n );
	const Av = reinterpret( A, 0 );
	let x = seed;
	let i;
	let j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			x = ( x * 16807 ) % 2147483647;
			Av[ 2 * ( ( j * n ) + i ) ] = ( x / 2147483647 ) - 0.5;
			x = ( x * 16807 ) % 2147483647;
			Av[ ( 2 * ( ( j * n ) + i ) ) + 1 ] = ( i === j ) ? 0.0 : ( x / 2147483647 ) - 0.5;
		}
	}
	return A;
}

for ( const tc of [ upper_66_nb64, upper_66_nb8 ] ) {
	test( 'zlahef: ' + tc.name + ' matches the reference\'s kb, pivots and A (upper row max covers rows imax+1..k; ticket 0108)', function t() {
		const n = tc.n;
		const nb = tc.nb;
		const kb = new Int32Array( 1 );
		const A = lcgHermitianUpper( n, 1 );
		const IPIV = new Int32Array( n );
		const info = zlahef( 'upper', n, nb, kb, A, 1, n, 0, IPIV, 1, 0, new Complex128Array( n * nb ), 1, n, 0 );
		assert.equal( info, tc.info, 'info' );
		assert.equal( kb[ 0 ], tc.kb, 'kb' );
		assert.deepEqual( Array.from( IPIV.slice( n - tc.kb ) ), convertIPIV( tc.ipiv.slice( n - tc.kb ) ), 'ipiv' );
		assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	});
}
