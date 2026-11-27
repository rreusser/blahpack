/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqsp from './../lib/ndarray.js';

// FIXTURES //

import upper_equilibrate from './fixtures/upper_equilibrate.json' with { type: 'json' };
import lower_equilibrate from './fixtures/lower_equilibrate.json' with { type: 'json' };
import no_equilibrate from './fixtures/no_equilibrate.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import small_amax from './fixtures/small_amax.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
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

// TESTS //

test( 'zlaqsp: upper_equilibrate', function t() {

	const tc = upper_equilibrate;
	const AP = new Complex128Array( [
		4.0, 1.0,
		1.0, 0.5, 9.0, 2.0,
		0.5, 0.25, 2.0, 1.0, 16.0, 3.0
	] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: lower_equilibrate', function t() {

	const tc = lower_equilibrate;
	const AP = new Complex128Array( [
		4.0, 1.0, 1.0, 0.5, 0.5, 0.25,
		9.0, 2.0, 2.0, 1.0,
		16.0, 3.0
	] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'lower', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: no_equilibrate', function t() {

	const tc = no_equilibrate;
	const AP = new Complex128Array( [
		4.0, 1.0,
		1.0, 0.5, 9.0, 2.0,
		0.5, 0.25, 2.0, 1.0, 16.0, 3.0
	] );
	const S = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 3, AP, 1, 0, S, 1, 0, 0.5, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: n_zero', function t() {

	const tc = n_zero;
	const AP = new Complex128Array( 1 );
	const S = new Float64Array( 1 );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 0, AP, 1, 0, S, 1, 0, 1.0, 1.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
});

test( 'zlaqsp: n_one_upper', function t() {

	const tc = n_one_upper;
	const AP = new Complex128Array( [ 100.0, 50.0 ] );
	const S = new Float64Array( [ 0.1 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 1, AP, 1, 0, S, 1, 0, 0.01, 100.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: small_amax', function t() {

	const tc = small_amax;
	const AP = new Complex128Array( [
		1e-300, 2e-300,
		0.0, 0.0,
		1e-300, 3e-300
	] );
	const S = new Float64Array( [ 1e150, 1e150 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 2, AP, 1, 0, S, 1, 0, 1.0, 1e-300, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: upper_4x4', function t() {

	const tc = upper_4x4;
	const AP = new Complex128Array( [
		16.0, 1.0,
		4.0, 2.0, 9.0, 3.0,
		2.0, 0.5, 3.0, 1.5, 25.0, 4.0,
		1.0, 0.25, 6.0, 3.0, 5.0, 2.5, 36.0, 6.0
	] );
	const S = new Float64Array( [ 0.25, 0.5, 0.2, 1.0/3.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 4, AP, 1, 0, S, 1, 0, 0.01, 36.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: lower_4x4', function t() {

	const tc = lower_4x4;
	const AP = new Complex128Array( [
		16.0, 1.0, 4.0, 2.0, 2.0, 0.5, 1.0, 0.25,
		9.0, 3.0, 3.0, 1.5, 6.0, 3.0,
		25.0, 4.0, 5.0, 2.5,
		36.0, 6.0
	] );
	const S = new Float64Array( [ 0.25, 0.5, 0.2, 1.0/3.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'lower', 4, AP, 1, 0, S, 1, 0, 0.01, 36.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], mapEqued( tc.equed ), 'equed' );
	const view = reinterpret( AP, 0 );
	assertArrayClose( toArray( view ), tc.ap, 1e-14, 'ap' );
});

test( 'zlaqsp: main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
});

test( 'zlaqsp: attached to the main export is an `ndarray` method', function t() { // eslint-disable-line max-len
	assert.strictEqual( typeof main.ndarray, 'function' );
});

test( 'zlaqsp: standard API works', function t() {

	const AP = new Complex128Array( [
		4.0, 1.0,
		1.0, 0.5, 9.0, 2.0,
		0.5, 0.25, 2.0, 1.0, 16.0, 3.0
	] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = main( 'column-major', 'upper', 3, AP, S, 1, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], 'yes' );
});

test( 'zlaqsp: ndarray API works', function t() {

	const AP = new Complex128Array( [
		4.0, 1.0,
		1.0, 0.5, 9.0, 2.0,
		0.5, 0.25, 2.0, 1.0, 16.0, 3.0
	] );
	const S = new Float64Array( [ 0.5, 1.0/3.0, 0.25 ] );
	const equed = [ '' ];
	const out = main.ndarray( 'upper', 3, AP, 1, 0, S, 1, 0, 0.05, 16.0, equed );
	assert.strictEqual( out, AP, 'returns expected array' );
	assert.equal( equed[ 0 ], 'yes' );
});

test( 'zlaqsp: ndarray API validates uplo', function t() {
	let AP, S;

	AP = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	assert.throws( function badUplo() {
		main.ndarray( 'invalid', 3, AP, 1, 0, S, 1, 0, 0.5, 1.0, [ '' ] );
	}, /invalid argument/ );
});

test( 'zlaqsp: standard API validates uplo', function t() {
	let AP, S;

	AP = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	assert.throws( function badUplo() {
		main( 'column-major', 'invalid', 3, AP, S, 1, 0.5, 1.0, [ '' ] );
	}, /invalid argument/ );
});

test( 'zlaqsp: amax just above SMALL skips scaling (ticket 0089)', function t() {
	// Reference: SMALL = DLAMCH('Safe minimum') / DLAMCH('Precision'), LARGE = 1/SMALL.
	// SMALL = 2^-1022 / 2^-52 = 2^-970 <= amax = 1.5*2^-970 < 2^-969,
	// Where 2^-969 is the SMALL DLAMCH('E') would give. With scond 1.0 (>= THRESH),
	// The reference leaves A untouched and returns 'none'; DLAMCH('E') would scale ('yes').
	const amax = Math.pow( 2.0, -970 ) * 1.5;
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const s = new Float64Array( [ 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 1, A, 1, 0, s, 1, 0, 1.0, amax, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none', 'equed' );
	assert.deepEqual( Array.from( reinterpret( A, 0 ) ), [ 3.0, 2.0 ], 'A unchanged' );
});

test( 'zlaqsp: amax just below LARGE skips scaling (ticket 0089)', function t() {
	// Reference: SMALL = DLAMCH('Safe minimum') / DLAMCH('Precision'), LARGE = 1/SMALL.
	// LARGE = 1/SMALL = 2^970 >= amax = 1.5*2^969 > 2^969,
	// Where 2^969 is the LARGE DLAMCH('E') would give. With scond 1.0 (>= THRESH),
	// The reference leaves A untouched and returns 'none'; DLAMCH('E') would scale ('yes').
	const amax = Math.pow( 2.0, 969 ) * 1.5;
	const A = new Complex128Array( [ 3.0, 2.0 ] );
	const s = new Float64Array( [ 2.0 ] );
	const equed = [ '' ];
	const out = zlaqsp( 'upper', 1, A, 1, 0, s, 1, 0, 1.0, amax, equed );
	assert.strictEqual( out, A, 'returns expected array' );
	assert.equal( equed[ 0 ], 'none', 'equed' );
	assert.deepEqual( Array.from( reinterpret( A, 0 ) ), [ 3.0, 2.0 ], 'A unchanged' );
});
