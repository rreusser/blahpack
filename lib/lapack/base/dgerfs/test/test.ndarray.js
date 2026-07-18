/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetrf from '../../dgetrf/lib/base.js';
import dgetrs from '../../dgetrs/lib/base.js';
import dgerfs from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import transpose_3x3 from './fixtures/transpose_3x3.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import hilbert_3x3 from './fixtures/hilbert_3x3.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };

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
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ~0, got ' + actual );
		return;
	}
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
* Sets up a system: factorizes A, solves for initial X, returns all arrays.
*
* @private
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {Array} aVals - column-major values for A (N*N)
* @param {Array} bVals - column-major values for B (N*NRHS)
* @param {number} N - matrix order
* @param {number} nrhs - number of right-hand sides
* @returns {Object} { A, AF, IPIV, B, X, FERR, BERR, work, iwork }
*/
function setupSystem( trans, aVals, bVals, N, nrhs ) {
	const IPIV = new Int32Array( N );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	let info;
	const AF = new Float64Array( aVals );
	const A = new Float64Array( aVals );
	const B = new Float64Array( bVals );
	const X = new Float64Array( bVals );
	const work = new Float64Array( 3 * N );
	const iwork = new Int32Array( N );

	// Factorize AF = P*L*U
	info = dgetrf( N, N, AF, 1, N, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'dgetrf should succeed' );

	// Initial solve: op(AF) * X = B
	info = dgetrs( trans, N, nrhs, AF, 1, N, 0, IPIV, 1, 0, X, 1, N, 0 );
	assert.equal( info, 0, 'dgetrs should succeed' );

	return {
		'A': A,
		'AF': AF,
		'IPIV': IPIV,
		'B': B,
		'X': X,
		'FERR': FERR,
		'BERR': BERR,
		'work': work,
		'iwork': iwork
	};
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

test( 'dgerfs: basic_3x3', function t() {

	const tc = basic_3x3;
	const sys = setupSystem( 'no-transpose', [
		2,
		4,
		8,
		1,
		3,
		7,
		1,
		3,
		9
	], [ 1, 1, 1 ], 3, 1 );
	const info = dgerfs( 'no-transpose', 3, 1, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.IPIV, 1, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0, sys.work, 1, 0, sys.iwork, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 3 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
	assert.ok( sys.BERR[ 0 ] < 1e-10, 'BERR is small' );
});

test( 'dgerfs: transpose_3x3', function t() {

	const tc = transpose_3x3;
	const sys = setupSystem( 'transpose', [
		2,
		4,
		8,
		1,
		3,
		7,
		1,
		3,
		9
	], [ 1, 1, 1 ], 3, 1 );
	const info = dgerfs( 'transpose', 3, 1, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.IPIV, 1, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0, sys.work, 1, 0, sys.iwork, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 3 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
	assert.ok( sys.BERR[ 0 ] < 1e-10, 'BERR is small' );
});

test( 'dgerfs: multi_rhs', function t() {

	const tc = multi_rhs;
	const sys = setupSystem( 'no-transpose', [
		2,
		4,
		8,
		1,
		3,
		7,
		1,
		3,
		9
	], [ 1, 0, 0, 0, 1, 0 ], 3, 2 );
	const info = dgerfs( 'no-transpose', 3, 2, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.IPIV, 1, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0, sys.work, 1, 0, sys.iwork, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 6 ) ), tc.x, 1e-12, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR[0] >= 0' );
	assert.ok( sys.FERR[ 1 ] >= 0.0, 'FERR[1] >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR[0] >= 0' );
	assert.ok( sys.BERR[ 1 ] >= 0.0, 'BERR[1] >= 0' );
});

test( 'dgerfs: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const AF = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( 1 );
	const X = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const info = dgerfs( 'no-transpose', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, new Float64Array( 0 ), 1, 0, new Int32Array( 0 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( FERR[ 0 ], 0.0, 'FERR = 0 for N=0' );
	assert.equal( BERR[ 0 ], 0.0, 'BERR = 0 for N=0' );
});

test( 'dgerfs: nrhs_zero', function t() {

	const tc = nrhs_zero;
	const A = new Float64Array( 9 );
	const AF = new Float64Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( 3 );
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const info = dgerfs( 'no-transpose', 3, 0, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, new Float64Array( 9 ), 1, 0, new Int32Array( 3 ), 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgerfs: hilbert_3x3', function t() {

	const tc = hilbert_3x3;
	const sys = setupSystem( 'no-transpose', [
		1.0,
		0.5,
		1.0 / 3.0,
		0.5,
		1.0 / 3.0,
		0.25,
		1.0 / 3.0,
		0.25,
		0.2
	], [ 1, 1, 1 ], 3, 1 );
	const info = dgerfs( 'no-transpose', 3, 1, sys.A, 1, 3, 0, sys.AF, 1, 3, 0, sys.IPIV, 1, 0, sys.B, 1, 3, 0, sys.X, 1, 3, 0, sys.FERR, 1, 0, sys.BERR, 1, 0, sys.work, 1, 0, sys.iwork, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 3 ) ), tc.x, 1e-10, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
});

test( 'dgerfs: one_by_one', function t() {

	const tc = one_by_one;
	const sys = setupSystem( 'no-transpose', [ 5.0 ], [ 10.0 ], 1, 1 );
	const info = dgerfs( 'no-transpose', 1, 1, sys.A, 1, 1, 0, sys.AF, 1, 1, 0, sys.IPIV, 1, 0, sys.B, 1, 1, 0, sys.X, 1, 1, 0, sys.FERR, 1, 0, sys.BERR, 1, 0, sys.work, 1, 0, sys.iwork, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( sys.X.subarray( 0, 1 ) ), tc.x, 1e-14, 'x' );
	assert.ok( sys.FERR[ 0 ] >= 0.0, 'FERR >= 0' );
	assert.ok( sys.BERR[ 0 ] >= 0.0, 'BERR >= 0' );
});
