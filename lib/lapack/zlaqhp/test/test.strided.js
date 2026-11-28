/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqhp from './../lib/strided.js';

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	let i;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zlaqhp: upper_equilibrate', function t() {

	const tc = upper_equilibrate;
	const AP = new Complex128Array( [ 4, 0, 1, 2, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: lower_equilibrate', function t() {

	const tc = lower_equilibrate;
	const AP = new Complex128Array( [ 4, 0, 1, -2, 0.5, 1, 9, 0, 2, -0.5, 16, 0 ] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'lower', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: no_equilibrate', function t() {

	const tc = no_equilibrate;
	const AP = new Complex128Array( [ 4, 0, 1, 1, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	const S = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 3, AP, 1, 0, S, 1, 0, 1.0, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: n_zero', function t() {

	const tc = n_zero;
	const AP = new Complex128Array( 1 );
	const S = new Float64Array( 1 );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 0, AP, 1, 0, S, 1, 0, 1.0, 1.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
});

test( 'zlaqhp: n_one_upper', function t() {

	const tc = n_one_upper;
	const AP = new Complex128Array( [ 100, 0 ] );
	const S = new Float64Array( [ 0.1 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 1, AP, 1, 0, S, 1, 0, 0.01, 100.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: upper_4x4', function t() {

	const tc = upper_4x4;
	const AP = new Complex128Array([
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
	const S = new Float64Array( [ 0.25, 0.5, 0.2, 1.0/3.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 4, AP, 1, 0, S, 1, 0, 0.01, 36.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: lower_4x4', function t() {

	const tc = lower_4x4;
	const AP = new Complex128Array([
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
	const S = new Float64Array( [ 0.25, 0.5, 0.2, 1.0/3.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'lower', 4, AP, 1, 0, S, 1, 0, 0.01, 36.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: diag_imag_upper (diagonal imaginary parts zeroed)', function t() { // eslint-disable-line max-len

	const tc = diag_imag_upper;
	const AP = new Complex128Array( [ 4, 0.5, 1, 2, 9, 0.3 ] );
	const S = new Float64Array( [ 0.5, 0.25 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 2, AP, 1, 0, S, 1, 0, 0.05, 9.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: n_one_lower', function t() {

	const tc = n_one_lower;
	const AP = new Complex128Array( [ 49, 0 ] );
	const S = new Float64Array( [ 0.2 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'lower', 1, AP, 1, 0, S, 1, 0, 0.01, 49.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( reinterpret( AP, 0 ) ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqhp: main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
});

test( 'zlaqhp: attached to the main export is an `strided` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof main.strided, 'function' );
});

test( 'zlaqhp: standard API works', function t() {

	const AP = new Complex128Array( [ 4, 0, 1, 2, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = main( 'column-major', 'upper', 3, AP, S, 1, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], 'yes' );
});

test( 'zlaqhp: strided API works', function t() {

	const AP = new Complex128Array( [ 4, 0, 1, 2, 9, 0, 0.5, -1, 2, 0.5, 16, 0 ] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = main.strided( 'upper', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], 'yes' );
});

test( 'zlaqhp: strided API validates uplo', function t() {
	let AP, S;

	AP = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	assert.throws( function badUplo() {
		main.strided( 'invalid', 3, AP, 1, 0, S, 1, 0, 0.5, 1.0, [ '' ] );
	}, /invalid argument/ );
});

test( 'zlaqhp: standard API validates uplo', function t() {
	let AP, S;

	AP = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	assert.throws( function badUplo() {
		main( 'column-major', 'invalid', 3, AP, S, 1, 0.5, 1.0, [ '' ] );
	}, /invalid argument/ );
});

test( 'zlaqhp: amax just above SMALL skips scaling (ticket 0089)', function t() {
	// Reference: SMALL = DLAMCH('Safe minimum') / DLAMCH('Precision'), LARGE = 1/SMALL.
	// SMALL = 2^-1022 / 2^-52 = 2^-970 <= amax = 1.5*2^-970 < 2^-969,
	// Where 2^-969 is the SMALL DLAMCH('E') would give. With scond 1.0 (>= THRESH),
	// The reference leaves A untouched and returns 'none'; DLAMCH('E') would scale ('yes').
	const amax = Math.pow( 2.0, -970 ) * 1.5;
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const s = new Float64Array( [ 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 1, A, 1, 0, s, 1, 0, 1.0, amax, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none', 'equed' );
	assert.deepEqual( Array.from( reinterpret( A, 0 ) ), [ 3.0, 2.0 ], 'A unchanged' );
});

test( 'zlaqhp: amax just below LARGE skips scaling (ticket 0089)', function t() {
	// Reference: SMALL = DLAMCH('Safe minimum') / DLAMCH('Precision'), LARGE = 1/SMALL.
	// LARGE = 1/SMALL = 2^970 >= amax = 1.5*2^969 > 2^969,
	// Where 2^969 is the LARGE DLAMCH('E') would give. With scond 1.0 (>= THRESH),
	// The reference leaves A untouched and returns 'none'; DLAMCH('E') would scale ('yes').
	const amax = Math.pow( 2.0, 969 ) * 1.5;
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const s = new Float64Array( [ 2.0 ] );
	const equed = [ '' ];
	const out = zlaqhp( 'upper', 1, A, 1, 0, s, 1, 0, 1.0, amax, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none', 'equed' );
	assert.deepEqual( Array.from( reinterpret( A, 0 ) ), [ 3.0, 2.0 ], 'A unchanged' );
});
