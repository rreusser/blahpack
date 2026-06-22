/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaexc from './../lib/ndarray.js';

// FIXTURES //

import n1_1_n2_1_wantq_true from './fixtures/n1_1_n2_1_wantq_true.json' with { type: 'json' };
import n1_1_n2_1_wantq_false from './fixtures/n1_1_n2_1_wantq_false.json' with { type: 'json' };
import n1_1_n2_2_wantq_true from './fixtures/n1_1_n2_2_wantq_true.json' with { type: 'json' };
import n1_1_n2_2_wantq_false from './fixtures/n1_1_n2_2_wantq_false.json' with { type: 'json' };
import n1_2_n2_1_wantq_true from './fixtures/n1_2_n2_1_wantq_true.json' with { type: 'json' };
import n1_2_n2_1_wantq_false from './fixtures/n1_2_n2_1_wantq_false.json' with { type: 'json' };
import n1_2_n2_2_wantq_true from './fixtures/n1_2_n2_2_wantq_true.json' with { type: 'json' };
import n1_2_n2_2_wantq_false from './fixtures/n1_2_n2_2_wantq_false.json' with { type: 'json' };
import n1_1_n2_1_boundary from './fixtures/n1_1_n2_1_boundary.json' with { type: 'json' };
import n1_1_n2_1_start from './fixtures/n1_1_n2_1_start.json' with { type: 'json' };

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
* Build an NxN column-major matrix and identity Q for dlaexc tests.
*/
function buildSchurMatrix( entries, N ) {
	var T = new Float64Array( N * N );
	var i;
	for ( i = 0; i < entries.length; i++ ) {
		T[ entries[ i ][ 0 ] + entries[ i ][ 1 ] * N ] = entries[ i ][ 2 ];
	}
	return T;
}

/**
* Eye.
*
* @private
* @param {*} N - N
* @returns {*} result
*/
function eye( N ) {
	var Q = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q[ i + i * N ] = 1.0;
	}
	return Q;
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

