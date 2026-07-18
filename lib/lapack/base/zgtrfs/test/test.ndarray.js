/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgttrf from './../../zgttrf/lib/base.js';
import zgttrs from './../../zgttrs/lib/base.js';
import zgtrfs from './../lib/ndarray.js';

// FIXTURES //

import basic_notrans from './fixtures/basic_notrans.json' with { type: 'json' };
import basic_conjtrans from './fixtures/basic_conjtrans.json' with { type: 'json' };
import multi_rhs_notrans from './fixtures/multi_rhs_notrans.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import pivot_5x5_notrans from './fixtures/pivot_5x5_notrans.json' with { type: 'json' };

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

test( 'zgtrfs: basic_notrans', function t() {

	const tc = basic_notrans;
	const n = 4;
	const nrhs = 1;
	const DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
	const d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
	const DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
	const B = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
	const DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
	const DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
	const DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
	const DU2 = new Complex128Array( n );
	const IPIV = new Int32Array( n );
	zgttrf( n, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const X = new Complex128Array( [ 5, 1.5, 6, 4, 6, 1, 9, -0.5 ] );
	zgttrs( 'no-transpose', n, nrhs, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 1, n, 0 ); // eslint-disable-line max-len
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const info = zgtrfs( 'no-transpose', n, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1.0, 'ferr' );
	assert.ok( BERR[ 0 ] < 1e-10, 'berr small' );
});

test( 'zgtrfs: basic_conjtrans', function t() {

	const tc = basic_conjtrans;
	const n = 4;
	const nrhs = 1;
	const DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
	const d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
	const DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
	const B = new Complex128Array( [ 6, -2, 7, -1.5, 5, -2.5, 8, 0 ] );
	const DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
	const DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
	const DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
	const DU2 = new Complex128Array( n );
	const IPIV = new Int32Array( n );
	zgttrf( n, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const X = new Complex128Array( [ 6, -2, 7, -1.5, 5, -2.5, 8, 0 ] );
	zgttrs( 'conjugate-transpose', n, nrhs, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 1, n, 0 ); // eslint-disable-line max-len
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const info = zgtrfs( 'conjugate-transpose', n, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1.0, 'ferr' );
});

test( 'zgtrfs: multi_rhs_notrans', function t() {

	const tc = multi_rhs_notrans;
	const n = 4;
	const nrhs = 2;
	const DL = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
	const d = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
	const DU = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
	const Bdata = new Float64Array( 2 * n * nrhs );
	Bdata[ 0 ] = 5;
	Bdata[ 1 ] = 1.5;
	Bdata[ 2 ] = 6;
	Bdata[ 3 ] = 4;
	Bdata[ 4 ] = 6;
	Bdata[ 5 ] = 1;
	Bdata[ 6 ] = 9;
	Bdata[ 7 ] = -0.5;
	Bdata[ 8 ] = 5.5;
	Bdata[ 9 ] = 5;
	Bdata[ 10 ] = 12;
	Bdata[ 11 ] = 2;
	Bdata[ 12 ] = 4;
	Bdata[ 13 ] = 0;
	Bdata[ 14 ] = 7.25;
	Bdata[ 15 ] = 0.75;
	const B = new Complex128Array( Bdata );
	const DLF = new Complex128Array( [ 2, 1, 1, -1, 3, 0.5 ] );
	const DF = new Complex128Array( [ 4, 1, 5, 2, 3, 1, 6, -1 ] );
	const DUF = new Complex128Array( [ 1, 0.5, -1, 1, 2, 1 ] );
	const DU2 = new Complex128Array( n );
	const IPIV = new Int32Array( n );
	zgttrf( n, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const Xdata = new Float64Array( Bdata.slice() );
	const X = new Complex128Array( Xdata );
	zgttrs( 'no-transpose', n, nrhs, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 1, n, 0 ); // eslint-disable-line max-len
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const info = zgtrfs( 'no-transpose', n, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ).slice( 0, 2 * n ), tc.x1, 1e-12, 'x1' );
	assertArrayClose( toArray( Xv ).slice( 2 * n, 4 * n ), tc.x2, 1e-12, 'x2' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1.0, 'ferr' );
});

test( 'zgtrfs: n_one', function t() {

	const tc = n_one;
	const nrhs = 1;
	const d = new Complex128Array( [ 3, 2 ] );
	const DL = new Complex128Array( 1 );
	const DU = new Complex128Array( 1 );
	const B = new Complex128Array( [ 3, 2 ] );
	const DF = new Complex128Array( [ 3, 2 ] );
	const DLF = new Complex128Array( 1 );
	const DUF = new Complex128Array( 1 );
	const DU2 = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	zgttrf( 1, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const X = new Complex128Array( [ 3, 2 ] );
	zgttrs( 'no-transpose', 1, nrhs, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 1, 1, 0 ); // eslint-disable-line max-len
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const info = zgtrfs( 'no-transpose', 1, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});

test( 'zgtrfs: n_zero', function t() {

	const tc = n_zero;
	const DL = new Complex128Array( 1 );
	const d = new Complex128Array( 1 );
	const DU = new Complex128Array( 1 );
	const DLF = new Complex128Array( 1 );
	const DF = new Complex128Array( 1 );
	const DUF = new Complex128Array( 1 );
	const DU2 = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const info = zgtrfs( 'no-transpose', 0, 1, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgtrfs: pivot_5x5_notrans', function t() {

	const tc = pivot_5x5_notrans;
	const n = 5;
	const nrhs = 1;
	const DL = new Complex128Array( [ 5, 1, 7, -2, 1, 3, 2, 0.5 ] );
	const d = new Complex128Array( [ 1, 0.5, 3, 1, 2, -1, 1, 2, 8, 0 ] );
	const DU = new Complex128Array( [ 2, -1, 4, 0, 6, 1, 3, -0.5 ] );
	const B = new Complex128Array( [ 3, -0.5, 12, 2, 15, -2, 5, 4.5, 10, 0.5 ] );
	const DLF = new Complex128Array( [ 5, 1, 7, -2, 1, 3, 2, 0.5 ] );
	const DF = new Complex128Array( [ 1, 0.5, 3, 1, 2, -1, 1, 2, 8, 0 ] );
	const DUF = new Complex128Array( [ 2, -1, 4, 0, 6, 1, 3, -0.5 ] );
	const DU2 = new Complex128Array( n );
	const IPIV = new Int32Array( n );
	zgttrf( n, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	const X = new Complex128Array( [ 3, -0.5, 12, 2, 15, -2, 5, 4.5, 10, 0.5 ] );
	zgttrs( 'no-transpose', n, nrhs, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, X, 1, n, 0 ); // eslint-disable-line max-len
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const info = zgtrfs( 'no-transpose', n, nrhs, DL, 1, 0, d, 1, 0, DU, 1, 0, DLF, 1, 0, DF, 1, 0, DUF, 1, 0, DU2, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1.0, 'ferr' );
});
