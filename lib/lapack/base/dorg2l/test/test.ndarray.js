/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dorg2l from './../lib/ndarray.js';


// FIXTURES //

// Expected outputs (Q matrices)
import out4x3K3 from './fixtures/4x3_k3.json' with { type: 'json' };
import out3x3K3 from './fixtures/3x3_k3.json' with { type: 'json' };
import out4x2K1 from './fixtures/4x2_k1.json' with { type: 'json' };
import outKZero from './fixtures/k_zero.json' with { type: 'json' };
import out5x3Orthogonal from './fixtures/5x3_orthogonal.json' with { type: 'json' };
import out6x4K4 from './fixtures/6x4_k4.json' with { type: 'json' };

// QL factorization inputs (A and TAU after DGEQL2)
import inp4x3Ql from './fixtures/4x3_ql.json' with { type: 'json' };
import inp3x3Ql from './fixtures/3x3_ql.json' with { type: 'json' };
import inp4x2Ql from './fixtures/4x2_ql.json' with { type: 'json' };
import inp5x3Ql from './fixtures/5x3_ql.json' with { type: 'json' };
import inp6x4Ql from './fixtures/6x4_ql.json' with { type: 'json' };

var outputs = {
	'4x3_k3': out4x3K3,
	'3x3_k3': out3x3K3,
	'4x2_k1': out4x2K1,
	'k_zero': outKZero,
	'5x3_orthogonal': out5x3Orthogonal,
	'6x4_k4': out6x4K4
};

var inputs = {
	'4x3_ql': inp4x3Ql,
	'3x3_ql': inp3x3Ql,
	'4x2_ql': inp4x2Ql,
	'5x3_ql': inp5x3Ql,
	'6x4_ql': inp6x4Ql
};


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Load fixture matrix (dense M*N column-major) into a Float64Array with LDA stride.
*
* Fixture stores M elements per column (no padding). This function
* unpacks into a buffer with row stride 1 and column stride LDA.
*
* @param {Array} data - dense column-major data (M*N elements)
* @param {number} M - number of rows
* @param {number} N - number of columns
* @param {number} LDA - leading dimension (>= M)
* @returns {Float64Array} buffer of size LDA*N
*/
function loadMatrix( data, M, N, LDA ) {
	var A = new Float64Array( LDA * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			A[ j * LDA + i ] = data[ j * M + i ];
		}
	}
	return A;
}

/**
* Extract M-by-N submatrix from column-major flat array with leading dim LDA.
*
* @param {Float64Array} A - flat column-major array
* @param {number} LDA - leading dimension (row stride)
* @param {number} M - number of rows
* @param {number} N - number of columns
* @returns {Array} extracted values in column-major order (M*N elements)
*/
function extractMatrix( A, LDA, M, N ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( A[ j * LDA + i ] );
		}
	}
	return out;
}


// TESTS //

