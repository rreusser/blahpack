/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgesc2 from './../lib/ndarray.js';

// FIXTURES //

import basic_2x2 from './fixtures/basic_2x2.json' with { type: 'json' };
import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import basic_4x4 from './fixtures/basic_4x4.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };

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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
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
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgesc2: main export is a function', function t() {
	assert.strictEqual( typeof zgesc2, 'function' );
});

test( 'zgesc2: basic_2x2', function t() {

	const tc = basic_2x2;
	const N = 2;
	const A = new Complex128Array( tc.A );
	const IPIV = new Int32Array( tc.ipiv.map( function sub1( v ) {
		return v - 1;
	} ) );
	const JPIV = new Int32Array( tc.jpiv.map( function sub1( v ) {
		return v - 1;
	} ) );
	const RHS = new Complex128Array( [ 10.0, 3.0, 7.0, 4.0 ] );
	const scale = new Float64Array( 1 );
	zgesc2( N, A, 1, N, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	const Rv = reinterpret( RHS, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( Rv ), tc.rhs, 1e-12, 'rhs' );
});

test( 'zgesc2: basic_3x3', function t() {

	const tc = basic_3x3;
	const N = 3;
	const A = new Complex128Array( tc.A );
	const IPIV = new Int32Array( tc.ipiv.map( function sub1( v ) {
		return v - 1;
	} ) );
	const JPIV = new Int32Array( tc.jpiv.map( function sub1( v ) {
		return v - 1;
	} ) );
	const RHS = new Complex128Array( [ 4.0, 0.5, 10.0, 1.0, 24.0, 0.5 ] );
	const scale = new Float64Array( 1 );
	zgesc2( N, A, 1, N, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	const Rv = reinterpret( RHS, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( Rv ), tc.rhs, 1e-12, 'rhs' );
});

test( 'zgesc2: basic_4x4', function t() {

	const tc = basic_4x4;
	const N = 4;
	const A = new Complex128Array( tc.A );
	const IPIV = new Int32Array( tc.ipiv.map( function sub1( v ) {
		return v - 1;
	} ) );
	const JPIV = new Int32Array( tc.jpiv.map( function sub1( v ) {
		return v - 1;
	} ) );
	const RHS = new Complex128Array( [ 13.5, 0.5, 11.5, 2.5, 17.0, -0.5, 13.0, 2.5 ] ); // eslint-disable-line max-len
	const scale = new Float64Array( 1 );
	zgesc2( N, A, 1, N, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	const Rv = reinterpret( RHS, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( Rv ), tc.rhs, 1e-12, 'rhs' );
});

test( 'zgesc2: n_equals_1', function t() {

	const tc = n_equals_1;
	const N = 1;
	const A = new Complex128Array( [ 5.0, 2.0 ] );
	const IPIV = new Int32Array( [ 0 ] );
	const JPIV = new Int32Array( [ 0 ] );
	const RHS = new Complex128Array( [ 15.0, 6.0 ] );
	const scale = new Float64Array( 1 );
	zgesc2( N, A, 1, 1, 0, RHS, 1, 0, IPIV, 1, 0, JPIV, 1, 0, scale );
	const Rv = reinterpret( RHS, 0 );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( Rv ), tc.rhs, 1e-12, 'rhs' );
});
