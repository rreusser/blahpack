/* eslint-disable max-len, no-restricted-syntax, stdlib/first-unit-test */
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlahr2 from './../lib/ndarray.js';

// FIXTURES //

import basic_6x6_k1_nb2 from './fixtures/basic_6x6_k1_nb2.json' with { type: 'json' };
import _8x8_k1_nb3 from './fixtures/8x8_k1_nb3.json' with { type: 'json' };
import _5x5_k1_nb1 from './fixtures/5x5_k1_nb1.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import _7x7_k2_nb2 from './fixtures/7x7_k2_nb2.json' with { type: 'json' };

// FUNCTIONS //

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

test( 'dlahr2: main export is a function', function t() {
	assert.strictEqual( typeof dlahr2, 'function' );
});

test( 'dlahr2: basic 6x6, K=1, NB=2', function () {
	var LDA;
	var LDT;
	var LDY;
	var tau;
	var tc;
	var NB;
	var N;
	var K;
	var A;
	var T;
	var Y;

	tc = basic_6x6_k1_nb2;
	N = 6;
	K = 1;
	NB = 2;
	LDA = N;
	LDT = NB;
	LDY = N;
	A = new Float64Array([
		2,
		1,
		3,
		1,
		4,
		2,
		1,
		4,
		1,
		2,
		1,
		3,
		3,
		1,
		5,
		1,
		2,
		1,
		1,
		2,
		1,
		6,
		1,
		2,
		4,
		1,
		2,
		1,
		7,
		1,
		2,
		3,
		1,
		2,
		1,
		8
	]);
	tau = new Float64Array( NB );
	T = new Float64Array( LDT * NB );
	Y = new Float64Array( LDY * NB );
	dlahr2( N, K, NB, A, 1, LDA, 0, tau, 1, 0, T, 1, 0, LDT, Y, 1, 0, LDY );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( tau ), tc.TAU, 1e-13, 'TAU' );
	assertArrayClose( toArray( T ), tc.T, 1e-13, 'T' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-13, 'Y' );
});

test( 'dlahr2: 8x8, K=1, NB=3', function () {
	var LDA;
	var LDT;
	var LDY;
	var tau;
	var tc;
	var NB;
	var N;
	var K;
	var A;
	var i;
	var T;
	var Y;

	tc = _8x8_k1_nb3;
	N = 8;
	K = 1;
	NB = 3;
	LDA = N;
	LDT = NB;
	LDY = N;
	A = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		A[ i * N + i ] = i + 2;
	}
	A[1] = 1.0;
	A[2] = 2.0;
	A[3] = 0.5;
	A[8] = 1.5;
	A[9] = 1.0;
	A[10] = 0.5;
	A[16] = 2.0;
	A[17] = 0.5;
	A[18] = 1.0;
	A[24] = 1.0;
	A[25] = 0.5;
	A[26] = 2.0;
	A[32] = 0.5;
	A[33] = 1.0;
	A[34] = 0.5;
	A[40] = 2.0;
	A[41] = 0.5;
	A[42] = 1.0;
	A[48] = 1.0;
	A[49] = 2.0;
	A[50] = 0.5;
	A[4] = 1.0;
	A[5] = 0.5;
	A[6] = 2.0;
	A[7] = 1.0;
	tau = new Float64Array( NB );
	T = new Float64Array( LDT * NB );
	Y = new Float64Array( LDY * NB );
	dlahr2( N, K, NB, A, 1, LDA, 0, tau, 1, 0, T, 1, 0, LDT, Y, 1, 0, LDY );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( tau ), tc.TAU, 1e-13, 'TAU' );
	assertArrayClose( toArray( T ), tc.T, 1e-13, 'T' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-13, 'Y' );
});

