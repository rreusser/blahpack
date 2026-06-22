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
import dlarfgp from './../lib/ndarray.js';


// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import alphaZero from './fixtures/alpha_zero.json' with { type: 'json' };
import nOne from './fixtures/n_one.json' with { type: 'json' };
import xZeroPos from './fixtures/x_zero_pos_alpha.json' with { type: 'json' };
import xZeroNeg from './fixtures/x_zero_neg_alpha.json' with { type: 'json' };
import negativeAlpha from './fixtures/negative_alpha.json' with { type: 'json' };
import nZero from './fixtures/n_zero.json' with { type: 'json' };
import stride2 from './fixtures/stride2.json' with { type: 'json' };
import largerN from './fixtures/larger_n.json' with { type: 'json' };


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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
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
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dlarfgp is a function', function t() {
	assert.strictEqual( typeof dlarfgp, 'function' );
} );

test( 'dlarfgp: basic (positive alpha)', function t() {
	var alpha = new Float64Array( [ 3.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );

	dlarfgp( 4, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], basic.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], basic.tau, 1e-14, 'tau' );
	assertArrayClose( x, basic.x, 1e-14, 'x' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: alpha = 0', function t() {
	var alpha = new Float64Array( [ 0.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 3.0, 4.0 ] );

	dlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], alphaZero.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], alphaZero.tau, 1e-14, 'tau' );
	assertArrayClose( x, alphaZero.x, 1e-14, 'x' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: n=1', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( 1 );

	dlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], nOne.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], nOne.tau, 1e-14, 'tau' );
} );

test( 'dlarfgp: x all zero, positive alpha (tau=0)', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 0.0, 0.0 ] );

	dlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], xZeroPos.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], xZeroPos.tau, 1e-14, 'tau' );
} );

test( 'dlarfgp: x all zero, negative alpha (alpha flipped, tau=2)', function t() {
	var alpha = new Float64Array( [ -5.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 0.0, 0.0 ] );

	dlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], xZeroNeg.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], xZeroNeg.tau, 1e-14, 'tau' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: negative alpha (sign-flip branch)', function t() {
	var alpha = new Float64Array( [ -3.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 4.0 ] );

	dlarfgp( 2, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], negativeAlpha.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], negativeAlpha.tau, 1e-14, 'tau' );
	assertArrayClose( x, negativeAlpha.x, 1e-14, 'x' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: n=0 (tau=0, alpha unchanged)', function t() {
	var alpha = new Float64Array( [ 5.0 ] );
	var tau = new Float64Array( [ 99.0 ] );
	var x = new Float64Array( 1 );

	dlarfgp( 0, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], nZero.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], nZero.tau, 1e-14, 'tau' );
} );

test( 'dlarfgp: non-unit stride', function t() {
	var alpha = new Float64Array( [ 2.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 1.0, 99.0, 2.0, 99.0, 2.0 ] );

	dlarfgp( 4, alpha, 0, x, 2, 0, tau, 0 );

	assertClose( alpha[ 0 ], stride2.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], stride2.tau, 1e-14, 'tau' );
	assertArrayClose( x, stride2.x, 1e-14, 'x' );

	// Strided gaps must be untouched:
	assert.strictEqual( x[ 1 ], 99.0 );
	assert.strictEqual( x[ 3 ], 99.0 );
} );

