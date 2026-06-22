/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgels from './../lib/ndarray.js';

// FIXTURES //

import overdetermined_4x2 from './fixtures/overdetermined_4x2.json' with { type: 'json' };
import underdetermined_2x4 from './fixtures/underdetermined_2x4.json' with { type: 'json' };
import square_3x3 from './fixtures/square_3x3.json' with { type: 'json' };
import conjtrans_mge_n_minnorm from './fixtures/conjtrans_mge_n_minnorm.json' with { type: 'json' };
import conjtrans_mlt_n_ls from './fixtures/conjtrans_mlt_n_ls.json' with { type: 'json' };
import multi_rhs_overdetermined from './fixtures/multi_rhs_overdetermined.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import overdetermined_6x3 from './fixtures/overdetermined_6x3.json' with { type: 'json' };

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
* Create a Complex128Array from interleaved re/im pairs.
*/
function c128( arr ) {
	var out = new Complex128Array( arr.length / 2 );
	var v = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		v[ i ] = arr[ i ];
	}
	return out;
}

/**
* Extract n doubles from the Float64 view of a Complex128Array at a given complex offset.
*/
function extractDoubles( C128, complexOffset, nDoubles ) {
	var out = [];
	var v = reinterpret( C128, 0 );
	var i;
	for ( i = 0; i < nDoubles; i++ ) {
		out.push( v[ (complexOffset * 2) + i ] );
	}
	return out;
}

// TESTS //

test( 'zgels: overdetermined_4x2, TRANS=N', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = overdetermined_4x2;
	A = c128( [ 1, 1, 2, 1, 3, 0, 1, 3, 1, 2, 2, 1, 3, 1, 1, 0 ] );
	B = c128( [ 1, 1, 2, 0, 3, 1, 1, 0 ] );
	info = zgels( 'no-transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 4 ), tc.x, 1e-12, 'x' );
});

test( 'zgels: underdetermined_2x4, TRANS=N', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = underdetermined_2x4;
	A = c128( [ 1, 1, 0, 0, 2, 0, 2, 1, 3, 1, 1, 0, 1, 0, 3, 1 ] );
	B = c128( [ 10, 2, 5, 1, 0, 0, 0, 0 ] );
	info = zgels( 'no-transpose', 2, 4, 1, A, 1, 2, 0, B, 1, 4, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 8 ), tc.x, 1e-12, 'x' );
});

test( 'zgels: square_3x3, TRANS=N', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = square_3x3;
	A = c128( [ 5, 1, 0, 1, 0, 0, 0, 1, 5, 1, 0, 1, 0, 0, 0, 1, 5, 1 ] );
	B = c128( [ 5, 2, 5, 3, 5, 2 ] );
	info = zgels( 'no-transpose', 3, 3, 1, A, 1, 3, 0, B, 1, 3, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 6 ), tc.x, 1e-12, 'x' );
});

test( 'zgels: conjtrans_mge_n_minnorm, TRANS=C, M>=N', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = conjtrans_mge_n_minnorm;
	A = c128( [ 2, 1, 1, 0, 1, 1, 0, 0, 1, 0, 2, 1, 1, 1, 1, 0 ] );
	B = c128( [ 3, 1, 2, 0, 0, 0, 0, 0 ] );
	info = zgels( 'conjugate-transpose', 4, 2, 1, A, 1, 4, 0, B, 1, 4, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 8 ), tc.x, 1e-12, 'x' );
});

test( 'zgels: conjtrans_mlt_n_ls, TRANS=C, M<N', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = conjtrans_mlt_n_ls;
	A = c128( [ 1, 1, 1, 0, 2, 0, 2, 1, 3, 0, 1, 1 ] );
	B = c128( [ 1, 0, 2, 1, 3, 0 ] );
	info = zgels( 'conjugate-transpose', 2, 3, 1, A, 1, 2, 0, B, 1, 3, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 4 ), tc.x, 1e-12, 'x' );
});

