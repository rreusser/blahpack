import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfb from './../lib/ndarray.js';


// FIXTURES //

import leftNotransFwdCol from './fixtures/zlarfb_left_notrans_fwd_col.json' with { type: 'json' };
import leftConjtransFwdCol from './fixtures/zlarfb_left_conjtrans_fwd_col.json' with { type: 'json' };
import rightNotransFwdCol from './fixtures/zlarfb_right_notrans_fwd_col.json' with { type: 'json' };
import leftNotransBwdCol from './fixtures/zlarfb_left_notrans_bwd_col.json' with { type: 'json' };
import rightNotransBwdCol from './fixtures/zlarfb_right_notrans_bwd_col.json' with { type: 'json' };
import leftConjtransBwdCol from './fixtures/zlarfb_left_conjtrans_bwd_col.json' with { type: 'json' };
import rightConjtransFwdCol from './fixtures/zlarfb_right_conjtrans_fwd_col.json' with { type: 'json' };
import leftNotransFwdRow from './fixtures/zlarfb_left_notrans_fwd_row.json' with { type: 'json' };
import rightNotransFwdRow from './fixtures/zlarfb_right_notrans_fwd_row.json' with { type: 'json' };
import leftConjtransFwdRow from './fixtures/zlarfb_left_conjtrans_fwd_row.json' with { type: 'json' };
import leftNotransBwdRow from './fixtures/zlarfb_left_notrans_bwd_row.json' with { type: 'json' };
import leftConjtransBwdRow from './fixtures/zlarfb_left_conjtrans_bwd_row.json' with { type: 'json' };
import rightNotransBwdRow from './fixtures/zlarfb_right_notrans_bwd_row.json' with { type: 'json' };
import rightConjtransBwdRow from './fixtures/zlarfb_right_conjtrans_bwd_row.json' with { type: 'json' };
import rightConjtransFwdRow from './fixtures/zlarfb_right_conjtrans_fwd_row.json' with { type: 'json' };
import rightConjtransBwdColFixture from './fixtures/zlarfb_right_conjtrans_bwd_col.json' with { type: 'json' };
import zlarft from '../../zlarft/lib/base.js';


// FUNCTIONS //

function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1e-30 );
	assert.ok( relErr <= 1e-10, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, label ) {
	var i;
	assert.strictEqual( actual.length, expected.length, label + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], label + '[' + i + ']' );
	}
}

// M=4, N=3, K=2
// V is 4x2 (LDV=4, unit lower triangular)
function makeV() {
	return new Complex128Array( [
		1.0, 0.0,  0.3, 0.2,  -0.5, 0.1,  0.4, -0.3,
		0.0, 0.0,  1.0, 0.0,  0.6, -0.4,  -0.2, 0.5
	]);
}

// T is 2x2 upper triangular, LDT=3 (so 3 complex entries per column)
function makeT() {
	var T = new Complex128Array( 6 );
	var Tv = reinterpret( T, 0 );
	// T(0,0) = 1.2 - 0.3i
	Tv[ 0 ] = 1.2; Tv[ 1 ] = -0.3;
	// T(1,0) = 0
	// T(2,0) = 0 (padding)
	// T(0,1) = 0.52 - 0.15i
	Tv[ 6 ] = 0.52; Tv[ 7 ] = -0.15;
	// T(1,1) = 1.5 + 0.4i
	Tv[ 8 ] = 1.5; Tv[ 9 ] = 0.4;
	return T;
}

// C is 4x3 (LDC=4), col-major interleaved
function makeC() {
	return new Complex128Array( [
		1.0, 0.0,   0.0, 1.0,   2.0, -1.0,  3.0, 0.5,
		-1.0, 2.0,  0.5, 0.5,   1.5, -0.5, -2.0, 1.0,
		0.0, 0.0,   1.0, 1.0,  -0.5, 0.0,   2.0, -2.0
	]);
}

