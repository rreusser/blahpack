/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetc2 from './../lib/ndarray.js';

// VARIABLES //

// FIXTURES //

import basic_2x2 from './fixtures/basic_2x2.json' with { type: 'json' };
import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import basic_4x4 from './fixtures/basic_4x4.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };
import near_singular from './fixtures/near_singular.json' with { type: 'json' };

// FUNCTIONS //

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} plain array
*/
function toArray( arr ) {
	var out;
	var i;
	out = [];
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
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

// TESTS //

test( 'zgetc2 is a function', function t() {
	assert.strictEqual( typeof zgetc2, 'function' );
} );

test( 'zgetc2: basic 2x2', function t() {
	var IPIV;
	var JPIV;
	var info;
	var tc;
	var Av;
	var A;
	var i;

	tc = basic_2x2;
	A = new Complex128Array( [ 1.0, 2.0, 5.0, 6.0, 3.0, 4.0, 7.0, 8.0 ] );
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	info = zgetc2( 2, A, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	Av = reinterpret( A, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
		assert.strictEqual( JPIV[ i ], tc.jpiv[ i ] - 1, 'jpiv[' + i + ']' );
	}
} );

test( 'zgetc2: basic 3x3', function t() {
	var IPIV;
	var JPIV;
	var info;
	var tc;
	var Av;
	var A;
	var i;

	tc = basic_3x3;
	A = new Complex128Array( [ 1.0, 0.5, 4.0, 2.0, 7.0, 1.0, 2.0, 1.0, 5.0, 0.0, 8.0, 3.0, 0.5, 3.0, 6.0, 1.5, 10.0, 2.0 ] ); // eslint-disable-line max-len
	IPIV = new Int32Array( 3 );
	JPIV = new Int32Array( 3 );
	info = zgetc2( 3, A, 1, 3, 0, IPIV, 1, 0, JPIV, 1, 0 );
	Av = reinterpret( A, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	for ( i = 0; i < 3; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
		assert.strictEqual( JPIV[ i ], tc.jpiv[ i ] - 1, 'jpiv[' + i + ']' );
	}
} );

test( 'zgetc2: basic 4x4 with complete pivoting', function t() {
	var IPIV;
	var JPIV;
	var info;
	var tc;
	var Av;
	var A;
	var i;

	tc = basic_4x4;
	A = new Complex128Array( [ 0.1, 0.2, 0.7, 0.8, 1.5, 1.6, 2.3, 2.4, 0.3, 0.4, 0.9, 1.0, 1.7, 1.8, 2.5, 2.6, 0.5, 0.6, 1.1, 1.2, 1.9, 2.0, 2.7, 2.8, 10.0, 1.0, 1.3, 1.4, 2.1, 2.2, 2.9, 3.0 ] ); // eslint-disable-line max-len
	IPIV = new Int32Array( 4 );
	JPIV = new Int32Array( 4 );
	info = zgetc2( 4, A, 1, 4, 0, IPIV, 1, 0, JPIV, 1, 0 );
	Av = reinterpret( A, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	for ( i = 0; i < 4; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
		assert.strictEqual( JPIV[ i ], tc.jpiv[ i ] - 1, 'jpiv[' + i + ']' );
	}
} );

test( 'zgetc2: N=1', function t() {
	var IPIV;
	var JPIV;
	var info;
	var tc;
	var Av;
	var A;

	tc = n_equals_1;
	A = new Complex128Array( [ 5.0, 3.0 ] );
	IPIV = new Int32Array( 1 );
	JPIV = new Int32Array( 1 );
	info = zgetc2( 1, A, 1, 1, 0, IPIV, 1, 0, JPIV, 1, 0 );
	Av = reinterpret( A, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	assert.strictEqual( IPIV[ 0 ], tc.ipiv[ 0 ] - 1, 'ipiv[0]' );
	assert.strictEqual( JPIV[ 0 ], tc.jpiv[ 0 ] - 1, 'jpiv[0]' );
} );

test( 'zgetc2: near-singular', function t() {
	var IPIV;
	var JPIV;
	var info;
	var tc;
	var Av;
	var A;
	var i;

	tc = near_singular;
	A = new Complex128Array( [ 1e-200, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0 ] );
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	info = zgetc2( 2, A, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	Av = reinterpret( A, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toArray( Av ), tc.A, 1e-14, 'A' );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
		assert.strictEqual( JPIV[ i ], tc.jpiv[ i ] - 1, 'jpiv[' + i + ']' );
	}
} );

test( 'zgetc2: N=1 near-singular', function t() {
	var IPIV;
	var JPIV;
	var info;
	var Av;
	var A;

	A = new Complex128Array( [ 1e-320, 1e-320 ] );
	IPIV = new Int32Array( 1 );
	JPIV = new Int32Array( 1 );
	info = zgetc2( 1, A, 1, 1, 0, IPIV, 1, 0, JPIV, 1, 0 );
	Av = reinterpret( A, 0 );
	assert.strictEqual( info, 1, 'info reports near-singular' );
	assert.ok( Av[ 0 ] > 0.0, 'diagonal replaced with SMLNUM' );
	assert.strictEqual( Av[ 1 ], 0.0, 'imaginary part zeroed' );
	assert.strictEqual( IPIV[ 0 ], 0, 'ipiv[0]' );
	assert.strictEqual( JPIV[ 0 ], 0, 'jpiv[0]' );
} );

test( 'zgetc2: 2x2 with small last diagonal (info > 0)', function t() {
	var IPIV;
	var JPIV;
	var info;
	var A;

	A = new Complex128Array( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0 + 1e-320, 0.0 ] ); // eslint-disable-line max-len
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	info = zgetc2( 2, A, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	assert.ok( info > 0, 'info reports near-singular last diagonal' );
} );

test( 'zgetc2: N=0 quick return', function t() {
	var IPIV;
	var JPIV;
	var info;
	var A;

	A = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	JPIV = new Int32Array( 1 );
	info = zgetc2( 0, A, 1, 1, 0, IPIV, 1, 0, JPIV, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
} );
