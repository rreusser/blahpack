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

/* eslint-disable no-restricted-syntax, max-lines, max-lines-per-function */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlarfgp from './../lib/ndarray.js';
import wrapper from './../lib/zlarfgp.js';
import base from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const fixtureRaw = readFileSync( path.join( fixtureDir, 'zlarfgp.jsonl' ), 'utf8' );
const fixtureLines = fixtureRaw.trim().split( '\n' );
const fixture = fixtureLines.map( parseLine );

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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1e-30 );
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
	let i;
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'zlarfgp: basic, n=3, positive real alpha', function t() {
	const alpha = new Complex128Array( [ 3.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_basic_real_pos' );
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: basic, n=3, negative real alpha', function t() {
	const alpha = new Complex128Array( [ -3.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_basic_real_neg' );
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: complex alpha and x', function t() {
	const alpha = new Complex128Array( [ 2.0, 1.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_complex' );
	const x = new Complex128Array( [ 1.0, -1.0, 0.5, 0.5 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: n=1, complex alpha', function t() {
	const alpha = new Complex128Array( [ 5.0, 3.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_n_one_complex' );
	const x = new Complex128Array( 0 );
	zlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfgp: n=1, negative real alpha', function t() {
	const alpha = new Complex128Array( [ -5.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_n_one_neg_real' );
	const x = new Complex128Array( 0 );
	zlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfgp: n=1, positive real alpha', function t() {
	const alpha = new Complex128Array( [ 5.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_n_one_pos_real' );
	const x = new Complex128Array( 0 );
	zlarfgp( 1, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
});

test( 'zlarfgp: n=0 (quick return)', function t() {
	const alpha = new Complex128Array( [ 5.0, 3.0 ] );
	const tau = new Complex128Array( 1 );
	zlarfgp( 0, alpha, 0, new Complex128Array( 0 ), 1, 0, tau, 0 );
	const tv = reinterpret( tau, 0 );
	assert.strictEqual( tv[ 0 ], 0.0 );
	assert.strictEqual( tv[ 1 ], 0.0 );
});

test( 'zlarfgp: x=0, positive real alpha => tau=0', function t() {
	const alpha = new Complex128Array( [ 4.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_x_zero_alpha_real_pos' );
	const x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: x=0, negative real alpha => tau=2', function t() {
	const alpha = new Complex128Array( [ -4.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_x_zero_alpha_real_neg' );
	const x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: x=0, complex alpha', function t() {
	const alpha = new Complex128Array( [ 4.0, 3.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_x_zero_alpha_complex' );
	const x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: stride=2', function t() {
	const alpha = new Complex128Array( [ 2.0, -1.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_stride2' );
	const x = new Complex128Array( [ 1.0, 2.0, 99.0, 99.0, 3.0, 4.0, 99.0, 99.0 ] );
	zlarfgp( 3, alpha, 0, x, 2, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: larger case n=5', function t() {
	const alpha = new Complex128Array( [ 1.0, 1.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_larger' );
	const x = new Complex128Array( [ 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
	zlarfgp( 5, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: negative real alpha with real x, n=5', function t() {
	const alpha = new Complex128Array( [ -2.0, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_neg_real_alpha_real_x' );
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	zlarfgp( 5, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

test( 'zlarfgp: rescaling loop triggered by very small values', function t() {
	const alpha = new Complex128Array( [ 1e-310, 0.0 ] );
	const tau = new Complex128Array( 1 );
	const tc = findCase( 'zlarfgp_rescaling' );
	const x = new Complex128Array( [ 1e-310, 0.0, 1e-310, 0.0 ] );
	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), tc.alpha, 'alpha' );
	assertArrayClose( toArray( reinterpret( tau, 0 ) ), tc.tau, 'tau' );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 'x' );
});

/**
* Asserts the defining property of a complex elementary reflector: with `v = [1; x]` and `H = I - tau*v*v^H`, `H^H * u = [beta; 0]`, and `|beta| = norm(u)`.
*
* @private
* @param {Array} u - original `[alpha; x]` as interleaved real/imaginary parts
* @param {Array} v - reflector vector `[1; x]` as interleaved real/imaginary parts
* @param {Array} tauv - `tau` as `[re, im]`
* @param {number} beta - returned (real) `beta`
* @param {number} tol - absolute tolerance relative to `norm(u)`
*/
function assertReflector( u, v, tauv, beta, tol ) {
	let nrm;
	let sr;
	let si;
	let tr;
	let ti;
	let wr;
	let wi;
	let i;

	// s = v^H * u
	sr = 0.0;
	si = 0.0;
	nrm = 0.0;
	for ( i = 0; i < u.length; i += 2 ) {
		sr += ( v[ i ] * u[ i ] ) + ( v[ i + 1 ] * u[ i + 1 ] );
		si += ( v[ i ] * u[ i + 1 ] ) - ( v[ i + 1 ] * u[ i ] );
		nrm += ( u[ i ] * u[ i ] ) + ( u[ i + 1 ] * u[ i + 1 ] );
	}
	nrm = Math.sqrt( nrm );

	// t = conj(tau) * s
	tr = ( tauv[ 0 ] * sr ) + ( tauv[ 1 ] * si );
	ti = ( tauv[ 0 ] * si ) - ( tauv[ 1 ] * sr );
	for ( i = 0; i < u.length; i += 2 ) {
		wr = u[ i ] - ( ( v[ i ] * tr ) - ( v[ i + 1 ] * ti ) );
		wi = u[ i + 1 ] - ( ( v[ i ] * ti ) + ( v[ i + 1 ] * tr ) );
		assert.ok( Math.abs( wr - ( ( i === 0 ) ? beta : 0.0 ) ) <= tol * nrm, 'H^H*u re[' + ( i / 2 ) + ']: ' + wr ); // eslint-disable-line max-len
		assert.ok( Math.abs( wi ) <= tol * nrm, 'H^H*u im[' + ( i / 2 ) + ']: ' + wi ); // eslint-disable-line max-len
	}
	assert.ok( Math.abs( Math.abs( beta ) - nrm ) <= tol * nrm, '|beta| = norm(u)' ); // eslint-disable-line max-len
}

test( 'zlarfgp: base quick return for n=0 sets tau to zero', function t() {
	const alpha = new Complex128Array( [ 5.0, 3.0 ] );
	const tau = new Complex128Array( [ 7.0, -7.0 ] );
	const x = new Complex128Array( 0 );
	const out = base( 0, alpha, 0, x, 1, 0, tau, 0 );
	assert.strictEqual( out, x );
	assert.deepStrictEqual( toArray( reinterpret( tau, 0 ) ), [ 0.0, 0.0 ] );
	assert.deepStrictEqual( toArray( reinterpret( alpha, 0 ) ), [ 5.0, 3.0 ] );
});

test( 'zlarfgp: zero real part of alpha (sign of zero alpha)', function t() {
	const alpha = new Complex128Array( [ 0.0, 1.0 ] );
	const x = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0 ] );
	const tau = new Complex128Array( 1 );
	let av;
	let xv;
	let tv;

	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );
	av = toArray( reinterpret( alpha, 0 ) );
	xv = toArray( reinterpret( x, 0 ) );
	tv = toArray( reinterpret( tau, 0 ) );

	// Reference ZLARFGP (LAPACK 3.12.0, gfortran) output; beta is non-negative:
	assertArrayClose( av, [ 2.64575131106459072, 0.0 ], 'alpha' );
	assertArrayClose( tv, [ 9.99999999999999778e-1, -3.77964473009227198e-1 ], 'tau' ); // eslint-disable-line max-len
	assertArrayClose( xv, [ -3.30718913883073840e-1, -1.25000000000000028e-1, -5.36437827766147679e-1, -5.80718913883073951e-1 ], 'x' ); // eslint-disable-line max-len
	assertReflector( [ 0.0, 1.0, 1.0, 0.0, 2.0, 1.0 ], [ 1.0, 0.0 ].concat( xv ), tv, av[ 0 ], 1e-14 ); // eslint-disable-line max-len
});

test( 'zlarfgp: alpha + beta overflows, real alpha (tiny-tau recovery, H = I)', function t() {
	const alpha = new Complex128Array( [ 1.5e308, 0.0 ] );
	const x = new Complex128Array( [ 1e300, 0.0, 1e299, 0.0 ] );
	const tau = new Complex128Array( 1 );

	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );

	// Reference ZLARFGP (LAPACK 3.12.0, gfortran): ALPHA+BETA overflows, so TAU underflows to zero and the routine falls back to H = I with BETA = |ALPHA| and X left unchanged:
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), [ 1.5e308, 0.0 ], 'alpha' ); // eslint-disable-line max-len
	assert.deepStrictEqual( toArray( reinterpret( tau, 0 ) ), [ 0.0, 0.0 ], 'tau' ); // eslint-disable-line max-len
	assert.deepStrictEqual( toArray( reinterpret( x, 0 ) ), [ 1e300, 0.0, 1e299, 0.0 ], 'x' ); // eslint-disable-line max-len
});

test( 'zlarfgp: alpha + beta overflows, complex alpha (tiny-tau recovery)', function t() {
	const alpha = new Complex128Array( [ 1.5e308, 1e-290 ] );
	const x = new Complex128Array( [ 1e300, 0.0, 1e299, 0.0 ] );
	const tau = new Complex128Array( 1 );
	let tv;

	zlarfgp( 3, alpha, 0, x, 1, 0, tau, 0 );

	// Reference ZLARFGP (LAPACK 3.12.0, gfortran): TAU = 1 - ALPHA/|ALPHA| (here zero to working precision), X zeroed, BETA = |ALPHA|:
	assertArrayClose( toArray( reinterpret( alpha, 0 ) ), [ 1.5e308, 0.0 ], 'alpha' ); // eslint-disable-line max-len
	tv = toArray( reinterpret( tau, 0 ) );
	assert.ok( tv[ 0 ] === 0.0, 'tau re' );
	assert.ok( tv[ 1 ] === 0.0, 'tau im' );
	assert.deepStrictEqual( toArray( reinterpret( x, 0 ) ), [ 0.0, 0.0, 0.0, 0.0 ], 'x' ); // eslint-disable-line max-len
});

test( 'zlarfgp: N = 0 sets tau to 0, as the reference does (both interfaces)', function t() {
	// ZLARFGP sets TAU = ZERO for N <= 0; ndarray.js and the wrapper used to
	// return first, leaving a stale tau (ticket 0094 PR).
	const alpha = new Complex128Array( [ 3.0, 1.0 ] );
	const x = new Complex128Array( 0 );
	let tau = new Complex128Array( [ 7.0, -2.0 ] );
	zlarfgp( 0, alpha, 0, x, 1, 0, tau, 0 );
	assert.deepStrictEqual( Array.from( reinterpret( tau, 0 ) ), [ 0.0, 0.0 ], 'ndarray' );
	assert.deepStrictEqual( Array.from( reinterpret( alpha, 0 ) ), [ 3.0, 1.0 ], 'alpha unchanged' );
	tau = new Complex128Array( [ 7.0, -2.0 ] );
	wrapper( 0, alpha, x, 1, tau );
	assert.deepStrictEqual( Array.from( reinterpret( tau, 0 ) ), [ 0.0, 0.0 ], 'wrapper' );
});
