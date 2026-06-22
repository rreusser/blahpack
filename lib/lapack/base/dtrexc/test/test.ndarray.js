/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrexc from './../lib/ndarray.js';

// FIXTURES //

import swap_1x1_forward from './fixtures/swap_1x1_forward.json' with { type: 'json' };
import swap_1x1_backward from './fixtures/swap_1x1_backward.json' with { type: 'json' };
import swap_1x1_forward_compq_n from './fixtures/swap_1x1_forward_compq_n.json' with { type: 'json' };
import forward_2x2_block from './fixtures/forward_2x2_block.json' with { type: 'json' };
import backward_2x2_block from './fixtures/backward_2x2_block.json' with { type: 'json' };
import forward_1x1_across_2x2 from './fixtures/forward_1x1_across_2x2.json' with { type: 'json' };
import backward_1x1_across_2x2 from './fixtures/backward_1x1_across_2x2.json' with { type: 'json' };
import ifst_adjusted_2x2 from './fixtures/ifst_adjusted_2x2.json' with { type: 'json' };
import backward_1x1_compq_n from './fixtures/backward_1x1_compq_n.json' with { type: 'json' };
import forward_2x2_across_2x2 from './fixtures/forward_2x2_across_2x2.json' with { type: 'json' };
import backward_2x2_across_2x2 from './fixtures/backward_2x2_across_2x2.json' with { type: 'json' };
import ilst_adjusted_fwd from './fixtures/ilst_adjusted_fwd.json' with { type: 'json' };
import backward_2x2_compq_n from './fixtures/backward_2x2_compq_n.json' with { type: 'json' };

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
* BuildSchurMatrix.
*
* @private
* @param {*} entries - entries
* @param {*} N - N
* @returns {*} result
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

