import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarft from './../lib/ndarray.js';

// Fixtures
import zlarftFwdCol from './fixtures/zlarft_fwd_col.json' with { type: 'json' };
import zlarftFwdCol5x3 from './fixtures/zlarft_fwd_col_5x3.json' with { type: 'json' };
import zlarftTauZero from './fixtures/zlarft_tau_zero.json' with { type: 'json' };
import zlarftBwdCol from './fixtures/zlarft_bwd_col.json' with { type: 'json' };
import zlarftFwdRow from './fixtures/zlarft_fwd_row.json' with { type: 'json' };
import zlarftBwdRow from './fixtures/zlarft_bwd_row.json' with { type: 'json' };

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1e-30 );
	assert.ok( relErr <= 1e-12, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, label ) {
	var i;
	assert.strictEqual( actual.length, expected.length, label + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], label + '[' + i + ']' );
	}
}

test( 'zlarft: forward, columnwise, n=4, k=2', function t() {
	var tc = zlarftFwdCol;
	// V is 4x2 (LDV=4), col-major interleaved
	var V = new Complex128Array( [
		// col 1: V(0,0)=1, V(1,0)=0.3+0.2i, V(2,0)=-0.5+0.1i, V(3,0)=0.4-0.3i
		1.0, 0.0,  0.3, 0.2,  -0.5, 0.1,  0.4, -0.3,
		// col 2: V(0,1)=0, V(1,1)=1, V(2,1)=0.6-0.4i, V(3,1)=-0.2+0.5i
		0.0, 0.0,  1.0, 0.0,  0.6, -0.4,  -0.2, 0.5
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	// T is 3x2 in Fortran (LDT=3), but only 2x2 is used. We store 3x2 col-major interleaved.
	var T = new Complex128Array( 6 );

	// strideV1=1 (rows), strideV2=4 (cols with LDV=4)
	// strideT1=1, strideT2=3 (LDT=3)
	// strideTAU=1
	zlarft( 'forward', 'columnwise', 4, 2, V, 1, 4, 0, tau, 1, 0, T, 1, 3, 0 );

	// Compare first 12 doubles (3x2 col-major = 6 complex values)
	assertArrayClose( Array.from( reinterpret( T, 0 ) ), tc.T, 'T' );
});

test( 'zlarft: forward, columnwise, n=5, k=3', function t() {
	var tc = zlarftFwdCol5x3;
	// V is 5x3, LDV=5
	var V = new Complex128Array( [
		// col 1
		1.0, 0.0,  0.2, 0.1,  -0.3, 0.4,  0.5, -0.2,  0.1, 0.6,
		// col 2
		0.0, 0.0,  1.0, 0.0,  0.4, -0.5,  -0.1, 0.3,  0.7, 0.2,
		// col 3
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0,  0.3, 0.1,  -0.2, 0.8
	]);
	var tau = new Complex128Array( [ 1.1, 0.2,  1.3, -0.1,  1.6, 0.5 ] );
	// T is 3x3, LDT=3
	var T = new Complex128Array( 9 );

	zlarft( 'forward', 'columnwise', 5, 3, V, 1, 5, 0, tau, 1, 0, T, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( T, 0 ) ), tc.T, 'T' );
});

test( 'zlarft: tau(0)=0 (first reflector is identity)', function t() {
	var tc = zlarftTauZero;
	var V = new Complex128Array( [
		1.0, 0.0,  0.3, 0.2,  -0.5, 0.1,  0.4, -0.3,
		0.0, 0.0,  1.0, 0.0,  0.6, -0.4,  -0.2, 0.5
	]);
	var tau = new Complex128Array( [ 0.0, 0.0,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );

	zlarft( 'forward', 'columnwise', 4, 2, V, 1, 4, 0, tau, 1, 0, T, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( T, 0 ) ), tc.T, 'T' );
});

test( 'zlarft: backward, columnwise, n=4, k=2', function t() {
	var tc = zlarftBwdCol;
	// V for backward: last K rows have unit upper triangular
	var V = new Complex128Array( [
		// col 1: V(0,0)=0.3+0.2i, V(1,0)=-0.5+0.1i, V(2,0)=1, V(3,0)=0
		0.3, 0.2,  -0.5, 0.1,  1.0, 0.0,  0.0, 0.0,
		// col 2: V(0,1)=0.6-0.4i, V(1,1)=-0.2+0.5i, V(2,1)=0.4-0.3i, V(3,1)=1
		0.6, -0.4,  -0.2, 0.5,  0.4, -0.3,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );

	zlarft( 'backward', 'columnwise', 4, 2, V, 1, 4, 0, tau, 1, 0, T, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( T, 0 ) ), tc.T, 'T' );
});

test( 'zlarft: N=0 quick return', function t() {
	var V = new Complex128Array( 8 );
	var tau = new Complex128Array( 2 );
	var T = new Complex128Array( 6 );
	var Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 99.0; // sentinel value
	zlarft( 'forward', 'columnwise', 0, 2, V, 1, 4, 0, tau, 1, 0, T, 1, 3, 0 );
	// T should be unchanged
	Tv = reinterpret( T, 0 );
	assert.strictEqual( Tv[ 0 ], 99.0 );
});

test( 'zlarft: forward, rowwise, n=4, k=2', function t() {
	var tc = zlarftFwdRow;
	// V is 2x4 (LDV=2), row-major reflectors (unit upper triangular in V1)
	var V = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0,
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );

	zlarft( 'forward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( T, 0 ) ), tc.T, 'T' );
});

test( 'zlarft: backward, rowwise, n=4, k=2', function t() {
	var tc = zlarftBwdRow;
	var V = new Complex128Array( [
		0.3, 0.2,  0.6, -0.4,
		-0.5, 0.1,  -0.2, 0.5,
		1.0, 0.0,  0.4, -0.3,
		0.0, 0.0,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );

	zlarft( 'backward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( T, 0 ) ), tc.T, 'T' );
});

test( 'zlarft: backward, tau(1)=0 (second reflector is identity)', function t() {
	// Same V as backward test, but tau(1)=0
	// Expected: T(:,1) column should be all zeros, T(0,0) = tau(0)
	var V = new Complex128Array( [
		0.3, 0.2,  -0.5, 0.1,  1.0, 0.0,  0.0, 0.0,
		0.6, -0.4,  -0.2, 0.5,  0.4, -0.3,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  0.0, 0.0 ] );
	var T = new Complex128Array( 6 );

	zlarft( 'backward', 'columnwise', 4, 2, V, 1, 4, 0, tau, 1, 0, T, 1, 3, 0 );

	var Tv = reinterpret( T, 0 );
	// T(1,1) column should be zero (tau=0 path)
	assert.strictEqual( Tv[ 8 ], 0.0, 'T(1,1) re' );  // T[1*st1 + 1*st2] = T[1*2 + 1*6] = T[8]
	assert.strictEqual( Tv[ 9 ], 0.0, 'T(1,1) im' );
	// T(0,0) should be tau(0)
	assert.strictEqual( Tv[ 0 ], 1.2, 'T(0,0) re' );
	assert.strictEqual( Tv[ 1 ], -0.3, 'T(0,0) im' );
});

test( 'zlarft: backward, K=3 with leading zeros in V', function t() {
	var V = new Complex128Array( [
		0.2, 0.1,  0.4, -0.2,  -0.3, 0.5,  1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.0, 0.0,  0.5, 0.3,  -0.1, 0.4,  0.3, -0.1,  1.0, 0.0,  0.0, 0.0,
		0.6, -0.2,  -0.2, 0.1,  0.4, 0.3,  -0.5, 0.2,  0.1, -0.3,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.1, 0.2,  1.3, -0.1,  1.6, 0.5 ] );
	// T is 3x3, LDT=3
	var T = new Complex128Array( 9 );

	zlarft( 'backward', 'columnwise', 6, 3, V, 1, 6, 0, tau, 1, 0, T, 1, 3, 0 );

	var Tv = reinterpret( T, 0 );
	// Verify T is lower triangular and diagonals are tau values
	// T(0,0) = tau(0) = 1.1+0.2i
	assert.strictEqual( Tv[ 0 ], 1.1, 'T(0,0) re = tau(0) re' );
	assert.strictEqual( Tv[ 1 ], 0.2, 'T(0,0) im = tau(0) im' );
	// T(1,1) = tau(1) = 1.3-0.1i
	var idx11 = 2 + 6; // 1*st1 + 1*st2 = 1*2 + 1*6 = 8
	assert.strictEqual( Tv[ idx11 ], 1.3, 'T(1,1) re = tau(1) re' );
	assert.strictEqual( Tv[ idx11 + 1 ], -0.1, 'T(1,1) im = tau(1) im' );
	// T(2,2) = tau(2) = 1.6+0.5i
	var idx22 = 4 + 12; // 2*st1 + 2*st2 = 2*2 + 2*6 = 16
	assert.strictEqual( Tv[ idx22 ], 1.6, 'T(2,2) re = tau(2) re' );
	assert.strictEqual( Tv[ idx22 + 1 ], 0.5, 'T(2,2) im = tau(2) im' );
	// Upper triangle should be zero (backward → lower triangular T)
	// T(0,1) should be 0
	var idx01 = 0 + 6; // 0*st1 + 1*st2 = 6
	assert.strictEqual( Tv[ idx01 ], 0.0, 'T(0,1) re = 0' );
	assert.strictEqual( Tv[ idx01 + 1 ], 0.0, 'T(0,1) im = 0' );
});

test( 'zlarft: forward, rowwise, n=5, k=3 (trailing zeros in V rows)', function t() {
	// V is 3x5 with row-wise reflectors. Row 1 (second reflector) has trailing zeros.
	// This triggers lines 166-167 (lastv update for trailing zeros in rowwise).
	// Storage: strideV1=1 (rows), strideV2=3 (cols with LDV=3).
	// Data in column-major order: V(0,0), V(1,0), V(2,0), V(0,1), V(1,1), V(2,1), ...
	var V = new Complex128Array( [
		// col 0: V(0,0)=1, V(1,0)=0, V(2,0)=0
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		// col 1: V(0,1)=0.3+0.2i, V(1,1)=1, V(2,1)=0
		0.3, 0.2,  1.0, 0.0,  0.0, 0.0,
		// col 2: V(0,2)=-0.5+0.1i, V(1,2)=0.4-0.5i, V(2,2)=1
		-0.5, 0.1,  0.4, -0.5,  1.0, 0.0,
		// col 3: V(0,3)=0.4-0.3i, V(1,3)=0 (trailing zero!), V(2,3)=0.3+0.1i
		0.4, -0.3,  0.0, 0.0,  0.3, 0.1,
		// col 4: V(0,4)=0.1+0.6i, V(1,4)=0 (trailing zero!), V(2,4)=-0.2+0.8i
		0.1, 0.6,  0.0, 0.0,  -0.2, 0.8
	]);
	var tau = new Complex128Array( [ 1.1, 0.2,  1.3, -0.1,  1.6, 0.5 ] );
	// T is 3x3, LDT=3
	var T = new Complex128Array( 9 );

	zlarft( 'forward', 'rowwise', 5, 3, V, 1, 3, 0, tau, 1, 0, T, 1, 3, 0 );

	var Tv = reinterpret( T, 0 );
	// Verify T is upper triangular with diag = tau
	assert.strictEqual( Tv[ 0 ], 1.1, 'T(0,0) re = tau(0) re' );
	assert.strictEqual( Tv[ 1 ], 0.2, 'T(0,0) im = tau(0) im' );
	var t11 = 2 + 6;
	assert.strictEqual( Tv[ t11 ], 1.3, 'T(1,1) re = tau(1) re' );
	assert.strictEqual( Tv[ t11 + 1 ], -0.1, 'T(1,1) im = tau(1) im' );
	var t22 = 4 + 12;
	assert.strictEqual( Tv[ t22 ], 1.6, 'T(2,2) re = tau(2) re' );
	assert.strictEqual( Tv[ t22 + 1 ], 0.5, 'T(2,2) im = tau(2) im' );
	// Lower triangle should be zero (forward -> upper triangular T)
	var t10 = 2; // row 1, col 0
	assert.strictEqual( Tv[ t10 ], 0.0, 'T(1,0) re = 0' );
	assert.strictEqual( Tv[ t10 + 1 ], 0.0, 'T(1,0) im = 0' );
});

test( 'zlarft: backward, columnwise, K=3 with leading nonzero in V', function t() {
	// V is 6x3, backward columnwise. Column 1 has a leading nonzero at V(0,1)
	// to trigger the break at line 231-232 during i=1 scan.
	// For backward col-wise with K=3, N=6:
	// - i=2 (last): skips inner block
	// - i=1: scans V(:,1) for leading zeros at jj=0. V(0,1) is nonzero => break
	// - i=0: loop jj from 0 to -1, doesn't run
	var V = new Complex128Array( [
		// col 0: V(0,0)=0.1+0.2i, V(1,0)=-0.3+0.1i, V(2,0)=0.5, V(3,0)=1, V(4,0)=0, V(5,0)=0
		0.1, 0.2,  -0.3, 0.1,  0.5, 0.0,  1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		// col 1: V(0,1)=0.2+0.1i (NONZERO!), V(1,1)=0.4+0.3i, V(2,1)=-0.2+0.5i, V(3,1)=0.3, V(4,1)=1, V(5,1)=0
		0.2, 0.1,  0.4, 0.3,  -0.2, 0.5,  0.3, 0.0,  1.0, 0.0,  0.0, 0.0,
		// col 2: V(0,2)=0, V(1,2)=0, V(2,2)=0.6-0.1i, V(3,2)=-0.4, V(4,2)=0.2+0.3i, V(5,2)=1
		0.0, 0.0,  0.0, 0.0,  0.6, -0.1,  -0.4, 0.0,  0.2, 0.3,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.1, 0.2,  1.3, -0.1,  1.6, 0.5 ] );
	var T = new Complex128Array( 9 );

	zlarft( 'backward', 'columnwise', 6, 3, V, 1, 6, 0, tau, 1, 0, T, 1, 3, 0 );

	var Tv = reinterpret( T, 0 );
	// Verify T is lower triangular with diag = tau
	assert.strictEqual( Tv[ 0 ], 1.1, 'T(0,0) re = tau(0) re' );
	assert.strictEqual( Tv[ 1 ], 0.2, 'T(0,0) im = tau(0) im' );
	var t11 = 2 + 6;
	assert.strictEqual( Tv[ t11 ], 1.3, 'T(1,1) re = tau(1) re' );
	assert.strictEqual( Tv[ t11 + 1 ], -0.1, 'T(1,1) im = tau(1) im' );
	var t22 = 4 + 12;
	assert.strictEqual( Tv[ t22 ], 1.6, 'T(2,2) re = tau(2) re' );
	assert.strictEqual( Tv[ t22 + 1 ], 0.5, 'T(2,2) im = tau(2) im' );
	// Upper triangle should be zero (backward = lower triangular T)
	var t01 = 0 + 6;
	assert.strictEqual( Tv[ t01 ], 0.0, 'T(0,1) re = 0' );
	assert.strictEqual( Tv[ t01 + 1 ], 0.0, 'T(0,1) im = 0' );
});

test( 'zlarft: backward, rowwise, n=6, k=3 (leading zeros)', function t() {
	// V is 3x6 with row-wise reflectors, backward direction.
	// K=3 so that the backward rowwise leading-zero scan (lines 263-268) is exercised.
	// Storage: strideV1=1, strideV2=3 (col-major of K=3 x N=6 matrix)
	// V(i,j) = complex index i + j*3
	// For backward rowwise, unit lower triangular is in last K columns:
	//   V(i, N-K+i) = 1, V(i, N-K+j) = 0 for j > i
	// Row 1 should have V(1,0) = 0 (leading zero) to trigger lastv = jj+1 (lines 267-268)
	//
	// Col-major order: V(0,0),V(1,0),V(2,0), V(0,1),V(1,1),V(2,1), ...
	var V = new Complex128Array( [
		// col 0: V(0,0)=0.1+0.2i, V(1,0)=0 (LEADING ZERO for row 1!), V(2,0)=0
		0.1, 0.2,  0.0, 0.0,  0.0, 0.0,
		// col 1: V(0,1)=-0.3+0.1i, V(1,1)=0.4+0.3i, V(2,1)=0
		-0.3, 0.1,  0.4, 0.3,  0.0, 0.0,
		// col 2: V(0,2)=0.5, V(1,2)=-0.2+0.5i, V(2,2)=0.6-0.1i
		0.5, 0.0,  -0.2, 0.5,  0.6, -0.1,
		// col 3 (N-K+0=3): V(0,3)=1 (unit), V(1,3)=0.3, V(2,3)=-0.4
		1.0, 0.0,  0.3, 0.0,  -0.4, 0.0,
		// col 4 (N-K+1=4): V(0,4)=0, V(1,4)=1 (unit), V(2,4)=0.2+0.3i
		0.0, 0.0,  1.0, 0.0,  0.2, 0.3,
		// col 5 (N-K+2=5): V(0,5)=0, V(1,5)=0, V(2,5)=1 (unit)
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.1, 0.2,  1.3, -0.1,  1.6, 0.5 ] );
	var T = new Complex128Array( 9 );

	zlarft( 'backward', 'rowwise', 6, 3, V, 1, 3, 0, tau, 1, 0, T, 1, 3, 0 );

	var Tv = reinterpret( T, 0 );
	// Verify T is lower triangular with diag = tau
	assert.strictEqual( Tv[ 0 ], 1.1, 'T(0,0) re = tau(0) re' );
	assert.strictEqual( Tv[ 1 ], 0.2, 'T(0,0) im = tau(0) im' );
	var t11 = 2 + 6;
	assert.strictEqual( Tv[ t11 ], 1.3, 'T(1,1) re = tau(1) re' );
	assert.strictEqual( Tv[ t11 + 1 ], -0.1, 'T(1,1) im = tau(1) im' );
	var t22 = 4 + 12;
	assert.strictEqual( Tv[ t22 ], 1.6, 'T(2,2) re = tau(2) re' );
	assert.strictEqual( Tv[ t22 + 1 ], 0.5, 'T(2,2) im = tau(2) im' );
	// Upper triangle should be zero (backward = lower triangular)
	var t01 = 0 + 6;
	assert.strictEqual( Tv[ t01 ], 0.0, 'T(0,1) re = 0' );
	assert.strictEqual( Tv[ t01 + 1 ], 0.0, 'T(0,1) im = 0' );
});

test( 'zlarft: backward, rowwise, n=7, k=4 (mixed leading zeros)', function t() {
	// V is 4x7 with row-wise reflectors, backward direction. K=4 so that
	// the backward rowwise leading-zero scan has multiple iterations.
	// Row 2 has V(2,0) = nonzero (triggers break at line 265-266)
	// Row 3 has V(3,0) = 0, V(3,1) = 0 (triggers lastv = jj+1 at line 267-268, covered already)
	// Col-major: V(i,j) = complex index i + j*4
	var V = new Complex128Array( [
		// col 0: V(0,0)=0.1, V(1,0)=0, V(2,0)=0.3+0.2i (NONZERO!), V(3,0)=0
		0.1, 0.0,  0.0, 0.0,  0.3, 0.2,  0.0, 0.0,
		// col 1: V(0,1)=-0.2, V(1,1)=0.4, V(2,1)=-0.1+0.5i, V(3,1)=0
		-0.2, 0.0,  0.4, 0.0,  -0.1, 0.5,  0.0, 0.0,
		// col 2: V(0,2)=0.5, V(1,2)=-0.2, V(2,2)=0.6, V(3,2)=0.7-0.1i
		0.5, 0.0,  -0.2, 0.0,  0.6, 0.0,  0.7, -0.1,
		// col 3 (N-K+0=3): V(0,3)=1, V(1,3)=0.2, V(2,3)=-0.4, V(3,3)=0.3
		1.0, 0.0,  0.2, 0.0,  -0.4, 0.0,  0.3, 0.0,
		// col 4 (N-K+1=4): V(0,4)=0, V(1,4)=1, V(2,4)=0.2, V(3,4)=-0.5
		0.0, 0.0,  1.0, 0.0,  0.2, 0.0,  -0.5, 0.0,
		// col 5 (N-K+2=5): V(0,5)=0, V(1,5)=0, V(2,5)=1, V(3,5)=0.1+0.3i
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0,  0.1, 0.3,
		// col 6 (N-K+3=6): V(0,6)=0, V(1,6)=0, V(2,6)=0, V(3,6)=1
		0.0, 0.0,  0.0, 0.0,  0.0, 0.0,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.1, 0.2,  1.3, -0.1,  1.6, 0.5,  0.8, -0.2 ] );
	var T = new Complex128Array( 16 );

	zlarft( 'backward', 'rowwise', 7, 4, V, 1, 4, 0, tau, 1, 0, T, 1, 4, 0 );

	var Tv = reinterpret( T, 0 );
	// Verify T diagonals = tau
	assert.strictEqual( Tv[ 0 ], 1.1, 'T(0,0) re = tau(0) re' );
	assert.strictEqual( Tv[ 1 ], 0.2, 'T(0,0) im = tau(0) im' );
	// T(1,1) at Float64 index 2 + 1*8 = 10
	assert.strictEqual( Tv[ 10 ], 1.3, 'T(1,1) re = tau(1) re' );
	assert.strictEqual( Tv[ 11 ], -0.1, 'T(1,1) im = tau(1) im' );
	// T(2,2) at Float64 index 4 + 2*8 = 20
	assert.strictEqual( Tv[ 20 ], 1.6, 'T(2,2) re = tau(2) re' );
	assert.strictEqual( Tv[ 21 ], 0.5, 'T(2,2) im = tau(2) im' );
	// T(3,3) at Float64 index 6 + 3*8 = 30
	assert.strictEqual( Tv[ 30 ], 0.8, 'T(3,3) re = tau(3) re' );
	assert.strictEqual( Tv[ 31 ], -0.2, 'T(3,3) im = tau(3) im' );
});

test( 'zlarft: forward with trailing zeros in V column', function t() {
	// V is 4x2 where column 0 has trailing zeros (V(3,0)=0)
	var V = new Complex128Array( [
		1.0, 0.0,  0.3, 0.2,  -0.5, 0.1,  0.0, 0.0,   // col 0: last elem = 0
		0.0, 0.0,  1.0, 0.0,  0.6, -0.4,  -0.2, 0.5    // col 1: normal
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );

	zlarft( 'forward', 'columnwise', 4, 2, V, 1, 4, 0, tau, 1, 0, T, 1, 3, 0 );

	var Tv = reinterpret( T, 0 );
	// T(0,0) should be tau(0)
	assert.strictEqual( Tv[ 0 ], 1.2, 'T(0,0) re = tau(0) re' );
	assert.strictEqual( Tv[ 1 ], -0.3, 'T(0,0) im = tau(0) im' );
	// T(1,1) should be tau(1)
	var t11 = 2 + 6; // index: 1*st1 + 1*st2 = 1*2 + 1*6 = 8
	assert.strictEqual( Tv[ t11 ], 1.5, 'T(1,1) re = tau(1) re' );
	assert.strictEqual( Tv[ t11 + 1 ], 0.4, 'T(1,1) im = tau(1) im' );
});
