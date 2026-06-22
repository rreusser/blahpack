/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from './../../dgetrf/lib/ndarray.js';
import dgecon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// 1-norm of an N-by-N column-major matrix (max column sum of |.|)
function norm1( A, N ) {
	var maxs = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < N; i++ ) {
			s += Math.abs( A[ (j * N) + i ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}

// inf-norm of an N-by-N column-major matrix (max row sum)
function normInf( A, N ) {
	var maxs = 0.0;
	var s;
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			s += Math.abs( A[ (j * N) + i ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgecon, 'function', 'main export is a function' );
});

test( 'dgecon: throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dgecon( 'invalid', 2, new Float64Array( 4 ), 1, 2, 0, 1, new Float64Array( 1 ), new Float64Array( 8 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dgecon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgecon( 'one-norm', -1, new Float64Array( 4 ), 1, 2, 0, 1, new Float64Array( 1 ), new Float64Array( 8 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dgecon: N=0 quick return', function t() {
	var rcond = new Float64Array( 1 );
	var info = dgecon( 'one-norm', 0, new Float64Array( 0 ), 1, 1, 0, 0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dgecon: anorm=0 returns rcond=0', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dgecon( 'one-norm', N, A, 1, N, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dgecon: identity 3x3 (well-conditioned, rcond=1)', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dgecon: identity 4x4 inf-norm', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		A[ (i * N) + i ] = 1.0;
	}
	var anorm = normInf( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'inf-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dgecon: diagonal 4x4 (1-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dgecon: diagonal 4x4 (inf-norm)', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	var anorm = normInf( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'inf-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dgecon: well-conditioned 3x3 (1-norm)', function t() {
	var N = 3;
	var A = new Float64Array( [ 2.0, 1.0, 0.0,  1.0, 2.0, 1.0,  0.0, 1.0, 2.0 ] );
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dgecon: well-conditioned 4x4 (1-norm)', function t() {
	var N = 4;
	var A = new Float64Array( [
		4.0, 1.0, 0.0, 0.0,
		1.0, 4.0, 1.0, 0.0,
		0.0, 1.0, 4.0, 1.0,
		0.0, 0.0, 1.0, 4.0
	] );
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dgecon: ill-conditioned Hilbert 4x4 (small rcond)', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ (j * N) + i ] = 1.0 / ( i + j + 1 );
		}
	}
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] >= 0.0 && rcond[ 0 ] < 0.001, 'rcond should be small' );
});

test( 'dgecon: 5x5 well-conditioned (1-norm)', function t() {
	var N = 5;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ (j * N) + i ] = 5.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				A[ (j * N) + i ] = 1.0;
			}
		}
	}
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dgecon: 5x5 well-conditioned (inf-norm)', function t() {
	var N = 5;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ (j * N) + i ] = 5.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				A[ (j * N) + i ] = 1.0;
			}
		}
	}
	var anorm = normInf( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'inf-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dgecon: anorm = NaN returns info=-5, rcond=NaN', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, NaN, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, -5 );
	assert.ok( isNaN( rcond[ 0 ] ) );
});

test( 'dgecon: anorm = +Infinity returns info=-5', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, Infinity, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, -5 );
});

test( 'dgecon: 6x6 diagonally-dominant matrix exercises full reverse-comm loop', function t() {
	var N = 6;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ (j * N) + i ] = 10.0;
			} else {
				A[ (j * N) + i ] = ( ((i * 3) + (j * 7)) % 5 ) - 2;
			}
		}
	}
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgecon: 6x6 diagonally-dominant matrix (inf-norm)', function t() {
	var N = 6;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ (j * N) + i ] = 10.0;
			} else {
				A[ (j * N) + i ] = ( ((i * 3) + (j * 7)) % 5 ) - 2;
			}
		}
	}
	var anorm = normInf( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'inf-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgecon: extremely ill-conditioned (near singular)', function t() {
	// A near-singular matrix: a small perturbation of a singular one.
	// Should still produce info=0 with very small rcond.
	var N = 4;
	var A = new Float64Array( [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0 + 1e-14
	] );
	var anorm = norm1( A, N );
	var IPIV = new Int32Array( N );
	var work = new Float64Array( 4 * N );
	var iwork = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	dgetrf( N, N, A, 1, N, 0, IPIV, 1, 0 );
	var info = dgecon( 'one-norm', N, A, 1, N, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	// Could return 0 with tiny rcond, or 1 if rcond=NaN/overflows.
	assert.ok( info === 0 || info === 1 );
});
