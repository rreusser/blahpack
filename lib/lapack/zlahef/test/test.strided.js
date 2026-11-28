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
import lower_66_nb64 from './fixtures/lower_66_nb64.json' with { type: 'json' };
import lower_66_nb8 from './fixtures/lower_66_nb8.json' with { type: 'json' };
import lower_66_nb2 from './fixtures/lower_66_nb2.json' with { type: 'json' };
import upper_66_nb2 from './fixtures/upper_66_nb2.json' with { type: 'json' };
import lower_9_nb9 from './fixtures/lower_9_nb9.json' with { type: 'json' };
import upper_9_nb9 from './fixtures/upper_9_nb9.json' with { type: 'json' };
import lower_9_nb12 from './fixtures/lower_9_nb12.json' with { type: 'json' };
import upper_9_nb12 from './fixtures/upper_9_nb12.json' with { type: 'json' };
import lower_12_nb12_zero from './fixtures/lower_12_nb12_zero.json' with { type: 'json' };
import upper_12_nb12_zero from './fixtures/upper_12_nb12_zero.json' with { type: 'json' };
import lower_20_nb20_smalldiag from './fixtures/lower_20_nb20_smalldiag.json' with { type: 'json' };
import upper_20_nb20_smalldiag from './fixtures/upper_20_nb20_smalldiag.json' with { type: 'json' };
import lower_30_nb7_smalldiag from './fixtures/lower_30_nb7_smalldiag.json' with { type: 'json' };
import upper_30_nb7_smalldiag from './fixtures/upper_30_nb7_smalldiag.json' with { type: 'json' };
import lower_12_nb12_zero_dirty from './fixtures/lower_12_nb12_zero_dirty.json' with { type: 'json' };
import upper_12_nb12_zero_dirty from './fixtures/upper_12_nb12_zero_dirty.json' with { type: 'json' };
import lower_30_nb7_dirty from './fixtures/lower_30_nb7_dirty.json' with { type: 'json' };
import upper_30_nb7_dirty from './fixtures/upper_30_nb7_dirty.json' with { type: 'json' };
import lower_12_nb12_big1 from './fixtures/lower_12_nb12_big1.json' with { type: 'json' };
import lower_12_nb6_big1 from './fixtures/lower_12_nb6_big1.json' with { type: 'json' };
import lower_tie_absakk from './fixtures/lower_tie_absakk.json' with { type: 'json' };
import upper_tie_absakk from './fixtures/upper_tie_absakk.json' with { type: 'json' };
import lower_tie_rowmax from './fixtures/lower_tie_rowmax.json' with { type: 'json' };
import upper_tie_rowmax from './fixtures/upper_tie_rowmax.json' with { type: 'json' };
import lower_tie_aimax from './fixtures/lower_tie_aimax.json' with { type: 'json' };
import upper_tie_aimax from './fixtures/upper_tie_aimax.json' with { type: 'json' };
import lower_rowmax_last from './fixtures/lower_rowmax_last.json' with { type: 'json' };
import upper_rowmax_last from './fixtures/upper_rowmax_last.json' with { type: 'json' };
import lower_rowmax_mid from './fixtures/lower_rowmax_mid.json' with { type: 'json' };
import upper_rowmax_mid from './fixtures/upper_rowmax_mid.json' with { type: 'json' };
import lower_imax_last from './fixtures/lower_imax_last.json' with { type: 'json' };
import upper_imax_last from './fixtures/upper_imax_last.json' with { type: 'json' };
import lower_tie_absakk_k1 from './fixtures/lower_tie_absakk_k1.json' with { type: 'json' };
import upper_tie_absakk_k2 from './fixtures/upper_tie_absakk_k2.json' with { type: 'json' };

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

