/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlatrd from './../lib/ndarray.js';

// FIXTURES //

import uplo_u_6x6_nb3 from './fixtures/uplo_u_6x6_nb3.json' with { type: 'json' };
import uplo_l_6x6_nb3 from './fixtures/uplo_l_6x6_nb3.json' with { type: 'json' };
import nb0_quick_return from './fixtures/nb0_quick_return.json' with { type: 'json' };
import uplo_u_4x4_nb2 from './fixtures/uplo_u_4x4_nb2.json' with { type: 'json' };
import uplo_l_4x4_nb2 from './fixtures/uplo_l_4x4_nb2.json' with { type: 'json' };

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

// TESTS //

test( 'dlatrd: uplo_u_6x6_nb3', function t() {
	var TAU;
	var tc;
	var nb;
	var N;
	var A;
	var E;
	var W;

	tc = uplo_u_6x6_nb3;
	N = 6;
	nb = 3;
	A = new Float64Array([
		 2.0,
		0.5,
		-0.3,
		0.7,
		1.0,
		-0.2,
		 0.5,
		-1.0,
		0.6,
		0.4,
		-0.8,
		0.3,
		-0.3,
		0.6,
		1.5,
		-0.5,
		0.2,
		0.9,
		 0.7,
		0.4,
		-0.5,
		0.8,
		1.2,
		-0.6,
		 1.0,
		-0.8,
		0.2,
		1.2,
		-0.4,
		0.7,
		-0.2,
		0.3,
		0.9,
		-0.6,
		0.7,
		1.0
	]);
	E = new Float64Array( N );
	TAU = new Float64Array( N );
	W = new Float64Array( N * nb );
	dlatrd( 'upper', N, nb, A, 1, N, 0, E, 1, 0, TAU, 1, 0, W, 1, N, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertArrayClose( E, tc.E, 1e-14, 'E' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
	assertArrayClose( W, tc.W, 1e-14, 'W' );
});

test( 'dlatrd: uplo_l_6x6_nb3', function t() {
	var TAU;
	var tc;
	var nb;
	var N;
	var A;
	var E;
	var W;

	tc = uplo_l_6x6_nb3;
	N = 6;
	nb = 3;
	A = new Float64Array([
		 2.0,
		0.5,
		-0.3,
		0.7,
		1.0,
		-0.2,
		 0.5,
		-1.0,
		0.6,
		0.4,
		-0.8,
		0.3,
		-0.3,
		0.6,
		1.5,
		-0.5,
		0.2,
		0.9,
		 0.7,
		0.4,
		-0.5,
		0.8,
		1.2,
		-0.6,
		 1.0,
		-0.8,
		0.2,
		1.2,
		-0.4,
		0.7,
		-0.2,
		0.3,
		0.9,
		-0.6,
		0.7,
		1.0
	]);
	E = new Float64Array( N );
	TAU = new Float64Array( N );
	W = new Float64Array( N * nb );
	dlatrd( 'lower', N, nb, A, 1, N, 0, E, 1, 0, TAU, 1, 0, W, 1, N, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertArrayClose( E, tc.E, 1e-14, 'E' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
	assertArrayClose( W, tc.W, 1e-14, 'W' );
});

test( 'dlatrd: nb0_quick_return', function t() {
	var tc = nb0_quick_return;
	var A = new Float64Array([
		 2.0,
		0.5,
		 0.5,
		-1.0
	]);

	dlatrd( 'upper', 2, 0, A, 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0 ); // eslint-disable-line max-len

	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dlatrd: uplo_u_4x4_nb2', function t() {
	var TAU;
	var tc;
	var nb;
	var N;
	var A;
	var E;
	var W;

	tc = uplo_u_4x4_nb2;
	N = 4;
	nb = 2;
	A = new Float64Array([
		 3.0,
		1.0,
		-0.5,
		0.8,
		 1.0,
		2.0,
		0.7,
		-0.4,
		-0.5,
		0.7,
		1.5,
		0.6,
		 0.8,
		-0.4,
		0.6,
		-1.0
	]);
	E = new Float64Array( N );
	TAU = new Float64Array( N );
	W = new Float64Array( N * nb );
	dlatrd( 'upper', N, nb, A, 1, N, 0, E, 1, 0, TAU, 1, 0, W, 1, N, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertArrayClose( E, tc.E, 1e-14, 'E' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
	assertArrayClose( W, tc.W, 1e-14, 'W' );
});

test( 'dlatrd: uplo_l_4x4_nb2', function t() {
	var TAU;
	var tc;
	var nb;
	var N;
	var A;
	var E;
	var W;

	tc = uplo_l_4x4_nb2;
	N = 4;
	nb = 2;
	A = new Float64Array([
		 3.0,
		1.0,
		-0.5,
		0.8,
		 1.0,
		2.0,
		0.7,
		-0.4,
		-0.5,
		0.7,
		1.5,
		0.6,
		 0.8,
		-0.4,
		0.6,
		-1.0
	]);
	E = new Float64Array( N );
	TAU = new Float64Array( N );
	W = new Float64Array( N * nb );
	dlatrd( 'lower', N, nb, A, 1, N, 0, E, 1, 0, TAU, 1, 0, W, 1, N, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
	assertArrayClose( E, tc.E, 1e-14, 'E' );
	assertArrayClose( TAU, tc.TAU, 1e-14, 'TAU' );
	assertArrayClose( W, tc.W, 1e-14, 'W' );
});

test( 'dlatrd: N=0 quick return', function t() {
	var A = new Float64Array( 0 );

	// Should not throw
	dlatrd( 'upper', 0, 0, A, 1, 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 1, 0 ); // eslint-disable-line max-len
});

test( 'dlatrd: N=1 quick return (nb=1, uplo=U)', function t() {
	// N=1, nb=1: loop runs once but i=0, i>0 is false, so only update (no-op for first col) // eslint-disable-line max-len
	var TAU = new Float64Array( 1 );
	var A = new Float64Array([ 5.0 ]);
	var E = new Float64Array( 1 );
	var W = new Float64Array( 1 );

	dlatrd( 'upper', 1, 1, A, 1, 1, 0, E, 1, 0, TAU, 1, 0, W, 1, 1, 0 );

	// A unchanged (diagonal only), no reflectors
	assert.equal( A[ 0 ], 5.0 );
	assert.equal( E[ 0 ], 0.0 );
	assert.equal( TAU[ 0 ], 0.0 );
});

test( 'dlatrd: N=1 quick return (nb=1, uplo=L)', function t() {
	var TAU = new Float64Array( 1 );
	var A = new Float64Array([ 5.0 ]);
	var E = new Float64Array( 1 );
	var W = new Float64Array( 1 );

	dlatrd( 'lower', 1, 1, A, 1, 1, 0, E, 1, 0, TAU, 1, 0, W, 1, 1, 0 );

	assert.equal( A[ 0 ], 5.0 );
	assert.equal( E[ 0 ], 0.0 );
	assert.equal( TAU[ 0 ], 0.0 );
});
