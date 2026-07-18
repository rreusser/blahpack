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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ndarrayFn from './../lib/ndarray.js';
const dormr3 = ndarrayFn;


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dormr3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Looks up a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture record
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts two scalars are close in relative terms.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - diagnostic message
*/
function assertClose( actual, expected, tol, msg ) {

	const diff = Math.abs( actual - expected );
	const denom = Math.max( Math.abs( expected ), 1.0 );
	const relErr = diff / denom;
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are elementwise close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - diagnostic message
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
* @param {Float64Array} arr - typed array
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

/**
* Returns a fresh copy of the RZ-factored `A` and `TAU` from the `rz_factor` fixture.
*
* @private
* @returns {Object} object with `A` and `TAU`
*/
function getRZ() {
	const rz = findCase( 'rz_factor' );
	return {
		'A': new Float64Array( rz.A ),
		'TAU': new Float64Array( rz.TAU )
	};
}

/**
* Returns a fresh 5x5 identity matrix stored column-major.
*
* @private
* @returns {Float64Array} identity matrix
*/
function eye5() {
	const C = new Float64Array( 25 );
	let i;
	for ( i = 0; i < 5; i++ ) {
		C[ ( i * 5 ) + i ] = 1.0;
	}
	return C;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof dormr3, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'dormr3: left_notrans (Q*I = Q)', function t() {

	const tc = findCase( 'left_notrans' );
	const rz = getRZ();
	const C = eye5();
	const WORK = new Float64Array( 100 );
	const info = dormr3( 'left', 'no-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});

test( 'dormr3: left_trans (Q^T*I)', function t() {

	const tc = findCase( 'left_trans' );
	const rz = getRZ();
	const C = eye5();
	const WORK = new Float64Array( 100 );
	const info = dormr3( 'left', 'transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});

test( 'dormr3: right_notrans (I*Q)', function t() {

	const tc = findCase( 'right_notrans' );
	const rz = getRZ();
	const C = eye5();
	const WORK = new Float64Array( 100 );
	const info = dormr3( 'right', 'no-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});

test( 'dormr3: right_trans (I*Q^T)', function t() {

	const tc = findCase( 'right_trans' );
	const rz = getRZ();
	const C = eye5();
	const WORK = new Float64Array( 100 );
	const info = dormr3( 'right', 'transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});

test( 'dormr3: left_notrans_rect (Q*C, 5x3)', function t() {
	let j, i, k;

	const tc = findCase( 'left_notrans_rect' );
	const rz = getRZ();
	const C = new Float64Array( 15 );
	k = 0;
	for ( j = 1; j <= 3; j++ ) {
		for ( i = 1; i <= 5; i++ ) {
			C[ k ] = i + ( 0.5 * j ) - 1.0;
			k += 1;
		}
	}
	const WORK = new Float64Array( 100 );
	const info = dormr3( 'left', 'no-transpose', 5, 3, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});

test( 'dormr3: right_trans_rect (C*Q^T, 3x5)', function t() {
	let j, i, k;

	const tc = findCase( 'right_trans_rect' );
	const rz = getRZ();
	const C = new Float64Array( 15 );
	k = 0;
	for ( j = 1; j <= 5; j++ ) {
		for ( i = 1; i <= 3; i++ ) {
			C[ k ] = j - ( 0.25 * i ) + 1.0;
			k += 1;
		}
	}
	const WORK = new Float64Array( 100 );
	const info = dormr3( 'right', 'transpose', 3, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});

test( 'dormr3: m_zero quick return', function t() {

	const rz = getRZ();
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormr3( 'left', 'no-transpose', 0, 5, 0, 0, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'dormr3: n_zero quick return', function t() {

	const rz = getRZ();
	const C = new Float64Array( 1 );
	const WORK = new Float64Array( 1 );
	const info = dormr3( 'left', 'no-transpose', 5, 0, 0, 0, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'dormr3: k_zero quick return', function t() {

	const rz = getRZ();
	const C = new Float64Array( 25 );
	const WORK = new Float64Array( 5 );
	const info = dormr3( 'left', 'no-transpose', 5, 5, 0, 0, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'dormr3: l_zero (trivial reflectors)', function t() {

	const tc = findCase( 'l_zero' );
	const A = new Float64Array( 9 );
	const TAU = new Float64Array( 3 );
	const C = eye5();
	const WORK = new Float64Array( 5 );
	const info = dormr3( 'left', 'no-transpose', 5, 5, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'C' );
});

test( 'dormr3: ndarray wrapper validates side', function t() {
	const WORK = new Float64Array( 5 );
	const TAU = new Float64Array( 3 );
	const A = new Float64Array( 9 );
	const C = new Float64Array( 25 );
	assert.throws( function throws() {
		ndarrayFn( 'bogus', 'no-transpose', 5, 5, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dormr3: ndarray wrapper validates trans', function t() {
	const WORK = new Float64Array( 5 );
	const TAU = new Float64Array( 3 );
	const A = new Float64Array( 9 );
	const C = new Float64Array( 25 );
	assert.throws( function throws() {
		ndarrayFn( 'left', 'bogus', 5, 5, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dormr3: ndarray wrapper validates negative dimensions', function t() {
	const WORK = new Float64Array( 5 );
	const TAU = new Float64Array( 3 );
	const A = new Float64Array( 9 );
	const C = new Float64Array( 25 );
	assert.throws( function throws() {
		ndarrayFn( 'left', 'no-transpose', -1, 5, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function throws() {
		ndarrayFn( 'left', 'no-transpose', 5, -1, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function throws() {
		ndarrayFn( 'left', 'no-transpose', 5, 5, -1, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
	assert.throws( function throws() {
		ndarrayFn( 'left', 'no-transpose', 5, 5, 3, -1, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dormr3: ndarray wrapper forwards successful call', function t() {

	const tc = findCase( 'left_notrans' );
	const rz = getRZ();
	const C = eye5();
	const WORK = new Float64Array( 100 );
	const info = ndarrayFn( 'left', 'no-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'C' );
});
