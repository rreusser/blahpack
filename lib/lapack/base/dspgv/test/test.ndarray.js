/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dspgv from './../lib/ndarray.js';

// FIXTURES //

import itype1_v_upper from './fixtures/itype1_v_upper.json' with { type: 'json' };
import itype1_v_lower from './fixtures/itype1_v_lower.json' with { type: 'json' };
import itype1_n_lower from './fixtures/itype1_n_lower.json' with { type: 'json' };
import itype1_n_upper from './fixtures/itype1_n_upper.json' with { type: 'json' };
import itype2_v_upper from './fixtures/itype2_v_upper.json' with { type: 'json' };
import itype2_v_lower from './fixtures/itype2_v_lower.json' with { type: 'json' };
import itype3_v_lower from './fixtures/itype3_v_lower.json' with { type: 'json' };
import itype3_v_upper from './fixtures/itype3_v_upper.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };

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

// A = [4 2 1; 2 5 3; 1 3 6], B = [4 2 0; 2 5 1; 0 1 3]

/**
* Returns A in upper packed format.
*
* @private
* @returns {Float64Array} packed upper A
*/
function makeAPUpper() {
	// Upper packed: A(1,1), A(1,2), A(2,2), A(1,3), A(2,3), A(3,3)
	return new Float64Array([ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ]);
}

/**
* Returns A in lower packed format.
*
* @private
* @returns {Float64Array} packed lower A
*/
function makeAPLower() {
	// Lower packed: A(1,1), A(2,1), A(3,1), A(2,2), A(3,2), A(3,3)
	return new Float64Array([ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ]);
}

/**
* Returns B in upper packed format.
*
* @private
* @returns {Float64Array} packed upper B
*/
function makeBPUpper() {
	// Upper packed: B(1,1), B(1,2), B(2,2), B(1,3), B(2,3), B(3,3)
	return new Float64Array([ 4.0, 2.0, 5.0, 0.0, 1.0, 3.0 ]);
}

/**
* Returns B in lower packed format.
*
* @private
* @returns {Float64Array} packed lower B
*/
function makeBPLower() {
	// Lower packed: B(1,1), B(2,1), B(3,1), B(2,2), B(3,2), B(3,3)
	return new Float64Array([ 4.0, 2.0, 0.0, 5.0, 1.0, 3.0 ]);
}

// TESTS //

test( 'dspgv: itype1_v_upper', function t() {
	var absExpected;
	var WORK;
	var info;
	var absZ;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype1_v_upper;
	AP = makeAPUpper();
	BP = makeBPUpper();
	w = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 100 );
	info = dspgv( 1, 'compute-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
	absZ = toArray( Z ).map( Math.abs );
	absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'dspgv: itype1_v_lower', function t() {
	var absExpected;
	var WORK;
	var info;
	var absZ;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype1_v_lower;
	AP = makeAPLower();
	BP = makeBPLower();
	w = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 100 );
	info = dspgv( 1, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
	absZ = toArray( Z ).map( Math.abs );
	absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'dspgv: itype1_n_lower (eigenvalues only)', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype1_n_lower;
	AP = makeAPLower();
	BP = makeBPLower();
	w = new Float64Array( 3 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dspgv( 1, 'no-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
});

test( 'dspgv: itype1_n_upper (eigenvalues only)', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype1_n_upper;
	AP = makeAPUpper();
	BP = makeBPUpper();
	w = new Float64Array( 3 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dspgv( 1, 'no-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-14, 'w' );
});

test( 'dspgv: itype2_v_upper', function t() {
	var absExpected;
	var WORK;
	var info;
	var absZ;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype2_v_upper;
	AP = makeAPUpper();
	BP = makeBPUpper();
	w = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 100 );
	info = dspgv( 2, 'compute-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	absZ = toArray( Z ).map( Math.abs );
	absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'dspgv: itype2_v_lower', function t() {
	var absExpected;
	var WORK;
	var info;
	var absZ;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype2_v_lower;
	AP = makeAPLower();
	BP = makeBPLower();
	w = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 100 );
	info = dspgv( 2, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	absZ = toArray( Z ).map( Math.abs );
	absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'dspgv: itype3_v_lower', function t() {
	var absExpected;
	var WORK;
	var info;
	var absZ;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype3_v_lower;
	AP = makeAPLower();
	BP = makeBPLower();
	w = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 100 );
	info = dspgv( 3, 'compute-vectors', 'lower', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	absZ = toArray( Z ).map( Math.abs );
	absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'dspgv: itype3_v_upper', function t() {
	var absExpected;
	var WORK;
	var info;
	var absZ;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = itype3_v_upper;
	AP = makeAPUpper();
	BP = makeBPUpper();
	w = new Float64Array( 3 );
	Z = new Float64Array( 9 );
	WORK = new Float64Array( 100 );
	info = dspgv( 3, 'compute-vectors', 'upper', 3, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-13, 'w' );
	absZ = toArray( Z ).map( Math.abs );
	absExpected = tc.Z.map( Math.abs );
	assertArrayClose( absZ, absExpected, 1e-12, 'Z' );
});

test( 'dspgv: n_zero', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = n_zero;
	AP = new Float64Array( 1 );
	BP = new Float64Array( 1 );
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dspgv( 1, 'compute-vectors', 'upper', 0, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dspgv: n_one', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = n_one;
	AP = new Float64Array([ 6.0 ]);
	BP = new Float64Array([ 2.0 ]);
	w = new Float64Array( 1 );
	Z = new Float64Array( 1 );
	WORK = new Float64Array( 100 );
	info = dspgv( 1, 'compute-vectors', 'upper', 1, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( w[ 0 ], tc.w1, 1e-14, 'w1' );
	assertClose( Math.abs( Z[ 0 ] ), Math.abs( tc.Z1 ), 1e-14, 'Z1' );
});

test( 'dspgv: not_posdef', function t() {
	var WORK;
	var info;
	var tc;
	var AP;
	var BP;
	var w;
	var Z;

	tc = not_posdef;
	AP = new Float64Array([ 1.0, 0.0, 1.0 ]);
	BP = new Float64Array([ -1.0, 0.0, 1.0 ]);
	w = new Float64Array( 2 );
	Z = new Float64Array( 4 );
	WORK = new Float64Array( 100 );
	info = dspgv( 1, 'compute-vectors', 'lower', 2, AP, 1, 0, BP, 1, 0, w, 1, 0, Z, 1, 2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});
