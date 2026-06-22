// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
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

var fixtures = {
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
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
	var tc = fixtures[ inputName ];
	var M = tc.M;
	var N = tc.N;
	var K = tc.K;
	var A = new Float64Array( tc.A );
	var TAU = new Float64Array( tc.TAU );
	var WORK = new Float64Array( Math.max( 1, N ) );
	var info;

	// Column-major: strideA1=1, strideA2=M
	info = dorgql(M, N, K, A, 1, M, 0, TAU, 1, 0, WORK, 1, 0 );
	return { info: info, Q: A };
}

/**
* Compute Q^T * Q for an M-by-N column-major matrix and return as flat N*N array.
*/
function computeQtQ( Q, M, N ) {
	var result = new Float64Array( N * N );
	var i;
	var j;
	var k;
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
	var expected = out4x3K3;
	var result = runCase( '4x3_k3_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: 3x3, K=3 (square)', function t() {
	var expected = out3x3K3;
	var result = runCase( '3x3_k3_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: 4x2, K=2', function t() {
	var expected = out4x2K2;
	var result = runCase( '4x2_k2_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: K=0 (identity-like columns)', function t() {
	var expected = outKZero;
	var result = runCase( 'k_zero_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: N=0 quick return', function t() {
	var A = new Float64Array( 1 );
	var TAU = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dorgql(3, 0, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dorgql: M=0, N=0 quick return', function t() {
	var A = new Float64Array( 1 );
	var TAU = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info = dorgql(0, 0, 0, A, 1, 0, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dorgql: 5x3, K=3 orthogonality check', function t() {
	var expected = out5x3Orthogonal;
	var result = runCase( '5x3_k3_input' );
	var QtQ;
	var i;
	var j;
	var M = 5;
	var N = 3;

	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );

	// Verify Q^T * Q = I
	QtQ = computeQtQ( result.Q, M, N );
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
	var expected = out6x4K4;
	var result = runCase( '6x4_k4_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});

test( 'dorgql: 40x35, K=35 (blocked path)', function t() {
	var expected = out40x35Blocked;
	var result = runCase( '40x35_input' );
	var QtQ;
	var M = 40;
	var N = 35;
	var i;
	var j;

	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-12, 'Q' );

	// Verify orthogonality: Q^T * Q = I
	QtQ = computeQtQ( result.Q, M, N );
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

test( 'dorgql: 40x35, K=34 (blocked path, N > K, exercises zero-fill)', function t() {
	var expected = out40x35K34;
	var result = runCase( '40x35_k34_input' );

	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-12, 'Q' );
});

test( 'dorgql: 4x3, K=1 (partial K)', function t() {
	var expected = out4x3K1;
	var result = runCase( '4x3_k1_input' );
	assert.equal( result.info, expected.INFO );
	assertArrayClose( result.Q, expected.Q, 1e-14, 'Q' );
});
