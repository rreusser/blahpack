/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// Build a packed complex upper triangular matrix from a real diagonal/upper triangle.
// AP[k] = A[i,j] for 0 <= i <= j < N, k=i+j*(j+1)/2.
function packUpperFromReal( diagAndUpper, N ) {
	var AP = new Complex128Array( N * (N+1) / 2 );
	var view = reinterpret( AP, 0 );
	var k = 0;
	var j, i;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			view[ 2*k ] = diagAndUpper[ i + j*N ];
			view[ 2*k + 1 ] = 0.0;
			k++;
		}
	}
	return AP;
}

function packLowerFromReal( diagAndLower, N ) {
	var AP = new Complex128Array( N * (N+1) / 2 );
	var view = reinterpret( AP, 0 );
	var k = 0;
	var j, i;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			view[ 2*k ] = diagAndLower[ i + j*N ];
			view[ 2*k + 1 ] = 0.0;
			k++;
		}
	}
	return AP;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ztpcon, 'function', 'main export is a function' );
});

test( 'ztpcon: throws TypeError for invalid uplo', function t() {
	var AP = new Complex128Array( 3 );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 4 );
	var rwork = new Float64Array( 2 );
	assert.throws( function throws() {
		ztpcon( 'one-norm', 'invalid', 'non-unit', 2, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	}, TypeError );
});

test( 'ztpcon: throws TypeError for invalid diag', function t() {
	var AP = new Complex128Array( 3 );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 4 );
	var rwork = new Float64Array( 2 );
	assert.throws( function throws() {
		ztpcon( 'one-norm', 'upper', 'invalid', 2, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	}, TypeError );
});

test( 'ztpcon: throws RangeError for negative N', function t() {
	var AP = new Complex128Array( 3 );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 4 );
	var rwork = new Float64Array( 2 );
	assert.throws( function throws() {
		ztpcon( 'one-norm', 'upper', 'non-unit', -1, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	}, RangeError );
});

test( 'ztpcon: N=0 quick return (rcond=1)', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', 0, new Complex128Array( 0 ), 1, 0, rcond, new Complex128Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'ztpcon: zero matrix returns rcond=0', function t() {
	var N = 3;
	var AP = new Complex128Array( 6 );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'ztpcon: identity 3x3 upper non-unit (one-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AP = packUpperFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'ztpcon: identity 3x3 upper non-unit (inf-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AP = packUpperFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'inf-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'ztpcon: upper unit 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packUpperFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztpcon: upper unit 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packUpperFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'inf-norm', 'upper', 'unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztpcon: lower non-unit diagonal 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var AP = packLowerFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'ztpcon: lower non-unit diagonal 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var AP = packLowerFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'inf-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'ztpcon: lower unit 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packLowerFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'lower', 'unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztpcon: lower unit 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packLowerFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'inf-norm', 'lower', 'unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztpcon: ill-conditioned upper diagonal (small rcond)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 5 ] = 1e-6; A[ 10 ] = 1.0; A[ 15 ] = 1.0;
	var AP = packUpperFromReal( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] < 1e-5 );
});

test( 'ztpcon: complex 3x3 upper non-unit (one-norm)', function t() {
	var N = 3;
	// Pack diagonal of 2+i and superdiagonal of 1
	var AP = new Complex128Array( 6 );
	var v = reinterpret( AP, 0 );
	// k=0: A[0,0] = 2+i
	v[ 0 ] = 2.0; v[ 1 ] = 1.0;
	// k=1: A[0,1] = 1+0i
	v[ 2 ] = 1.0; v[ 3 ] = 0.0;
	// k=2: A[1,1] = 2+i
	v[ 4 ] = 2.0; v[ 5 ] = 1.0;
	// k=3: A[0,2] = 0
	v[ 6 ] = 0.0; v[ 7 ] = 0.0;
	// k=4: A[1,2] = 1
	v[ 8 ] = 1.0; v[ 9 ] = 0.0;
	// k=5: A[2,2] = 2+i
	v[ 10 ] = 2.0; v[ 11 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztpcon: complex 3x3 lower non-unit (inf-norm)', function t() {
	var N = 3;
	var AP = new Complex128Array( 6 );
	var v = reinterpret( AP, 0 );
	// lower packed: k=0:A[0,0], k=1:A[1,0], k=2:A[2,0], k=3:A[1,1], k=4:A[2,1], k=5:A[2,2]
	v[ 0 ] = 2.0; v[ 1 ] = 1.0;
	v[ 2 ] = 1.0; v[ 3 ] = 0.0;
	v[ 4 ] = 0.0; v[ 5 ] = 0.0;
	v[ 6 ] = 2.0; v[ 7 ] = 1.0;
	v[ 8 ] = 1.0; v[ 9 ] = 0.0;
	v[ 10 ] = 2.0; v[ 11 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'inf-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'ztpcon: 6x6 dense complex upper exercises reverse-comm loop', function t() {
	var N = 6;
	var AP = new Complex128Array( N * (N+1) / 2 );
	var v = reinterpret( AP, 0 );
	var k = 0;
	var j, i;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				v[ 2*k ] = 5.0; v[ 2*k + 1 ] = 0.5;
			} else {
				v[ 2*k ] = ( ((i*3) + (j*7)) % 5 ) - 2;
				v[ 2*k + 1 ] = ( ((i*5) + (j*3)) % 3 ) - 1;
			}
			k++;
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'ztpcon: N=1 upper non-unit', function t() {
	var N = 1;
	var AP = new Complex128Array( 1 );
	var v = reinterpret( AP, 0 );
	v[ 0 ] = 2.0; v[ 1 ] = 0.0;
	var rcond = new Float64Array( 1 );
	var work = new Complex128Array( 2 * N );
	var rwork = new Float64Array( N );
	var info = ztpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, rwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});
