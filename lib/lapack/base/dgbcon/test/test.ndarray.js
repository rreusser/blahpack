/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/ndarray.js';
import dgbcon from './../lib/ndarray.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// Build the dgbtrf storage (LDAB = 2*KL + KU + 1 rows, N cols, column-major).
// A is given as N-by-N column-major.
function bandStore( A, N, kl, ku ) {
	var LDAB = (2 * kl) + ku + 1;
	var AB = new Float64Array( LDAB * N );
	var i;
	var j;

	// Fortran convention: AB(KL+KU+1+i-j, j) = A(i,j) for max(1,j-KU) <= i <= min(M,j+KL)

	// 0-based: row index in AB = kl + ku + i - j, column = j
	for ( j = 0; j < N; j++ ) {
		var iLo = Math.max( 0, j - ku );
		var iHi = Math.min( N - 1, j + kl );
		for ( i = iLo; i <= iHi; i++ ) {
			AB[ (j * LDAB) + (kl + ku + i - j) ] = A[ (j * N) + i ];
		}
	}
	return AB;
}

// 1-norm of dense matrix in column-major (max col sum)
function norm1Dense( A, N ) {
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

function normInfDense( A, N ) {
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
	assert.strictEqual( typeof dgbcon, 'function', 'main export is a function' );
});

test( 'dgbcon: throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dgbcon( 'invalid', 3, 1, 1, new Float64Array( 12 ), 1, 4, 0, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 9 ), 1, 0, new Int32Array( 3 ), 1, 0 );
	}, TypeError );
});

test( 'dgbcon: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgbcon( 'one-norm', -1, 1, 1, new Float64Array( 12 ), 1, 4, 0, new Int32Array( 3 ), 1, 0, 1.0, new Float64Array( 1 ), new Float64Array( 9 ), 1, 0, new Int32Array( 3 ), 1, 0 );
	}, RangeError );
});

test( 'dgbcon: N=0 quick return (rcond=1)', function t() {
	var rcond = new Float64Array( 1 );
	var info = dgbcon( 'one-norm', 0, 0, 0, new Float64Array( 0 ), 1, 1, 0, new Int32Array( 0 ), 1, 0, 0.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 1.0 );
});

test( 'dgbcon: anorm=0 returns rcond=0', function t() {
	var N = 3;
	var kl = 0;
	var ku = 0;
	var LDAB = (2 * kl) + ku + 1;
	var AB = new Float64Array( LDAB * N );
	var IPIV = new Int32Array( N );
	var rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, 0.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dgbcon: KL=0 KU=0 (diagonal) 4x4', function t() {
	var N = 4;
	var kl = 0;
	var ku = 0;

	// A = diag(4,3,2,1)
	var Adense = new Float64Array( N * N );
	Adense[ 0 ] = 4.0;
	Adense[ 5 ] = 3.0;
	Adense[ 10 ] = 2.0;
	Adense[ 15 ] = 1.0;
	var anorm = norm1Dense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );

	// rcond = 1/(4*1) = 0.25
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dgbcon: KL=1 KU=1 (tridiagonal) 5x5', function t() {
	var N = 5;
	var kl = 1;
	var ku = 1;
	var Adense = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 4.0;
		if ( i < N - 1 ) {
			Adense[ (i * N) + (i + 1) ] = 1.0;
			Adense[ ((i + 1) * N) + i ] = 1.0;
		}
	}
	var anorm = norm1Dense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dgbcon: KL=1 KU=1 (tridiagonal) 5x5 inf-norm', function t() {
	var N = 5;
	var kl = 1;
	var ku = 1;
	var Adense = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 4.0;
		if ( i < N - 1 ) {
			Adense[ (i * N) + (i + 1) ] = 1.0;
			Adense[ ((i + 1) * N) + i ] = 1.0;
		}
	}
	var anorm = normInfDense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'inf-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgbcon: KL=2 KU=1 5x5', function t() {
	var N = 5;
	var kl = 2;
	var ku = 1;
	var Adense = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 4.0;
	}
	for ( i = 0; i < N - 1; i++ ) {
		Adense[ (i * N) + (i + 1) ] = 1.0; // superdiag
		Adense[ ((i + 1) * N) + i ] = 1.0; // subdiag1
	}
	for ( i = 0; i < N - 2; i++ ) {
		Adense[ ((i + 2) * N) + i ] = 0.5; // subdiag2
	}
	var anorm = norm1Dense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgbcon: KL=N-1 KU=N-1 (full) 4x4', function t() {
	var N = 4;
	var kl = N - 1;
	var ku = N - 1;
	var Adense = new Float64Array([
		4.0, 1.0, 0.0, 0.0,
		1.0, 4.0, 1.0, 0.0,
		0.0, 1.0, 4.0, 1.0,
		0.0, 0.0, 1.0, 4.0
	]);
	var anorm = norm1Dense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgbcon: KL=1 KU=1 6x6 ill-conditioned', function t() {
	var N = 6;
	var kl = 1;
	var ku = 1;
	var Adense = new Float64Array( N * N );
	var i;

	// near-singular tridiagonal: small diagonal compared to off-diagonals
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 1.0001;
		if ( i < N - 1 ) {
			Adense[ (i * N) + (i + 1) ] = 1.0;
			Adense[ ((i + 1) * N) + i ] = 1.0;
		}
	}
	var anorm = norm1Dense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] >= 0.0 && rcond[ 0 ] <= 1.0 );
});

test( 'dgbcon: KL=0 KU=0 N=1 (degenerate diagonal)', function t() {
	var N = 1;
	var kl = 0;
	var ku = 0;
	var LDAB = (2 * kl) + ku + 1;
	var AB = new Float64Array( LDAB * N );
	AB[ 0 ] = 5.0;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, 5.0, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );

	// 1x1 with A=[5] gives rcond = 1/(5*0.2) = 1
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dgbcon: KL=0 KU=0 5x5 inf-norm diagonal', function t() {
	var N = 5;
	var kl = 0;
	var ku = 0;
	var Adense = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = i + 1;
	}
	var anorm = normInfDense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'inf-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );

	// rcond = 1/(5 * 1) = 0.2
	assert.ok( close( rcond[ 0 ], 0.2, 1e-9 ) );
});

test( 'dgbcon: tridiagonal 7x7 exercises full reverse-comm loop', function t() {
	var N = 7;
	var kl = 1;
	var ku = 1;
	var Adense = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 3.0;
	}
	for ( i = 0; i < N - 1; i++ ) {
		Adense[ (i * N) + (i + 1) ] = -1.0;
		Adense[ ((i + 1) * N) + i ] = -1.0;
	}
	var anorm = norm1Dense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'one-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});

test( 'dgbcon: tridiagonal 7x7 inf-norm', function t() {
	var N = 7;
	var kl = 1;
	var ku = 1;
	var Adense = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Adense[ (i * N) + i ] = 3.0;
	}
	for ( i = 0; i < N - 1; i++ ) {
		Adense[ (i * N) + (i + 1) ] = -1.0;
		Adense[ ((i + 1) * N) + i ] = -1.0;
	}
	var anorm = normInfDense( Adense, N );
	var AB = bandStore( Adense, N, kl, ku );
	var LDAB = (2 * kl) + ku + 1;
	var IPIV = new Int32Array( N );
	dgbtrf( N, N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0 );
	var rcond = new Float64Array( 1 );
	var work = new Float64Array( 3 * N );
	var iwork = new Int32Array( N );
	var info = dgbcon( 'inf-norm', N, kl, ku, AB, 1, LDAB, 0, IPIV, 1, 0, anorm, rcond, work, 1, 0, iwork, 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.0 );
});
