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
import dlarfg from './../lib/ndarray.js';

// VARIABLES //

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import x_all_zero from './fixtures/x_all_zero.json' with { type: 'json' };
import negative_alpha from './fixtures/negative_alpha.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
* @returns {void}
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr;

	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Float64Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
* @returns {void}
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'dlarfg is a function', function t() {
	assert.strictEqual( typeof dlarfg, 'function' );
} );

test( 'dlarfg: basic', function t() {
	var alpha = new Float64Array( [ 3.0 ] );
	var tau = new Float64Array( 1 );
	var tc = basic;
	var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );

	dlarfg( 4, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], tc.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], tc.tau, 1e-14, 'tau' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
} );

test( 'dlarfg: alpha=0', function t() {
	var alpha = new Float64Array( [ 0.0 ] );
	var tau = new Float64Array( 1 );
	var tc = alpha_zero;
	var x = new Float64Array( [ 3.0, 4.0 ] );

	dlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], tc.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], tc.tau, 1e-14, 'tau' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
} );

test( 'dlarfg: n=1 (tau=0)', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( 1 );
	var tc = n_one;
	var x = new Float64Array( 1 );

	dlarfg( 1, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( tau[ 0 ], tc.tau, 1e-14, 'tau' );
} );

test( 'dlarfg: x all zero (tau=0)', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( 1 );
	var tc = x_all_zero;
	var x = new Float64Array( [ 0.0, 0.0 ] );

	dlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( tau[ 0 ], tc.tau, 1e-14, 'tau' );
} );

test( 'dlarfg: negative alpha', function t() {
	var alpha = new Float64Array( [ -3.0 ] );
	var tau = new Float64Array( 1 );
	var tc = negative_alpha;
	var x = new Float64Array( [ 4.0 ] );

	dlarfg( 2, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], tc.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], tc.tau, 1e-14, 'tau' );
	assertArrayClose( x, tc.x, 1e-14, 'x' );
} );

test( 'dlarfg: n=0 (tau=0)', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( 1 );
	var tc = n_zero;
	var x = new Float64Array( 1 );

	dlarfg( 0, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( tau[ 0 ], tc.tau, 1e-14, 'tau' );
} );

test( 'dlarfg: tiny inputs (sfmin scaling loop)', function t() {
	var origNorm;
	var alpha;
	var tau;
	var x;

	alpha = new Float64Array( [ 1e-300 ] );
	x = new Float64Array( [ 1e-300, 1e-300 ] );
	tau = new Float64Array( 1 );

	dlarfg( 3, alpha, 0, x, 1, 0, tau, 0 );

	assert.ok( tau[ 0 ] > 0.0 && tau[ 0 ] <= 2.0, 'tau in range [0, 2]' );
	assert.ok( alpha[ 0 ] < 0.0, 'expected negative beta' );

	origNorm = Math.sqrt( (1e-300 * 1e-300) + (1e-300 * 1e-300) + (1e-300 * 1e-300) ); // eslint-disable-line max-len
	assertClose( Math.abs( alpha[ 0 ] ), origNorm, 1e-10, 'beta magnitude' );
} );

test( 'dlarfg: tiny negative alpha (sfmin scaling loop)', function t() {
	var origNorm;
	var alpha;
	var tau;
	var x;

	alpha = new Float64Array( [ -2e-300 ] );
	x = new Float64Array( [ 1e-300 ] );
	tau = new Float64Array( 1 );

	dlarfg( 2, alpha, 0, x, 1, 0, tau, 0 );

	assert.ok( tau[ 0 ] > 0.0 && tau[ 0 ] <= 2.0, 'tau in range [0, 2]' );
	assert.ok( alpha[ 0 ] > 0.0, 'expected positive beta for negative alpha' );

	origNorm = Math.sqrt( (4e-600) + (1e-600) );
	assertClose( Math.abs( alpha[ 0 ] ), origNorm, 1e-10, 'beta magnitude' );
} );

