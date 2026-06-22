/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlabrd from './../lib/ndarray.js';

// FIXTURES //

import m_ge_n_6x5_nb3 from './fixtures/m_ge_n_6x5_nb3.json' with { type: 'json' };
import m_lt_n_5x6_nb3 from './fixtures/m_lt_n_5x6_nb3.json' with { type: 'json' };
import square_4x4_nb2 from './fixtures/square_4x4_nb2.json' with { type: 'json' };
import nb0_quick_return from './fixtures/nb0_quick_return.json' with { type: 'json' };
import nb1_3x3 from './fixtures/nb1_3x3.json' with { type: 'json' };
import nb1_m_lt_n_2x3 from './fixtures/nb1_m_lt_n_2x3.json' with { type: 'json' };

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

// TESTS //

test( 'dlabrd: m_ge_n_6x5_nb3 (upper bidiagonal)', function t() {
	var TAUQ;
	var TAUP;
	var tc;
	var nb;
	var M;
	var N;
	var A;
	var d;
	var e;
	var X;
	var Y;

	tc = m_ge_n_6x5_nb3;
	M = 6;
	N = 5;
	nb = 3;
	A = new Float64Array([
		 1.0,
		2.0,
		-0.5,
		0.7,
		1.5,
		-0.3,
		 0.3,
		-1.0,
		0.6,
		1.2,
		-0.3,
		0.4,
		 0.5,
		0.8,
		-0.4,
		0.2,
		1.1,
		-0.6,
		-0.2,
		0.4,
		0.9,
		-0.6,
		0.3,
		0.7,
		 0.8,
		-0.1,
		0.2,
		1.3,
		-0.5,
		0.9
	]);
	d = new Float64Array( nb );
	e = new Float64Array( nb );
	TAUQ = new Float64Array( nb );
	TAUP = new Float64Array( nb );
	X = new Float64Array( M * nb );
	Y = new Float64Array( N * nb );
	dlabrd( M, N, nb, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, M, 0, Y, 1, N, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-14, 'Y' );
});

test( 'dlabrd: m_lt_n_5x6_nb3 (lower bidiagonal)', function t() {
	var TAUQ;
	var TAUP;
	var tc;
	var nb;
	var M;
	var N;
	var A;
	var d;
	var e;
	var X;
	var Y;

	tc = m_lt_n_5x6_nb3;
	M = 5;
	N = 6;
	nb = 3;
	A = new Float64Array([
		 1.0,
		2.0,
		-0.5,
		0.7,
		1.5,
		 0.3,
		-1.0,
		0.6,
		1.2,
		-0.3,
		 0.5,
		0.8,
		-0.4,
		0.2,
		1.1,
		-0.2,
		0.4,
		0.9,
		-0.6,
		0.3,
		 0.8,
		-0.1,
		0.2,
		1.3,
		-0.5,
		-0.3,
		0.4,
		0.7,
		0.9,
		-0.6
	]);
	d = new Float64Array( nb );
	e = new Float64Array( nb );
	TAUQ = new Float64Array( nb );
	TAUP = new Float64Array( nb );
	X = new Float64Array( M * nb );
	Y = new Float64Array( N * nb );
	dlabrd( M, N, nb, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, M, 0, Y, 1, N, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-14, 'Y' );
});

test( 'dlabrd: square_4x4_nb2 (M=N, upper bidiagonal)', function t() {
	var TAUQ;
	var TAUP;
	var tc;
	var nb;
	var M;
	var N;
	var A;
	var d;
	var e;
	var X;
	var Y;

	tc = square_4x4_nb2;
	M = 4;
	N = 4;
	nb = 2;
	A = new Float64Array([
		 2.0,
		-1.0,
		0.3,
		0.5,
		 0.5,
		1.0,
		-0.7,
		0.4,
		 0.8,
		-0.3,
		1.5,
		-0.2,
		-0.4,
		0.6,
		0.1,
		0.9
	]);
	d = new Float64Array( nb );
	e = new Float64Array( nb );
	TAUQ = new Float64Array( nb );
	TAUP = new Float64Array( nb );
	X = new Float64Array( M * nb );
	Y = new Float64Array( N * nb );
	dlabrd( M, N, nb, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, M, 0, Y, 1, N, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-14, 'Y' );
});