test( 'dlarfgp: larger n', function t() {
	var alpha = new Float64Array( [ 1.5 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 0.5, -0.25, 0.75, -0.125, 0.0625 ] );

	dlarfgp( 6, alpha, 0, x, 1, 0, tau, 0 );

	assertClose( alpha[ 0 ], largerN.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], largerN.tau, 1e-14, 'tau' );
	assertArrayClose( x, largerN.x, 1e-14, 'x' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: tiny inputs (smlnum rescaling branch)', function t() {
	var alpha = new Float64Array( [ 1e-300 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 1e-300, 1e-300 ] );

	dlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );

	assert.ok( tau[ 0 ] >= 0.0 && tau[ 0 ] <= 2.0, 'tau in [0, 2]' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: tiny negative alpha (smlnum rescaling branch)', function t() {
	var alpha = new Float64Array( [ -2e-300 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 1e-300 ] );

	dlarfgp( 2, alpha, 0, x, 1, 0, tau, 0 );

	assert.ok( tau[ 0 ] >= 0.0 && tau[ 0 ] <= 2.0, 'tau in [0, 2]' );
	assert.ok( alpha[ 0 ] >= 0.0, 'beta must be non-negative' );
} );

test( 'dlarfgp: offsets into alpha and tau arrays', function t() {
	var alpha = new Float64Array( [ 99.0, 3.0, 99.0 ] );
	var tau = new Float64Array( [ 99.0, 0.0, 99.0 ] );
	var x = new Float64Array( [ 4.0, 0.0, 0.0 ] );

	dlarfgp( 4, alpha, 1, x, 1, 0, tau, 1 );

	assert.strictEqual( alpha[ 0 ], 99.0, 'alpha[0] untouched' );
	assert.strictEqual( alpha[ 2 ], 99.0, 'alpha[2] untouched' );
	assert.strictEqual( tau[ 0 ], 99.0, 'tau[0] untouched' );
	assert.strictEqual( tau[ 2 ], 99.0, 'tau[2] untouched' );
	assertClose( alpha[ 1 ], basic.alpha, 1e-14, 'alpha[1]' );
	assertClose( tau[ 1 ], basic.tau, 1e-14, 'tau[1]' );
} );

test( 'dlarfgp: offset into x array', function t() {
	var alpha = new Float64Array( [ 3.0 ] );
	var tau = new Float64Array( 1 );
	var x = new Float64Array( [ 99.0, 99.0, 4.0, 0.0, 0.0 ] );

	dlarfgp( 4, alpha, 0, x, 1, 2, tau, 0 );

	assert.strictEqual( x[ 0 ], 99.0, 'prefix untouched' );
	assert.strictEqual( x[ 1 ], 99.0, 'prefix untouched' );
	assertClose( alpha[ 0 ], basic.alpha, 1e-14, 'alpha' );
	assertClose( tau[ 0 ], basic.tau, 1e-14, 'tau' );
} );

test( 'dlarfgp: reflector property H*u = beta*e1 with beta >= 0', function t() {
	var alpha;
	var beta;
	var tau;
	var dot;
	var hi;
	var u;
	var v;
	var x;
	var i;

	alpha = new Float64Array( [ -3.0 ] );
	tau = new Float64Array( 1 );
	x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	u = new Float64Array( [ -3.0, 1.0, 2.0, 3.0, 4.0 ] );

	dlarfgp( 5, alpha, 0, x, 1, 0, tau, 0 );

	beta = alpha[ 0 ];
	assert.ok( beta >= 0.0, 'beta must be non-negative' );

	v = new Float64Array( [ 1.0, x[ 0 ], x[ 1 ], x[ 2 ], x[ 3 ] ] );

	dot = 0.0;
	for ( i = 0; i < 5; i++ ) {
		dot += v[ i ] * u[ i ];
	}
	for ( i = 0; i < 5; i++ ) {
		hi = u[ i ] - ( tau[ 0 ] * v[ i ] * dot );
		if ( i === 0 ) {
			assertClose( hi, beta, 1e-13, 'H*u[0] = beta' );
		} else {
			assertClose( hi, 0.0, 1e-13, 'H*u[' + i + '] = 0' );
		}
	}
} );

test( 'dlarfgp: N<0 range error in wrapper', function t() {
	assert.throws( function thrw() {
		dlarfgp( -1, new Float64Array( 1 ), 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 0 ); // eslint-disable-line max-len
	}, RangeError );
} );
