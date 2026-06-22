

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrttp from './../lib/index.js';

// FIXTURES //

import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import lower_3x3_lda4 from './fixtures/lower_3x3_lda4.json' with { type: 'json' };
import upper_3x3_lda4 from './fixtures/upper_3x3_lda4.json' with { type: 'json' };

// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[i] - expected[i] ) / Math.max( Math.abs( expected[i] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[i] + ', got ' + actual[i] );
	}
}

// TESTS //

test( 'ztrttp: main export is a function', function t() {
	assert.strictEqual( typeof ztrttp, 'function' );
});

test( 'ztrttp: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof ztrttp.ndarray, 'function' );
});

test( 'ztrttp.ndarray: lower triangular 3x3', function t() {
	var info;
	var tc = lower_3x3;
	// A is 3x3 complex matrix, column-major, LDA=3
	// Lower tri: A(1,1)=(1,0.1), A(2,1)=(2,0.2), A(3,1)=(3,0.3),
	//            A(2,2)=(5,0.5), A(3,2)=(6,0.6),
	//            A(3,3)=(9,0.9)
	// Stored column-major with stride1=1, stride2=3
	var A = new Complex128Array( [
		1.0, 0.1, 2.0, 0.2, 3.0, 0.3,
		99.0, 99.0, 5.0, 0.5, 6.0, 0.6,
		99.0, 99.0, 99.0, 99.0, 9.0, 0.9
	] );
	var AP = new Complex128Array( 6 );
	info = ztrttp.ndarray( 'lower', 3, A, 1, 3, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'lower_3x3 AP' );
});

test( 'ztrttp.ndarray: upper triangular 3x3', function t() {
	var info;
	var tc = upper_3x3;
	// Upper tri: A(1,1)=(1,-0.1), A(1,2)=(4,-0.4), A(2,2)=(5,-0.5),
	//            A(1,3)=(7,-0.7), A(2,3)=(8,-0.8), A(3,3)=(9,-0.9)
	var A = new Complex128Array( [
		1.0, -0.1, 99.0, 99.0, 99.0, 99.0,
		4.0, -0.4, 5.0, -0.5, 99.0, 99.0,
		7.0, -0.7, 8.0, -0.8, 9.0, -0.9
	] );
	var AP = new Complex128Array( 6 );
	info = ztrttp.ndarray( 'upper', 3, A, 1, 3, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'upper_3x3 AP' );
});

test( 'ztrttp.ndarray: lower triangular 4x4', function t() {
	var info;
	var tc = lower_4x4;
	// Lower 4x4: A(i,j) for i>=j, value = (i+(j-1)*4, (i+(j-1)*4)*0.01)
	var A = new Complex128Array( [
		1.0, 0.01, 2.0, 0.02, 3.0, 0.03, 4.0, 0.04,
		0.0, 0.0, 6.0, 0.06, 7.0, 0.07, 8.0, 0.08,
		0.0, 0.0, 0.0, 0.0, 11.0, 0.11, 12.0, 0.12,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 16.0, 0.16
	] );
	var AP = new Complex128Array( 10 );
	info = ztrttp.ndarray( 'lower', 4, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'lower_4x4 AP' );
});

test( 'ztrttp.ndarray: upper triangular 4x4', function t() {
	var info;
	var tc = upper_4x4;
	// Upper 4x4: A(i,j) for i<=j, value = (i+(j-1)*4, -(i+(j-1)*4)*0.1)
	var A = new Complex128Array( [
		1.0, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		5.0, -0.5, 6.0, -0.6, 0.0, 0.0, 0.0, 0.0,
		9.0, -0.9, 10.0, -1.0, 11.0, -1.1, 0.0, 0.0,
		13.0, -1.3, 14.0, -1.4, 15.0, -1.5, 16.0, -1.6
	] );
	var AP = new Complex128Array( 10 );
	info = ztrttp.ndarray( 'upper', 4, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'upper_4x4 AP' );
});

test( 'ztrttp.ndarray: N=0 quick return', function t() {
	var info;
	var AP = new Complex128Array( [ -1.0, -1.0 ] );
	var APv = reinterpret( AP, 0 );
	info = ztrttp.ndarray( 'lower', 0, new Complex128Array( 1 ), 1, 1, 0, AP, 1, 0 );
	assert.equal( info, 0 );
	// AP should be untouched
	assert.equal( APv[ 0 ], -1.0 );
	assert.equal( APv[ 1 ], -1.0 );
});

test( 'ztrttp.ndarray: N=1 lower', function t() {
	var info;
	var tc = n_one_lower;
	var A = new Complex128Array( [ 42.0, -3.5 ] );
	var AP = new Complex128Array( 1 );
	info = ztrttp.ndarray( 'lower', 1, A, 1, 1, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'n_one_lower AP' );
});

test( 'ztrttp.ndarray: N=1 upper', function t() {
	var info;
	var tc = n_one_upper;
	var A = new Complex128Array( [ 77.0, 1.25 ] );
	var AP = new Complex128Array( 1 );
	info = ztrttp.ndarray( 'upper', 1, A, 1, 1, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'n_one_upper AP' );
});