test( 'dlabrd: nb0_quick_return', function t() {
	var TAUQ = new Float64Array( 2 );
	var TAUP = new Float64Array( 2 );
	var tc = nb0_quick_return;
	var A = new Float64Array([ 1.0, 2.0, 3.0, 4.0 ]);
	var d = new Float64Array( 2 );
	var e = new Float64Array( 2 );
	var X = new Float64Array( 4 );
	var Y = new Float64Array( 4 );

	dlabrd( 2, 2, 0, A, 1, 2, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, 2, 0, Y, 1, 2, 0 ); // eslint-disable-line max-len

	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dlabrd: nb1_3x3 (single step, M >= N)', function t() {
	var TAUQ;
	var TAUP;
	var tc;
	var nb;
	var M;
	var N;
	var A;
	var d;
	var e;
	var X;
	var Y;

	tc = nb1_3x3;
	M = 3;
	N = 3;
	nb = 1;
	A = new Float64Array([
		 2.0,
		-1.0,
		0.3,
		 0.5,
		1.0,
		-0.7,
		 0.8,
		-0.3,
		1.5
	]);
	d = new Float64Array( nb );
	e = new Float64Array( nb );
	TAUQ = new Float64Array( nb );
	TAUP = new Float64Array( nb );
	X = new Float64Array( M * nb );
	Y = new Float64Array( N * nb );
	dlabrd( M, N, nb, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, M, 0, Y, 1, N, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-14, 'Y' );
});

test( 'dlabrd: nb1_m_lt_n_2x3 (single step, M < N)', function t() {
	var TAUQ;
	var TAUP;
	var tc;
	var nb;
	var M;
	var N;
	var A;
	var d;
	var e;
	var X;
	var Y;

	tc = nb1_m_lt_n_2x3;
	M = 2;
	N = 3;
	nb = 1;
	A = new Float64Array([
		 1.5,
		-0.8,
		 0.6,
		1.0,
		-0.4,
		0.2
	]);
	d = new Float64Array( nb );
	e = new Float64Array( nb );
	TAUQ = new Float64Array( nb );
	TAUP = new Float64Array( nb );
	X = new Float64Array( M * nb );
	Y = new Float64Array( N * nb );
	dlabrd( M, N, nb, A, 1, M, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, M, 0, Y, 1, N, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( e ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
	assertArrayClose( toArray( X ), tc.X, 1e-14, 'X' );
	assertArrayClose( toArray( Y ), tc.Y, 1e-14, 'Y' );
});

test( 'dlabrd: quick return when M=0', function t() {
	var TAUQ = new Float64Array( 1 );
	var TAUP = new Float64Array( 1 );
	var A = new Float64Array([ 1.0, 2.0 ]);
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	var X = new Float64Array( 2 );
	var Y = new Float64Array( 2 );

	dlabrd( 0, 2, 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, 1, 0, Y, 1, 2, 0 ); // eslint-disable-line max-len

	// A should be unchanged
	assert.equal( A[ 0 ], 1.0 );
	assert.equal( A[ 1 ], 2.0 );
});

test( 'dlabrd: quick return when N=0', function t() {
	var TAUQ = new Float64Array( 1 );
	var TAUP = new Float64Array( 1 );
	var A = new Float64Array([ 1.0, 2.0 ]);
	var d = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	var X = new Float64Array( 2 );
	var Y = new Float64Array( 2 );

	dlabrd( 2, 0, 1, A, 1, 2, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, 2, 0, Y, 1, 1, 0 ); // eslint-disable-line max-len

	// A should be unchanged
	assert.equal( A[ 0 ], 1.0 );
	assert.equal( A[ 1 ], 2.0 );
});
