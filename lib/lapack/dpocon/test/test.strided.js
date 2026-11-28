/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpotrf from './../../dpotrf/lib/strided.js';
import dpocon from './../lib/strided.js';
import dpoconWrapper from './../lib/dpocon.js';


// HELPERS //

function close( got, expected, tol ) {
	return Math.abs( got - expected ) <= tol * Math.max( Math.abs( expected ), 1.0 );
}

// 1-norm of a symmetric N-by-N column-major matrix (max column sum of |.|)
function norm1Sym( A, N ) {
	let maxs = 0.0;
	let s, i, j;
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
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			A[ ( i * N ) + j ] = A[ ( j * N ) + i ];
		}
	}
}

function symmetrizeFromLower( A, N ) {
	let i, j;
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
	const rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	const info = dpocon( 'upper', 0, new Float64Array( 0 ), 1, 1, 0, 0.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'dpocon: N=0 sets rcond = 1, as the reference and the layout wrapper do (ticket 0074)', function t() {
	const rcond = new Float64Array( [ 0.5 ] );
	const rcondW = new Float64Array( [ 0.5 ] );
	const info = dpocon( 'upper', 0, new Float64Array( 0 ), 1, 1, 0, 2.0, rcond, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	const infoW = dpoconWrapper( 'column-major', 'upper', 0, new Float64Array( 0 ), 1, 2.0, rcondW, null, null );
	assert.strictEqual( info, infoW );
	assert.strictEqual( rcond[ 0 ], 1.0 );
	assert.strictEqual( rcond[ 0 ], rcondW[ 0 ] );
});

test( 'dpocon: anorm=0 returns rcond=0 (upper)', function t() {
	const N = 3;
	const A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	const rcond = new Float64Array( 1 );
	rcond[ 0 ] = 0.5;
	const info = dpocon( 'upper', N, A, 1, N, 0, 0.0, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.strictEqual( rcond[ 0 ], 0.0 );
});

test( 'dpocon: identity 3x3 upper (rcond=1)', function t() {
	const N = 3;
	const A = new Float64Array( N * N );
	A[ 0 ] = 1.0;
	A[ 4 ] = 1.0;
	A[ 8 ] = 1.0;
	const anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dpocon: identity 4x4 lower (rcond=1)', function t() {
	const N = 4;
	const A = new Float64Array( N * N );
	let i;
	for ( i = 0; i < N; i++ ) {
		A[ ( i * N ) + i ] = 1.0;
	}
	const anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-9 ) );
});

test( 'dpocon: diagonal 4x4 upper', function t() {
	const N = 4;
	const A = new Float64Array( N * N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	const anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dpocon: diagonal 4x4 lower', function t() {
	const N = 4;
	const A = new Float64Array( N * N );
	A[ 0 ] = 4.0;
	A[ 5 ] = 3.0;
	A[ 10 ] = 2.0;
	A[ 15 ] = 1.0;
	const anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 0.25, 1e-9 ) );
});

test( 'dpocon: tridiagonal SPD 3x3 upper', function t() {
	// A = [[4,1,0],[1,4,1],[0,1,4]]
	const N = 3;
	const A = new Float64Array([
		4.0, 1.0, 0.0,
		1.0, 4.0, 1.0,
		0.0, 1.0, 4.0
	]);
	const anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dpocon: tridiagonal SPD 4x4 lower', function t() {
	const N = 4;
	const A = new Float64Array([
		4.0, 1.0, 0.0, 0.0,
		1.0, 4.0, 1.0, 0.0,
		0.0, 1.0, 4.0, 1.0,
		0.0, 0.0, 1.0, 4.0
	]);
	const anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.1 && rcond[ 0 ] <= 1.0 );
});

