/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgebd2 from './../lib/ndarray.js';

// FIXTURES //

import _4x3_upper from './fixtures/4x3_upper.json' with { type: 'json' };
import _3x4_lower from './fixtures/3x4_lower.json' with { type: 'json' };
import _3x3_square from './fixtures/3x3_square.json' with { type: 'json' };
import _1x3 from './fixtures/1x3.json' with { type: 'json' };
import _3x1 from './fixtures/3x1.json' with { type: 'json' };
import _1x1 from './fixtures/1x1.json' with { type: 'json' };

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

test( 'dgebd2: 4x3 upper bidiagonal (M > N)', function t() {
	var WORK;
	var TAUQ;
	var TAUP;
	var info;
	var tc;
	var A;
	var D;
	var E;

	tc = _4x3_upper;
	A = new Float64Array([
		2.0,
		1.0,
		3.0,
		1.0,  // col 0
		1.0,
		4.0,
		2.0,
		3.0,  // col 1
		3.0,
		2.0,
		5.0,
		1.0   // col 2
	]);
	D = new Float64Array( 3 );
	E = new Float64Array( 2 );
	TAUQ = new Float64Array( 3 );
	TAUP = new Float64Array( 3 );
	WORK = new Float64Array( 4 );
	info = dgebd2( 4, 3, A, 1, 4, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( E ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebd2: 3x4 lower bidiagonal (M < N)', function t() {
	var WORK;
	var TAUQ;
	var TAUP;
	var info;
	var tc;
	var A;
	var D;
	var E;

	tc = _3x4_lower;
	A = new Float64Array([
		2.0,
		4.0,
		1.0,  // col 0
		1.0,
		2.0,
		5.0,  // col 1
		3.0,
		1.0,
		2.0,  // col 2
		1.0,
		3.0,
		4.0   // col 3
	]);
	D = new Float64Array( 3 );
	E = new Float64Array( 2 );
	TAUQ = new Float64Array( 3 );
	TAUP = new Float64Array( 3 );
	WORK = new Float64Array( 4 );
	info = dgebd2( 3, 4, A, 1, 3, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( E ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebd2: 3x3 square matrix', function t() {
	var WORK;
	var TAUQ;
	var TAUP;
	var info;
	var tc;
	var A;
	var D;
	var E;

	tc = _3x3_square;
	A = new Float64Array([
		5.0,
		3.0,
		1.0,  // col 0
		2.0,
		4.0,
		3.0,  // col 1
		1.0,
		2.0,
		6.0   // col 2
	]);
	D = new Float64Array( 3 );
	E = new Float64Array( 2 );
	TAUQ = new Float64Array( 3 );
	TAUP = new Float64Array( 3 );
	WORK = new Float64Array( 3 );
	info = dgebd2( 3, 3, A, 1, 3, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( E ), tc.E, 1e-14, 'E' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebd2: 1x3 (M=1, M < N)', function t() {
	var WORK;
	var TAUQ;
	var TAUP;
	var info;
	var tc;
	var A;
	var D;

	tc = _1x3;
	A = new Float64Array([
		2.0, 3.0, 4.0
	]);
	D = new Float64Array( 1 );
	TAUQ = new Float64Array( 1 );
	TAUP = new Float64Array( 1 );
	WORK = new Float64Array( 3 );
	info = dgebd2( 1, 3, A, 1, 1, 0, D, 1, 0, new Float64Array( 0 ), 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebd2: 3x1 (N=1, M > N)', function t() {
	var WORK;
	var TAUQ;
	var TAUP;
	var info;
	var tc;
	var A;
	var D;

	tc = _3x1;
	A = new Float64Array([
		2.0, 3.0, 4.0
	]);
	D = new Float64Array( 1 );
	TAUQ = new Float64Array( 1 );
	TAUP = new Float64Array( 1 );
	WORK = new Float64Array( 3 );
	info = dgebd2( 3, 1, A, 1, 3, 0, D, 1, 0, new Float64Array( 0 ), 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});

test( 'dgebd2: M=0 quick return', function t() {
	var info = dgebd2( 0, 3, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dgebd2: N=0 quick return', function t() {
	var info = dgebd2( 3, 0, new Float64Array( 0 ), 1, 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0, new Float64Array( 0 ), 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'dgebd2: 1x1 matrix', function t() {
	var WORK;
	var TAUQ;
	var TAUP;
	var info;
	var tc;
	var A;
	var D;

	tc = _1x1;
	A = new Float64Array([ 7.0 ]);
	D = new Float64Array( 1 );
	TAUQ = new Float64Array( 1 );
	TAUP = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgebd2( 1, 1, A, 1, 1, 0, D, 1, 0, new Float64Array( 0 ), 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.INFO );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
	assertArrayClose( toArray( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toArray( TAUQ ), tc.TAUQ, 1e-14, 'TAUQ' );
	assertArrayClose( toArray( TAUP ), tc.TAUP, 1e-14, 'TAUP' );
});
