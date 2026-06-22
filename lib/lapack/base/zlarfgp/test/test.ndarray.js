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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfgp from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'zlarfgp.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var fixtureLines = fixtureRaw.trim().split( '\n' );
var fixture = fixtureLines.map( parseLine );

/**
* Parse a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Locate a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( matchName );

	/**
	* Match fixture record by name.
	*
	* @private
	* @param {Object} rec - fixture record
	* @returns {boolean} match
	*/
	function matchName( rec ) {
		return rec.name === name;
	}
}

/**
* Assert that two floats are close (relative tolerance).
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {string} msg - failure message
*/
function assertClose( actual, expected, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1e-30 );
	assert.ok( relErr <= 1e-12, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Assert that two arrays are elementwise close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {string} label - failure label
*/
function assertArrayClose( actual, expected, label ) {
	var i;
	assert.strictEqual( actual.length, expected.length, label + ' length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], label + '[' + i + ']' );
	}
}

/**
* Convert a typed array to a plain Array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} plain array
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

test( 'zlarfgp: basic, n=3, positive real alpha', function t() {
	var alpha = new Complex128Array( [ 3.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_basic_real_pos' );
	var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: basic, n=3, negative real alpha', function t() {
	var alpha = new Complex128Array( [ -3.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_basic_real_neg' );
	var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: complex alpha and x', function t() {
	var alpha = new Complex128Array( [ 2.0, 1.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_complex' );
	var x = new Complex128Array( [ 1.0, -1.0, 0.5, 0.5 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: n=1, complex alpha', function t() {
	var alpha = new Complex128Array( [ 5.0, 3.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_n_one_complex' );
	var x = new Complex128Array( 0 );
	zlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfgp: n=1, negative real alpha', function t() {
	var alpha = new Complex128Array( [ -5.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_n_one_neg_real' );
	var x = new Complex128Array( 0 );
	zlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfgp: n=1, positive real alpha', function t() {
	var alpha = new Complex128Array( [ 5.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_n_one_pos_real' );
	var x = new Complex128Array( 0 );
	zlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfgp: n=0 (quick return)', function t() {
	var alpha = new Complex128Array( [ 5.0, 3.0 ] );
	var tau = new Complex128Array( 1 );
	var tv;
	zlarfgp( 0, alpha, 0, new Complex128Array( 0 ), 1, 0, tau, 0 );
	tv = reinterpret( tau, 0 );
	assert.strictEqual( tv[ 0 ], 0.0 );
	assert.strictEqual( tv[ 1 ], 0.0 );
});

test( 'zlarfgp: x=0, positive real alpha => tau=0', function t() {
	var alpha = new Complex128Array( [ 4.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_x_zero_alpha_real_pos' );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: x=0, negative real alpha => tau=2', function t() {
	var alpha = new Complex128Array( [ -4.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_x_zero_alpha_real_neg' );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: x=0, complex alpha', function t() {
	var alpha = new Complex128Array( [ 4.0, 3.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_x_zero_alpha_complex' );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: stride=2', function t() {
	var alpha = new Complex128Array( [ 2.0, -1.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_stride2' );
	var x = new Complex128Array( [ 1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0 ] );
	zlarfgp( 3, alpha, 0, x, 2, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: larger case n=5', function t() {
	var alpha = new Complex128Array( [ 1.0, 1.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_larger' );
	var x = new Complex128Array( [ 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
	zlarfgp( 5, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: negative real alpha with real x, n=5', function t() {
	var alpha = new Complex128Array( [ -2.0, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_neg_real_alpha_real_x' );
	var x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	zlarfgp( 5, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: rescaling loop triggered by very small values', function t() {
	var alpha = new Complex128Array( [ 1e-310, 0.0 ] );
	var tau = new Complex128Array( 1 );
	var tc = findCase( 'zlarfgp_rescaling' );
	var x = new Complex128Array( [ 1e-310, 0.0, 1e-310, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});
