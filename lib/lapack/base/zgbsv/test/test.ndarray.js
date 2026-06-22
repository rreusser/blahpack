/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbsv from './../lib/ndarray.js';

// FIXTURES //

import tridiag_4x4_1rhs from './fixtures/tridiag_4x4_1rhs.json' with { type: 'json' };
import tridiag_4x4_2rhs from './fixtures/tridiag_4x4_2rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import complex_rhs from './fixtures/complex_rhs.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a complex band matrix in column-major layout.
*
* @param {number} ldab - leading dimension (2*KL+KU+1) in complex elements
* @param {number} n - number of columns
* @param {Array} entries - array of [row, col, re, im] (0-based row/col in band storage)
* @returns {Complex128Array} band matrix
*/
function bandMatrix( ldab, n, entries ) {
	var ABv;
	var AB;
	var i;
	AB = new Complex128Array( ldab * n );
	ABv = reinterpret( AB, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		ABv[ 2 * ( entries[ i ][ 0 ] + entries[ i ][ 1 ] * ldab ) ] = entries[ i ][ 2 ]; // eslint-disable-line max-len
		ABv[ 2 * ( entries[ i ][ 0 ] + entries[ i ][ 1 ] * ldab ) + 1 ] = entries[ i ][ 3 ]; // eslint-disable-line max-len
	}
	return AB;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
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

test( 'zgbsv: 4x4 complex tridiagonal, single RHS', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var Bv;
	var B;
	var i;

	tc = tridiag_4x4_1rhs;
	AB = bandMatrix( 4, 4, [
		// Col 0
		[ 2, 0, 4.0, 1.0 ],
		[ 3, 0, -1.0, 0.0 ],

		// Col 1
		[ 1, 1, -1.0, 0.0 ],
		[ 2, 1, 4.0, 1.0 ],
		[ 3, 1, -1.0, 0.0 ],

		// Col 2
		[ 1, 2, -1.0, 0.0 ],
		[ 2, 2, 4.0, 1.0 ],
		[ 3, 2, -1.0, 0.0 ],

		// Col 3
		[ 1, 3, -1.0, 0.0 ],
		[ 2, 3, 4.0, 1.0 ]
	]);
	B = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0 ] );
	IPIV = new Int32Array( 4 );
	info = zgbsv( 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 8 ), tc.x, 1e-12, 'x' );
	for ( i = 0; i < 4; i++ ) {
		assert.equal( IPIV[ i ], tc.ipiv[ i ] - 1, 'IPIV[' + i + ']' );
	}
});

test( 'zgbsv: 4x4 complex tridiagonal, 2 RHS', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = tridiag_4x4_2rhs;
	AB = bandMatrix( 4, 4, [
		[ 2, 0, 4.0, 1.0 ],
		[ 3, 0, -1.0, 0.0 ],
		[ 1, 1, -1.0, 0.0 ],
		[ 2, 1, 4.0, 1.0 ],
		[ 3, 1, -1.0, 0.0 ],
		[ 1, 2, -1.0, 0.0 ],
		[ 2, 2, 4.0, 1.0 ],
		[ 3, 2, -1.0, 0.0 ],
		[ 1, 3, -1.0, 0.0 ],
		[ 2, 3, 4.0, 1.0 ]
	]);
	B = new Complex128Array( 8 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = 1.0;
	Bv[ 1 ] = 0.0;
	Bv[ 2 ] = 2.0;
	Bv[ 3 ] = 0.0;
	Bv[ 4 ] = 3.0;
	Bv[ 5 ] = 0.0;
	Bv[ 6 ] = 4.0;
	Bv[ 7 ] = 0.0;
	Bv[ 8 ] = 5.0;
	Bv[ 9 ] = 1.0;
	Bv[ 10 ] = 6.0;
	Bv[ 11 ] = 2.0;
	Bv[ 12 ] = 7.0;
	Bv[ 13 ] = 3.0;
	Bv[ 14 ] = 8.0;
	Bv[ 15 ] = 4.0;
	IPIV = new Int32Array( 4 );
	info = zgbsv( 4, 1, 1, 2, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 16 ), tc.x, 1e-12, 'x' );
});

test( 'zgbsv: N=1 scalar system', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = n_one;
	AB = new Complex128Array( [ 3.0, 2.0 ] );
	B = new Complex128Array( [ 6.0, 4.0 ] );
	IPIV = new Int32Array( 1 );
	info = zgbsv( 1, 0, 0, 1, AB, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 2 ), tc.x, 1e-12, 'x' );
});

test( 'zgbsv: singular matrix returns info > 0', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var B;

	tc = singular;
	AB = bandMatrix( 4, 2, [
		[ 2, 0, 1.0, 0.0 ]  // diag(0)=1, diag(1)=0 (default)
	]);
	B = new Complex128Array( [ 1.0, 0.0, 2.0, 0.0 ] );
	IPIV = new Int32Array( 2 );
	info = zgbsv( 2, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.equal( info, tc.info, 'info (singular at position 2)' );
});

test( 'zgbsv: N=0 quick return', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var B;

	tc = n_zero;
	AB = new Complex128Array( 4 );
	B = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	info = zgbsv( 0, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zgbsv: complex RHS with imaginary parts', function t() {
	var IPIV;
	var info;
	var tc;
	var AB;
	var Bv;
	var B;

	tc = complex_rhs;
	AB = bandMatrix( 4, 4, [
		[ 2, 0, 4.0, 1.0 ],
		[ 3, 0, -1.0, 0.0 ],
		[ 1, 1, -1.0, 0.0 ],
		[ 2, 1, 4.0, 1.0 ],
		[ 3, 1, -1.0, 0.0 ],
		[ 1, 2, -1.0, 0.0 ],
		[ 2, 2, 4.0, 1.0 ],
		[ 3, 2, -1.0, 0.0 ],
		[ 1, 3, -1.0, 0.0 ],
		[ 2, 3, 4.0, 1.0 ]
	]);
	B = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0 ] );
	IPIV = new Int32Array( 4 );
	info = zgbsv( 4, 1, 1, 1, AB, 1, 4, 0, IPIV, 1, 0, B, 1, 4, 0 );
	assert.equal( info, tc.info, 'info' );
	Bv = reinterpret( B, 0 );
	assertArrayClose( toArray( Bv ).slice( 0, 8 ), tc.x, 1e-12, 'x' );
});
