/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeql2 from './../../zgeql2/lib/base.js';
import zgeqlf from '../../zgeqlf/lib/base.js';
import zungql from './../lib/strided.js';


// FUNCTIONS //

// Random complex M x N matrix with deterministic LCG seed.
function randomMatrix( M, N, seed ) {
	const A = new Complex128Array( M * N );
	const v = reinterpret( A, 0 );
	let x = seed;
	let i;
	for ( i = 0; i < 2 * M * N; i += 1 ) {
		x = ( ( x * 1103515245 ) + 12345 ) & 0x7fffffff;
		v[ i ] = ( ( x % 2000 ) - 1000 ) / 500.0;
	}
	return A;
}

// Verify Q^H * Q = I_N (Q is M x N, taken as column-major with stride LDA).
function verifyOrthonormal( Q, M, N, LDA, tol ) {
	const Av = reinterpret( Q, 0 );
	let maxErr = 0;
	let expected, err, re, im, qi, qj, i, j, k;
	for ( i = 0; i < N; i += 1 ) {
		for ( j = 0; j < N; j += 1 ) {
			re = 0;
			im = 0;
			for ( k = 0; k < M; k += 1 ) {
				qi = 2 * ( k + ( i * LDA ) );
				qj = 2 * ( k + ( j * LDA ) );
				re += ( Av[ qi ] * Av[ qj ] ) + ( Av[ qi + 1 ] * Av[ qj + 1 ] );
				im += ( Av[ qi ] * Av[ qj + 1 ] ) - ( Av[ qi + 1 ] * Av[ qj ] );
			}
			expected = ( i === j ) ? 1.0 : 0.0;
			err = Math.abs( re - expected ) + Math.abs( im );
			if ( err > maxErr ) {
				maxErr = err;
			}
		}
	}
	assert.ok( maxErr < tol, 'Q^H*Q=I, max error: ' + maxErr );
}


// TESTS //

test( 'zungql: main export is a function', function t() {
	assert.strictEqual( typeof zungql, 'function', 'is a function' );
});

