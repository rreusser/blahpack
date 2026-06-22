import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarf from './../lib/ndarray.js';


// FIXTURES //

import zlarfLeft3x2 from './fixtures/zlarf_left_3x2.json' with { type: 'json' };
import zlarfRight2x3 from './fixtures/zlarf_right_2x3.json' with { type: 'json' };
import zlarfTauZero from './fixtures/zlarf_tau_zero.json' with { type: 'json' };
import zlarfNZero from './fixtures/zlarf_n_zero.json' with { type: 'json' };
import zlarfLeft4x3 from './fixtures/zlarf_left_4x3.json' with { type: 'json' };


// FUNCTIONS //

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

test( 'zlarf: left side, 3x2 matrix', function t() {
	var tc = zlarfLeft3x2;
	// v = [1+0i, 0.5+0.5i, -0.3+0.2i]
	var v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.5, -0.3, 0.2 ] );
	var tau = new Complex128Array( [ 1.5, 0.3 ] );
	// C is 3x2 col-major: col1=[1+0i,3+1i,5+2i], col2=[2+1i,4-1i,6+0i]
	var C = new Complex128Array( [
		1.0, 0.0,  3.0, 1.0,  5.0, 2.0,   // col 1
		2.0, 1.0,  4.0, -1.0, 6.0, 0.0    // col 2
	]);
	var work = new Complex128Array( 20 );

	// strideC1=1 (row stride in complex elems), strideC2=3 (col stride = LDA=3)
	zlarf( 'left', 3, 2, v, 1, 0, tau, 0, C, 1, 3, 0, work, 1, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarf: right side, 2x3 matrix', function t() {
	var tc = zlarfRight2x3;
	var v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.5, -0.3, 0.2 ] );
	var tau = new Complex128Array( [ 1.5, 0.3 ] );
	// C is 2x3 col-major
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,   // col 1
		3.0, 1.0,  4.0, -1.0,  // col 2
		5.0, 2.0,  6.0, 0.0    // col 3
	]);
	var work = new Complex128Array( 20 );

	zlarf( 'right', 2, 3, v, 1, 0, tau, 0, C, 1, 2, 0, work, 1, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarf: tau=0 (identity)', function t() {
	var tc = zlarfTauZero;
	var v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.5 ] );
	var tau = new Complex128Array( [ 0.0, 0.0 ] );
	var C = new Complex128Array( [
		1.0, 0.0,  2.0, 1.0,
		3.0, 2.0,  4.0, 3.0
	]);
	var work = new Complex128Array( 20 );

	zlarf( 'left', 2, 2, v, 1, 0, tau, 0, C, 1, 2, 0, work, 1, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarf: n=0', function t() {
	var tc = zlarfNZero;
	var v = new Complex128Array( [ 1.0, 0.0 ] );
	var tau = new Complex128Array( [ 1.0, 0.0 ] );
	var C = new Complex128Array( [ 1.0, 0.0 ] );
	var work = new Complex128Array( 20 );

	zlarf( 'left', 1, 0, v, 1, 0, tau, 0, C, 1, 1, 0, work, 1, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});

test( 'zlarf: v with trailing zeros (lastv reduced)', function t() {
	// v = [1+0i, 0.5+0.5i, 0+0i] — trailing zero should cause lastv=2
	// Only first 2 rows of C should be modified; row 2 stays unchanged.
	var v = new Complex128Array( [ 1.0, 0.0, 0.5, 0.5, 0.0, 0.0 ] );
	var tau = new Complex128Array( [ 1.5, 0.3 ] );
	var C = new Complex128Array( [
		1.0, 0.0,  3.0, 1.0,  5.0, 2.0,
		2.0, 1.0,  4.0, -1.0, 6.0, 0.0
	]);
	var Cv = reinterpret( C, 0 );
	var origRow2re0 = Cv[ 4 ]; // row2, col0
	var origRow2im0 = Cv[ 5 ];
	var origRow2re1 = Cv[ 10 ]; // row2, col1
	var origRow2im1 = Cv[ 11 ];
	var work = new Complex128Array( 20 );

	zlarf( 'left', 3, 2, v, 1, 0, tau, 0, C, 1, 3, 0, work, 1, 0 );
	// Row 2 should be unchanged because v[2]=0
	Cv = reinterpret( C, 0 );
	assert.strictEqual( Cv[ 4 ], origRow2re0 );
	assert.strictEqual( Cv[ 5 ], origRow2im0 );
	assert.strictEqual( Cv[ 10 ], origRow2re1 );
	assert.strictEqual( Cv[ 11 ], origRow2im1 );
});

test( 'zlarf: negative strideV', function t() {
	// Same logical v=[1+0i, 0.5+0.5i] stored reversed with strideV=-1
	// Physical: [-0.3, 0.2, 0.5, 0.5, 1.0, 0.0], offsetV=2, strideV=-1
	// maps to: v[0]=phys[2]=(1,0), v[1]=phys[1]=(0.5,0.5), v[2]=phys[0]=(-0.3,0.2)
	//
	// Use same C as the positive-stride left_3x2 test for comparison.
	var vfwd = new Complex128Array( [ 1.0, 0.0, 0.5, 0.5, -0.3, 0.2 ] );
	var tau = new Complex128Array( [ 1.5, 0.3 ] );
	var C1 = new Complex128Array( [
		1.0, 0.0,  3.0, 1.0,  5.0, 2.0,
		2.0, 1.0,  4.0, -1.0, 6.0, 0.0
	]);
	var C2 = new Complex128Array( [
		1.0, 0.0,  3.0, 1.0,  5.0, 2.0,
		2.0, 1.0,  4.0, -1.0, 6.0, 0.0
	]);
	var work1 = new Complex128Array( 20 );
	var work2 = new Complex128Array( 20 );

	// Forward stride
	zlarf( 'left', 3, 2, vfwd, 1, 0, tau, 0, C1, 1, 3, 0, work1, 1, 0 );

	// Reversed: store v in reverse order, use strideV=-1, offsetV=2
	var vrev = new Complex128Array( [ -0.3, 0.2, 0.5, 0.5, 1.0, 0.0 ] );
	zlarf( 'left', 3, 2, vrev, -1, 2, tau, 0, C2, 1, 3, 0, work2, 1, 0 );

	// Should produce same result
	var C1v = reinterpret( C1, 0 );
	var C2v = reinterpret( C2, 0 );
	for ( var i = 0; i < C1v.length; i++ ) {
		assert.strictEqual( C2v[ i ], C1v[ i ], 'C[' + i + ']' );
	}
});

test( 'zlarf: left side, 4x3 matrix', function t() {
	var tc = zlarfLeft4x3;
	var v = new Complex128Array( [
		1.0, 0.0,  0.2, 0.3,  -0.5, 0.1,  0.4, -0.6
	]);
	var tau = new Complex128Array( [ 1.2, -0.4 ] );
	var C = new Complex128Array( [
		1.0, 0.0,   0.0, 1.0,   2.0, -1.0,  3.0, 0.5,
		-1.0, 2.0,  0.5, 0.5,   1.5, -0.5, -2.0, 1.0,
		0.0, 0.0,   1.0, 1.0,  -0.5, 0.0,   2.0, -2.0
	]);
	var work = new Complex128Array( 20 );

	zlarf( 'left', 4, 3, v, 1, 0, tau, 0, C, 1, 4, 0, work, 1, 0 );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.C, 'C' );
});