// The full Hermitian LCG matrix of test/fortran/test_zlahef.f90's `lcg_case`
// (column-major, dense): both triangles filled, the diagonal's real part
// scaled by `o.dscale` and its imaginary part set to `o.dimag` (which
// ZLAHEF must ignore), rows/columns `o.z` (1-based) zeroed, and A(2,2) set
// to `o.big1` when it is nonzero.
function lcgHermitianFull( n, o ) {
	const A = new Float64Array( 2 * n * n );
	let re;
	let im;
	let x = 1;
	let i;
	let j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			x = ( x * 16807 ) % 2147483647;
			re = ( x / 2147483647 ) - 0.5;
			x = ( x * 16807 ) % 2147483647;
			im = ( x / 2147483647 ) - 0.5;
			if ( i === j ) {
				A[ 2 * ( ( j * n ) + i ) ] = re * o.dscale;
				A[ ( 2 * ( ( j * n ) + i ) ) + 1 ] = o.dimag;
			} else {
				A[ 2 * ( ( j * n ) + i ) ] = re;
				A[ ( 2 * ( ( j * n ) + i ) ) + 1 ] = im;
				A[ 2 * ( ( i * n ) + j ) ] = re;
				A[ ( 2 * ( ( i * n ) + j ) ) + 1 ] = -im;
			}
		}
	}
	for ( i = 0; i < n; i++ ) {
		if ( o.z.includes( i + 1 ) ) {
			for ( j = 0; j < n; j++ ) {
				A[ 2 * ( ( j * n ) + i ) ] = 0.0;
				A[ ( 2 * ( ( j * n ) + i ) ) + 1 ] = 0.0;
				A[ 2 * ( ( i * n ) + j ) ] = 0.0;
				A[ ( 2 * ( ( i * n ) + j ) ) + 1 ] = 0.0;
			}
			A[ ( 2 * ( ( i * n ) + i ) ) + 1 ] = o.dimag;
		}
	}
	if ( o.big1 !== 0.0 ) {
		A[ 2 * ( n + 1 ) ] = o.big1;
	}
	return A;
}

// The 4x4 real symmetric matrices of `tie_case` (diag = A11..A44, off =
// A21, A31, A41, A32, A42, A43); the upper case is the matrix reversed.
function tieMatrix( diag, off, reversed ) {
	const M = [
		[ diag[ 0 ], off[ 0 ], off[ 1 ], off[ 2 ] ],
		[ off[ 0 ], diag[ 1 ], off[ 3 ], off[ 4 ] ],
		[ off[ 1 ], off[ 3 ], diag[ 2 ], off[ 5 ] ],
		[ off[ 2 ], off[ 4 ], off[ 5 ], diag[ 3 ] ]
	];
	const A = new Float64Array( 32 );
	let i;
	let j;
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			A[ 2 * ( ( j * 4 ) + i ) ] = ( reversed ) ? M[ 3 - i ][ 3 - j ] : M[ i ][ j ];
		}
	}
	return A;
}

// Runs one fixture case with A (LDA = N + 2, one spare column) and W
// (LDW = N + 2, one spare column) inside buffers whose unused elements hold
// distinct sentinels, and IPIV at offset 1 inside sentinels; checks info, kb,
// IPIV and A against the reference and that no sentinel changed.
function checkCase( tc, Adense, padded ) {
	const uplo = ( tc.name.startsWith( 'upper' ) ) ? 'upper' : 'lower';
	const n = tc.n;
	const nb = tc.nb;
	const lda = ( padded ) ? n + 2 : n;
	const ldw = ( padded ) ? n + 2 : n;
	const po = ( padded ) ? 1 : 0;
	const A = new Complex128Array( lda * ( n + po ) );
	const W = new Complex128Array( ldw * ( nb + po ) );
	const IPIV = new Int32Array( n + ( 2 * po ) );
	const Av = reinterpret( A, 0 );
	const Wv = reinterpret( W, 0 );
	const isA = new Uint8Array( Av.length );
	const lo = ( uplo === 'upper' ) ? n - tc.kb : 0;
	const hi = ( uplo === 'upper' ) ? n : tc.kb;
	let i;
	let j;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = 1000.0 + i;
	}
	for ( i = 0; i < Wv.length; i++ ) {
		Wv[ i ] = -2000.0 - i;
	}
	for ( i = 0; i < IPIV.length; i++ ) {
		IPIV[ i ] = 777;
	}
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			Av[ 2 * ( ( j * lda ) + i ) ] = Adense[ 2 * ( ( j * n ) + i ) ];
			Av[ ( 2 * ( ( j * lda ) + i ) ) + 1 ] = Adense[ ( 2 * ( ( j * n ) + i ) ) + 1 ];
			isA[ 2 * ( ( j * lda ) + i ) ] = 1;
			isA[ ( 2 * ( ( j * lda ) + i ) ) + 1 ] = 1;
		}
	}
	const kb = new Int32Array( 1 );
	const info = zlahef( uplo, n, nb, kb, A, 1, lda, 0, IPIV, 1, po, W, 1, ldw, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( kb[ 0 ], tc.kb, 'kb' );
	assert.deepEqual( Array.from( IPIV.slice( po + lo, po + hi ) ), convertIPIV( tc.ipiv.slice( lo, hi ) ), 'ipiv' );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < n; i++ ) {
			assertClose( Av[ 2 * ( ( j * lda ) + i ) ], tc.A[ 2 * ( ( j * n ) + i ) ], 1e-12, 'A re(' + i + ',' + j + ')' );
			assertClose( Av[ ( 2 * ( ( j * lda ) + i ) ) + 1 ], tc.A[ ( 2 * ( ( j * n ) + i ) ) + 1 ], 1e-12, 'A im(' + i + ',' + j + ')' );
		}
		// The reference's diagonal is exactly real.
		assert.equal( Av[ ( 2 * ( ( j * lda ) + j ) ) + 1 ], 0.0, 'A im(' + j + ',' + j + ') is exactly 0' );
	}
	if ( !padded ) {
		return;
	}
	for ( i = 0; i < Av.length; i++ ) {
		if ( !isA[ i ] ) {
			assert.equal( Av[ i ], 1000.0 + i, 'A sentinel ' + i );
		}
	}
	for ( j = 0; j < nb + 1; j++ ) {
		for ( i = 2 * n; i < 2 * ldw; i++ ) {
			assert.equal( Wv[ ( 2 * j * ldw ) + i ], -2000.0 - ( ( 2 * j * ldw ) + i ), 'W sentinel row ' + ( i >> 1 ) + ' col ' + j );
		}
	}
	for ( i = 2 * ldw * nb; i < Wv.length; i++ ) {
		assert.equal( Wv[ i ], -2000.0 - i, 'W sentinel ' + i );
	}
	assert.equal( IPIV[ 0 ], 777, 'IPIV sentinel before' );
	assert.equal( IPIV[ n + 1 ], 777, 'IPIV sentinel after' );
	for ( i = 0; i < n; i++ ) {
		if ( i < lo || i >= hi ) {
			assert.equal( IPIV[ po + i ], 777, 'IPIV[' + i + '] outside the factored columns is untouched' );
		}
	}
}

