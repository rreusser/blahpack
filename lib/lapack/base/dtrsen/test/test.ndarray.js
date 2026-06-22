/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrsen from './../lib/ndarray.js';

// FIXTURES //

import all_selected_2x2 from './fixtures/all_selected_2x2.json' with { type: 'json' };
import none_selected from './fixtures/none_selected.json' with { type: 'json' };
import e_compute_s from './fixtures/e_compute_s.json' with { type: 'json' };
import v_compute_sep from './fixtures/v_compute_sep.json' with { type: 'json' };
import b_compute_both from './fixtures/b_compute_both.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };

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
* Convert column-major Fortran fixture array (4x4 with padding) to column-major Float64Array for N-by-N.
*/
function fromFortranColMajor( arr, N, LDA ) {
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out[ i + j * N ] = arr[ i + j * LDA ];
		}
	}
	return out;
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

test( 'dtrsen: N V select scalar swap', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	N = 3;
	T = new Float64Array([
		1.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		0.5,
		1.0,
		5.0
	]);
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1;
	Q[ 4 ] = 1;
	Q[ 8 ] = 1;
	SELECT = new Uint8Array([ 0, 1, 0 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'none', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( M[ 0 ], 1 );
	assertClose( WR[ 0 ], 3.0, 1e-13, 'WR[0]' );
	assertClose( WR[ 1 ], 1.0, 1e-13, 'WR[1]' );
	assertClose( WR[ 2 ], 5.0, 1e-13, 'WR[2]' );
});

test( 'dtrsen: all selected 2x2', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var tc;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	tc = all_selected_2x2;
	N = 2;
	T = fromFortranColMajor([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	], N, 4 );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1;
	Q[ 3 ] = 1;
	SELECT = new Uint8Array([ 1, 1 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'none', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
	assertArrayClose( toArray( WR ), tc.WR.slice( 0, N ), 1e-13, 'WR' );
	assertArrayClose( toArray( WI ), tc.WI.slice( 0, N ), 1e-13, 'WI' );
});

test( 'dtrsen: none selected', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var tc;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	tc = none_selected;
	N = 2;
	T = new Float64Array([ 1.0, 0.0, 2.0, 3.0 ]);
	Q = new Float64Array([ 1.0, 0.0, 0.0, 1.0 ]);
	SELECT = new Uint8Array([ 0, 0 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'none', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
});

test( 'dtrsen: E compute S', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var tc;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	tc = e_compute_s;
	N = 3;
	T = fromFortranColMajor([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		0.0,
		0.5,
		1.0,
		5.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	], N, 4 );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1;
	Q[ 4 ] = 1;
	Q[ 8 ] = 1;
	SELECT = new Uint8Array([ 1, 0, 0 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'eigenvalues', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
	assertClose( s[ 0 ], tc.S, 1e-13, 'S' );
});

test( 'dtrsen: V compute SEP', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var tc;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	tc = v_compute_sep;
	N = 3;
	T = fromFortranColMajor([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		0.0,
		0.5,
		1.0,
		5.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	], N, 4 );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1;
	Q[ 4 ] = 1;
	Q[ 8 ] = 1;
	SELECT = new Uint8Array([ 1, 0, 0 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'subspace', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
	assertClose( sep[ 0 ], tc.SEP, 1e-13, 'SEP' );
});

test( 'dtrsen: B compute both', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var tc;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	tc = b_compute_both;
	N = 3;
	T = fromFortranColMajor([
		1.0,
		0.0,
		0.0,
		0.0,
		2.0,
		3.0,
		0.0,
		0.0,
		0.5,
		1.0,
		5.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0
	], N, 4 );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1;
	Q[ 4 ] = 1;
	Q[ 8 ] = 1;
	SELECT = new Uint8Array([ 1, 0, 0 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'both', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
	assertClose( s[ 0 ], tc.S, 1e-13, 'S' );
	assertClose( sep[ 0 ], tc.SEP, 1e-13, 'SEP' );
});

test( 'dtrsen: N=0', function t() {
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var tc;
	var WR;
	var WI;
	var T;
	var Q;
	var M;
	var s;

	tc = n_0;
	T = new Float64Array( 0 );
	Q = new Float64Array( 0 );
	SELECT = new Uint8Array( 0 );
	WR = new Float64Array( 0 );
	WI = new Float64Array( 0 );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'none', 'update', SELECT, 1, 0, 0, T, 1, 0, 0, Q, 1, 0, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( M[ 0 ], tc.M );
});

test( 'dtrsen: select complex pair (already in leading position)', function t() { // eslint-disable-line max-len
	var SELECT;
	var IWORK;
	var WORK;
	var info;
	var sep;
	var WR;
	var WI;
	var N;
	var T;
	var Q;
	var M;
	var s;

	N = 4;
	T = fromFortranColMajor([
		4.0,
		-1.5,
		0.0,
		0.0,
		1.5,
		4.0,
		0.0,
		0.0,
		0.3,
		0.4,
		1.0,
		0.0,
		0.2,
		0.1,
		0.5,
		2.0
	], N, N );
	Q = new Float64Array( N * N );
	Q[ 0 ] = 1;
	Q[ 5 ] = 1;
	Q[ 10 ] = 1;
	Q[ 15 ] = 1;
	SELECT = new Uint8Array([ 1, 1, 0, 0 ]);
	WR = new Float64Array( N );
	WI = new Float64Array( N );
	M = new Float64Array( 1 );
	s = new Float64Array( 1 );
	sep = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	IWORK = new Int32Array( 100 );
	info = dtrsen( 'none', 'update', SELECT, 1, 0, N, T, 1, N, 0, Q, 1, N, 0, WR, 1, 0, WI, 1, 0, M, s, sep, WORK, 1, 0, 100, IWORK, 1, 0, 100 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( M[ 0 ], 2 );
	assertClose( WR[ 0 ], 4.0, 1e-13, 'WR[0]' );
	assertClose( WR[ 1 ], 4.0, 1e-13, 'WR[1]' );
	assertClose( Math.abs( WI[ 0 ] ), 1.5, 1e-13, 'WI[0]' );
	assertClose( Math.abs( WI[ 1 ] ), 1.5, 1e-13, 'WI[1]' );
});