test( 'dorg2l: 4x3, K=3 (M > N, full K)', function t() {
	var expected;
	var WORK;
	var info;
	var inp;
	var LDA;
	var out;
	var A;

	expected = outputs[ '4x3_k3' ];
	inp = inputs[ '4x3_ql' ];
	WORK = new Float64Array( 4 );
	LDA = 6;
	A = loadMatrix( inp.A, 4, 3, LDA );
	info = dorg2l( 4, 3, 3, A, 1, LDA, 0, new Float64Array( inp.TAU ), 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
	out = extractMatrix( A, LDA, 4, 3 );
	assertArrayClose( out, expected.Q, 1e-14, 'Q' );
});

test( 'dorg2l: 3x3, K=3 (square)', function t() {
	var expected;
	var WORK;
	var info;
	var inp;
	var LDA;
	var out;
	var A;

	expected = outputs[ '3x3_k3' ];
	inp = inputs[ '3x3_ql' ];
	WORK = new Float64Array( 4 );
	LDA = 6;
	A = loadMatrix( inp.A, 3, 3, LDA );
	info = dorg2l( 3, 3, 3, A, 1, LDA, 0, new Float64Array( inp.TAU ), 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
	out = extractMatrix( A, LDA, 3, 3 );
	assertArrayClose( out, expected.Q, 1e-14, 'Q' );
});

test( 'dorg2l: 4x2, K=1 (K < N, partial reflectors)', function t() {
	var expected;
	var WORK;
	var info;
	var inp;
	var LDA;
	var out;
	var A;

	expected = outputs[ '4x2_k1' ];
	inp = inputs[ '4x2_ql' ];
	WORK = new Float64Array( 4 );
	LDA = 6;
	A = loadMatrix( inp.A, 4, 2, LDA );
	info = dorg2l( 4, 2, 1, A, 1, LDA, 0, new Float64Array( inp.TAU ), 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
	out = extractMatrix( A, LDA, 4, 2 );
	assertArrayClose( out, expected.Q, 1e-14, 'Q' );
});

test( 'dorg2l: K=0 (identity columns)', function t() {
	var expected;
	var WORK;
	var info;
	var TAU;
	var LDA;
	var out;
	var A;

	expected = outputs[ 'k_zero' ];
	WORK = new Float64Array( 4 );
	TAU = new Float64Array( 1 );
	LDA = 6;
	A = new Float64Array( LDA * 2 );
	A[ 0 ] = 99.0;
	A[ LDA ] = 88.0;
	A[ 1 ] = 77.0;
	A[ LDA + 1 ] = 66.0;
	A[ 2 ] = 55.0;
	A[ LDA + 2 ] = 44.0;
	info = dorg2l( 3, 2, 0, A, 1, LDA, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	out = extractMatrix( A, LDA, 3, 2 );
	assertArrayClose( out, expected.Q, 1e-14, 'Q' );
});

test( 'dorg2l: N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	WORK = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	A = new Float64Array( 6 );
	info = dorg2l( 3, 0, 0, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorg2l: M=0, N=0 quick return', function t() {
	var WORK;
	var info;
	var TAU;
	var A;

	WORK = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	A = new Float64Array( 1 );
	info = dorg2l( 0, 0, 0, A, 1, 6, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
});

test( 'dorg2l: 5x3, K=3 (verify orthogonality Q^T * Q = I)', function t() {
	var expected;
	var WORK;
	var info;
	var inp;
	var LDA;
	var QtQ;
	var out;
	var sum;
	var A;
	var i;
	var j;
	var k;
	var M;
	var N;

	expected = outputs[ '5x3_orthogonal' ];
	inp = inputs[ '5x3_ql' ];
	WORK = new Float64Array( 4 );
	LDA = 6;
	M = 5;
	N = 3;
	A = loadMatrix( inp.A, M, N, LDA );
	info = dorg2l( M, N, 3, A, 1, LDA, 0, new Float64Array( inp.TAU ), 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
	out = extractMatrix( A, LDA, M, N );
	assertArrayClose( out, expected.Q, 1e-14, 'Q' );
	QtQ = [];
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( k = 0; k < M; k++ ) {
				sum += A[ i * LDA + k ] * A[ j * LDA + k ];
			}
			QtQ.push( sum );
		}
	}
	assertArrayClose( QtQ, expected.QtQ, 1e-14, 'QtQ' );
});

test( 'dorg2l: 6x4, K=4 (larger matrix)', function t() {
	var expected;
	var WORK;
	var info;
	var inp;
	var LDA;
	var out;
	var A;

	expected = outputs[ '6x4_k4' ];
	inp = inputs[ '6x4_ql' ];
	WORK = new Float64Array( 4 );
	LDA = 6;
	A = loadMatrix( inp.A, 6, 4, LDA );
	info = dorg2l( 6, 4, 4, A, 1, LDA, 0, new Float64Array( inp.TAU ), 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
	out = extractMatrix( A, LDA, 6, 4 );
	assertArrayClose( out, expected.Q, 1e-14, 'Q' );
});

test( 'dorg2l: non-unit strides', function t() {
	var expected;
	var strideA1;
	var strideA2;
	var WORK;
	var info;
	var inp;
	var out;
	var A;
	var i;
	var j;

	inp = inputs[ '3x3_ql' ];
	expected = outputs[ '3x3_k3' ];
	WORK = new Float64Array( 4 );
	strideA1 = 2;
	strideA2 = strideA1 * 3;
	A = new Float64Array( strideA2 * 3 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ i * strideA1 + j * strideA2 ] = inp.A[ j * 3 + i ];
		}
	}
	info = dorg2l( 3, 3, 3, A, strideA1, strideA2, 0, new Float64Array( inp.TAU ), 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
	out = [];
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			out.push( A[ i * strideA1 + j * strideA2 ] );
		}
	}
	assertArrayClose( out, expected.Q, 1e-14, 'Q strided' );
});

test( 'dorg2l: non-zero offset', function t() {
	var expected;
	var TAU_arr;
	var WORK;
	var info;
	var inp;
	var LDA;
	var off;
	var out;
	var A;
	var i;
	var j;

	inp = inputs[ '3x3_ql' ];
	expected = outputs[ '3x3_k3' ];
	WORK = new Float64Array( 4 );
	LDA = 6;
	off = 5;
	A = new Float64Array( off + LDA * 3 );
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ off + j * LDA + i ] = inp.A[ j * 3 + i ];
		}
	}
	TAU_arr = new Float64Array( 1 + 3 );
	TAU_arr[ 1 ] = inp.TAU[ 0 ];
	TAU_arr[ 2 ] = inp.TAU[ 1 ];
	TAU_arr[ 3 ] = inp.TAU[ 2 ];
	info = dorg2l( 3, 3, 3, A, 1, LDA, off, TAU_arr, 1, 1, WORK, 1, 0 );
	assert.equal( info, 0, 'INFO' );
	out = [];
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			out.push( A[ off + j * LDA + i ] );
		}
	}
	assertArrayClose( out, expected.Q, 1e-14, 'Q with offset' );
});