test( 'ztrttp.ndarray: lower 3x3 with LDA > N (LDA=4)', function t() {
	var info;
	var tc = lower_3x3_lda4;
	// Column-major with LDA=4: 4 complex elements per column, N=3
	var A = new Complex128Array( [
		1.0, 0.1, 2.0, 0.2, 3.0, 0.3, 0.0, 0.0,
		0.0, 0.0, 5.0, 0.5, 6.0, 0.6, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 9.0, 0.9, 0.0, 0.0
	] );
	var AP = new Complex128Array( 6 );
	info = ztrttp.ndarray( 'lower', 3, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'lower_3x3_lda4 AP' );
});

test( 'ztrttp.ndarray: upper 3x3 with LDA > N (LDA=4)', function t() {
	var info;
	var tc = upper_3x3_lda4;
	var A = new Complex128Array( [
		1.0, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
		4.0, -0.4, 5.0, -0.5, 0.0, 0.0, 0.0, 0.0,
		7.0, -0.7, 8.0, -0.8, 9.0, -0.9, 0.0, 0.0
	] );
	var AP = new Complex128Array( 6 );
	info = ztrttp.ndarray( 'upper', 3, A, 1, 4, 0, AP, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( Array.from( reinterpret( AP, 0 ) ), tc.AP, 1e-14, 'upper_3x3_lda4 AP' );
});

test( 'ztrttp.ndarray: supports non-unit strides for AP', function t() {
	var info;
	var APv;
	// Lower 2x2: A = [[(1,2), x], [(3,4), (5,6)]]
	var A = new Complex128Array( [
		1.0, 2.0, 3.0, 4.0,
		99.0, 99.0, 5.0, 6.0
	] );
	// AP stride=2 (pack into every other complex element)
	var AP = new Complex128Array( 6 );
	info = ztrttp.ndarray( 'lower', 2, A, 1, 2, 0, AP, 2, 0 );
	assert.equal( info, 0 );
	APv = reinterpret( AP, 0 );
	// Lower packed: A(0,0), A(1,0), A(1,1)
	// = (1,2), (3,4), (5,6) at positions 0, 2, 4 in complex elements
	assert.equal( APv[ 0 ], 1.0 );
	assert.equal( APv[ 1 ], 2.0 );
	assert.equal( APv[ 4 ], 3.0 );
	assert.equal( APv[ 5 ], 4.0 );
	assert.equal( APv[ 8 ], 5.0 );
	assert.equal( APv[ 9 ], 6.0 );
});

test( 'ztrttp.ndarray: supports offset for A and AP', function t() {
	var info;
	var APv;
	// A data starts at offset 1 (1 complex element padding)
	var A = new Complex128Array( [
		99.0, 99.0,
		1.0, -1.0, 99.0, 99.0,
		3.0, -3.0, 4.0, -4.0
	] );
	// Upper 2x2 starting at offset 1 in A, stride1=1, stride2=2
	var AP = new Complex128Array( 4 );
	info = ztrttp.ndarray( 'upper', 2, A, 1, 2, 1, AP, 1, 1 );
	assert.equal( info, 0 );
	APv = reinterpret( AP, 0 );
	// Upper packed: A(0,0)=(1,-1), A(0,1)=(3,-3), A(1,1)=(4,-4)
	// AP[0] untouched (0,0), AP[1]=(1,-1), AP[2]=(3,-3), AP[3]=(4,-4)
	assert.equal( APv[ 0 ], 0.0 );
	assert.equal( APv[ 1 ], 0.0 );
	assert.equal( APv[ 2 ], 1.0 );
	assert.equal( APv[ 3 ], -1.0 );
	assert.equal( APv[ 4 ], 3.0 );
	assert.equal( APv[ 5 ], -3.0 );
	assert.equal( APv[ 6 ], 4.0 );
	assert.equal( APv[ 7 ], -4.0 );
});

test( 'ztrttp.ndarray: supports row-major stride for A', function t() {
	var info;
	var APv;
	// Row-major 2x2: strideA1=2, strideA2=1
	// A stored as: [(1,0.1), (3,0.3), (2,0.2), (4,0.4)]
	// This represents matrix:
	//   row 0: (1,0.1) (3,0.3)
	//   row 1: (2,0.2) (4,0.4)
	// With stride1=2, stride2=1: A(i,j) = A[offset + i*2 + j*1]
	var A = new Complex128Array( [
		1.0, 0.1, 3.0, 0.3,
		2.0, 0.2, 4.0, 0.4
	] );
	var AP = new Complex128Array( 3 );
	info = ztrttp.ndarray( 'lower', 2, A, 2, 1, 0, AP, 1, 0 );
	assert.equal( info, 0 );
	APv = reinterpret( AP, 0 );
	// Lower packed: A(0,0)=(1,0.1), A(1,0)=(2,0.2), A(1,1)=(4,0.4)
	assert.equal( APv[ 0 ], 1.0 );
	assert.equal( APv[ 1 ], 0.1 );
	assert.equal( APv[ 2 ], 2.0 );
	assert.equal( APv[ 3 ], 0.2 );
	assert.equal( APv[ 4 ], 4.0 );
	assert.equal( APv[ 5 ], 0.4 );
});

test( 'ztrttp.ndarray: uplo validation throws TypeError', function t() {
	var A = new Complex128Array( 4 );
	var AP = new Complex128Array( 3 );
	assert.throws( function badUplo() {
		ztrttp.ndarray( 'invalid', 2, A, 1, 2, 0, AP, 1, 0 );
	}, TypeError );
});
