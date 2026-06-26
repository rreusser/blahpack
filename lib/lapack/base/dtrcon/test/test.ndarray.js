/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dtrcon, 'function', 'main export is a function' );
});

test( 'dtrcon: throws TypeError for invalid uplo', function t() {
	var A = new Float64Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtrcon( 'one-norm', 'invalid', 'non-unit', 2, A, 1, 2, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, TypeError );
});

test( 'dtrcon: throws TypeError for invalid diag', function t() {
	var A = new Float64Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtrcon( 'one-norm', 'upper', 'invalid', 2, A, 1, 2, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, TypeError );
});

test( 'dtrcon: throws RangeError for negative N', function t() {
	var A = new Float64Array( 4 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 6 );
	var iwork = new Int32Array( 2 );
	assert.throws( function throws() {
		dtrcon( 'one-norm', 'upper', 'non-unit', -1, A, 1, 2, 0, rcond, work, 1, 0, iwork, 1, 0 );
	}, RangeError );
});

test( 'dtrcon: N=0 quick return (rcond=1)', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', 0, new Float64Array( 0 ), 1, 1, 0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dtrcon: zero matrix returns rcond=0', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dtrcon: identity 3x3 upper non-unit (one-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dtrcon: identity 3x3 upper non-unit (inf-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 4 ] = 1.0; A[ 8 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dtrcon: upper unit 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: upper unit 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'upper', 'unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: lower non-unit diagonal 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'lower', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dtrcon: lower non-unit diagonal 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 4.0; A[ 5 ] = 3.0; A[ 10 ] = 2.0; A[ 15 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'lower', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dtrcon: lower unit 4x4 (one-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'lower', 'unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: lower unit 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			A[ i + j*N ] = ( i === j ) ? 1.0 : 0.1;
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'lower', 'unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: ill-conditioned upper diag (small rcond)', function t() {
	var N = 4;
	var A = new Float64Array( N*N );
	A[ 0 ] = 1.0; A[ 5 ] = 1e-6; A[ 10 ] = 1.0; A[ 15 ] = 1.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] < 1e-5 );
});

test( 'dtrcon: well-conditioned upper non-unit 3x3 (one-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0;
	A[ 3 ] = 1.0; A[ 4 ] = 2.0;
	A[ 6 ] = 0.0; A[ 7 ] = 1.0; A[ 8 ] = 2.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: well-conditioned upper non-unit 3x3 (inf-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0;
	A[ 3 ] = 1.0; A[ 4 ] = 2.0;
	A[ 6 ] = 0.0; A[ 7 ] = 1.0; A[ 8 ] = 2.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: well-conditioned lower non-unit 3x3 (one-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0; A[ 1 ] = 1.0; A[ 2 ] = 0.0;
	A[ 4 ] = 2.0; A[ 5 ] = 1.0;
	A[ 8 ] = 2.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'lower', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: well-conditioned lower non-unit 3x3 (inf-norm)', function t() {
	var N = 3;
	var A = new Float64Array( N*N );
	A[ 0 ] = 2.0; A[ 1 ] = 1.0; A[ 2 ] = 0.0;
	A[ 4 ] = 2.0; A[ 5 ] = 1.0;
	A[ 8 ] = 2.0;
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'lower', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dtrcon: 6x6 dense upper non-unit exercises reverse-comm loop (one-norm)', function t() {
	var N = 6;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else {
				A[ i + j*N ] = ( ((i*3) + (j*7)) % 5 ) - 2;
			}
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dtrcon: 6x6 dense lower non-unit (inf-norm)', function t() {
	var N = 6;
	var A = new Float64Array( N*N );
	var i; var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				A[ i + j*N ] = 5.0;
			} else {
				A[ i + j*N ] = ( ((i*3) + (j*7)) % 5 ) - 2;
			}
		}
	}
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'inf-norm', 'lower', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dtrcon: N=1 upper non-unit', function t() {
	var N = 1;
	var A = new Float64Array( [ 2.0 ] );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dtrcon( 'one-norm', 'upper', 'non-unit', N, A, 1, N, 0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});