const ALPHA = ( 1.0 + Math.sqrt( 17.0 ) ) / 8.0;
const LCG = [
	[ lower_66_nb64, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_66_nb8, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_66_nb2, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ upper_66_nb2, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_9_nb9, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ upper_9_nb9, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_9_nb12, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ upper_9_nb12, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_12_nb12_zero, { 'dscale': 1.0, 'dimag': 0.0, 'z': [ 3, 12 ], 'big1': 0.0 } ],
	[ upper_12_nb12_zero, { 'dscale': 1.0, 'dimag': 0.0, 'z': [ 1, 10 ], 'big1': 0.0 } ],
	[ lower_20_nb20_smalldiag, { 'dscale': 1e-3, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ upper_20_nb20_smalldiag, { 'dscale': 1e-3, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_30_nb7_smalldiag, { 'dscale': 1e-3, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ upper_30_nb7_smalldiag, { 'dscale': 1e-3, 'dimag': 0.0, 'z': [], 'big1': 0.0 } ],
	[ lower_12_nb12_zero_dirty, { 'dscale': 1.0, 'dimag': 0.3, 'z': [ 3, 12 ], 'big1': 0.0 } ],
	[ upper_12_nb12_zero_dirty, { 'dscale': 1.0, 'dimag': 0.3, 'z': [ 1, 10 ], 'big1': 0.0 } ],
	[ lower_30_nb7_dirty, { 'dscale': 1.0, 'dimag': 0.3, 'z': [], 'big1': 0.0 } ],
	[ upper_30_nb7_dirty, { 'dscale': 1.0, 'dimag': 0.3, 'z': [], 'big1': 0.0 } ],
	[ lower_12_nb12_big1, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 5.0 } ],
	[ lower_12_nb6_big1, { 'dscale': 1.0, 'dimag': 0.0, 'z': [], 'big1': 5.0 } ]
];
const TIES = [
	[ lower_tie_absakk, upper_tie_absakk, [ ALPHA, 3.0, 3.0, 3.0 ], [ 1.0, 0.5, 0.25, 0.1, 0.2, 0.3 ] ],
	[ lower_tie_rowmax, upper_tie_rowmax, [ 0.5 * ALPHA, 3.0, 3.0, 3.0 ], [ 1.0, 0.5, 0.25, 2.0, 0.2, 0.3 ] ],
	[ lower_tie_aimax, upper_tie_aimax, [ 0.1, 2.0 * ALPHA, 3.0, 3.0 ], [ 1.0, 0.5, 0.25, 2.0, 0.2, 0.3 ] ],
	[ lower_rowmax_last, upper_rowmax_last, [ 0.1, 1.5 * ALPHA, 3.0, 3.0 ], [ 1.0, 0.05, 0.05, 0.1, 2.0, 0.3 ] ],
	[ lower_rowmax_mid, upper_rowmax_mid, [ 0.1, 1.5 * ALPHA, 3.0, 3.0 ], [ 1.0, 0.05, 0.05, 2.0, 0.1, 0.3 ] ],
	[ lower_imax_last, upper_imax_last, [ 0.3, 3.0, 3.0, 4.0 ], [ 0.1, 0.1, 1.0, 0.1, 0.1, 0.1 ] ]
];

for ( const [ tc, o ] of LCG ) {
	for ( const padded of [ false, true ] ) {
		test( 'zlahef: ' + tc.name + ( ( padded ) ? ' (padded LDA/LDW, sentinels)' : '' ) + ' matches the reference\'s info, kb, pivots and A (full Hermitian LCG; ticket 0110)', function t() {
			checkCase( tc, lcgHermitianFull( tc.n, o ), padded );
		});
	}
}

for ( const [ lower, upper, diag, off ] of TIES ) {
	for ( const padded of [ false, true ] ) {
		test( 'zlahef: ' + lower.name + ( ( padded ) ? ' (padded)' : '' ) + ' matches the reference at a pivot-test tie or row-max edge (ticket 0110)', function t() {
			checkCase( lower, tieMatrix( diag, off, false ), padded );
		});
		test( 'zlahef: ' + upper.name + ( ( padded ) ? ' (padded)' : '' ) + ' matches the reference at a pivot-test tie or row-max edge (ticket 0110)', function t() {
			checkCase( upper, tieMatrix( diag, off, true ), padded );
		});
	}
}

// 4x4 Hermitian inputs of test_zlahef.f90's `raw_case`, found by search: the
// second pivot step is an exact tie ABSAKK = ALPHA*COLMAX after a 1x1 update,
// and rounding leaves the row max just below COLMAX, so `>=` and `>` pick
// different pivots there (ticket 0110).
const RAW_TIE_LOWER = [
	2.959842059509755, 0.0, 0.011936738859832596, 0.3792299827929726,
	0.18228935528653178, 0.26280569926034925, -0.27273628011938944, -0.1213400334219169,
	0.011936738859832596, -0.3792299827929726, 0.41210063273976305, 0.0,
	0.024612531310232555, 0.3371862689206313, 0.3619417221573842, -0.15452429915523358,
	0.18228935528653178, -0.26280569926034925, 0.024612531310232555, -0.3371862689206313,
	2.9103782509501923, 0.0, 0.08989590201056374, 0.11957490845563584,
	-0.27273628011938944, 0.1213400334219169, 0.3619417221573842, 0.15452429915523358,
	0.08989590201056374, -0.11957490845563584, 3.30451358612837, 0.0
];
const RAW_TIE_UPPER = [
	3.1367260965689674, 0.0, -0.04449496536724967, -0.17311707263491916,
	0.19869986302158793, 0.45140219617234645, 0.17277548679745547, 0.16239339516609602,
	-0.04449496536724967, 0.17311707263491916, 2.578639775085561, 0.0,
	0.2832889313731757, -0.23706958896344044, -0.34579255657540287, -0.26450163720385245,
	0.19869986302158793, -0.45140219617234645, 0.2832889313731757, 0.23706958896344044,
	0.47669382259612747, 0.0, 0.47901648514858286, 0.1699341077683187,
	0.17277548679745547, -0.16239339516609602, -0.34579255657540287, 0.26450163720385245,
	0.47901648514858286, -0.1699341077683187, 2.59455135049976, 0.0
];

for ( const [ tc, raw ] of [ [ lower_tie_absakk_k1, RAW_TIE_LOWER ], [ upper_tie_absakk_k2, RAW_TIE_UPPER ] ] ) {
	test( 'zlahef: ' + tc.name + ' matches the reference at an exact ABSAKK = ALPHA*COLMAX tie after an update (ticket 0110)', function t() {
		checkCase( tc, new Float64Array( raw ), false );
	});
}
