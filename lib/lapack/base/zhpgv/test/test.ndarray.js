/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpgv from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_lower from './fixtures/itype1_v_lower.json' with { type: 'json' };
import itype1_v_upper from './fixtures/itype1_v_upper.json' with { type: 'json' };
import itype1_n_lower from './fixtures/itype1_n_lower.json' with { type: 'json' };
import itype1_n_upper from './fixtures/itype1_n_upper.json' with { type: 'json' };
import itype2_v_lower from './fixtures/itype2_v_lower.json' with { type: 'json' };
import itype2_v_upper from './fixtures/itype2_v_upper.json' with { type: 'json' };
import itype3_v_lower from './fixtures/itype3_v_lower.json' with { type: 'json' };
import itype3_v_upper from './fixtures/itype3_v_upper.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': got ' + actual );
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
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;

	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Returns A in lower packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function makeAPLower( ) {
	return new Complex128Array( [ 4, 0, 1, 1, 2, -1, 5, 0, 3, 0, 6, 0 ] );
}

/**
* Returns A in upper packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed upper matrix
*/
function makeAPUpper( ) {
	return new Complex128Array( [ 4, 0, 1, -1, 5, 0, 2, 1, 3, 0, 6, 0 ] );
}

/**
* Returns B in lower packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed lower matrix
*/
function makeBPLower( ) {
	return new Complex128Array( [ 2, 0, 0.5, 0.5, 0, 0, 3, 0, 0.5, 0, 2, 0 ] );
}

/**
* Returns B in upper packed Complex128Array form.
*
* @private
* @returns {Complex128Array} packed upper matrix
*/
function makeBPUpper( ) {
	return new Complex128Array( [ 2, 0, 0.5, -0.5, 3, 0, 0, 0, 0.5, 0, 2, 0 ] );
}

// TESTS //

test( 'zhpgv: itype1_v_lower', function t() {

	const tc = itype1_v_lower;
	const AP = makeAPLower();
	const BP = makeBPLower();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 9 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 1, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	const Zv = reinterpret( Z, 0 );
	const absZ = toArray( Zv ).map( Math.abs );
	const absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'zhpgv: itype1_v_upper', function t() {

	const tc = itype1_v_upper;
	const AP = makeAPUpper();
	const BP = makeBPUpper();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 9 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 1, 'compute-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	const Zv = reinterpret( Z, 0 );
	const absZ = toArray( Zv ).map( Math.abs );
	const absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'zhpgv: itype1_n_lower (eigenvalues only)', function t() {

	const tc = itype1_n_lower;
	const AP = makeAPLower();
	const BP = makeBPLower();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 1 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 1, 'no-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
});

test( 'zhpgv: itype1_n_upper (eigenvalues only)', function t() {

	const tc = itype1_n_upper;
	const AP = makeAPUpper();
	const BP = makeBPUpper();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 1 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 1, 'no-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
});

test( 'zhpgv: itype2_v_lower', function t() {

	const tc = itype2_v_lower;
	const AP = makeAPLower();
	const BP = makeBPLower();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 9 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 2, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	const Zv = reinterpret( Z, 0 );
	const absZ = toArray( Zv ).map( Math.abs );
	const absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'zhpgv: itype2_v_upper', function t() {

	const tc = itype2_v_upper;
	const AP = makeAPUpper();
	const BP = makeBPUpper();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 9 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 2, 'compute-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	const Zv = reinterpret( Z, 0 );
	const absZ = toArray( Zv ).map( Math.abs );
	const absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'zhpgv: itype3_v_lower', function t() {

	const tc = itype3_v_lower;
	const AP = makeAPLower();
	const BP = makeBPLower();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 9 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 3, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	const Zv = reinterpret( Z, 0 );
	const absZ = toArray( Zv ).map( Math.abs );
	const absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'zhpgv: itype3_v_upper', function t() {

	const tc = itype3_v_upper;
	const AP = makeAPUpper();
	const BP = makeBPUpper();
	const w = new Float64Array( 3 );
	const Z = new Complex128Array( 9 );
	const WORK = new Complex128Array( 20 );
	const RWORK = new Float64Array( 20 );
	const info = zhpgv( 3, 'compute-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	const Zv = reinterpret( Z, 0 );
	const absZ = toArray( Zv ).map( Math.abs );
	const absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'zhpgv: n_zero', function t() {

	const AP = new Complex128Array( 1 );
	const BP = new Complex128Array( 1 );
	const w = new Float64Array( 1 );
	const Z = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );
	const info = zhpgv( 1, 'compute-vectors', 'upper', 0, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'zhpgv: n_one', function t() {

	const tc = n_one;
	const AP = new Complex128Array( [ 6.0, 0.0 ] );
	const BP = new Complex128Array( [ 2.0, 0.0 ] );
	const w = new Float64Array( 1 );
	const Z = new Complex128Array( 1 );
	const WORK = new Complex128Array( 10 );
	const RWORK = new Float64Array( 10 );
	const info = zhpgv( 1, 'compute-vectors', 'upper', 1, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( w[ 0 ], tc.w1, 1e-14, 'w1' );
	const Zv = reinterpret( Z, 0 );
	assertClose( Math.abs( Zv[ 0 ] ), Math.abs( tc.Z[ 0 ] ), 1e-14, 'Z1' );
});

test( 'zhpgv: not_posdef', function t() {

	const tc = not_posdef;
	const AP = new Complex128Array( [ 1, 0, 0, 0, 1, 0 ] );
	const BP = new Complex128Array( [ -1, 0, 0, 0, 1, 0 ] );
	const w = new Float64Array( 2 );
	const Z = new Complex128Array( 4 );
	const WORK = new Complex128Array( 10 );
	const RWORK = new Float64Array( 10 );
	const info = zhpgv( 1, 'compute-vectors', 'lower', 2, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 2, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});