test( 'dlarfg: non-unit stride', function t() {
	var alpha;
	var tau;
	var x;

	// x = [1.0, *, 2.0, *, 3.0] with stride 2
	alpha = new Float64Array( [ 2.0 ] );
	x = new Float64Array( [ 1.0, 99.0, 2.0, 99.0, 3.0 ] );
	tau = new Float64Array( 1 );

	dlarfg( 4, alpha, 0, x, 2, 0, tau, 0 );

	assert.ok( tau[ 0 ] >= 1.0 && tau[ 0 ] <= 2.0, 'tau in [1, 2]' ); // eslint-disable-line max-len

	// The off-stride elements should be untouched:
	assert.strictEqual( x[ 1 ], 99.0 );
	assert.strictEqual( x[ 3 ], 99.0 );
} );

test( 'dlarfg: offset into alpha and tau arrays', function t() {
	var alpha;
	var tau;
	var x;

	alpha = new Float64Array( [ 99.0, 3.0, 99.0 ] );
	x = new Float64Array( [ 4.0, 0.0, 0.0 ] );
	tau = new Float64Array( [ 99.0, 0.0, 99.0 ] );

	dlarfg( 4, alpha, 1, x, 1, 0, tau, 1 );

	// alpha[0] and alpha[2] should be untouched
	assert.strictEqual( alpha[ 0 ], 99.0 );
	assert.strictEqual( alpha[ 2 ], 99.0 );

	// tau[0] and tau[2] should be untouched
	assert.strictEqual( tau[ 0 ], 99.0 );
	assert.strictEqual( tau[ 2 ], 99.0 );

	// tau[1] should be valid
	assert.ok( tau[ 1 ] >= 1.0 && tau[ 1 ] <= 2.0, 'tau in [1, 2]' ); // eslint-disable-line max-len
} );

test( 'dlarfg: offset into x array', function t() {
	var alpha;
	var tau;
	var x;

	alpha = new Float64Array( [ 3.0 ] );
	x = new Float64Array( [ 99.0, 99.0, 4.0, 0.0, 0.0 ] );
	tau = new Float64Array( 1 );

	dlarfg( 4, alpha, 0, x, 1, 2, tau, 0 );

	// The prefix elements should be untouched
	assert.strictEqual( x[ 0 ], 99.0 );
	assert.strictEqual( x[ 1 ], 99.0 );

	// tau should be in valid range
	assert.ok( tau[ 0 ] >= 1.0 && tau[ 0 ] <= 2.0, 'tau in [1, 2]' ); // eslint-disable-line max-len
} );

test( 'dlarfg: reflector property H*u = beta*e1', function t() {
	var alpha;
	var beta;
	var tau;
	var dot;
	var hi;
	var v;
	var u;
	var x;
	var i;

	// Original vector u = [3; 1; 2; 3; 4]
	alpha = new Float64Array( [ 3.0 ] );
	x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	tau = new Float64Array( 1 );

	dlarfg( 5, alpha, 0, x, 1, 0, tau, 0 );

	beta = alpha[ 0 ];

	// Build v = [1, x[0], x[1], x[2], x[3]] (the reflector vector)
	v = new Float64Array( [ 1.0, x[0], x[1], x[2], x[3] ] );

	// Original vector before dlarfg modified it:
	u = new Float64Array( [ 3.0, 1.0, 2.0, 3.0, 4.0 ] );

	// Apply H*u = u - tau * v * (v^T * u)
	dot = 0.0;
	for ( i = 0; i < 5; i++ ) {
		dot += v[ i ] * u[ i ];
	}
	for ( i = 0; i < 5; i++ ) {
		hi = u[ i ] - ( tau[ 0 ] * v[ i ] * dot );

		// H*u should be [beta, 0, 0, 0, 0]
		if ( i === 0 ) {
			assertClose( hi, beta, 1e-14, 'H*u[0] = beta' );
		} else {
			assertClose( hi, 0.0, 1e-14, 'H*u[' + i + '] = 0' );
		}
	}
} );
