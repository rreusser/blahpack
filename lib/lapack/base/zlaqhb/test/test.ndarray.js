/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaqhb from './../lib/ndarray.js';

// FIXTURES //

import upper_kd1 from './fixtures/upper_kd1.json' with { type: 'json' };
import lower_kd1 from './fixtures/lower_kd1.json' with { type: 'json' };
import no_equilibrate from './fixtures/no_equilibrate.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import upper_kd2 from './fixtures/upper_kd2.json' with { type: 'json' };
import lower_kd2 from './fixtures/lower_kd2.json' with { type: 'json' };
import small_amax from './fixtures/small_amax.json' with { type: 'json' };
import large_amax from './fixtures/large_amax.json' with { type: 'json' };

// VARIABLES //

const LDAB = 5;

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

test( 'zlaqhb is a function', function t() {
	assert.equal( typeof zlaqhb, 'function' );
});

test( 'zlaqhb: upper_kd1 - upper band matrix with KD=1, equilibration needed (Hermitian diag zeroing)', function t() { // eslint-disable-line max-len

	const tc = upper_kd1;
	const N = 4;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(1 + (0 * LDAB)) ] = 4.0;
	Av[ 2*(1 + (0 * LDAB)) + 1 ] = 0.1;
	Av[ 2*(1 + (1 * LDAB)) ] = 9.0;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 0.2;
	Av[ 2*(1 + (2 * LDAB)) ] = 16.0;
	Av[ 2*(1 + (2 * LDAB)) + 1 ] = 0.3;
	Av[ 2*(1 + (3 * LDAB)) ] = 25.0;
	Av[ 2*(1 + (3 * LDAB)) + 1 ] = 0.4;
	Av[ 2*(0 + (1 * LDAB)) ] = 1.0;
	Av[ 2*(0 + (1 * LDAB)) + 1 ] = 2.0;
	Av[ 2*(0 + (2 * LDAB)) ] = 3.0;
	Av[ 2*(0 + (2 * LDAB)) + 1 ] = 4.0;
	Av[ 2*(0 + (3 * LDAB)) ] = 5.0;
	Av[ 2*(0 + (3 * LDAB)) + 1 ] = 6.0;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = zlaqhb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 0.02, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: lower_kd1 - lower band matrix with KD=1, equilibration needed (Hermitian diag zeroing)', function t() { // eslint-disable-line max-len

	const tc = lower_kd1;
	const N = 4;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(0 + (0 * LDAB)) ] = 4.0;
	Av[ 2*(0 + (0 * LDAB)) + 1 ] = 0.1;
	Av[ 2*(0 + (1 * LDAB)) ] = 9.0;
	Av[ 2*(0 + (1 * LDAB)) + 1 ] = 0.2;
	Av[ 2*(0 + (2 * LDAB)) ] = 16.0;
	Av[ 2*(0 + (2 * LDAB)) + 1 ] = 0.3;
	Av[ 2*(0 + (3 * LDAB)) ] = 25.0;
	Av[ 2*(0 + (3 * LDAB)) + 1 ] = 0.4;
	Av[ 2*(1 + (0 * LDAB)) ] = 1.0;
	Av[ 2*(1 + (0 * LDAB)) + 1 ] = 2.0;
	Av[ 2*(1 + (1 * LDAB)) ] = 3.0;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 4.0;
	Av[ 2*(1 + (2 * LDAB)) ] = 5.0;
	Av[ 2*(1 + (2 * LDAB)) + 1 ] = 6.0;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = zlaqhb( 'lower', N, 1, AB, 1, LDAB, 0, S, 1, 0, 0.02, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: no_equilibrate - good scond, amax in range', function t() {

	const tc = no_equilibrate;
	const N = 4;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(1 + (0 * LDAB)) ] = 4.0;
	Av[ 2*(1 + (0 * LDAB)) + 1 ] = 0.1;
	Av[ 2*(1 + (1 * LDAB)) ] = 9.0;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 0.2;
	Av[ 2*(1 + (2 * LDAB)) ] = 16.0;
	Av[ 2*(1 + (2 * LDAB)) + 1 ] = 0.3;
	Av[ 2*(1 + (3 * LDAB)) ] = 25.0;
	Av[ 2*(1 + (3 * LDAB)) + 1 ] = 0.4;
	Av[ 2*(0 + (1 * LDAB)) ] = 1.0;
	Av[ 2*(0 + (1 * LDAB)) + 1 ] = 2.0;
	Av[ 2*(0 + (2 * LDAB)) ] = 3.0;
	Av[ 2*(0 + (2 * LDAB)) + 1 ] = 4.0;
	Av[ 2*(0 + (3 * LDAB)) ] = 5.0;
	Av[ 2*(0 + (3 * LDAB)) + 1 ] = 6.0;
	const S = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const equed = zlaqhb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 0.5, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: n_zero - quick return', function t() {

	const tc = n_zero;
	const AB = new Complex128Array( 1 );
	const S = new Float64Array( 1 );
	const equed = zlaqhb( 'upper', 0, 1, AB, 1, LDAB, 0, S, 1, 0, 0.5, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
});