test( 'zgels: multi_rhs_overdetermined, TRANS=N', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = multi_rhs_overdetermined;
	A = c128( [ 2, 0, 0, 1, 1, 0, 1, 1, 1, 0, 2, 0, 1, 1, 0, 1 ] );
	B = c128([
		3,
		0,
		2,
		1,
		2,
		0,
		1,
		1,
		5,
		1,
		4,
		0,
		3,
		1,
		2,
		0
	]);
	info = zgels( 'no-transpose', 4, 2, 2, A, 1, 4, 0, B, 1, 4, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 4 ), tc.x1, 1e-12, 'x1' );
	assertArrayClose( extractDoubles( B, 4, 4 ), tc.x2, 1e-12, 'x2' );
});

test( 'zgels: n_zero quick return', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = c128( [ 1, 0 ] );
	B = c128( [ 1, 0, 0, 0, 0, 0 ] );
	info = zgels( 'no-transpose', 3, 0, 1, A, 1, 3, 0, B, 1, 3, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgels: m_zero quick return', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = m_zero;
	A = c128( [ 0, 0 ] );
	B = c128( [ 0, 0, 0, 0, 0, 0 ] );
	info = zgels( 'no-transpose', 0, 3, 1, A, 1, 1, 0, B, 1, 3, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgels: nrhs_zero quick return', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = nrhs_zero;
	A = c128( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	B = c128( [ 0, 0, 0, 0 ] );
	info = zgels( 'no-transpose', 2, 2, 0, A, 1, 2, 0, B, 1, 2, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgels: zero matrix A returns zero solution', function t() {
	var info;
	var Bv;
	var A;
	var B;

	A = c128( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	B = c128( [ 1, 2, 0, 0 ] );
	info = zgels( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	Bv = reinterpret( B, 0 );
	assert.equal( Bv[ 0 ], 0.0, 'B[0]' );
	assert.equal( Bv[ 1 ], 0.0, 'B[1]' );
});

test( 'zgels: tiny A triggers upscaling (iascl=1)', function t() {
	var tiny;
	var info;
	var A;
	var B;

	tiny = 1e-310;
	A = c128( [ tiny, 0, 0, 0, 0, 0, tiny, 0 ] );
	B = c128( [ tiny, 0, 0, 0 ] );
	info = zgels( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.ok( info >= 0, 'info should be non-negative' );
});

test( 'zgels: huge A triggers downscaling (iascl=2)', function t() {
	var huge;
	var info;
	var A;
	var B;

	huge = 1e307;
	A = c128( [ huge, 0, 0, 0, 0, 0, huge, 0 ] );
	B = c128( [ huge, 0, 0, 0 ] );
	info = zgels( 'no-transpose', 2, 2, 1, A, 1, 2, 0, B, 1, 2, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.ok( info >= 0, 'info should be non-negative' );
});

test( 'zgels: tiny B triggers upscaling (ibscl=1)', function t() {
	var tiny;
	var info;
	var A;
	var B;

	tiny = 1e-310;
	A = c128( [ 5, 1, 0, 1, 0, 1, 5, 1, 0, 0, 0, 1, 5, 1 ] );
	B = c128( [ tiny, 0, tiny, 0, tiny, 0 ] );
	info = zgels( 'no-transpose', 3, 3, 1, A, 1, 3, 0, B, 1, 3, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'zgels: huge B triggers downscaling (ibscl=2)', function t() {
	var huge;
	var info;
	var A;
	var B;

	huge = 1e307;
	A = c128( [ 5, 1, 0, 1, 0, 1, 5, 1, 0, 0, 0, 1, 5, 1 ] );
	B = c128( [ huge, 0, huge, 0, huge, 0 ] );
	info = zgels( 'no-transpose', 3, 3, 1, A, 1, 3, 0, B, 1, 3, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'zgels: overdetermined_6x3', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = overdetermined_6x3;
	A = c128([
		10,
		1,
		1,
		0,
		1,
		0,
		0,
		1,
		1,
		0,
		0,
		0,
		1,
		0,
		10,
		1,
		1,
		0,
		1,
		0,
		0,
		1,
		0,
		0,
		1,
		0,
		1,
		0,
		10,
		1,
		1,
		0,
		1,
		0,
		0,
		1
	]);
	B = c128( [ 15, 1, 24, 2, 33, 3, 5, 1, 5, 2, 0, 3 ] );
	info = zgels( 'no-transpose', 6, 3, 1, A, 1, 6, 0, B, 1, 6, 0, null, 1, 0, -1 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( extractDoubles( B, 0, 6 ), tc.x, 1e-10, 'x' );
});
