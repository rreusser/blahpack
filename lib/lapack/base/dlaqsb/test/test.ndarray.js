/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqsb from './../lib/ndarray.js';

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

test( 'dlaqsb is a function', function t() {
	assert.equal( typeof dlaqsb, 'function' );
});

test( 'dlaqsb: upper_kd1 - upper band matrix with KD=1, equilibration needed', function t() { // eslint-disable-line max-len

	const tc = upper_kd1;
	const N = 4;
	const AB = new Float64Array( LDAB * N );

	// Diagonal: AB(KD+1, j) = AB[1 + j*LDAB] (0-based row 1, col j)
	AB[ 1 + (0 * LDAB) ] = 4.0;
	AB[ 1 + (1 * LDAB) ] = 9.0;
	AB[ 1 + (2 * LDAB) ] = 16.0;
	AB[ 1 + (3 * LDAB) ] = 25.0;

	// Superdiagonal: AB(KD, j) = AB[0 + j*LDAB] for j>=1
	AB[ 0 + (1 * LDAB) ] = 1.0;
	AB[ 0 + (2 * LDAB) ] = 2.0;
	AB[ 0 + (3 * LDAB) ] = 3.0;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = dlaqsb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 0.02, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: lower_kd1 - lower band matrix with KD=1, equilibration needed', function t() { // eslint-disable-line max-len

	const tc = lower_kd1;
	const N = 4;
	const AB = new Float64Array( LDAB * N );

	// Diagonal: AB(1, j) = AB[0 + j*LDAB]
	AB[ 0 + (0 * LDAB) ] = 4.0;
	AB[ 0 + (1 * LDAB) ] = 9.0;
	AB[ 0 + (2 * LDAB) ] = 16.0;
	AB[ 0 + (3 * LDAB) ] = 25.0;

	// Subdiagonal: AB(2, j) = AB[1 + j*LDAB] for j=0..N-2
	AB[ 1 + (0 * LDAB) ] = 1.0;
	AB[ 1 + (1 * LDAB) ] = 2.0;
	AB[ 1 + (2 * LDAB) ] = 3.0;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = dlaqsb( 'lower', N, 1, AB, 1, LDAB, 0, S, 1, 0, 0.02, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: no_equilibrate - good scond, amax in range', function t() { // eslint-disable-line max-len

	const tc = no_equilibrate;
	const N = 4;
	const AB = new Float64Array( LDAB * N );
	AB[ 1 + (0 * LDAB) ] = 4.0;
	AB[ 1 + (1 * LDAB) ] = 9.0;
	AB[ 1 + (2 * LDAB) ] = 16.0;
	AB[ 1 + (3 * LDAB) ] = 25.0;
	AB[ 0 + (1 * LDAB) ] = 1.0;
	AB[ 0 + (2 * LDAB) ] = 2.0;
	AB[ 0 + (3 * LDAB) ] = 3.0;
	const S = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const equed = dlaqsb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 0.5, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: n_zero - quick return', function t() {

	const tc = n_zero;
	const AB = new Float64Array( 1 );
	const S = new Float64Array( 1 );
	const equed = dlaqsb( 'upper', 0, 1, AB, 1, LDAB, 0, S, 1, 0, 0.5, 25.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
});

test( 'dlaqsb: n_one_upper - single element, equilibration needed', function t() { // eslint-disable-line max-len

	const tc = n_one_upper;
	const AB = new Float64Array( LDAB * 1 );
	AB[ 0 ] = 100.0;
	const S = new Float64Array( [ 0.1 ] );
	const equed = dlaqsb( 'upper', 1, 0, AB, 1, LDAB, 0, S, 1, 0, 0.01, 100.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: upper_kd2 - wider bandwidth KD=2, upper', function t() { // eslint-disable-line max-len

	const tc = upper_kd2;
	const N = 4;
	const AB = new Float64Array( LDAB * N );

	// Diagonal: AB(KD+1, j) = AB[2 + j*LDAB]
	AB[ 2 + (0 * LDAB) ] = 10.0;
	AB[ 2 + (1 * LDAB) ] = 20.0;
	AB[ 2 + (2 * LDAB) ] = 30.0;
	AB[ 2 + (3 * LDAB) ] = 40.0;

	// First superdiag: AB(KD, j) = AB[1 + j*LDAB] for j>=1
	AB[ 1 + (1 * LDAB) ] = 1.0;
	AB[ 1 + (2 * LDAB) ] = 2.0;
	AB[ 1 + (3 * LDAB) ] = 3.0;

	// Second superdiag: AB(KD-1, j) = AB[0 + j*LDAB] for j>=2
	AB[ 0 + (2 * LDAB) ] = 0.5;
	AB[ 0 + (3 * LDAB) ] = 1.5;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = dlaqsb( 'upper', N, 2, AB, 1, LDAB, 0, S, 1, 0, 0.02, 40.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: lower_kd2 - wider bandwidth KD=2, lower', function t() { // eslint-disable-line max-len

	const tc = lower_kd2;
	const N = 4;
	const AB = new Float64Array( LDAB * N );

	// Diagonal: AB(1, j) = AB[0 + j*LDAB]
	AB[ 0 + (0 * LDAB) ] = 10.0;
	AB[ 0 + (1 * LDAB) ] = 20.0;
	AB[ 0 + (2 * LDAB) ] = 30.0;
	AB[ 0 + (3 * LDAB) ] = 40.0;

	// First subdiag: AB(2, j) = AB[1 + j*LDAB]
	AB[ 1 + (0 * LDAB) ] = 1.0;
	AB[ 1 + (1 * LDAB) ] = 2.0;
	AB[ 1 + (2 * LDAB) ] = 3.0;

	// Second subdiag: AB(3, j) = AB[2 + j*LDAB]
	AB[ 2 + (0 * LDAB) ] = 0.5;
	AB[ 2 + (1 * LDAB) ] = 1.5;
	const S = new Float64Array( [ 0.5, 0.25, 0.2, 0.1 ] );
	const equed = dlaqsb( 'lower', N, 2, AB, 1, LDAB, 0, S, 1, 0, 0.02, 40.0 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: small_amax - amax very small triggers equilibration', function t() { // eslint-disable-line max-len

	const tc = small_amax;
	const N = 2;
	const AB = new Float64Array( LDAB * N );
	AB[ 1 + (0 * LDAB) ] = 1.0e-300;
	AB[ 0 + (1 * LDAB) ] = 0.0;
	AB[ 1 + (1 * LDAB) ] = 1.0e-300;
	const S = new Float64Array( [ 1.0e150, 1.0e150 ] );
	const equed = dlaqsb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 1.0, 1.0e-300 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});

test( 'dlaqsb: large_amax - amax very large triggers equilibration', function t() { // eslint-disable-line max-len

	const tc = large_amax;
	const N = 2;
	const AB = new Float64Array( LDAB * N );
	AB[ 1 + (0 * LDAB) ] = 1.0e300;
	AB[ 0 + (1 * LDAB) ] = 0.0;
	AB[ 1 + (1 * LDAB) ] = 1.0e300;
	const S = new Float64Array( [ 1.0e-150, 1.0e-150 ] );
	const equed = dlaqsb( 'upper', N, 1, AB, 1, LDAB, 0, S, 1, 0, 1.0, 1.0e300 );
	assert.equal( equed, mapEqued( tc.equed ), 'equed' );
	assertArrayClose( toArray( AB ), tc.ab, 1e-14, 'ab' );
});
