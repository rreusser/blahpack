// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import dgeqlf from '../../dgeqlf/lib/base.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorgql from './../lib/ndarray.js';


// FIXTURES //

import out3x3K3 from './fixtures/3x3_k3.json' with { type: 'json' };
import out40x35Blocked from './fixtures/40x35_blocked.json' with { type: 'json' };
import out40x35K34 from './fixtures/40x35_k34.json' with { type: 'json' };
import out4x2K2 from './fixtures/4x2_k2.json' with { type: 'json' };
import out4x3K1 from './fixtures/4x3_k1.json' with { type: 'json' };
import out4x3K3 from './fixtures/4x3_k3.json' with { type: 'json' };
import out5x3Orthogonal from './fixtures/5x3_orthogonal.json' with { type: 'json' };
import out6x4K4 from './fixtures/6x4_k4.json' with { type: 'json' };
import outKZero from './fixtures/k_zero.json' with { type: 'json' };
import inp3x3K3 from './fixtures/3x3_k3_input.json' with { type: 'json' };
import inp40x35 from './fixtures/40x35_input.json' with { type: 'json' };
import inp40x35K34 from './fixtures/40x35_k34_input.json' with { type: 'json' };
import inp4x2K2 from './fixtures/4x2_k2_input.json' with { type: 'json' };
import inp4x3K1 from './fixtures/4x3_k1_input.json' with { type: 'json' };
import inp4x3K3 from './fixtures/4x3_k3_input.json' with { type: 'json' };
import inp5x3K3 from './fixtures/5x3_k3_input.json' with { type: 'json' };
import inp6x4K4 from './fixtures/6x4_k4_input.json' with { type: 'json' };
import inpKZero from './fixtures/k_zero_input.json' with { type: 'json' };

const fixtures = {
	'3x3_k3': out3x3K3,
	'40x35_blocked': out40x35Blocked,
	'40x35_k34': out40x35K34,
	'4x2_k2': out4x2K2,
	'4x3_k1': out4x3K1,
	'4x3_k3': out4x3K3,
	'5x3_orthogonal': out5x3Orthogonal,
	'6x4_k4': out6x4K4,
	'k_zero': outKZero,
	'3x3_k3_input': inp3x3K3,
	'40x35_input': inp40x35,
	'40x35_k34_input': inp40x35K34,
	'4x2_k2_input': inp4x2K2,
	'4x3_k1_input': inp4x3K1,
	'4x3_k3_input': inp4x3K3,
	'5x3_k3_input': inp5x3K3,
	'6x4_k4_input': inp6x4K4,
	'k_zero_input': inpKZero
};


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Run dorgql on a test case. Reads input from the *_input fixture case,
* calls dorgql, and returns the result Q as a flat column-major array.
*
* @param {string} inputName - name of the _input fixture case
* @returns {Object} { info, Q (Float64Array, M*N flat col-major) }
*/
function runCase( inputName ) {
	const tc = fixtures[ inputName ];
	const M = tc.M;
	const N = tc.N;
	const K = tc.K;
	const A = new Float64Array( tc.A );
	const TAU = new Float64Array( tc.TAU );
	const WORK = new Float64Array( Math.max( 1, N ) * 32 );

	// Column-major: strideA1=1, strideA2=M
	const info = dorgql(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	return { info: info, Q: A };
}

/**
* Compute Q^T * Q for an M-by-N column-major matrix and return as flat N*N array.
*/
function computeQtQ( Q, M, N ) {
	const result = new Float64Array( N * N );
	let i, j, k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			for ( k = 0; k < M; k++ ) {
				result[ i + j * N ] += Q[ k + i * M ] * Q[ k + j * M ];
			}
		}
	}
	return result;
}


// TESTS //