test( 'dtrexc: swap 1x1 forward', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = swap_1x1_forward;
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
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 4, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: N=1 quick return', function t() {
	var WORK;
	var T;
	var Q;
	var r;

	T = new Float64Array([ 5.0 ]);
	Q = new Float64Array([ 1.0 ]);
	WORK = new Float64Array( 1 );
	r = dtrexc( 'update', 1, T, 1, 1, 0, Q, 1, 1, 0, 1, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: swap 1x1 backward', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = swap_1x1_backward;
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
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 4, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: swap 1x1 forward, COMPQ=N', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = swap_1x1_forward_compq_n;
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
	r = dtrexc( 'none', N, T, 1, N, 0, Q, 1, N, 0, 1, 4, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q unchanged' );
});

test( 'dtrexc: forward 2x2 block', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = forward_2x2_block;
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
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 4, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: backward 2x2 block', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = backward_2x2_block;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 0.5],
		[0, 2, 0.2],
		[0, 3, 0.1],
		[0, 4, 0.3],
		[1, 1, 1],
		[1, 2, 0.6],
		[1, 3, 0.4],
		[1, 4, 0.15],
		[2, 2, 0.5],
		[2, 3, 0.9],
		[2, 4, 0.2],
		[3, 3, 3],
		[3, 4, 2],
		[4, 3, -2],
		[4, 4, 3]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 4, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: forward 1x1 across 2x2', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = forward_1x1_across_2x2;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 0.5],
		[0, 2, 0.2],
		[0, 3, 0.1],
		[0, 4, 0.3],
		[1, 1, 3],
		[1, 2, 2],
		[1, 3, 0.6],
		[1, 4, 0.4],
		[2, 1, -2],
		[2, 2, 3],
		[2, 3, 0.8],
		[2, 4, 0.15],
		[3, 3, 1],
		[3, 4, 0.9],
		[4, 4, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 5, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: backward 1x1 across 2x2', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = backward_1x1_across_2x2;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 1],
		[0, 1, 0.5],
		[0, 2, 0.2],
		[0, 3, 0.1],
		[0, 4, 0.3],
		[1, 1, 3],
		[1, 2, 2],
		[1, 3, 0.6],
		[1, 4, 0.4],
		[2, 1, -2],
		[2, 2, 3],
		[2, 3, 0.8],
		[2, 4, 0.15],
		[3, 3, 5],
		[3, 4, 0.9],
		[4, 4, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 5, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: IFST==ILST (no-op)', function t() {
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 3;
	T = buildSchurMatrix([
		[0, 0, 4],
		[0, 1, 1],
		[0, 2, 0.5],
		[1, 1, 3],
		[1, 2, 0.8],
		[2, 2, 2]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 2, 2, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: IFST points to second row of 2x2 block', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = ifst_adjusted_2x2;
	N = 4;
	T = buildSchurMatrix([
		[0, 0, 3],
		[0, 1, 2],
		[0, 2, 0.5],
		[0, 3, 0.2],
		[1, 0, -2],
		[1, 1, 3],
		[1, 2, 0.8],
		[1, 3, 0.3],
		[2, 2, 5],
		[2, 3, 0.6],
		[3, 3, 1]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 2, 4, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: backward 1x1, COMPQ=N', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = backward_1x1_compq_n;
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
	r = dtrexc( 'none', N, T, 1, N, 0, Q, 1, N, 0, 3, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
});

test( 'dtrexc: forward 2x2 across 2x2', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = forward_2x2_across_2x2;
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
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 4, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: backward 2x2 across 2x2', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = backward_2x2_across_2x2;
	N = 6;
	T = buildSchurMatrix([
		[0, 0, 2],
		[0, 1, 3],
		[0, 2, 0.5],
		[0, 3, 0.3],
		[0, 4, 0.2],
		[0, 5, 0.1],
		[1, 0, -3],
		[1, 1, 2],
		[1, 2, 0.8],
		[1, 3, 0.4],
		[1, 4, 0.25],
		[1, 5, 0.15],
		[2, 2, 4],
		[2, 3, 1],
		[2, 4, 0.6],
		[2, 5, 0.35],
		[3, 2, -1],
		[3, 3, 4],
		[3, 4, 0.7],
		[3, 5, 0.45],
		[4, 4, 1],
		[4, 5, 0.9],
		[5, 5, 0.5]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 3, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: ilst adjusted forward', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = ilst_adjusted_fwd;
	N = 4;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 0.5],
		[0, 2, 0.2],
		[0, 3, 0.1],
		[1, 1, 3],
		[1, 2, 2],
		[1, 3, 0.6],
		[2, 1, -2],
		[2, 2, 3],
		[2, 3, 0.8],
		[3, 3, 1]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 2, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
});

test( 'dtrexc: N=0 quick return', function t() {
	var WORK;
	var T;
	var Q;
	var r;

	T = new Float64Array( 0 );
	Q = new Float64Array( 0 );
	WORK = new Float64Array( 0 );
	r = dtrexc( 'update', 0, T, 1, 1, 0, Q, 1, 1, 0, 1, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: throws TypeError for invalid compq', function t() {
	assert.throws( function throws() {
		dtrexc( 'invalid', 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 1, 2, new Float64Array( 2 ), 1, 0 );
	}, TypeError );
});

test( 'dtrexc: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrexc( 'update', -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, 1, 1, new Float64Array( 2 ), 1, 0 );
	}, RangeError );
});

test( 'dtrexc: forward 2x2 block splits during swap (nbf=3 path)', function t() {
	// 2x2 block with extremely small imaginary part: dlanv2 standardization
	// makes b*c numerically zero, splitting the 2x2 into two real eigenvalues.
	// Triggers nbf = 3 forward branch.
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 5;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 5 ); set( 0, 1, 1e-100 ); set( 0, 2, 0.5 ); set( 0, 3, 0.2 ); set( 0, 4, 0.1 );
	set( 1, 0, -1e-100 ); set( 1, 1, 5 ); set( 1, 2, 0.8 ); set( 1, 3, 0.3 ); set( 1, 4, 0.15 );
	set( 2, 2, 3 ); set( 2, 3, 0.6 ); set( 2, 4, 0.4 );
	set( 3, 3, 1 ); set( 3, 4, 0.9 );
	set( 4, 4, 0.5 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 4, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: forward 2x2 split with 2x2 block after split (nbnext=2 in nbf=3 branch)', function t() {
	// 2x2 block at position 1 splits during swap. Then a real 2x2 sits at position 4
	// (after split, here=3, so checking T[here+3, here+2] = T[6, 5] for next 2x2.
	// We need a 2x2 block at positions (5,6) in 1-based.
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 7;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 5 ); set( 0, 1, 1e-100 ); set( 0, 2, 0.5 ); set( 0, 3, 0.2 ); set( 0, 4, 0.1 ); set( 0, 5, 0.05 ); set( 0, 6, 0.03 );
	set( 1, 0, -1e-100 ); set( 1, 1, 5 ); set( 1, 2, 0.8 ); set( 1, 3, 0.3 ); set( 1, 4, 0.15 ); set( 1, 5, 0.1 ); set( 1, 6, 0.07 );
	set( 2, 2, 3 ); set( 2, 3, 0.6 ); set( 2, 4, 0.4 ); set( 2, 5, 0.2 ); set( 2, 6, 0.1 );
	set( 3, 3, 1 ); set( 3, 4, 0.9 ); set( 3, 5, 0.45 ); set( 3, 6, 0.25 );
	set( 4, 4, 4 ); set( 4, 5, 2 ); set( 4, 6, 0.5 );
	set( 5, 4, -2 ); set( 5, 5, 4 ); set( 5, 6, 0.7 );
	set( 6, 6, 0.5 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 6, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: forward 2x2 split, second 2x2 also splits (nbnext=2 -> nbnext=1 recheck)', function t() {
	// First 2x2 splits during initial swap; the next 2x2 also has tiny imag,
	// so during the next swap it splits too, triggering the recheck path
	// at line 184 setting nbnext = 1.
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 6;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 5 ); set( 0, 1, 1e-100 ); set( 0, 2, 0.5 ); set( 0, 3, 0.2 ); set( 0, 4, 0.1 ); set( 0, 5, 0.05 );
	set( 1, 0, -1e-100 ); set( 1, 1, 5 ); set( 1, 2, 0.8 ); set( 1, 3, 0.3 ); set( 1, 4, 0.15 ); set( 1, 5, 0.1 );
	set( 2, 2, 3 ); set( 2, 3, 0.6 ); set( 2, 4, 0.4 ); set( 2, 5, 0.2 );
	set( 3, 3, 1 ); set( 3, 4, 0.9 ); set( 3, 5, 0.45 );
	// Second 2x2 with tiny imag (also splits)
	set( 4, 4, 4 ); set( 4, 5, 1e-100 );
	set( 5, 4, -1e-100 ); set( 5, 5, 4 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 1, 5, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: backward 2x2 split, prior 2x2 also splits (recheck nbnext=1)', function t() {
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 6;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 1 ); set( 0, 1, 0.5 ); set( 0, 2, 0.2 ); set( 0, 3, 0.1 ); set( 0, 4, 0.3 ); set( 0, 5, 0.15 );
	set( 1, 1, 4 ); set( 1, 2, 1e-100 ); set( 1, 3, 0.6 ); set( 1, 4, 0.4 ); set( 1, 5, 0.25 );
	set( 2, 1, -1e-100 ); set( 2, 2, 4 ); set( 2, 3, 0.8 ); set( 2, 4, 0.45 ); set( 2, 5, 0.3 );
	set( 3, 3, 0.5 ); set( 3, 4, 0.9 ); set( 3, 5, 0.2 );
	set( 4, 4, 5 ); set( 4, 5, 1e-100 );
	set( 5, 4, -1e-100 ); set( 5, 5, 5 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 5, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: backward 2x2 block splits during swap (nbf=3 backward path)', function t() {
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 5;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 1 ); set( 0, 1, 0.5 ); set( 0, 2, 0.2 ); set( 0, 3, 0.1 ); set( 0, 4, 0.3 );
	set( 1, 1, 3 ); set( 1, 2, 0.8 ); set( 1, 3, 0.6 ); set( 1, 4, 0.4 );
	set( 2, 2, 0.5 ); set( 2, 3, 0.9 ); set( 2, 4, 0.2 );
	// 2x2 block at end with extremely small imaginary part
	set( 3, 3, 5 ); set( 3, 4, 1e-100 );
	set( 4, 3, -1e-100 ); set( 4, 4, 5 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 4, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: backward 2x2 split with 2x2 block before split (nbnext=2 in nbf=3 backward)', function t() {
	// 2x2 block at end splits during backward swap. Need a 2x2 block before the split position.
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 7;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 0.5 ); set( 0, 1, 0.2 ); set( 0, 2, 0.1 ); set( 0, 3, 0.3 ); set( 0, 4, 0.15 ); set( 0, 5, 0.1 ); set( 0, 6, 0.05 );
	set( 1, 1, 4 ); set( 1, 2, 2 ); set( 1, 3, 0.6 ); set( 1, 4, 0.4 ); set( 1, 5, 0.25 ); set( 1, 6, 0.15 );
	set( 2, 1, -2 ); set( 2, 2, 4 ); set( 2, 3, 0.8 ); set( 2, 4, 0.45 ); set( 2, 5, 0.3 ); set( 2, 6, 0.2 );
	set( 3, 3, 1 ); set( 3, 4, 0.9 ); set( 3, 5, 0.45 ); set( 3, 6, 0.25 );
	set( 4, 4, 3 ); set( 4, 5, 0.6 ); set( 4, 6, 0.4 );
	set( 5, 5, 5 ); set( 5, 6, 1e-100 );
	set( 6, 5, -1e-100 ); set( 6, 6, 5 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 6, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
});

test( 'dtrexc: ifst at second row of 2x2, ilst at second row of 2x2', function t() {
	// Both ifst and ilst point to second rows of 2x2 blocks; both get adjusted.
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 6;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 3 ); set( 0, 1, 2 ); set( 0, 2, 0.5 ); set( 0, 3, 0.3 ); set( 0, 4, 0.2 ); set( 0, 5, 0.1 );
	set( 1, 0, -1 ); set( 1, 1, 3 ); set( 1, 2, 0.8 ); set( 1, 3, 0.4 ); set( 1, 4, 0.25 ); set( 1, 5, 0.15 );
	set( 2, 2, 5 ); set( 2, 3, 0.6 ); set( 2, 4, 0.4 ); set( 2, 5, 0.2 );
	set( 3, 3, 1 ); set( 3, 4, 0.9 ); set( 3, 5, 0.45 );
	set( 4, 4, 2 ); set( 4, 5, 3 );
	set( 5, 4, -2 ); set( 5, 5, 2 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 2, 6, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
	// ifst should be adjusted from 2 to 1; ilst from 6 to 5
	assert.strictEqual( r.ifst, 1, 'ifst adjusted' );
});

test( 'dtrexc: ilst at second row of 2x2 backward', function t() {
	// Backward swap; ilst is adjusted from 2 -> 1.
	var WORK;
	var N;
	var T;
	var Q;
	var r;

	N = 4;
	T = new Float64Array( N * N );
	function set( i, j, v ) { T[ i + j * N ] = v; }
	set( 0, 0, 3 ); set( 0, 1, 2 ); set( 0, 2, 0.5 ); set( 0, 3, 0.2 );
	set( 1, 0, -1 ); set( 1, 1, 3 ); set( 1, 2, 0.8 ); set( 1, 3, 0.3 );
	set( 2, 2, 5 ); set( 2, 3, 0.6 );
	set( 3, 3, 1 );
	Q = new Float64Array( N * N );
	for ( var i = 0; i < N; i++ ) { Q[ i + i * N ] = 1.0; }
	WORK = new Float64Array( N );
	r = dtrexc( 'update', N, T, 1, N, 0, Q, 1, N, 0, 4, 2, WORK, 1, 0 );
	assert.strictEqual( r.info, 0, 'info' );
	// ilst should be adjusted to point to start of 2x2 block (1)
	assert.strictEqual( r.ilst, 1, 'ilst adjusted backward' );
});

test( 'dtrexc: backward 2x2 block, COMPQ=N', function t() {
	var WORK;
	var tc;
	var N;
	var T;
	var Q;
	var r;

	tc = backward_2x2_compq_n;
	N = 5;
	T = buildSchurMatrix([
		[0, 0, 5],
		[0, 1, 0.5],
		[0, 2, 0.2],
		[0, 3, 0.1],
		[0, 4, 0.3],
		[1, 1, 1],
		[1, 2, 0.6],
		[1, 3, 0.4],
		[1, 4, 0.15],
		[2, 2, 0.5],
		[2, 3, 0.9],
		[2, 4, 0.2],
		[3, 3, 3],
		[3, 4, 2],
		[4, 3, -2],
		[4, 4, 3]
	], N);
	Q = eye( N );
	WORK = new Float64Array( N );
	r = dtrexc( 'none', N, T, 1, N, 0, Q, 1, N, 0, 4, 1, WORK, 1, 0 );
	assert.strictEqual( r.info, tc.info, 'info' );
	assertArrayClose( toArray( T ), tc.T, 1e-12, 'T' );
});
