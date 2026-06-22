/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtpcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// Pack an N-by-N upper triangular column-major matrix into AP
// AP[i + j*(j+1)/2] = A[i,j] for 0 <= i <= j < N
function packUpper( A, N ) {
	var AP = new Float64Array( N * (N+1) / 2 );
	var j;
	var i;
	var k = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			AP[ k ] = A[ i + j*N ];
			k++;
		}
	}
	return AP;
}

// Pack an N-by-N lower triangular column-major matrix into AP
// AP[(j*(2*N-j+1))/2 + (i-j)] = A[i,j] for 0 <= j <= i < N
function packLower( A, N ) {
	var AP = new Float64Array( N * (N+1) / 2 );
	var j;
	var i;
	var k = 0;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			AP[ k ] = A[ i + j*N ];
			k++;
		}
	}
	return AP;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtpcon, 'function', 'main export is a function' );
});

test( 'dtpcon: throws TypeError for invalid uplo', function t() {
	var AP = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtpcon( 'one-norm', 'invalid', 'non-unit', 2, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, TypeError );
});

test( 'dtpcon: throws TypeError for invalid diag', function t() {
	var AP = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtpcon( 'one-norm', 'upper', 'invalid', 2, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, TypeError );
});

test( 'dtpcon: throws RangeError for negative N', function t() {
	var AP = new Float64Array( 3 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtpcon( 'one-norm', 'upper', 'non-unit', -1, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, RangeError );
});

test( 'dtpcon: N=0 quick return (rcond=1)', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', 0, new Float64Array( 0 ), 1, 0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dtpcon: zero matrix returns rcond=0', function t() {
	var N = 3;
	var AP = new Float64Array( 6 );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dtpcon: identity 3x3 upper non-unit (one-norm, rcond=1)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dtpcon: identity 3x3 upper non-unit (inf-norm, rcond=1)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dtpcon: upper unit 4x4 (one-norm)', function t() {
	// Unit-diagonal (off-diags small) ⇒ rcond near 1
	var N = 4;
	var A = new Float64Array( N*N );
	// Set strict upper part and 1's on diagonal explicitly (diag is implicit unit, but pack still expects something there)
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: upper unit 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'upper', 'unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: lower non-unit 4x4 diagonal (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	// diag-only triangular ⇒ rcond = min/max = 1/4
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dtpcon: lower non-unit 4x4 diagonal (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dtpcon: lower unit 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'lower', 'unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: lower unit 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'lower', 'unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: ill-conditioned upper 4x4 (small rcond)', function t() {
	// Diagonal with [1, 1e-6, 1, 1] is ill-conditioned
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0;
	A[ 5 ] = 1e-6;
	A[ 10 ] = 1.0;
	A[ 15 ] = 1.0;
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] < 1e-5 );
});

test( 'dtpcon: well-conditioned upper non-unit 3x3 (one-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	// Upper-triangular with diag 2,2,2 and superdiag entries 1
	A[ 0 ] = 2.0;
	A[ 3 ] = 1.0; A[ 4 ] = 2.0;
	A[ 6 ] = 0.0; A[ 7 ] = 1.0; A[ 8 ] = 2.0;
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: well-conditioned upper non-unit 3x3 (inf-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0;
	A[ 3 ] = 1.0; A[ 4 ] = 2.0;
	A[ 6 ] = 0.0; A[ 7 ] = 1.0; A[ 8 ] = 2.0;
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: lower non-unit 3x3 well-conditioned (one-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0; A[ 1 ] = 1.0; A[ 2 ] = 0.0;
	A[ 4 ] = 2.0; A[ 5 ] = 1.0;
	A[ 8 ] = 2.0;
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: lower non-unit 3x3 well-conditioned (inf-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0; A[ 1 ] = 1.0; A[ 2 ] = 0.0;
	A[ 4 ] = 2.0; A[ 5 ] = 1.0;
	A[ 8 ] = 2.0;
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtpcon: 6x6 upper non-unit dense triangle exercises reverse-comm loop', function t() {
	var N = 6;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else {
				A[ i + j*N ] = ( ((i*3) + (j*7)) % 5 ) - 2;
			}
		}
	}
	var AP = packUpper( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dtpcon: 6x6 lower non-unit dense triangle (inf-norm)', function t() {
	var N = 6;
	var A = new Float64Array( N*N );
	var i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else {
				A[ i + j*N ] = ( ((i*3) + (j*7)) % 5 ) - 2;
			}
		}
	}
	var AP = packLower( A, N );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'inf-norm', 'lower', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dtpcon: N=1 upper non-unit', function t() {
	var N = 1;
	var AP = new Float64Array( [ 2.0 ] );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtpcon( 'one-norm', 'upper', 'non-unit', N, AP, 1, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});