test( 'dpocon: ill-conditioned (Hilbert-like) 4x4 upper', function t() {
	const N = 4;
	const A = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			A[ ( j * N ) + i ] = 1.0 / ( i + j + 1 );
		}
	}
	const anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] >= 0.0 && rcond[ 0 ] < 0.01, 'rcond should be small for Hilbert' );
});

test( 'dpocon: 5x5 SPD upper well-conditioned', function t() {
	const N = 5;
	const A = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ ( j * N ) + i ] = 5.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				A[ ( j * N ) + i ] = 1.0;
			}
		}
	}
	const anorm = norm1Sym( A, N );
	dpotrf( 'upper', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dpocon: 5x5 SPD lower well-conditioned', function t() {
	const N = 5;
	const A = new Float64Array( N * N );
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				A[ ( j * N ) + i ] = 5.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				A[ ( j * N ) + i ] = 1.0;
			}
		}
	}
	const anorm = norm1Sym( A, N );
	dpotrf( 'lower', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'lower', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 * N ), 1, 0, new Int32Array( N ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( rcond[ 0 ] > 0.3 );
});

test( 'dpocon: N=1 simple', function t() {
	const N = 1;
	const A = new Float64Array( 1 );
	A[ 0 ] = 9.0;
	const anorm = 9.0;
	dpotrf( 'upper', N, A, 1, N, 0 );
	const rcond = new Float64Array( 1 );
	const info = dpocon( 'upper', N, A, 1, N, 0, anorm, rcond, new Float64Array( 3 ), 1, 0, new Int32Array( 1 ), 1, 0 );
	assert.strictEqual( info, 0 );
	assert.ok( close( rcond[ 0 ], 1.0, 1e-12 ) );

	// Suppress unused helper warnings by referencing them.
	symmetrizeFromUpper( A, N );
	symmetrizeFromLower( A, N );
});

// Regression: when the scaled solve inside the DLACN2 loop would overflow,
// the reference leaves the loop with GO TO 20, skipping the RCOND
// computation, so RCOND stays exactly 0. The second solve here grows to
// ~1/a^2 > 1/SMLNUM while EST is already ~3.5e307; the old `break` fell
// into `rcond = 1/ainvnm/anorm` and returned ~2.88e-308.
test( 'dpocon: an overflowing scaled solve leaves rcond exactly 0 (reference GO TO 20)', function t() {
	const a = 1.2e-154;
	[ 'upper', 'lower' ].forEach( function each( uplo ) {
		const rcond = new Float64Array( 1 );
		const info = dpocon( uplo, 2, new Float64Array( [ 1.0, 0.0, 0.0, a ] ), 1, 2, 0, 1.0, rcond, new Float64Array( 6 ), 1, 0, new Int32Array( 2 ), 1, 0 );
		assert.equal( info, 0, uplo + ': info' );
		assert.ok( Object.is( rcond[ 0 ], 0.0 ), uplo + ': rcond is exactly 0, got ' + rcond[ 0 ] );
	});
});

test( 'strided: inv(A) underflowing to zero leaves rcond = 0 (AINVNM = 0 guard)', function t() {
	// N = 1, factor 1e200: the two triangular solves give 1/1e200/1e200, which
	// underflows to 0 with scale = 1, so the estimator returns AINVNM = 0. The
	// reference then skips RCOND = (1/AINVNM)/ANORM and returns RCOND = 0, INFO = 0.
	[ 'upper', 'lower' ].forEach( function check( uplo ) {
		const rcond = new Float64Array( [ -1.0 ] );
		const A = new Float64Array( [ 1e200 ] );
		const info = dpocon( uplo, 1, A, 1, 1, 0, 1.0, rcond, new Float64Array( 3 ), 1, 0, new Int32Array( 1 ), 1, 0 ); // eslint-disable-line max-len
		assert.strictEqual( info, 0, uplo + ': info' );
		assert.ok( Object.is( rcond[ 0 ], 0.0 ), uplo + ': rcond is exactly 0, got ' + rcond[ 0 ] );
	});
});
