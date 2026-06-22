// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetf2 from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import singular_upper from './fixtures/singular_upper.json' with { type: 'json' };
import lower_6x6 from './fixtures/lower_6x6.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Convert Fortran IPIV (1-based) to JS IPIV (0-based).
* Positive values: subtract 1
* Negative values: stay the same (already encodes ~(p-1))
*/
function convertIPIV( fipiv ) {
	var out = [];
	var i;
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
* Extract packed column-major submatrix from Fortran output.
* Fortran stores NxN in LDA-strided columns. We need N*N interleaved re/im.
*
* @param {Array} data - fixture A array (2*LDA*ncols interleaved re/im)
* @param {integer} n - matrix dimension
* @param {integer} lda - leading dimension in Fortran (NMAX)
* @returns {Array} n*n*2 interleaved re/im values
*/
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

/**
* Build a packed N x N Complex128Array from interleaved re/im column-major.
*/
function makeMatrix( data ) {
	return new Complex128Array( data );
}

// TESTS //

test( 'zhetf2: upper_4x4 (1x1 pivots only)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = upper_4x4;
	n = 4;

	// Column-major upper Hermitian 4x4 in N x N storage (no LDA padding)
	// Upper triangle:
	// (4,0)    (1,2)    (3,-1)   (0.5,0.5)
	//          (5,0)    (2,1)    (1,-2)
	//                   (7,0)    (3,0)
	//                            (6,0)
	A = new Complex128Array([
		4, 0,    0, 0,    0, 0,    0, 0,     // col 0
		1, 2,    5, 0,    0, 0,    0, 0,     // col 1
		3, -1,   2, 1,    7, 0,    0, 0,     // col 2
		0.5, 0.5, 1, -2,  3, 0,    6, 0      // col 3
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetf2: lower_4x4 (1x1 pivots, lower triangle)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = lower_4x4;
	n = 4;

	// Lower Hermitian 4x4:
	// (4,0)
	// (1,-2)   (5,0)
	// (3,1)    (2,-1)   (7,0)
	// (0.5,-0.5) (1,2)  (3,0)    (6,0)
	A = new Complex128Array([
		4, 0,    1, -2,   3, 1,    0.5, -0.5,   // col 0
		0, 0,    5, 0,    2, -1,   1, 2,         // col 1
		0, 0,    0, 0,    7, 0,    3, 0,         // col 2
		0, 0,    0, 0,    0, 0,    6, 0          // col 3
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetf2: n0 (quick return)', function t() {
	var IPIV;
	var info;
	var A;

	A = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );

	info = zhetf2( 'upper', 0, A, 1, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zhetf2: n1 (single element)', function t() {
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;

	tc = n1;

	A = new Complex128Array([ 3.0, 0.0 ]);
	IPIV = new Int32Array( 1 );

	info = zhetf2( 'upper', 1, A, 1, 1, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), tc.A, 1e-14, 'A' );
	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetf2: singular_upper (zero diagonal)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = singular_upper;
	n = 3;

	// Upper 3x3 with zero diagonal element at (0,0):
	// (0,0)   (1,1)   (2,0)
	//         (3,0)   (1,1)
	//                 (2,0)
	A = new Complex128Array([
		0, 0,    0, 0,   0, 0,       // col 0
		1, 1,    3, 0,   0, 0,       // col 1
		2, 0,    1, 1,   2, 0        // col 2
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	// Note: Fortran fixture says info=0 but let's check the actual result
	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetf2: lower_6x6 (2x2 pivots)', function t() {
	var expected;
	var IPIV;
	var info;
	var tc;
	var Av;
	var A;
	var n;

	tc = lower_6x6;
	n = 6;

	// Lower Hermitian 6x6 with small diagonals to force 2x2 pivoting
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
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, tc.info );

	expected = extractSubmatrix( tc.A, n, 6 );
	Av = reinterpret( A, 0 );
	assertArrayClose( Array.from( Av ), expected, 1e-13, 'A' );

	assert.deepEqual( Array.from( IPIV ), convertIPIV( tc.ipiv ) );
});

test( 'zhetf2: upper with 2x2 pivots', function t() {
	// Upper Hermitian 4x4 with small diag to force 2x2 pivoting
	// Make (3,3) small and off-diag large
	var IPIV;
	var info;
	var Av;
	var A;
	var n;

	n = 4;

	A = new Complex128Array([
		// col 0
		0.01, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		5, 1,  0.02, 0,  0, 0,  0, 0,
		// col 2
		1, -1,  2, 1,  8, 0,  0, 0,
		// col 3
		0.5, 0.5,  1, -1,  3, 0,  7, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	// Just verify it runs without error and returns valid info
	assert.ok( info >= 0, 'info should be non-negative' );
	// Verify IPIV entries are valid
	var i;
	for ( i = 0; i < n; i++ ) {
		if ( IPIV[ i ] >= 0 ) {
			assert.ok( IPIV[ i ] < n, 'IPIV[' + i + '] should be < n' );
		}
	}
});

test( 'zhetf2: lower n=1', function t() {
	var IPIV;
	var info;
	var Av;
	var A;

	A = new Complex128Array([ 5.0, 0.0 ]);
	IPIV = new Int32Array( 1 );

	info = zhetf2( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	Av = reinterpret( A, 0 );
	assertClose( Av[ 0 ], 5.0, 1e-14, 'A(0,0) real' );
	assertClose( Av[ 1 ], 0.0, 1e-14, 'A(0,0) imag' );
	assert.equal( IPIV[ 0 ], 0 );
});

test( 'zhetf2: upper n=2 with interchange', function t() {
	// 2x2 upper Hermitian where off-diag is large relative to diag
	// Forces 1x1 pivot with interchange
	var IPIV;
	var info;
	var A;
	var n;

	n = 2;

	// A = [ 0.01  5+i ]
	//     [       8   ]
	A = new Complex128Array([
		0.01, 0,  0, 0,     // col 0
		5, 1,     8, 0      // col 1
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
});

test( 'zhetf2: lower n=2 with interchange', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 2;

	// A = [ 0.01       ]
	//     [ 5-i   8    ]
	A = new Complex128Array([
		0.01, 0,  5, -1,    // col 0
		0, 0,     8, 0      // col 1
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
});

test( 'zhetf2: NaN in diagonal triggers info > 0', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 2;

	A = new Complex128Array([
		NaN, 0,  0, 0,
		1, 1,    3, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info > 0, 'NaN on diagonal should produce info > 0' );
});

test( 'zhetf2: upper 3x3 all 1x1 pivots (diag dominant)', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	// Diagonally dominant upper Hermitian
	A = new Complex128Array([
		10, 0,   0, 0,    0, 0,     // col 0
		1, 1,    10, 0,   0, 0,     // col 1
		0.5, -0.5, 1, 0,  10, 0    // col 2
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	// All diagonal pivots (no interchange)
	assert.equal( IPIV[ 0 ], 0 );
	assert.equal( IPIV[ 1 ], 1 );
	assert.equal( IPIV[ 2 ], 2 );
});

test( 'zhetf2: lower 3x3 all 1x1 pivots (diag dominant)', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	// Diagonally dominant lower Hermitian
	A = new Complex128Array([
		10, 0,   1, -1,   0.5, 0.5,  // col 0
		0, 0,    10, 0,   1, 0,      // col 1
		0, 0,    0, 0,    10, 0      // col 2
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.equal( info, 0 );
	assert.equal( IPIV[ 0 ], 0 );
	assert.equal( IPIV[ 1 ], 1 );
	assert.equal( IPIV[ 2 ], 2 );
});

test( 'zhetf2: lower singular (zero column)', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 3;

	// Lower 3x3 with zero first column -> singular
	A = new Complex128Array([
		0, 0,  0, 0,  0, 0,     // col 0
		0, 0,  3, 0,  1, -1,    // col 1
		0, 0,  0, 0,  2, 0      // col 2
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info > 0, 'singular matrix should produce info > 0' );
});

test( 'zhetf2: upper 5x5 mixed pivots', function t() {
	// 5x5 upper with small diags to trigger 2x2 and 1x1 pivots
	var IPIV;
	var info;
	var A;
	var n;
	var i;

	n = 5;

	A = new Complex128Array([
		// col 0
		0.01, 0,  0, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		5, 1,  0.02, 0,  0, 0,  0, 0,  0, 0,
		// col 2
		1, -1,  2, 1,  10, 0,  0, 0,  0, 0,
		// col 3
		0.5, 0.5,  1, -1,  0.3, 0.3,  9, 0,  0, 0,
		// col 4
		0.1, 0.1,  0.2, -0.2,  1, 0,  2, 1,  8, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0, 'info should be non-negative' );
	for ( i = 0; i < n; i++ ) {
		if ( IPIV[ i ] >= 0 ) {
			assert.ok( IPIV[ i ] < n, 'IPIV[' + i + '] valid' );
		}
	}
});

test( 'zhetf2: lower 5x5 mixed pivots', function t() {
	var IPIV;
	var info;
	var A;
	var n;

	n = 5;

	A = new Complex128Array([
		// col 0
		0.01, 0,  5, -1,  1, 1,  0.5, -0.5,  0.1, -0.1,
		// col 1
		0, 0,  0.02, 0,  2, -1,  1, 1,  0.2, 0.2,
		// col 2
		0, 0,  0, 0,  10, 0,  0.3, -0.3,  1, 0,
		// col 3
		0, 0,  0, 0,  0, 0,  9, 0,  2, -1,
		// col 4
		0, 0,  0, 0,  0, 0,  0, 0,  8, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0, 'info should be non-negative' );
});

test( 'zhetf2: upper with kp !== kk and kstep === 2 swap', function t() {
	// Force the code path where kstep=2 AND kp != kk in upper triangle
	// Need: small A(k,k) and A(k-1,k-1), large off-diagonal A(imax,k)
	// AND |A(imax,imax)| < ALPHA*rowmax
	var IPIV;
	var info;
	var A;
	var n;

	n = 4;

	// Upper Hermitian with very small top-left to force 2x2 pivot with interchange
	A = new Complex128Array([
		// col 0
		0.001, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		0.001, 0.001, 0.001, 0,  0, 0,  0, 0,
		// col 2
		10, 1,  10, -1,  0.001, 0,  0, 0,
		// col 3
		1, 0.5,  1, -0.5,  5, 1,  20, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.ok( info >= 0 );
});

test( 'zhetf2: lower 4x4 with kp !== kk and kstep === 2', function t() {
	// Force 2x2 pivot with interchange in lower triangle
	var IPIV;
	var info;
	var A;
	var n;

	n = 4;

	A = new Complex128Array([
		// col 0
		0.001, 0,  0.001, -0.001,  10, -1,  1, -0.5,
		// col 1
		0, 0,  0.001, 0,  10, 1,  1, 0.5,
		// col 2
		0, 0,  0, 0,  0.001, 0,  5, -1,
		// col 3
		0, 0,  0, 0,  0, 0,  20, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'lower', n, A, 1, n, 0, IPIV, 1, 0 );
	assert.ok( info >= 0 );
});

test( 'zhetf2: upper 6x6 with 2x2 pivots (exercises column update k>1)', function t() {
	// Upper 6x6 Hermitian with small diagonal at positions 4,5 to force
	// 2x2 pivot at k=5 (first iteration), then another pattern at lower k.
	// This exercises the upper 2x2 column update loop (lines 241-322).
	var IPIV;
	var info;
	var A;
	var n;

	n = 6;

	// Upper Hermitian 6x6: small diag at (4,4) and (5,5) area
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
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0, 'info should be non-negative' );
});

test( 'zhetf2: upper 6x6 with 2x2 pivot kp==kk (no interchange)', function t() {
	// Upper 6x6 where the 2x2 pivot has kp==kk (no interchange needed)
	// This exercises lines 225-228 (kp==kk, kstep==2)
	// Need: small A(k,k) and A(k-1,k-1) both, large A(k-1,k),
	// and imax == k-1 (so kp = k-1 = kk when kstep=2)
	var IPIV;
	var info;
	var A;
	var n;

	n = 4;

	// Upper: A(3,3)=0.01, A(2,2)=0.01, A(2,3)=big
	// imax for col 3 will be row with largest off-diag -> likely row 2
	// Then if |A(imax,imax)| < ALPHA*rowmax, kstep=2 and kp=imax=2=k-1=kk
	A = new Complex128Array([
		// col 0
		10, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		0.1, 0.1,  10, 0,  0, 0,  0, 0,
		// col 2
		0.1, -0.1,  0.1, 0.1,  0.01, 0,  0, 0,
		// col 3
		0.1, 0,  0.1, 0,  5, 1,  0.01, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0, 'info should be non-negative' );
});

test( 'zhetf2: upper absakk >= ALPHA*colmax*(colmax/rowmax) path', function t() {
	// Force the path at line 157-159: absakk >= ALPHA*colmax*(colmax/rowmax)
	// Need: absakk < ALPHA*colmax (so we enter the else at 144)
	// but absakk >= ALPHA*colmax*(colmax/rowmax) (rowmax >> colmax)
	var IPIV;
	var info;
	var A;
	var n;

	n = 4;

	// A(3,3) is moderate, off-diag in col 3 has one moderate entry,
	// but the row scan of imax finds a very large entry making rowmax huge
	A = new Complex128Array([
		// col 0
		1, 0,  0, 0,  0, 0,  0, 0,
		// col 1
		0.1, 0,  100, 0,  0, 0,  0, 0,
		// col 2
		0.1, 0,  50, 1,  1, 0,  0, 0,
		// col 3
		0.1, 0,  2, 1,  0.1, 0,  2, 0
	]);
	IPIV = new Int32Array( n );

	info = zhetf2( 'upper', n, A, 1, n, 0, IPIV, 1, 0 );

	assert.ok( info >= 0 );
});

test( 'zhetf2: with offsetA > 0', function t() {
	// Test using offset to embed matrix within larger array
	var IPIV;
	var info;
	var A;
	var n;

	n = 2;

	// Embed 2x2 matrix at offset 2 in a larger array (LDA=3, but we use offset)
	A = new Complex128Array([
		99, 99, 99, 99,  // padding at start (2 complex elements)
		5, 0,  0, 0,     // col 0 of embedded matrix
		1, 1,  3, 0      // col 1 of embedded matrix
	]);
	IPIV = new Int32Array( 2 );

	info = zhetf2( 'upper', n, A, 1, n, 2, IPIV, 1, 0 );

	assert.equal( info, 0 );
});
