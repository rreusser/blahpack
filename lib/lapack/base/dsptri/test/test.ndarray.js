/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from './../../dsptrf/lib/base.js';
import dsptri from './../lib/ndarray.js';


// FIXTURES //

import upper3x3 from './fixtures/3x3_upper.json' with { type: 'json' };
import lower3x3 from './fixtures/3x3_lower.json' with { type: 'json' };
import upper4x4 from './fixtures/4x4_upper.json' with { type: 'json' };
import lower4x4 from './fixtures/4x4_lower.json' with { type: 'json' };
import nZero from './fixtures/n_zero.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import indef2x2Upper4x4 from './fixtures/4x4_indef_2x2_upper.json' with { type: 'json' };
import indef2x2Lower4x4 from './fixtures/4x4_indef_2x2_lower.json' with { type: 'json' };
import indefUpper3x3 from './fixtures/3x3_indef_upper.json' with { type: 'json' };
import indefLower3x3 from './fixtures/3x3_indef_lower.json' with { type: 'json' };
var ndarray = dsptri;


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - error message prefix
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;

	relErr = Math.abs( actual - expected );
	relErr /= Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg +
		': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - error message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Factors and inverts a packed symmetric matrix.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} ap - packed matrix (modified in place)
* @returns {Object} result with info, ap, ipiv
*/
function factorAndInvert( uplo, N, ap ) {
	var ipiv;
	var work;
	var info;

	ipiv = new Int32Array( N );
	work = new Float64Array( N );
	info = dsptrf( uplo, N, ap, 1, 0, ipiv, 1, 0 );
	if ( info !== 0 ) {
		return {
			'info': info,
			'ap': ap,
			'ipiv': ipiv
		};
	}
	info = dsptri( uplo, N, ap, 1, 0, ipiv, 1, 0, work, 1, 0 );
	return {
		'info': info,
		'ap': ap,
		'ipiv': ipiv
	};
}


// TESTS //

test( 'dsptri is a function', function t() {
	assert.equal( typeof dsptri, 'function' );
});

test( 'dsptri: 3x3_upper', function t() {
	var result;
	var tc;
	var ap;

	tc = upper3x3;
	ap = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	result = factorAndInvert( 'upper', 3, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 3x3_lower', function t() {
	var result;
	var tc;
	var ap;

	tc = lower3x3;
	ap = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	result = factorAndInvert( 'lower', 3, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 4x4_upper', function t() {
	var result;
	var tc;
	var ap;

	tc = upper4x4;
	ap = new Float64Array([
		2.0, 1.0, 4.0, 0.0, 2.0, 6.0, 3.0, 1.0, 5.0, 8.0
	]);
	result = factorAndInvert( 'upper', 4, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 4x4_lower', function t() {
	var result;
	var tc;
	var ap;

	tc = lower4x4;
	ap = new Float64Array([
		2.0, 1.0, 0.0, 3.0, 4.0, 2.0, 1.0, 6.0, 5.0, 8.0
	]);
	result = factorAndInvert( 'lower', 4, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: n_zero', function t() {
	var ipiv;
	var work;
	var info;
	var tc;
	var ap;

	tc = nZero;
	ap = new Float64Array( 0 );
	ipiv = new Int32Array( 0 );
	work = new Float64Array( 0 );
	info = dsptri( 'upper', 0, ap, 1, 0, ipiv, 1, 0, work, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dsptri: n_one', function t() {
	var result;
	var tc;
	var ap;

	tc = nOne;
	ap = new Float64Array( [ 5.0 ] );
	result = factorAndInvert( 'upper', 1, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 4x4_indef_2x2_upper', function t() {
	var result;
	var tc;
	var ap;

	tc = indef2x2Upper4x4;
	ap = new Float64Array([
		0.0, 1.0, 0.0, 2.0, 4.0, 0.0, 3.0, 5.0, 6.0, 0.0
	]);
	result = factorAndInvert( 'upper', 4, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 4x4_indef_2x2_lower', function t() {
	var result;
	var tc;
	var ap;

	tc = indef2x2Lower4x4;
	ap = new Float64Array([
		0.0, 1.0, 2.0, 3.0, 0.0, 4.0, 5.0, 0.0, 6.0, 0.0
	]);
	result = factorAndInvert( 'lower', 4, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 3x3_indef_upper', function t() {
	var result;
	var tc;
	var ap;

	tc = indefUpper3x3;
	ap = new Float64Array( [ 1.0, 2.0, 0.0, 3.0, 1.0, 1.0 ] );
	result = factorAndInvert( 'upper', 3, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: 3x3_indef_lower', function t() {
	var result;
	var tc;
	var ap;

	tc = indefLower3x3;
	ap = new Float64Array( [ 1.0, 2.0, 3.0, 0.0, 1.0, 1.0 ] );
	result = factorAndInvert( 'lower', 3, ap );
	assert.equal( result.info, tc.info );
	assertArrayClose( result.ap, tc.ap, 1e-14, 'ap' );
});

test( 'dsptri: ndarray wrapper validates uplo', function t() {
	var ipiv;
	var work;
	var ap;

	ap = new Float64Array( [ 1.0 ] );
	ipiv = new Int32Array( [ 0 ] );
	work = new Float64Array( [ 0.0 ] );
	assert.throws( function invalid() {
		ndarray( 'invalid', 1, ap, 1, 0, ipiv, 1, 0, work, 1, 0 );
	}, /invalid argument/ );
});
