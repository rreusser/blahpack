/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbequ from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import larger from './fixtures/larger.json' with { type: 'json' };
import zero_row from './fixtures/zero_row.json' with { type: 'json' };
import zero_col from './fixtures/zero_col.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import diagonal from './fixtures/diagonal.json' with { type: 'json' };
import nonsquare from './fixtures/nonsquare.json' with { type: 'json' };
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

test( 'zgbequ: basic 3x3 tridiagonal band (KL=1, KU=1)', function t() {
	var result;
	var ldab;
	var tc;
	var kl;
	var ku;
	var AB;
	var r;
	var c;

	tc = basic;
	kl = 1;
	ku = 1;
	ldab = kl + ku + 1;
	AB = new Complex128Array([
		0,
		0,
		2,
		1,
		3,
		0,    // column 1
		1,
		2,
		4,
		1,
		2,
		3,    // column 2
		1,
		1,
		5,
		0,
		0,
		0     // column 3
	]);
	r = new Float64Array( 3 );
	c = new Float64Array( 3 );
	result = zgbequ( 3, 3, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zgbequ: larger 4x4 band (KL=2, KU=1)', function t() {
	var result;
	var ldab;
	var tc;
	var kl;
	var ku;
	var AB;
	var r;
	var c;

	tc = larger;
	kl = 2;
	ku = 1;
	ldab = kl + ku + 1;
	AB = new Complex128Array([
		0,
		0,
		1,
		1,
		3,
		2,
		0,
		5,    // column 1
		2,
		0,
		4,
		0,
		6,
		1,
		1,
		0,    // column 2
		1,
		3,
		2,
		2,
		7,
		0,
		0,
		0,    // column 3
		3,
		0,
		4,
		4,
		0,
		0,
		0,
		0     // column 4
	]);
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	result = zgbequ( 4, 4, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zgbequ: zero row returns info=i', function t() {
	var result;
	var ldab;
	var tc;
	var kl;
	var ku;
	var AB;
	var r;
	var c;

	tc = zero_row;
	kl = 2;
	ku = 1;
	ldab = kl + ku + 1;
	AB = new Complex128Array([
		0,
		0,
		1,
		0,
		0,
		0,
		0,
		0,    // column 1
		2,
		0,
		0,
		0,
		3,
		0,
		0,
		0     // column 2
	]);
	r = new Float64Array( 3 );
	c = new Float64Array( 2 );
	result = zgbequ( 3, 2, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'zgbequ: zero column returns info=M+j', function t() {
	var result;
	var ldab;
	var tc;
	var kl;
	var ku;
	var AB;
	var r;
	var c;

	tc = zero_col;
	kl = 1;
	ku = 0;
	ldab = kl + ku + 1;
	AB = new Complex128Array([
		1,
		0,
		2,
		0,    // column 1
		0,
		0,
		0,
		0     // column 2
	]);
	r = new Float64Array( 2 );
	c = new Float64Array( 2 );
	result = zgbequ( 2, 2, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
});

test( 'zgbequ: quick return M=0', function t() {
	var result;
	var tc;
	var r;
	var c;

	tc = m_zero;
	r = new Float64Array( 0 );
	c = new Float64Array( 3 );
	result = zgbequ( 0, 3, 0, 0, new Complex128Array( 0 ), 1, 1, 0, r, 1, 0, c, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zgbequ: quick return N=0', function t() {
	var result;
	var tc;
	var r;
	var c;

	tc = n_zero;
	r = new Float64Array( 3 );
	c = new Float64Array( 0 );
	result = zgbequ( 3, 0, 0, 0, new Complex128Array( 0 ), 1, 1, 0, r, 1, 0, c, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zgbequ: diagonal only (KL=0, KU=0)', function t() {
	var result;
	var tc;
	var AB;
	var r;
	var c;

	tc = diagonal;
	AB = new Complex128Array([
		3,
		4,    // A(1,1)
		1,
		0,    // A(2,2)
		0,
		2     // A(3,3)
	]);
	r = new Float64Array( 3 );
	c = new Float64Array( 3 );
	result = zgbequ( 3, 3, 0, 0, AB, 1, 1, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'zgbequ: non-square 2x4 band (KL=0, KU=1)', function t() {
	var result;
	var ldab;
	var tc;
	var kl;
	var ku;
	var AB;
	var r;
	var c;

	tc = nonsquare;
	kl = 0;
	ku = 1;
	ldab = kl + ku + 1;
	AB = new Complex128Array([
		0,
		0,
		1,
		1,    // column 1
		2,
		3,
		4,
		0,    // column 2
		5,
		1,
		0,
		0,    // column 3
		0,
		0,
		0,
		0     // column 4
	]);
	r = new Float64Array( 2 );
	c = new Float64Array( 4 );
	result = zgbequ( 2, 4, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ).slice( 0, 3 ), tc.c.slice( 0, 3 ), 1e-14, 'c (first 3)' ); // eslint-disable-line max-len
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
});

test( 'zgbequ: 1x1 matrix', function t() {
	var result;
	var tc;
	var AB;
	var r;
	var c;

	tc = one_by_one;
	AB = new Complex128Array( [ 7, 3 ] );
	r = new Float64Array( 1 );
	c = new Float64Array( 1 );
	result = zgbequ( 1, 1, 0, 0, AB, 1, 1, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});
