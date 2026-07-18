/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgtsv from './../lib/ndarray.js';

// FIXTURES //

import basic_5x5_single_rhs from './fixtures/basic_5x5_single_rhs.json' with { type: 'json' };
import multi_rhs_complex from './fixtures/multi_rhs_complex.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import pivoting from './fixtures/pivoting.json' with { type: 'json' };

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
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a Complex128Array from interleaved re/im data.
*/
function c128( data ) {
	return new Complex128Array( new Float64Array( data ) );
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
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgtsv: basic_5x5_single_rhs', function t() {

	const tc = basic_5x5_single_rhs;
	const N = 5;
	const nrhs = 1;
	const DL = c128( [ -1, 0, -1, 0, -1, 0, -1, 0 ] );
	const d = c128( [ 2, 0, 2, 0, 2, 0, 2, 0, 2, 0 ] );
	const DU = c128( [ -1, 0, -1, 0, -1, 0, -1, 0 ] );
	const B = c128( [ 1, 0, 2, 0, 3, 0, 4, 0, 5, 0 ] );
	const info = zgtsv( N, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	const dv = reinterpret( d, 0 );
	assertArrayClose( toArray( dv ), tc.d, 1e-14, 'd' );
	const bv = reinterpret( B, 0 );
	assertArrayClose( toArray( bv ), tc.b, 1e-14, 'b' );
});

test( 'zgtsv: multi_rhs_complex', function t() {

	const tc = multi_rhs_complex;
	const N = 4;
	const nrhs = 2;
	const DL = c128( [ 1, 1, 1, -1, 2, 0 ] );
	const d = c128( [ 4, 0, 4, 1, 4, -1, 4, 0 ] );
	const DU = c128( [ 1, -1, 1, 1, 1, 0 ] );
	const B = c128([
		6,
		-1,
		10,
		1,
		10,
		-1,
		7,
		0,
		2,
		0,
		3,
		1,
		3,
		-1,
		2,
		0
	]);
	const info = zgtsv( N, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	const dv = reinterpret( d, 0 );
	assertArrayClose( toArray( dv ), tc.d, 1e-14, 'd' );
	const bv = reinterpret( B, 0 );
	const bCol1 = toArray( bv ).slice( 0, 2 * N );
	const bCol2 = toArray( bv ).slice( 2 * N, 4 * N );
	assertArrayClose( bCol1, tc.b.slice( 0, 2 * N ), 1e-13, 'b col1' );
	assertArrayClose( bCol2, tc.b.slice( 2 * N, 4 * N ), 1e-13, 'b col2' );
});

test( 'zgtsv: n_one', function t() {

	const tc = n_one;
	const d = c128( [ 5, 2 ] );
	const DL = c128( [] );
	const DU = c128( [] );
	const B = c128( [ 10, 4 ] );
	const info = zgtsv( 1, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	const bv = reinterpret( B, 0 );
	assertArrayClose( toArray( bv ), tc.b, 1e-14, 'b' );
});

test( 'zgtsv: n_zero', function t() {

	const tc = n_zero;
	const d = c128( [] );
	const DL = c128( [] );
	const DU = c128( [] );
	const B = c128( [] );
	const info = zgtsv( 0, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, B, 1, 0, 0 );
	assert.equal( info, tc.info );
});

test( 'zgtsv: singular', function t() {

	const tc = singular;
	const DL = c128( [ 0, 0, 0, 0 ] );
	const d = c128( [ 0, 0, 2, 0, 3, 0 ] );
	const DU = c128( [ 1, 0, 1, 0 ] );
	const B = c128( [ 1, 0, 2, 0, 3, 0 ] );
	const info = zgtsv( 3, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
});

test( 'zgtsv: pivoting', function t() {

	const tc = pivoting;
	const N = 4;
	const DL = c128( [ 5, 0, 7, 0, 9, 0 ] );
	const d = c128( [ 1, 0, 3, 0, 2, 0, 1, 0 ] );
	const DU = c128( [ 2, 0, 4, 0, 6, 0 ] );
	const B = c128( [ 5, 0, 12, 0, 15, 0, 10, 0 ] );
	const info = zgtsv( N, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	const dv = reinterpret( d, 0 );
	assertArrayClose( toArray( dv ), tc.d, 1e-14, 'd' );
	const dlv = reinterpret( DL, 0 );
	assertArrayClose( toArray( dlv ), tc.dl, 1e-14, 'dl' );
	const duv = reinterpret( DU, 0 );
	assertArrayClose( toArray( duv ), tc.du, 1e-14, 'du' );
	const bv = reinterpret( B, 0 );
	assertArrayClose( toArray( bv ), tc.b, 1e-13, 'b' );
});