test( 'zungql: throws RangeError for negative M', function t() {
	assert.throws( function f() {
		zungql( -1, 1, 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zungql: throws RangeError for negative N', function t() {
	assert.throws( function f() {
		zungql( 1, -1, 1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zungql: throws RangeError for negative K', function t() {
	assert.throws( function f() {
		zungql( 1, 1, -1, new Complex128Array( 1 ), 1, 1, 0, new Complex128Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 0 );
	}, RangeError );
});

test( 'zungql: M=0 quick return', function t() {
	const info = zungql( 0, 0, 0, new Complex128Array( 0 ), 1, 1, 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zungql: N=0 quick return', function t() {
	const info = zungql( 3, 0, 0, new Complex128Array( 0 ), 1, 3, 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zungql: 3x3 from QL factorization (M=N=K=3)', function t() {
	const M = 3;
	const N = 3;
	const K = 3;
	const LDA = M;

	// Random matrix
	const A = randomMatrix( M, N, 12345 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( N );
	zgeql2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );

	// Generate Q
	const Wbig = new Complex128Array( N * 32 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: 5x3 (M>N) from QL factorization, K=3', function t() {
	const M = 5;
	const N = 3;
	const K = 3;
	const LDA = M;
	const A = randomMatrix( M, N, 67890 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( N );
	zgeql2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const Wbig = new Complex128Array( N * 32 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: 4x4 (M=N=K=4)', function t() {
	const M = 4;
	const N = 4;
	const K = 4;
	const LDA = M;
	const A = randomMatrix( M, N, 314159 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( N );
	zgeql2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const Wbig = new Complex128Array( N * 32 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: K=0 (no reflectors, A unchanged in last 0 cols)', function t() {
	// With K=0 and the unblocked path: zung2l(M, N, 0, ...) — no reflectors
	// applied. A is left as-is.
	const M = 3;
	const N = 3;
	const K = 0;
	const LDA = M;
	const A = new Complex128Array( M * N );

	// Set A to something distinctive
	const Av = reinterpret( A, 0 );
	Av[ 0 ] = 5;  // A[0,0] real=5
	const TAU = new Complex128Array( 1 );
	const Wbig = new Complex128Array( N * 32 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );

	// With K=0 zung2l initializes Q to identity-like (last N cols of identity).

	// We don't pin exact contents — just ensure no crash and info=0.
});

test( 'zungql: 1x1 K=1', function t() {
	const M = 1;
	const N = 1;
	const K = 1;
	const LDA = 1;
	const A = randomMatrix( M, N, 999 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( 1 );
	zgeql2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const Wbig = new Complex128Array( N * 32 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: M>K (M=5, N=3, K=2)', function t() {
	// Factor a 5x2 matrix to get K=2 reflectors, then place them in a 5x3
	// Matrix (last 2 cols carry reflectors, first col will be set by zung2l).
	const M = 5;
	const N = 3;
	const K = 2;
	const LDA = M;

	// Factor a 5x2 matrix
	const Asrc = randomMatrix( M, K, 271828 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( K );
	zgeql2( M, K, Asrc, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

	// Copy Asrc into the last K columns of a 5x3 A; first column zeroed.
	const A = new Complex128Array( M * N );
	const Asrcv = reinterpret( Asrc, 0 );
	const Av = reinterpret( A, 0 );
	let i, j, idxSrc, idxDst;
	for ( j = 0; j < K; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			idxSrc = 2 * ( i + ( j * M ) );
			idxDst = 2 * ( i + ( ( N - K + j ) * LDA ) );
			Av[ idxDst ] = Asrcv[ idxSrc ];
			Av[ idxDst + 1 ] = Asrcv[ idxSrc + 1 ];
		}
	}
	const Wbig = new Complex128Array( N * 32 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: 40x40, K=40 (K <= NX = 128: unblocked, as in the reference)', function t() {
	// K=40 > NB=32 triggers blocked path.
	const M = 40;
	const N = 40;
	const K = 40;
	const LDA = M;
	const A = randomMatrix( M, N, 555 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( N );
	zgeql2( M, N, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	const Wbig = new Complex128Array( N * 64 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});

test( 'zungql: 40x40 with K=35, N=40 (K <= NX = 128: unblocked, as in the reference)', function t() {
	// K=35 with NB=32 -> kk=min(35, ceil(35/32)*32) = min(35, 64) = 35. N-kk=5 so the
	// Outer zero-init loop runs (lines 115-121).
	const M = 40;
	const N = 40;
	const K = 35;
	const LDA = M;

	// Factor a 40x35 matrix to get K=35 reflectors.
	const Asrc = randomMatrix( M, K, 99 );
	const TAU = new Complex128Array( K );
	const WORK = new Complex128Array( K );
	zgeql2( M, K, Asrc, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );

	// Copy into last K columns of M x N matrix.
	const A = new Complex128Array( M * N );
	const Asrcv = reinterpret( Asrc, 0 );
	const Av = reinterpret( A, 0 );
	let i, j;
	for ( j = 0; j < K; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			Av[ 2 * ( i + ( ( N - K + j ) * LDA ) ) ] = Asrcv[ 2 * ( i + ( j * M ) ) ];
			Av[ ( 2 * ( i + ( ( N - K + j ) * LDA ) ) ) + 1 ] = Asrcv[ ( 2 * ( i + ( j * M ) ) ) + 1 ];
		}
	}
	const Wbig = new Complex128Array( N * 64 );
	const info = zungql( M, N, K, A, 1, LDA, 0, TAU, 1, 0, Wbig, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	verifyOrthonormal( A, M, N, LDA, 1e-10 );
});


// TESTS: WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

const WS_N = 170; // K = 170 > NX = 128 (the ILAENV(3) crossover) and NB = 32: past the blocking threshold, two blocks
const WS_LDWORK = WS_N; // reference LDWORK (N)
const WS_NB = 32;

/**
* Factors a deterministic WS_N-by-WS_N matrix with `zgeqlf` (ample WORK), returning its reflectors and scalar factors.
*
* @private
* @returns {Object} factorization
*/
function wsFactor() {
	const A = new Complex128Array( WS_N * WS_N );
	const Av = reinterpret( A, 0 );
	const TAU = new Complex128Array( WS_N );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / 140 ) * 13 ) );
	}
	zgeqlf( WS_N, WS_N, A, 1, WS_N, 0, TAU, 1, 0, new Complex128Array( ( WS_N * 64 ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Runs `zungql` on a copy of the factorization with a WORK of `lwork` elements, returning the interleaved Q.
*
* @private
* @param {Object} F - factorization
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} Q (column-major, interleaved re/im)
*/
function wsRun( F, lwork ) {
	const A = new Complex128Array( F.A );
	const info = zungql( WS_N, WS_N, WS_N, A, 1, WS_N, 0, F.TAU, 1, 0, new Complex128Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return reinterpret( A, 0 );
}

/**
* Returns the largest elementwise difference between two arrays.
*
* @private
* @param {Float64Array} x - first array
* @param {Float64Array} y - second array
* @returns {number} max |x - y|
*/
function wsMaxDiff( x, y ) {
	let d = 0.0;
	let i;
	for ( i = 0; i < x.length; i++ ) {
		d = Math.max( d, Math.abs( x[ i ] - y[ i ] ) );
	}
	return d;
}

/**
* Returns max |Q^H Q - I| for a square column-major Q.
*
* @private
* @param {Float64Array} Q - interleaved Q
* @returns {number} orthogonality error
*/
function wsOrthErr( Q ) {
	let err = 0.0;
	let re, im, a, b, i, j, k;
	for ( i = 0; i < WS_N; i++ ) {
		for ( j = 0; j < WS_N; j++ ) {
			re = ( i === j ) ? -1.0 : 0.0;
			im = 0.0;
			for ( k = 0; k < WS_N; k++ ) {
				a = 2 * ( ( i * WS_N ) + k );
				b = 2 * ( ( j * WS_N ) + k );
				re += Q[ a ] * Q[ b ] + ( Q[ a + 1 ] * Q[ b + 1 ] );
				im += ( Q[ a ] * Q[ b + 1 ] ) - ( Q[ a + 1 ] * Q[ b ] );
			}
			err = Math.max( err, Math.abs( re ), Math.abs( im ) );
		}
	}
	return err;
}

test( 'zungql: WORK of the reference minimum max(1,N) past the blocking threshold (unblocked fallback) matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, WS_LDWORK );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-11, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'zungql: WORK of LDWORK*8 (shrunk block size NB = 8) past the blocking threshold matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, ( WS_LDWORK * 8 ) + 3 );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-11, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'zungql: WORK one element below the reference minimum max(1,N) throws', function t() {
	const F = wsFactor();
	assert.throws( function throws() {
		wsRun( F, WS_LDWORK - 1 );
	}, RangeError );
});


// TESTS: CROSSOVER FROM ILAENV (ticket 0049) //

test( 'zungql: between NB = 32 and the ILAENV(3) crossover NX = 128 (K = 64), the optimal WORK takes the unblocked path as the reference does', function t() {
	const n = 64;
	const A = new Complex128Array( n * n );
	const TAU = new Complex128Array( n );
	const Av = reinterpret( A, 0 );
	let bad, i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / ( 2 * n ) ) * 13 ) );
	}
	zgeqlf( n, n, A, 1, n, 0, TAU, 1, 0, new Complex128Array( ( n * 64 ) + 4096 ), 1, 0 );
	const Aopt = new Complex128Array( A );
	const Amin = new Complex128Array( A );

	// Optimal WORK (N*NB), NaN-poisoned past the unblocked minimum max(1,N):
	const W = new Complex128Array( n * 32 );
	const Wv = reinterpret( W, 0 );
	for ( i = 2 * n; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	assert.equal( zungql( n, n, n, Aopt, 1, n, 0, TAU, 1, 0, W, 1, 0 ), 0, 'info' );
	assert.equal( zungql( n, n, n, Amin, 1, n, 0, TAU, 1, 0, new Complex128Array( n ), 1, 0 ), 0, 'info' );

	// The blocked path would write its T factor past WORK[N-1]; the unblocked path leaves it untouched:
	bad = 0;
	for ( i = 2 * n; i < Wv.length; i++ ) {
		if ( !Number.isNaN( Wv[ i ] ) ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'WORK past the unblocked minimum is untouched' );

	// And Q is bit-identical to the unblocked result:
	const ov = reinterpret( Aopt, 0 );
	const mv = reinterpret( Amin, 0 );
	bad = 0;
	for ( i = 0; i < ov.length; i++ ) {
		if ( ov[ i ] !== mv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'Q matches the unblocked Q bit for bit' );
});