test( 'zlaqhb: n_one_upper - single element with imaginary part, equilibration needed', function t() { // eslint-disable-line max-len

	const tc = n_one_upper;
	const AB = new Complex128Array( LDAB * 1 );
	const Av = reinterpret( AB, 0 );
	Av[ 0 ] = 100.0;
	Av[ 1 ] = 7.5;
	const S = new Float64Array( [ 0.1 ] );
	const equed = zlaqhb( 'upper', 1, 0, AB, 1, LDAB, 0, S, 1, 0, 0.01, 100.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: upper_kd2 - wider bandwidth KD=2, upper', function t() {

	const tc = upper_kd2;
	const N = 4;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(2 + (0 * LDAB)) ] = 10.0;
	Av[ 2*(2 + (0 * LDAB)) + 1 ] = 0.5;
	Av[ 2*(2 + (1 * LDAB)) ] = 20.0;
	Av[ 2*(2 + (1 * LDAB)) + 1 ] = 0.7;
	Av[ 2*(2 + (2 * LDAB)) ] = 30.0;
	Av[ 2*(2 + (2 * LDAB)) + 1 ] = 0.9;
	Av[ 2*(2 + (3 * LDAB)) ] = 40.0;
	Av[ 2*(2 + (3 * LDAB)) + 1 ] = 1.1;
	Av[ 2*(1 + (1 * LDAB)) ] = 1.0;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 0.5;
	Av[ 2*(1 + (2 * LDAB)) ] = 2.0;
	Av[ 2*(1 + (2 * LDAB)) + 1 ] = 1.0;
	Av[ 2*(1 + (3 * LDAB)) ] = 3.0;
	Av[ 2*(1 + (3 * LDAB)) + 1 ] = 1.5;
	Av[ 2*(0 + (2 * LDAB)) ] = 0.5;
	Av[ 2*(0 + (2 * LDAB)) + 1 ] = 0.25;
	Av[ 2*(0 + (3 * LDAB)) ] = 1.5;
	Av[ 2*(0 + (3 * LDAB)) + 1 ] = 0.75;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = zlaqhb( 'upper', N, 2, AB, 1, LDAB, 0, S, 1, 0, 0.02, 40.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: lower_kd2 - wider bandwidth KD=2, lower', function t() {

	const tc = lower_kd2;
	const N = 4;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(0 + (0 * LDAB)) ] = 10.0;
	Av[ 2*(0 + (0 * LDAB)) + 1 ] = 0.5;
	Av[ 2*(0 + (1 * LDAB)) ] = 20.0;
	Av[ 2*(0 + (1 * LDAB)) + 1 ] = 0.7;
	Av[ 2*(0 + (2 * LDAB)) ] = 30.0;
	Av[ 2*(0 + (2 * LDAB)) + 1 ] = 0.9;
	Av[ 2*(0 + (3 * LDAB)) ] = 40.0;
	Av[ 2*(0 + (3 * LDAB)) + 1 ] = 1.1;
	Av[ 2*(1 + (0 * LDAB)) ] = 1.0;
	Av[ 2*(1 + (0 * LDAB)) + 1 ] = 0.5;
	Av[ 2*(1 + (1 * LDAB)) ] = 2.0;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 1.0;
	Av[ 2*(1 + (2 * LDAB)) ] = 3.0;
	Av[ 2*(1 + (2 * LDAB)) + 1 ] = 1.5;
	Av[ 2*(2 + (0 * LDAB)) ] = 0.5;
	Av[ 2*(2 + (0 * LDAB)) + 1 ] = 0.25;
	Av[ 2*(2 + (1 * LDAB)) ] = 1.5;
	Av[ 2*(2 + (1 * LDAB)) + 1 ] = 0.75;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = zlaqhb( 'lower', N, 2, AB, 1, LDAB, 0, S, 1, 0, 0.02, 40.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: small_amax - amax very small triggers equilibration', function t() { // eslint-disable-line max-len

	const tc = small_amax;
	const N = 2;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(1 + (0 * LDAB)) ] = 1.0e-300;
	Av[ 2*(1 + (0 * LDAB)) + 1 ] = 0.5e-300;
	Av[ 2*(0 + (1 * LDAB)) ] = 0.0;
	Av[ 2*(1 + (1 * LDAB)) ] = 1.0e-300;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 0.3e-300;
	const S = new Float64Array( [ 1.0e150, 1.0e150 ] );
	const equed = zlaqhb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 1.0, 1.0e-300 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});

test( 'zlaqhb: large_amax - amax very large triggers equilibration', function t() { // eslint-disable-line max-len

	const tc = large_amax;
	const N = 2;
	const AB = new Complex128Array( LDAB * N );
	const Av = reinterpret( AB, 0 );
	Av[ 2*(1 + (0 * LDAB)) ] = 1.0e300;
	Av[ 2*(1 + (0 * LDAB)) + 1 ] = 0.5e300;
	Av[ 2*(0 + (1 * LDAB)) ] = 0.0;
	Av[ 2*(1 + (1 * LDAB)) ] = 1.0e300;
	Av[ 2*(1 + (1 * LDAB)) + 1 ] = 0.3e300;
	const S = new Float64Array( [ 1.0e-150, 1.0e-150 ] );
	const equed = zlaqhb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 1.0, 1.0e300 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( Av ), tc.ab, 1e-14, 'ab' );
});
