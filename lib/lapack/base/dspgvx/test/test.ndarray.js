/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dspgvx from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_a_u from './fixtures/itype1_v_a_u.json' with { type: 'json' };
import itype1_v_a_l from './fixtures/itype1_v_a_l.json' with { type: 'json' };
import itype1_n_a_l from './fixtures/itype1_n_a_l.json' with { type: 'json' };
import itype1_v_v_u from './fixtures/itype1_v_v_u.json' with { type: 'json' };
import itype1_v_i_l from './fixtures/itype1_v_i_l.json' with { type: 'json' };
import itype2_v_a_u from './fixtures/itype2_v_a_u.json' with { type: 'json' };
import itype3_v_a_l from './fixtures/itype3_v_a_l.json' with { type: 'json' };
import itype3_v_i_u from './fixtures/itype3_v_i_u.json' with { type: 'json' };
import itype1_n_v_u from './fixtures/itype1_n_v_u.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import itype2_v_i_l from './fixtures/itype2_v_i_l.json' with { type: 'json' };
import itype1_v_a_l_4x4 from './fixtures/itype1_v_a_l_4x4.json' with { type: 'json' };
import itype1_v_i_l_4x4 from './fixtures/itype1_v_i_l_4x4.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {

	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = Math.abs( actual - expected ) / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;

	assert.equal( actual.length, expected.length, msg + ' length' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array slice to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @param {NonNegativeInteger} start - start index
* @param {NonNegativeInteger} end - end index
* @returns {Array} output array
*/
function toArray( arr, start, end ) {
	const out = [];
	let i;

	for ( i = start; i < end; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Runs dspgvx with standard workspace allocation.
*
* @private
* @param {integer} itype - problem type
* @param {string} jobz - job type
* @param {string} range - range type
* @param {string} uplo - triangle type
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} AP - packed matrix A
* @param {Float64Array} BP - packed matrix B
* @param {number} vl - lower value bound
* @param {number} vu - upper value bound
* @param {integer} il - lower index bound
* @param {integer} iu - upper index bound
* @param {number} abstol - convergence tolerance
* @returns {Object} result with info, M, w, Z, IFAIL
*/
function runDspgvx( itype, jobz, range, uplo, N, AP, BP, vl, vu, il, iu, abstol ) { // eslint-disable-line max-len, max-params

	const WORK = new Float64Array( Math.max( 256, (8 * N) + 100 ) );
	const IWORK = new Int32Array( (5 * N) + 10 );
	const IFAIL = new Int32Array( N + 1 );
	const w = new Float64Array( N );
	const Z = new Float64Array( N * N );
	const out = {
		'M': 0
	};

	const info = dspgvx( itype, jobz, range, uplo, N, AP, 1, 0, BP, 1, 0, vl, vu, il, iu, abstol, out, w, 1, 0, Z, 1, N, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'M': out.M,
		'w': w,
		'Z': Z,
		'IFAIL': IFAIL
	};
}

// A = [4 2 1; 2 5 3; 1 3 6], B = [4 2 0; 2 5 1; 0 1 3]

/**
* Returns A in upper packed format (3x3).
*
* @private
* @returns {Float64Array} packed upper A
*/
function makeAPUpper3( ) {
	return new Float64Array([ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ]);
}

/**
* Returns A in lower packed format (3x3).
*
* @private
* @returns {Float64Array} packed lower A
*/
function makeAPLower3( ) {
	return new Float64Array([ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ]);
}

/**
* Returns B in upper packed format (3x3).
*
* @private
* @returns {Float64Array} packed upper B
*/
function makeBPUpper3( ) {
	return new Float64Array([ 4.0, 2.0, 5.0, 0.0, 1.0, 3.0 ]);
}

/**
* Returns B in lower packed format (3x3).
*
* @private
* @returns {Float64Array} packed lower B
*/
function makeBPLower3( ) {
	return new Float64Array([ 4.0, 2.0, 0.0, 5.0, 1.0, 3.0 ]);
}

// 4x4 matrices:
// A = [4 1 -2 0; 1 3 0 1; -2 0 5 -1; 0 1 -1 6]
// B = [4 1 0 0; 1 5 1 0; 0 1 6 1; 0 0 1 3]

/**
* Returns A in lower packed format (4x4).
*
* @private
* @returns {Float64Array} packed lower A
*/
function makeAPLower4( ) {
	return new Float64Array([
		4.0,
		1.0,
		-2.0,
		0.0,
		3.0,
		0.0,
		1.0,
		5.0,
		-1.0,
		6.0
	]);
}

/**
* Returns B in lower packed format (4x4).
*
* @private
* @returns {Float64Array} packed lower B
*/
function makeBPLower4( ) {
	return new Float64Array([
		4.0,
		1.0,
		0.0,
		0.0,
		5.0,
		1.0,
		0.0,
		6.0,
		1.0,
		3.0
	]);
}

// TESTS //

test( 'dspgvx: itype1, V, A, U (all eigenvalues + vectors, upper)', function t() { // eslint-disable-line max-len

	const tc = itype1_v_a_u;
	const r = runDspgvx( 1, 'compute-vectors', 'all', 'upper', 3, makeAPUpper3(), makeBPUpper3(), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype1, V, A, L (all eigenvalues + vectors, lower)', function t() { // eslint-disable-line max-len

	const tc = itype1_v_a_l;
	const r = runDspgvx( 1, 'compute-vectors', 'all', 'lower', 3, makeAPLower3(), makeBPLower3(), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype1, N, A, L (eigenvalues only)', function t() {

	const tc = itype1_n_a_l;
	const r = runDspgvx( 1, 'no-vectors', 'all', 'lower', 3, makeAPLower3(), makeBPLower3(), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dspgvx: itype1, V, V, U (value range)', function t() {

	const tc = itype1_v_v_u;
	const r = runDspgvx( 1, 'compute-vectors', 'value', 'upper', 3, makeAPUpper3(), makeBPUpper3(), 0.5, 1.5, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype1, V, I, L (index range)', function t() {

	const tc = itype1_v_i_l;
	const r = runDspgvx( 1, 'compute-vectors', 'index', 'lower', 3, makeAPLower3(), makeBPLower3(), 0, 0, 1, 2, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype2, V, A, U', function t() {

	const tc = itype2_v_a_u;
	const r = runDspgvx( 2, 'compute-vectors', 'all', 'upper', 3, makeAPUpper3(), makeBPUpper3(), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype3, V, A, L', function t() {

	const tc = itype3_v_a_l;
	const r = runDspgvx( 3, 'compute-vectors', 'all', 'lower', 3, makeAPLower3(), makeBPLower3(), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype3, V, I, U (index range)', function t() {

	const tc = itype3_v_i_u;
	const r = runDspgvx( 3, 'compute-vectors', 'index', 'upper', 3, makeAPUpper3(), makeBPUpper3(), 0, 0, 2, 3, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype1, N, V, U (eigenvalues only, value range)', function t() {

	const tc = itype1_n_v_u;
	const r = runDspgvx( 1, 'no-vectors', 'value', 'upper', 3, makeAPUpper3(), makeBPUpper3(), 0.5, 1.5, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
});

test( 'dspgvx: N=0 quick return', function t() {

	const AP = new Float64Array( 1 );
	const BP = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const IWORK = new Int32Array( 1 );
	const IFAIL = new Int32Array( 1 );
	const out = {
		'M': 0
	};
	const info = dspgvx( 1, 'compute-vectors', 'all', 'upper', 0, AP, 1, 0, BP, 1, 0, 0, 0, 0, 0, 0, out, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( out.M, 0 );
});

test( 'dspgvx: N=1', function t() {

	const tc = n_one;
	const r = runDspgvx( 1, 'compute-vectors', 'all', 'upper', 1, new Float64Array([ 6.0 ]), new Float64Array([ 2.0 ]), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertClose( Math.abs( r.Z[ 0 ] ), Math.abs( tc.Z[ 0 ] ), 1e-13, 'Z' );
});

test( 'dspgvx: non-positive definite B', function t() {

	const tc = not_posdef;
	const r = runDspgvx( 1, 'compute-vectors', 'all', 'lower', 2, new Float64Array([ 1.0, 0.0, 1.0 ]), new Float64Array([ -1.0, 0.0, 1.0 ]), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
});

test( 'dspgvx: itype2, V, I, L (index range)', function t() {

	const tc = itype2_v_i_l;
	const r = runDspgvx( 2, 'compute-vectors', 'index', 'lower', 3, makeAPLower3(), makeBPLower3(), 0, 0, 2, 3, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 3 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype1, V, A, L, 4x4', function t() {

	const tc = itype1_v_a_l_4x4;
	const r = runDspgvx( 1, 'compute-vectors', 'all', 'lower', 4, makeAPLower4(), makeBPLower4(), 0, 0, 0, 0, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 4 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});

test( 'dspgvx: itype1, V, I, L, 4x4 (index range)', function t() {

	const tc = itype1_v_i_l_4x4;
	const r = runDspgvx( 1, 'compute-vectors', 'index', 'lower', 4, makeAPLower4(), makeBPLower4(), 0, 0, 2, 3, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info );
	assert.equal( r.M, tc.M );
	assertArrayClose( toArray( r.w, 0, r.M ), tc.w, 1e-13, 'w' );
	assertArrayClose( toArray( r.Z, 0, 4 * r.M ).map( Math.abs ), tc.Z.map( Math.abs ), 1e-12, 'Z' ); // eslint-disable-line max-len
});
