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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ndarrayFn from './../lib/ndarray.js';
import zunmr3 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zunmr3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixture = lines.map( function parse( line ) {
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
	var relErr;
	var denom;
	var diff;

	diff = Math.abs( actual - expected );
	denom = Math.max( Math.abs( expected ), 1.0 );
	relErr = diff / denom;
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a Complex128Array to a plain array of interleaved re/im pairs.
*
* @private
* @param {Complex128Array} arr - complex array
* @returns {Array} plain numeric array
*/
function toReImArray( arr ) {
	var view;
	var out;
	var i;

	view = reinterpret( arr, 0 );
	out = [];
	for ( i = 0; i < view.length; i++ ) {
		out.push( view[ i ] );
	}
	return out;
}

/**
* Returns a fresh copy of the RZ-factored `A` and `TAU` from the `rz_factor` fixture.
*
* @private
* @returns {Object} object with `A` and `TAU` as Complex128Arrays
*/
function getRZ() {
	var view;
	var rz;
	var A;
	var T;
	var i;

	rz = findCase( 'rz_factor' );

	// A: 30 doubles = 15 complex (3 rows x 5 cols column-major)
	A = new Complex128Array( 15 );
	view = reinterpret( A, 0 );
	for ( i = 0; i < 30; i++ ) {
		view[ i ] = rz.A[ i ];
	}
	T = new Complex128Array( 3 );
	view = reinterpret( T, 0 );
	for ( i = 0; i < 6; i++ ) {
		view[ i ] = rz.TAU[ i ];
	}
	return {
		'A': A,
		'TAU': T
	};
}

/**
* Builds a complex 5x5 identity matrix as a Complex128Array (column-major).
*
* @private
* @returns {Complex128Array} identity matrix
*/
function eye5() {
	var view;
	var C;
	var i;

	C = new Complex128Array( 25 );
	view = reinterpret( C, 0 );
	for ( i = 0; i < 5; i++ ) {
		view[ ( ( i * 5 ) + i ) * 2 ] = 1.0;
	}
	return C;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof zunmr3, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'zunmr3: left_notrans (Q*I)', function t() {
	var WORK;
	var info;
	var tc;
	var rz;
	var C;

	tc = findCase( 'left_notrans' );
	rz = getRZ();
	C = eye5();
	WORK = new Complex128Array( 10 );
	info = zunmr3( 'left', 'no-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});

test( 'zunmr3: left_conjtrans (Q^H*I)', function t() {
	var WORK;
	var info;
	var tc;
	var rz;
	var C;

	tc = findCase( 'left_conjtrans' );
	rz = getRZ();
	C = eye5();
	WORK = new Complex128Array( 10 );
	info = zunmr3( 'left', 'conjugate-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});

test( 'zunmr3: right_notrans (I*Q)', function t() {
	var WORK;
	var info;
	var tc;
	var rz;
	var C;

	tc = findCase( 'right_notrans' );
	rz = getRZ();
	C = eye5();
	WORK = new Complex128Array( 10 );
	info = zunmr3( 'right', 'no-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});

test( 'zunmr3: right_conjtrans (I*Q^H)', function t() {
	var WORK;
	var info;
	var tc;
	var rz;
	var C;

	tc = findCase( 'right_conjtrans' );
	rz = getRZ();
	C = eye5();
	WORK = new Complex128Array( 10 );
	info = zunmr3( 'right', 'conjugate-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});

test( 'zunmr3: left_notrans_rect (Q*C, 5x3)', function t() {
	var WORK;
	var view;
	var info;
	var tc;
	var rz;
	var C;
	var j;
	var i;
	var k;

	tc = findCase( 'left_notrans_rect' );
	rz = getRZ();
	C = new Complex128Array( 15 );
	view = reinterpret( C, 0 );
	k = 0;
	for ( j = 1; j <= 3; j++ ) {
		for ( i = 1; i <= 5; i++ ) {
			view[ k * 2 ] = i + ( 0.5 * j ) - 1.0;
			view[ ( k * 2 ) + 1 ] = ( 0.25 * i ) - ( 0.1 * j );
			k += 1;
		}
	}
	WORK = new Complex128Array( 10 );
	info = zunmr3( 'left', 'no-transpose', 5, 3, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});

test( 'zunmr3: right_conjtrans_rect (C*Q^H, 3x5)', function t() {
	var WORK;
	var view;
	var info;
	var tc;
	var rz;
	var C;
	var j;
	var i;
	var k;

	tc = findCase( 'right_conjtrans_rect' );
	rz = getRZ();
	C = new Complex128Array( 15 );
	view = reinterpret( C, 0 );
	k = 0;
	for ( j = 1; j <= 5; j++ ) {
		for ( i = 1; i <= 3; i++ ) {
			view[ k * 2 ] = j - ( 0.25 * i ) + 1.0;
			view[ ( k * 2 ) + 1 ] = ( -0.2 * j ) + ( 0.15 * i );
			k += 1;
		}
	}
	WORK = new Complex128Array( 10 );
	info = zunmr3( 'right', 'conjugate-transpose', 3, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});

test( 'zunmr3: m_zero quick return', function t() {
	var WORK;
	var info;
	var rz;
	var C;

	rz = getRZ();
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zunmr3( 'left', 'no-transpose', 0, 5, 0, 0, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'zunmr3: n_zero quick return', function t() {
	var WORK;
	var info;
	var rz;
	var C;

	rz = getRZ();
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zunmr3( 'left', 'no-transpose', 5, 0, 0, 0, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'zunmr3: k_zero quick return', function t() {
	var WORK;
	var info;
	var rz;
	var C;

	rz = getRZ();
	C = new Complex128Array( 25 );
	WORK = new Complex128Array( 5 );
	info = zunmr3( 'left', 'no-transpose', 5, 5, 0, 0, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'INFO' );
});

test( 'zunmr3: ndarray wrapper validates side', function t() {
	var WORK = new Complex128Array( 5 );
	var TAU = new Complex128Array( 3 );
	var A = new Complex128Array( 9 );
	var C = new Complex128Array( 25 );
	assert.throws( function throws() {
		ndarrayFn( 'bogus', 'no-transpose', 5, 5, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zunmr3: ndarray wrapper validates trans', function t() {
	var WORK = new Complex128Array( 5 );
	var TAU = new Complex128Array( 3 );
	var A = new Complex128Array( 9 );
	var C = new Complex128Array( 25 );
	assert.throws( function throws() {
		ndarrayFn( 'left', 'bogus', 5, 5, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zunmr3: ndarray wrapper validates negative dimensions', function t() {
	var WORK = new Complex128Array( 5 );
	var TAU = new Complex128Array( 3 );
	var A = new Complex128Array( 9 );
	var C = new Complex128Array( 25 );
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

test( 'zunmr3: ndarray wrapper forwards successful call', function t() {
	var WORK;
	var info;
	var tc;
	var rz;
	var C;

	tc = findCase( 'left_notrans' );
	rz = getRZ();
	C = eye5();
	WORK = new Complex128Array( 10 );
	info = ndarrayFn( 'left', 'no-transpose', 5, 5, 3, 2, rz.A, 1, 3, 0, rz.TAU, 1, 0, C, 1, 5, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'INFO' );
	assertArrayClose( toReImArray( C ), tc.C, 1e-13, 'C' );
});
