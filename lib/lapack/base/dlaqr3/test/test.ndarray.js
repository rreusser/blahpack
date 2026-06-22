/* eslint-disable max-len, no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr3 from './../lib/ndarray.js';

// FIXTURES //

import _6x6_hessenberg_nw_3 from './fixtures/6x6_hessenberg_nw_3.json' with { type: 'json' };
import _4x4_hessenberg_nw_2 from './fixtures/4x4_hessenberg_nw_2.json' with { type: 'json' };
import _4x4_hessenberg_nw_1 from './fixtures/4x4_hessenberg_nw_1.json' with { type: 'json' };
import empty_active_block from './fixtures/empty_active_block.json' with { type: 'json' };
import empty_deflation_window from './fixtures/empty_deflation_window.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extract NxN submatrix from column-major array with leading dimension LDA,.
* returning a column-major Float64Array with leading dimension N.
*/
function extractMatrix( arr, N, LDA ) {
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
* Run dlaqr3 with test parameters.
* Matrices are passed in column-major order. Returns { ns, nd, H, Z, SR, SI }.
*/
function runDlaqr3( wantt, wantz, N, ktop, kbot, nw, Hin, iloz, ihiz ) {
	var result;
	var lwork = 200;
	var MAXN = 10;
	var WORK = new Float64Array( 200 );
	var SR = new Float64Array( N );
	var SI = new Float64Array( N );
	var WV = new Float64Array( MAXN * MAXN );
	var nh = N;
	var nv = N;
	var H = new Float64Array( MAXN * N );
	var Z = new Float64Array( MAXN * N );
	var V = new Float64Array( MAXN * MAXN );
	var T = new Float64Array( MAXN * MAXN );
	var i;

	// Copy input H (column-major with LDH=MAXN -> stride1=1, stride2=MAXN -> but we use N as LDH) // eslint-disable-line max-len

	// We store H with LDH=N (stride1=1, stride2=N) for simplicity
	for ( i = 0; i < Hin.length && i < N * N; i++ ) {
		H[ i ] = Hin[ i ];
	}

	// Z = I
	for ( i = 0; i < N; i++ ) {
		Z[ i + i * N ] = 1.0;
	}

	result = dlaqr3( wantt, wantz, N, ktop, kbot, nw, H, 1, N, 0, iloz, ihiz, Z, 1, N, 0, SR, 1, 0, SI, 1, 0, V, 1, N, 0, nh, T, 1, N, 0, nv, WV, 1, N, 0, WORK, 1, 0, lwork ); // eslint-disable-line max-len

	return {
		'ns': result.ns,
		'nd': result.nd,
		'H': H,
		'Z': Z,
		'SR': SR,
		'SI': SI
	};
}

// TESTS //

test( 'dlaqr3: 6x6 hessenberg NW=3', function t() {
	var result;
	var MAXN;
	var Hexp;
	var Hin;
	var tc;
	var N;

	tc = _6x6_hessenberg_nw_3;
	N = 6;
	MAXN = 10;
	Hin = extractMatrix( tc.H, N, MAXN );
	result = runDlaqr3( true, true, N, 1, 6, 3, Hin, 1, 6 );
	assert.equal( result.ns, tc.ns, 'ns' );
	assert.equal( result.nd, tc.nd, 'nd' );
	Hexp = extractMatrix( tc.H, N, MAXN );
	assertArrayClose( result.SR, new Float64Array( tc.SR ), 1e-10, 'SR' );
	assertArrayClose( result.SI, new Float64Array( tc.SI ), 1e-10, 'SI' );
});

test( 'dlaqr3: 4x4 hessenberg NW=2', function t() {
	var result;
	var MAXN;
	var Hin;
	var tc;
	var N;

	tc = _4x4_hessenberg_nw_2;
	N = 4;
	MAXN = 10;
	Hin = extractMatrix( tc.H, N, MAXN );
	result = runDlaqr3( true, true, N, 1, 4, 2, Hin, 1, 4 );
	assert.equal( result.ns, tc.ns, 'ns' );
	assert.equal( result.nd, tc.nd, 'nd' );
	assertArrayClose( result.SR, new Float64Array( tc.SR ), 1e-10, 'SR' );
	assertArrayClose( result.SI, new Float64Array( tc.SI ), 1e-10, 'SI' );
});

test( 'dlaqr3: 4x4 hessenberg NW=1', function t() {
	var result;
	var MAXN;
	var tc;
	var H0;
	var N;

	tc = _4x4_hessenberg_nw_1;
	N = 4;
	MAXN = 10;
	H0 = new Float64Array( N * N );
	H0[ 0 + 0 * N ] = 5.0;
	H0[ 0 + 1 * N ] = 2.0;
	H0[ 0 + 2 * N ] = 0.3;
	H0[ 0 + 3 * N ] = 0.1;
	H0[ 1 + 0 * N ] = 1.0;
	H0[ 1 + 1 * N ] = 4.0;
	H0[ 1 + 2 * N ] = 1.5;
	H0[ 1 + 3 * N ] = 0.2;
	H0[ 2 + 1 * N ] = 0.8;
	H0[ 2 + 2 * N ] = 3.0;
	H0[ 2 + 3 * N ] = 1.0;
	H0[ 3 + 2 * N ] = 0.5;
	H0[ 3 + 3 * N ] = 2.0;
	result = runDlaqr3( true, false, N, 1, 4, 1, H0, 1, 4 );
	assert.equal( result.ns, tc.ns, 'ns' );
	assert.equal( result.nd, tc.nd, 'nd' );
	assertArrayClose( result.SR, new Float64Array( tc.SR ), 1e-10, 'SR' );
	assertArrayClose( result.SI, new Float64Array( tc.SI ), 1e-10, 'SI' );
});

test( 'dlaqr3: empty active block (ktop > kbot)', function t() {
	var result;
	var WORK;
	var tc;
	var SR;
	var SI;
	var WV;
	var N;
	var H;
	var Z;
	var V;
	var T;

	tc = empty_active_block;
	N = 4;
	H = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	SR = new Float64Array( N );
	SI = new Float64Array( N );
	V = new Float64Array( N * N );
	T = new Float64Array( N * N );
	WV = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	result = dlaqr3( true, false, N, 3, 2, 2, H, 1, N, 0, 1, 4, Z, 1, N, 0, SR, 1, 0, SI, 1, 0, V, 1, N, 0, N, T, 1, N, 0, N, WV, 1, N, 0, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( result.ns, tc.ns, 'ns' );
	assert.equal( result.nd, tc.nd, 'nd' );
});

test( 'dlaqr3: empty deflation window (nw < 1)', function t() {
	var result;
	var WORK;
	var tc;
	var SR;
	var SI;
	var WV;
	var N;
	var H;
	var Z;
	var V;
	var T;

	tc = empty_deflation_window;
	N = 4;
	H = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	SR = new Float64Array( N );
	SI = new Float64Array( N );
	V = new Float64Array( N * N );
	T = new Float64Array( N * N );
	WV = new Float64Array( N * N );
	WORK = new Float64Array( 200 );
	result = dlaqr3( true, false, N, 1, 4, 0, H, 1, N, 0, 1, 4, Z, 1, N, 0, SR, 1, 0, SI, 1, 0, V, 1, N, 0, N, T, 1, N, 0, N, WV, 1, N, 0, WORK, 1, 0, 200 ); // eslint-disable-line max-len
	assert.equal( result.ns, tc.ns, 'ns' );
	assert.equal( result.nd, tc.nd, 'nd' );
});