test( 'dorgql: 4x3, K=3 (M > N, full K)', function t() {
	const expected = out4x3K3;
	const result = runCase( '4x3_k3_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: 3x3, K=3 (square)', function t() {
	const expected = out3x3K3;
	const result = runCase( '3x3_k3_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: 4x2, K=2', function t() {
	const expected = out4x2K2;
	const result = runCase( '4x2_k2_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: K=0 (identity-like columns)', function t() {
	const expected = outKZero;
	const result = runCase( 'k_zero_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: N=0 quick return', function t() {
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgql(3, 0, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dorgql: M=0, N=0 quick return', function t() {
	const A = new Float64Array( 1 );
	const TAU = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dorgql(0, 0, 0, A, 1, 0, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dorgql: 5x3, K=3 orthogonality check', function t() {
	const expected = out5x3Orthogonal;
	const result = runCase( '5x3_k3_input' );
	let i, j;
	const M = 5;
	const N = 3;

	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );

	// Verify Q^T * Q = I
	const QtQ = computeQtQ( result.Q, M, N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( i === j ) {
				assertClose( QtQ[ i + j * N ], 1.0, 1e-14, 'QtQ[' + i + ',' + j + ']' );
			} else {
				assertClose( QtQ[ i + j * N ], 0.0, 1e-14, 'QtQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dorgql: 6x4, K=4', function t() {
	const expected = out6x4K4;
	const result = runCase( '6x4_k4_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: 40x35, K=35 (K <= NX = 128: unblocked, as in the reference)', function t() {
	const expected = out40x35Blocked;
	const result = runCase( '40x35_input' );
	const M = 40;
	const N = 35;
	let i, j;

	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-12, 'Q' );

	// Verify orthogonality: Q^T * Q = I
	const QtQ = computeQtQ( result.Q, M, N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			if ( i === j ) {
				assertClose( QtQ[ i + j * N ], 1.0, 1e-12, 'QtQ[' + i + ',' + j + ']' );
			} else {
				assertClose( QtQ[ i + j * N ], 0.0, 1e-12, 'QtQ[' + i + ',' + j + ']' );
			}
		}
	}
});

test( 'dorgql: 40x35, K=34 (N > K; K <= NX = 128: unblocked, as in the reference)', function t() {
	const expected = out40x35K34;
	const result = runCase( '40x35_k34_input' );

	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-12, 'Q' );
});

test( 'dorgql: 4x3, K=1 (partial K)', function t() {
	const expected = out4x3K1;
	const result = runCase( '4x3_k1_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});


// TESTS: WORKSPACE-ADAPTIVE BLOCKING (ticket 0100) //

const WS_N = 170; // K = 170 > NX = 128 (the ILAENV(3) crossover) and NB = 32: past the blocking threshold, two blocks
const WS_LDWORK = WS_N; // reference LDWORK (N)
const WS_NB = 32;

/**
* Factors a deterministic WS_N-by-WS_N matrix with `dgeqlf` (ample WORK), returning its reflectors and scalar factors.
*
* @private
* @returns {Object} factorization
*/
function wsFactor() {
	const A = new Float64Array( WS_N * WS_N );
	const Av = A;
	const TAU = new Float64Array( WS_N );
	let i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / 70 ) * 13 ) );
	}
	dgeqlf( WS_N, WS_N, A, 1, WS_N, 0, TAU, 1, 0, new Float64Array( ( WS_N * 64 ) + 4096 ), 1, 0 );
	return {
		'A': A,
		'TAU': TAU
	};
}

/**
* Runs `dorgql` on a copy of the factorization with a WORK of `lwork` elements, returning the interleaved Q.
*
* @private
* @param {Object} F - factorization
* @param {NonNegativeInteger} lwork - workspace length
* @returns {Float64Array} Q (column-major, real)
*/
function wsRun( F, lwork ) {
	const A = new Float64Array( F.A );
	const info = dorgql( WS_N, WS_N, WS_N, A, 1, WS_N, 0, F.TAU, 1, 0, new Float64Array( lwork ), 1, 0 );
	assert.equal( info, 0, 'info' );
	return A;
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
* @param {Float64Array} Q - Q
* @returns {number} orthogonality error
*/
function wsOrthErr( Q ) {
	let err = 0.0;
	let re, a, b, i, j, k;
	for ( i = 0; i < WS_N; i++ ) {
		for ( j = 0; j < WS_N; j++ ) {
			re = ( i === j ) ? -1.0 : 0.0;
			for ( k = 0; k < WS_N; k++ ) {
				a = ( i * WS_N ) + k;
				b = ( j * WS_N ) + k;
				re += Q[ a ] * Q[ b ];
			}
			err = Math.max( err, Math.abs( re ) );
		}
	}
	return err;
}

test( 'dorgql: WORK of the reference minimum max(1,N) past the blocking threshold (unblocked fallback) matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, WS_LDWORK );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorgql: WORK of LDWORK*8 (shrunk block size NB = 8) past the blocking threshold matches the optimum', function t() {
	const F = wsFactor();
	const opt = wsRun( F, WS_LDWORK * WS_NB );
	const got = wsRun( F, ( WS_LDWORK * 8 ) + 3 );
	assert.ok( wsMaxDiff( got, opt ) <= 1e-12, 'Q matches the optimum-WORK Q: ' + wsMaxDiff( got, opt ) );
	assert.ok( wsOrthErr( got ) <= 1e-12, 'Q^H Q = I: ' + wsOrthErr( got ) );
});

test( 'dorgql: WORK one element below the reference minimum max(1,N) throws', function t() {
	const F = wsFactor();
	assert.throws( function throws() {
		wsRun( F, WS_LDWORK - 1 );
	}, RangeError );
});


// TESTS: CROSSOVER FROM ILAENV (ticket 0049) //

test( 'dorgql: between NB = 32 and the ILAENV(3) crossover NX = 128 (K = 64), the optimal WORK takes the unblocked path as the reference does', function t() {
	const n = 64;
	const A = new Float64Array( n * n );
	const TAU = new Float64Array( n );
	const Av = A;
	let bad, i;
	for ( i = 0; i < Av.length; i++ ) {
		Av[ i ] = Math.sin( ( ( i + 1 ) * 7 ) + ( Math.floor( i / ( n ) ) * 13 ) );
	}
	dgeqlf( n, n, A, 1, n, 0, TAU, 1, 0, new Float64Array( ( n * 64 ) + 4096 ), 1, 0 );
	const Aopt = new Float64Array( A );
	const Amin = new Float64Array( A );

	// Optimal WORK (N*NB), NaN-poisoned past the unblocked minimum max(1,N):
	const W = new Float64Array( n * 32 );
	const Wv = W;
	for ( i = n; i < Wv.length; i++ ) {
		Wv[ i ] = NaN;
	}
	assert.equal( dorgql( n, n, n, Aopt, 1, n, 0, TAU, 1, 0, W, 1, 0 ), 0, 'info' );
	assert.equal( dorgql( n, n, n, Amin, 1, n, 0, TAU, 1, 0, new Float64Array( n ), 1, 0 ), 0, 'info' );

	// The blocked path would write its T factor past WORK[N-1]; the unblocked path leaves it untouched:
	bad = 0;
	for ( i = n; i < Wv.length; i++ ) {
		if ( !Number.isNaN( Wv[ i ] ) ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'WORK past the unblocked minimum is untouched' );

	// And Q is bit-identical to the unblocked result:
	const ov = Aopt;
	const mv = Amin;
	bad = 0;
	for ( i = 0; i < ov.length; i++ ) {
		if ( ov[ i ] !== mv[ i ] ) {
			bad += 1;
		}
	}
	assert.equal( bad, 0, 'Q matches the unblocked Q bit for bit' );
});
