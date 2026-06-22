/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqhp from './../lib/ndarray.js';

// FIXTURES //

import upper_equilibrate from './fixtures/upper_equilibrate.json' with { type: 'json' };
import lower_equilibrate from './fixtures/lower_equilibrate.json' with { type: 'json' };
import no_equilibrate from './fixtures/no_equilibrate.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import diag_imag_upper from './fixtures/diag_imag_upper.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import main from './../lib/index.js';

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
* Maps Fortran single-char EQUED to JS string.
*
* @private
* @param {string} c - Fortran character
* @returns {string} JS equed string
*/
function mapEqued( c ) {
	if ( c === 'Y' ) {
		return 'yes';
	}
	return 'none';
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

test( 'zlaqhp: upper_equilibrate', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = upper_equilibrate;
	AP = new Complex128Array( [ 4, 0, 1, 2, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	equed = zlaqhp( 'upper', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: lower_equilibrate', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = lower_equilibrate;
	AP = new Complex128Array( [ 4, 0, 1, -2, 0.5, 1, 9, 0, 2, -0.5, 16, 0 ] );
	S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	equed = zlaqhp( 'lower', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: no_equilibrate', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = no_equilibrate;
	AP = new Complex128Array( [ 4, 0, 1, 1, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	S = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	equed = zlaqhp( 'upper', 3, AP, 1, 0, S, 1, 0, 1.0, 16.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: n_zero', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = n_zero;
	AP = new Complex128Array( 1 );
	S = new Float64Array( 1 );
	equed = zlaqhp( 'upper', 0, AP, 1, 0, S, 1, 0, 1.0, 1.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
});

test( 'zlaqhp: n_one_upper', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = n_one_upper;
	AP = new Complex128Array( [ 100, 0 ] );
	S = new Float64Array( [ 0.1 ] );
	equed = zlaqhp( 'upper', 1, AP, 1, 0, S, 1, 0, 0.01, 100.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: upper_4x4', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = upper_4x4;
	AP = new Complex128Array([
		16,
		0,
		4,
		1,
		9,
		0,
		2,
		-1,
		3,
		2,
		25,
		0,
		1,
		0.5,
		6,
		-2,
		5,
		1,
		36,
		0
	]);
	S = new Float64Array( [ 0.25, 0.5, 0.2, 1.0/3.0 ] );
	equed = zlaqhp( 'upper', 4, AP, 1, 0, S, 1, 0, 0.01, 36.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: lower_4x4', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = lower_4x4;
	AP = new Complex128Array([
		16,
		0,
		4,
		-1,
		2,
		1,
		1,
		-0.5,
		9,
		0,
		3,
		-2,
		6,
		2,
		25,
		0,
		5,
		-1,
		36,
		0
	]);
	S = new Float64Array( [ 0.25, 0.5, 0.2, 1.0/3.0 ] );
	equed = zlaqhp( 'lower', 4, AP, 1, 0, S, 1, 0, 0.01, 36.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: diag_imag_upper (diagonal imaginary parts zeroed)', function t() { // eslint-disable-line max-len
	var equed;
	var tc;
	var AP;
	var S;

	tc = diag_imag_upper;
	AP = new Complex128Array( [ 4, 0.5, 1, 2, 9, 0.3 ] );
	S = new Float64Array( [ 0.5, 0.25 ] );
	equed = zlaqhp( 'upper', 2, AP, 1, 0, S, 1, 0, 0.05, 9.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: n_one_lower', function t() {
	var equed;
	var tc;
	var AP;
	var S;

	tc = n_one_lower;
	AP = new Complex128Array( [ 49, 0 ] );
	S = new Float64Array( [ 0.2 ] );
	equed = zlaqhp( 'lower', 1, AP, 1, 0, S, 1, 0, 0.01, 49.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
});

test( 'zlaqhp: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof main.ndarray, 'function' );
});

test( 'zlaqhp: standard API works', function t() {
	var equed;
	var AP;
	var S;

	AP = new Complex128Array( [ 4, 0, 1, 2, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	equed = main( 'upper', 3, AP, S, 1, 0.05, 16.0 );
	assert.equal( equed, 'yes' );
});

test( 'zlaqhp: ndarray API works', function t() {
	var equed;
	var AP;
	var S;

	AP = new Complex128Array( [ 4, 0, 1, 2, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	equed = main.ndarray( 'upper', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0 );
	assert.equal( equed, 'yes' );
});

test( 'zlaqhp: ndarray API validates uplo', function t() {
	var AP;
	var S;

	AP = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	assert.throws( function badUplo() {
		main.ndarray( 'invalid', 3, AP, 1, 0, S, 1, 0, 0.5, 1.0 );
	}, /invalid argument/ );
});

test( 'zlaqhp: standard API validates uplo', function t() {
	var AP;
	var S;

	AP = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	assert.throws( function badUplo() {
		main( 'invalid', 3, AP, S, 1, 0.5, 1.0 );
	}, /invalid argument/ );
});