test( 'zlarfb: left, no-transpose, forward, columnwise', function t() {
	var tc = leftNotransFwdCol;
	var V = makeV();
	var T = makeT();
	var C = makeC();
	var work = new Complex128Array( 30 );

	// strideV1=1, strideV2=4, strideT1=1, strideT2=3, strideC1=1, strideC2=4
	// strideW1=1, strideW2=3 (LDWORK=3 for N=3)
	zlarfb( 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: left, conjugate-transpose, forward, columnwise', function t() {
	var tc = leftConjtransFwdCol;
	var V = makeV();
	var T = makeT();
	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'conjugate-transpose', 'forward', 'columnwise', 4, 3, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, no-transpose, forward, columnwise', function t() {
	var tc = rightNotransFwdCol;
	var V = makeV();
	var T = makeT();
	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	// strideC1=1, strideC2=3 (LDC=3)
	// strideW1=1, strideW2=3 (LDWORK=3 for M=3)
	zlarfb( 'right', 'no-transpose', 'forward', 'columnwise', 3, 4, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: M=0 (quick return)', function t() {
	var C = new Complex128Array( [ 1.0, 0.0 ] );
	var V = makeV();
	var T = makeT();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'no-transpose', 'forward', 'columnwise', 0, 3, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 1, 0,
		work, 1, 3, 0 );
	var Cv = reinterpret( C, 0 );
	assert.strictEqual( Cv[ 0 ], 1.0 );
	assert.strictEqual( Cv[ 1 ], 0.0 );
});

test( 'zlarfb: left, no-transpose, backward, columnwise', function t() {
	var tc = leftNotransBwdCol;
	// V for backward: last K rows have unit upper triangular
	var V = new Complex128Array( [
		0.3, 0.2,  -0.5, 0.1,  1.0, 0.0,  0.0, 0.0,
		0.6, -0.4,  -0.2, 0.5,  0.4, -0.3,  1.0, 0.0
	]);
	// T for backward is lower triangular
	var T = new Complex128Array( 6 );
	var Tb = reinterpret( T, 0 );
	Tb[ 0 ] = 1.2; Tb[ 1 ] = -0.3;
	Tb[ 2 ] = -1.22; Tb[ 3 ] = -1.50;
	// T(2,0) = 0 (padding)
	// T(0,1) = 0
	Tb[ 8 ] = 1.5; Tb[ 9 ] = 0.4;
	// T(2,1) = 0 (padding)

	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'no-transpose', 'backward', 'columnwise', 4, 3, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, no-transpose, backward, columnwise', function t() {
	var tc = rightNotransBwdCol;
	// V for backward: last K rows have unit upper triangular
	var V = new Complex128Array( [
		0.3, 0.2,  -0.5, 0.1,  1.0, 0.0,  0.0, 0.0,
		0.6, -0.4,  -0.2, 0.5,  0.4, -0.3,  1.0, 0.0
	]);
	// T for backward is lower triangular
	var T = new Complex128Array( 6 );
	var Tb = reinterpret( T, 0 );
	Tb[ 0 ] = 1.2; Tb[ 1 ] = -0.3;
	Tb[ 2 ] = -1.22; Tb[ 3 ] = -1.50;
	Tb[ 8 ] = 1.5; Tb[ 9 ] = 0.4;

	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'no-transpose', 'backward', 'columnwise', 3, 4, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: left, conjugate-transpose, backward, columnwise', function t() {
	var tc = leftConjtransBwdCol;
	var V = new Complex128Array( [
		0.3, 0.2,  -0.5, 0.1,  1.0, 0.0,  0.0, 0.0,
		0.6, -0.4,  -0.2, 0.5,  0.4, -0.3,  1.0, 0.0
	]);
	var T = new Complex128Array( 6 );
	var Tb = reinterpret( T, 0 );
	Tb[ 0 ] = 1.2; Tb[ 1 ] = -0.3;
	Tb[ 2 ] = -1.22; Tb[ 3 ] = -1.50;
	Tb[ 8 ] = 1.5; Tb[ 9 ] = 0.4;

	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'conjugate-transpose', 'backward', 'columnwise', 4, 3, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, conjugate-transpose, forward, columnwise', function t() {
	var tc = rightConjtransFwdCol;
	var V = makeV();
	var T = makeT();
	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'conjugate-transpose', 'forward', 'columnwise', 3, 4, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: left, no-transpose, forward, rowwise', function t() {
	var tc = leftNotransFwdRow;
	// V is 2x4 (K=2, M=4), unit upper triangular in V1
	var V = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0,
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5
	]);
	// T computed by zlarft('forward','rowwise',4,2,V,2,tau,T,3)
	// Use pre-computed T from the fixture (we need zlarft output)
	// Actually, let's compute T ourselves using zlarft
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'forward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'no-transpose', 'forward', 'rowwise', 4, 3, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, no-transpose, forward, rowwise', function t() {
	var tc = rightNotransFwdRow;
	// V is 2x4 (K=2, N=4), unit upper triangular in V1
	var V = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0,
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'forward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'no-transpose', 'forward', 'rowwise', 3, 4, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: left, conjugate-transpose, forward, rowwise', function t() {
	var tc = leftConjtransFwdRow;
	// V is 2x4 (K=2, M=4), unit upper triangular in V1
	var V = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0,
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'forward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'conjugate-transpose', 'forward', 'rowwise', 4, 3, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: left, no-transpose, backward, rowwise', function t() {
	var tc = leftNotransBwdRow;
	// V is 2x4 (K=2, M=4), last K cols unit lower triangular for backward
	var V = new Complex128Array( [
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5,
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'backward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'no-transpose', 'backward', 'rowwise', 4, 3, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: left, conjugate-transpose, backward, rowwise', function t() {
	var tc = leftConjtransBwdRow;
	// V is 2x4 (K=2, M=4), last K cols unit lower triangular for backward
	var V = new Complex128Array( [
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5,
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'backward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	var C = makeC();
	var work = new Complex128Array( 30 );

	zlarfb( 'left', 'conjugate-transpose', 'backward', 'rowwise', 4, 3, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 4, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, no-transpose, backward, rowwise', function t() {
	var tc = rightNotransBwdRow;
	// V is 2x4 (K=2, N=4), last K cols unit lower triangular for backward
	var V = new Complex128Array( [
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5,
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'backward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'no-transpose', 'backward', 'rowwise', 3, 4, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, conjugate-transpose, backward, rowwise', function t() {
	var tc = rightConjtransBwdRow;
	// V is 2x4 (K=2, N=4), last K cols unit lower triangular for backward
	var V = new Complex128Array( [
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5,
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'backward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'conjugate-transpose', 'backward', 'rowwise', 3, 4, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, conjugate-transpose, forward, rowwise', function t() {
	var tc = rightConjtransFwdRow;
	// V is 2x4 (K=2, N=4), unit upper triangular in V1
	var V = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,
		0.3, 0.2,  1.0, 0.0,
		-0.5, 0.1,  0.6, -0.4,
		0.4, -0.3,  -0.2, 0.5
	]);
	var tau = new Complex128Array( [ 1.2, -0.3,  1.5, 0.4 ] );
	var T = new Complex128Array( 6 );
	zlarft( 'forward', 'rowwise', 4, 2, V, 1, 2, 0, tau, 1, 0, T, 1, 3, 0 );

	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'conjugate-transpose', 'forward', 'rowwise', 3, 4, 2,
		V, 1, 2, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarfb: right, conjugate-transpose, backward, columnwise', function t() {
	var tc = rightConjtransBwdColFixture;
	// V is 4x2 (N=4, K=2), last K rows unit upper triangular for backward
	var V = new Complex128Array( [
		0.3, 0.2,  -0.5, 0.1,  1.0, 0.0,  0.0, 0.0,
		0.6, -0.4,  -0.2, 0.5,  0.4, -0.3,  1.0, 0.0
	]);
	// T for backward is lower triangular
	var T = new Complex128Array( 6 );
	var Tb = reinterpret( T, 0 );
	Tb[ 0 ] = 1.2; Tb[ 1 ] = -0.3;
	Tb[ 2 ] = -1.22; Tb[ 3 ] = -1.50;
	Tb[ 8 ] = 1.5; Tb[ 9 ] = 0.4;

	// C is 3x4 (M=3, N=4, LDC=3)
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,  3.0, -1.0,
		0.0, 1.0,  0.5, 0.5,  -1.0, 2.0,
		1.5, -0.5, -2.0, 1.0,  0.0, 0.0,
		1.0, 1.0,  -0.5, 0.0,  2.0, -2.0
	]);
	var work = new Complex128Array( 30 );

	zlarfb( 'right', 'conjugate-transpose', 'backward', 'columnwise', 3, 4, 2,
		V, 1, 4, 0,
		T, 1, 3, 0,
		C, 1, 3, 0,
		work, 1, 3, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});
