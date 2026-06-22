/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/ndarray.js';
import dpocon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// 1-norm of a symmetric N-by-N column-major matrix (max column sum of |.|)
function norm1Sym( A, N ) {
	var maxs = 0.0;
	var s;
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		s = 0.0;
		for ( i = 0; i < N; i++ ) {
			s += Math.abs( A[ ( j * N ) + i ] );
		}
		if ( s > maxs ) {
			maxs = s;
		}
	}
	return maxs;
}

// Mirror upper triangle to lower (or vice versa) so the matrix is fully symmetric.
function symmetrizeFromUpper( A, N ) {
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			A[ ( i * N ) + j ] = A[ ( j * N ) + i ];
		}
	}
}

function symmetrizeFromLower( A, N ) {
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			A[ ( i * N ) + j ] = A[ ( j * N ) + i ];
		}
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dpocon, 'function', 'main export is a function' );
});

test( 'dpocon: throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dpocon( 'invalid', 2, new Float64Array( 4 ), 1, 2, 0, 1.0, new Float64Array( 1 ), new Float64Array( 6 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dpocon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dpocon( 'upper', -1, new Float64Array( 4 ), 1, 2, 0, 1.0, new Float64Array( 1 ), new Float64Array( 6 ), 1, 0, new Int32Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dpocon: N=0 quick return', function t() {
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dpocon( 'upper', 0, new Float64Array( 0 ), 1, 1, 0, 0.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dpocon: anorm=0 returns rcond=0 (upper)', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var info = dpocon( 'upper', N, A, 1, N, 0, 0.0, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dpocon: identity 3x3 upper (rcond=1)', function t() {
	var N = 3;
	var A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	var anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dpocon: identity 4x4 lower (rcond=1)', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		A[ ( i * N ) + i ] = 1.0;
	}
	var anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dpocon: diagonal 4x4 upper', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	var anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dpocon: diagonal 4x4 lower', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	var anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dpocon: tridiagonal SPD 3x3 upper', function t() {
	// A = [[4,1,0],[1,4,1],[0,1,4]]
	var N = 3;
	var A = new Float64Array( [
		4.0, 1.0, 0.0,
		1.0, 4.0, 1.0,
		0.0, 1.0, 4.0
	] );
	var anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dpocon: tridiagonal SPD 4x4 lower', function t() {
	var N = 4;
	var A = new Float64Array( [
		4.0, 1.0, 0.0, 0.0,
		1.0, 4.0, 1.0, 0.0,
		0.0, 1.0, 4.0, 1.0,
		0.0, 0.0, 1.0, 4.0
	] );
	var anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dpocon: ill-conditioned (Hilbert-like) 4x4 upper', function t() {
	var N = 4;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ ( j * N ) + i ] = 1.0 / ( i + j + 1 );
		}
	}
	var anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] >= 0.0 && rcond[ 0 ] < 0.01, 'rcond should be small for Hilbert' );
});

test( 'dpocon: 5x5 SPD upper well-conditioned', function t() {
	var N = 5;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ ( j * N ) + i ] = 5.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				A[ ( j * N ) + i ] = 1.0;
			}
		}
	}
	var anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dpocon: 5x5 SPD lower well-conditioned', function t() {
	var N = 5;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ ( j * N ) + i ] = 5.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				A[ ( j * N ) + i ] = 1.0;
			}
		}
	}
	var anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dpocon: N=1 simple', function t() {
	var N = 1;
	var A = new Float64Array( 1 );
	A[ 0 ] = 9.0;
	var anorm = 9.0;
	dpotrf( 'upper', N, A, 1, N, 0 );
	var rcond = new Float64Array( 1 );
	var info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-12 ) );
	// Suppress unused helper warnings by referencing them.
	symmetrizeFromUpper( A, N );
	symmetrizeFromLower( A, N );
});
