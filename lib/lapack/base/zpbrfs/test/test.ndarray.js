/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbrfs from './../lib/ndarray.js';

// FIXTURES //

import upper_kd1_3x3 from './fixtures/upper_kd1_3x3.json' with { type: 'json' };
import lower_kd1_3x3 from './fixtures/lower_kd1_3x3.json' with { type: 'json' };
import upper_kd2_3x3 from './fixtures/upper_kd2_3x3.json' with { type: 'json' };
import upper_kd1_nrhs2 from './fixtures/upper_kd1_nrhs2.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import lower_kd2_3x3 from './fixtures/lower_kd2_3x3.json' with { type: 'json' };

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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Run zpbrfs for a standard test case with band matrix inputs from fixture.
*
* @private
* @param {Object} tc - test case from fixture
* @param {string} uplo - 'upper' or 'lower'
* @param {integer} N - order
* @param {integer} kd - bandwidth
* @param {integer} nrhs - number of RHS
* @param {integer} LDAB - leading dimension of AB
* @returns {Object} result object with info, x, ferr, berr
*/
function runCase( tc, uplo, N, kd, nrhs, LDAB ) {
	const RWORK = new Float64Array( N );
	const WORK = new Complex128Array( 2 * N );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const AFB = new Complex128Array( tc.afb );
	const AB = new Complex128Array( tc.ab );
	const B = new Complex128Array( tc.b );
	const X = new Complex128Array( tc.x );

	const info = zpbrfs( uplo, N, kd, nrhs, AB, 1, LDAB, 0, AFB, 1, LDAB, 0, B, 1, N, 0, X, 1, N, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': toArray( reinterpret( X, 0 ) ),
		'ferr': toArray( FERR ),
		'berr': toArray( BERR )
	};
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

test( 'zpbrfs: upper_kd1_3x3', function t() {

	const tc = upper_kd1_3x3;
	const result = runCase( tc, 'upper', 3, 1, 1, 2 );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.x, tc.x, 1e-13, 'x' );
	assertArrayClose( result.ferr, tc.ferr, 0.5, 'ferr' );
	assertArrayClose( result.berr, tc.berr, 0.5, 'berr' );
});

test( 'zpbrfs: lower_kd1_3x3', function t() {

	const tc = lower_kd1_3x3;
	const result = runCase( tc, 'lower', 3, 1, 1, 2 );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.x, tc.x, 1e-13, 'x' );
	assertArrayClose( result.ferr, tc.ferr, 0.5, 'ferr' );
	assertArrayClose( result.berr, tc.berr, 0.5, 'berr' );
});

test( 'zpbrfs: upper_kd2_3x3', function t() {

	const tc = upper_kd2_3x3;
	const result = runCase( tc, 'upper', 3, 2, 1, 3 );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.x, tc.x, 1e-13, 'x' );
	assertArrayClose( result.ferr, tc.ferr, 0.5, 'ferr' );
	assertArrayClose( result.berr, tc.berr, 0.5, 'berr' );
});

test( 'zpbrfs: upper_kd1_nrhs2', function t() {

	const tc = upper_kd1_nrhs2;
	const result = runCase( tc, 'upper', 3, 1, 2, 2 );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.x, tc.x, 1e-13, 'x' );
	assertArrayClose( result.ferr, tc.ferr, 0.5, 'ferr' );
	assertArrayClose( result.berr, tc.berr, 0.5, 'berr' );
});

test( 'zpbrfs: n_zero', function t() {

	const RWORK = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const FERR = new Float64Array( [ -1.0 ] );
	const BERR = new Float64Array( [ -1.0 ] );
	const AB = new Complex128Array( 1 );
	const AFB = new Complex128Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const info = zpbrfs( 'upper', 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	assert.equal( FERR[ 0 ], 0.0 );
	assert.equal( BERR[ 0 ], 0.0 );
});

test( 'zpbrfs: n_one', function t() {

	const tc = n_one;
	const RWORK = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const AB = new Complex128Array( [ 4.0, 0.0 ] );
	const AFB = new Complex128Array( [ 2.0, 0.0 ] );
	const B = new Complex128Array( [ 8.0, 4.0 ] );
	const X = new Complex128Array( tc.x );
	const info = zpbrfs( 'upper', 1, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	const xv = reinterpret( X, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( xv ), tc.x, 1e-13, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 0.5, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 0.5, 'berr' );
});

test( 'zpbrfs: lower_kd2_3x3', function t() {

	const tc = lower_kd2_3x3;
	const result = runCase( tc, 'lower', 3, 2, 1, 3 );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.x, tc.x, 1e-13, 'x' );
	assertArrayClose( result.ferr, tc.ferr, 0.5, 'ferr' );
	assertArrayClose( result.berr, tc.berr, 0.5, 'berr' );
});