test( 'dlahr2: 5x5, K=1, NB=1 (single column)', function () {
	var LDA;
	var LDT;
	var LDY;
	var tau;
	var tc;
	var NB;
	var N;
	var K;
	var A;
	var T;
	var Y;

	tc = _5x5_k1_nb1;
	N = 5;
	K = 1;
	NB = 1;
	LDA = N;
	LDT = NB;
	LDY = N;
	A = new Float64Array([
		1,
		6,
		11,
		16,
		21,
		2,
		7,
		12,
		17,
		22,
		3,
		8,
		13,
		18,
		23,
		4,
		9,
		14,
		19,
		24,
		5,
		10,
		15,
		20,
		25
	]);
	tau = new Float64Array( NB );
	T = new Float64Array( LDT * NB );
	Y = new Float64Array( LDY * NB );
	dlahr2( N, K, NB, A, 1, LDA, 0, tau, 1, 0, T, 1, 0, LDT, Y, 1, 0, LDY );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( tau ), tc.TAU, 1e-13, 'TAU' );
	assertArrayClose( toArray( T ), tc.T, 1e-13, 'T' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-13, 'Y' );
});

test( 'dlahr2: N=1 (quick return)', function () {
	var tau = new Float64Array([ 99.0 ]);
	var tc = n_one;
	var A = new Float64Array([ 5.0 ]);
	var T = new Float64Array([ 99.0 ]);
	var Y = new Float64Array([ 99.0 ]);
	dlahr2( 1, 1, 1, A, 1, 1, 0, tau, 1, 0, T, 1, 0, 1, Y, 1, 0, 1 );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );

	// tau should be unchanged since quick return
	assert.equal( tau[0], 99.0, 'tau unchanged' );
});

test( 'dlahr2: 7x7, K=2, NB=2 (non-unit K offset)', function () {
	var LDA;
	var LDT;
	var LDY;
	var tau;
	var tc;
	var NB;
	var N;
	var K;
	var A;
	var i;
	var T;
	var Y;

	tc = _7x7_k2_nb2;
	N = 7;
	K = 2;
	NB = 2;
	LDA = N;
	LDT = NB;
	LDY = N;
	A = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		A[ i * N + i ] = ( i + 1 ) * 2;
	}
	A[1] = 1.0;
	A[2] = 2.0;
	A[3] = 0.5;
	A[4] = 1.0;
	A[8] = 1.5;
	A[9] = 1.0;
	A[10] = 0.5;
	A[11] = 2.0;
	A[15] = 2.0;
	A[16] = 0.5;
	A[17] = 1.0;
	A[18] = 0.5;
	A[22] = 1.0;
	A[23] = 0.5;
	A[24] = 2.0;
	A[25] = 1.0;
	A[29] = 0.5;
	A[30] = 1.0;
	A[31] = 0.5;
	A[32] = 2.0;
	A[36] = 2.0;
	A[37] = 0.5;
	A[38] = 1.0;
	A[39] = 0.5;
	A[43] = 1.0;
	A[44] = 2.0;
	A[45] = 0.5;
	A[46] = 1.0;
	A[5] = 0.5;
	A[6] = 1.0;
	A[12] = 2.0;
	A[13] = 0.5;
	A[19] = 1.0;
	A[20] = 2.0;
	A[26] = 0.5;
	A[27] = 1.0;
	A[33] = 2.0;
	A[34] = 0.5;
	A[40] = 1.0;
	A[41] = 2.0;
	A[47] = 0.5;
	A[48] = 1.0;
	tau = new Float64Array( NB );
	T = new Float64Array( LDT * NB );
	Y = new Float64Array( LDY * NB );
	dlahr2( N, K, NB, A, 1, LDA, 0, tau, 1, 0, T, 1, 0, LDT, Y, 1, 0, LDY );
	assertArrayClose( toArray( A ), tc.A, 1e-13, 'A' );
	assertArrayClose( toArray( tau ), tc.TAU, 1e-13, 'TAU' );
	assertArrayClose( toArray( T ), tc.T, 1e-13, 'T' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-13, 'Y' );
});