test( 'dlaexc: N1=1, N2=1, WANTQ=true', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_1_n2_1_wantq_true;
	N = 4;
	T = buildSchurMatrix([
		[0, 0, 4],
		[0, 1, 1],
		[0, 2, 0.5],
		[0, 3, 0.2],
		[1, 1, 3],
		[1, 2, 0.8],
		[1, 3, 0.3],
		[2, 2, 2],
		[2, 3, 0.6],
		[3, 3, 1]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( true, N, T, 1, N, 0, Q, 1, N, 0, 2, 1, 1, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dlaexc: N1=1, N2=1, WANTQ=false', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_1_n2_1_wantq_false;
	N = 4;
	T = buildSchurMatrix([
		[0, 0, 4],
		[0, 1, 1],
		[0, 2, 0.5],
		[0, 3, 0.2],
		[1, 1, 3],
		[1, 2, 0.8],
		[1, 3, 0.3],
		[2, 2, 2],
		[2, 3, 0.6],
		[3, 3, 1]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( false, N, T, 1, N, 0, Q, 1, N, 0, 2, 1, 1, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q unchanged' );
});

test( 'dlaexc: N1=1, N2=2, WANTQ=true', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_1_n2_2_wantq_true;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 1],
		[0, 2, 0.3],
		[0, 3, 0.2],
		[0, 4, 0.1],
		[1, 1, 3],
		[1, 2, 2],
		[1, 3, 0.5],
		[1, 4, 0.4],
		[2, 1, -2],
		[2, 2, 3],
		[2, 3, 0.7],
		[2, 4, 0.6],
		[3, 3, 1],
		[3, 4, 0.9],
		[4, 4, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( true, N, T, 1, N, 0, Q, 1, N, 0, 1, 1, 2, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dlaexc: N1=1, N2=2, WANTQ=false', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_1_n2_2_wantq_false;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 1],
		[0, 2, 0.3],
		[0, 3, 0.2],
		[0, 4, 0.1],
		[1, 1, 3],
		[1, 2, 2],
		[1, 3, 0.5],
		[1, 4, 0.4],
		[2, 1, -2],
		[2, 2, 3],
		[2, 3, 0.7],
		[2, 4, 0.6],
		[3, 3, 1],
		[3, 4, 0.9],
		[4, 4, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( false, N, T, 1, N, 0, Q, 1, N, 0, 1, 1, 2, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
});

test( 'dlaexc: N1=2, N2=1, WANTQ=true', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_2_n2_1_wantq_true;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 3],
		[0, 1, 2],
		[0, 2, 0.5],
		[0, 3, 0.2],
		[0, 4, 0.1],
		[1, 0, -2],
		[1, 1, 3],
		[1, 2, 0.8],
		[1, 3, 0.3],
		[1, 4, 0.15],
		[2, 2, 5],
		[2, 3, 0.6],
		[2, 4, 0.4],
		[3, 3, 1],
		[3, 4, 0.9],
		[4, 4, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( true, N, T, 1, N, 0, Q, 1, N, 0, 1, 2, 1, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dlaexc: N1=2, N2=1, WANTQ=false', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_2_n2_1_wantq_false;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 3],
		[0, 1, 2],
		[0, 2, 0.5],
		[0, 3, 0.2],
		[0, 4, 0.1],
		[1, 0, -2],
		[1, 1, 3],
		[1, 2, 0.8],
		[1, 3, 0.3],
		[1, 4, 0.15],
		[2, 2, 5],
		[2, 3, 0.6],
		[2, 4, 0.4],
		[3, 3, 1],
		[3, 4, 0.9],
		[4, 4, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( false, N, T, 1, N, 0, Q, 1, N, 0, 1, 2, 1, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
});

test( 'dlaexc: N1=2, N2=2, WANTQ=true', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_2_n2_2_wantq_true;
	N = 6;
	T = buildSchurMatrix([
		[0, 0, 4],
		[0, 1, 1],
		[0, 2, 0.5],
		[0, 3, 0.3],
		[0, 4, 0.2],
		[0, 5, 0.1],
		[1, 0, -1],
		[1, 1, 4],
		[1, 2, 0.8],
		[1, 3, 0.4],
		[1, 4, 0.25],
		[1, 5, 0.15],
		[2, 2, 2],
		[2, 3, 3],
		[2, 4, 0.6],
		[2, 5, 0.35],
		[3, 2, -3],
		[3, 3, 2],
		[3, 4, 0.7],
		[3, 5, 0.45],
		[4, 4, 1],
		[4, 5, 0.9],
		[5, 5, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( true, N, T, 1, N, 0, Q, 1, N, 0, 1, 2, 2, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dlaexc: N1=2, N2=2, WANTQ=false', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_2_n2_2_wantq_false;
	N = 6;
	T = buildSchurMatrix([
		[0, 0, 4],
		[0, 1, 1],
		[0, 2, 0.5],
		[0, 3, 0.3],
		[0, 4, 0.2],
		[0, 5, 0.1],
		[1, 0, -1],
		[1, 1, 4],
		[1, 2, 0.8],
		[1, 3, 0.4],
		[1, 4, 0.25],
		[1, 5, 0.15],
		[2, 2, 2],
		[2, 3, 3],
		[2, 4, 0.6],
		[2, 5, 0.35],
		[3, 2, -3],
		[3, 3, 2],
		[3, 4, 0.7],
		[3, 5, 0.45],
		[4, 4, 1],
		[4, 5, 0.9],
		[5, 5, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( false, N, T, 1, N, 0, Q, 1, N, 0, 1, 2, 2, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
});

test( 'dlaexc: quick return N=0', function t() {
	var info = dlaexc( true, 0, new Float64Array(0), 1, 0, 0, new Float64Array(0), 1, 0, 0, 1, 1, 1, new Float64Array(0), 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0, 'info' );
});

test( 'dlaexc: quick return n1=0', function t() {
	var WORK;
	var info;
	var T;
	var Q;

	T = new Float64Array( 16 );
	Q = new Float64Array( 16 );
	WORK = new Float64Array( 4 );
	info = dlaexc( true, 4, T, 1, 4, 0, Q, 1, 4, 0, 1, 0, 1, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'dlaexc: N1=1, N2=1 boundary (end of matrix)', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_1_n2_1_boundary;
	N = 3;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 1],
		[0, 2, 0.5],
		[1, 1, 3],
		[1, 2, 0.8],
		[2, 2, 1]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( true, N, T, 1, N, 0, Q, 1, N, 0, 2, 1, 1, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dlaexc: N1=1, N2=1 at start (j1=1)', function t() {
	var WORK;
	var info;
	var tc;
	var N;
	var T;
	var Q;

	tc = n1_1_n2_1_start;
	N = 3;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 1],
		[0, 2, 0.5],
		[1, 1, 3],
		[1, 2, 0.8],
		[2, 2, 1]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	info = dlaexc( true, N, T, 1, N, 0, Q, 1, N, 0, 1, 1, 1, WORK, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});
