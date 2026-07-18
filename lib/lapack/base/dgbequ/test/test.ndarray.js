/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbequ from './../lib/ndarray.js';

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

test( 'dgbequ: basic 3x3 tridiagonal band (KL=1, KU=1)', function t() {

	const tc = basic;
	const kl = 1;
	const ku = 1;
	const ldab = kl + ku + 1;
	const AB = new Float64Array([
		0,
		2,
		1,    // column 1: *, A(1,1)=2, A(2,1)=1
		3,
		4,
		5,    // column 2: A(1,2)=3, A(2,2)=4, A(3,2)=5
		2,
		6,
		0     // column 3: A(2,3)=2, A(3,3)=6, *
	]);
	const r = new Float64Array( 3 );
	const c = new Float64Array( 3 );
	const result = dgbequ( 3, 3, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgbequ: larger 4x4 band (KL=2, KU=1)', function t() {

	const tc = larger;
	const kl = 2;
	const ku = 1;
	const ldab = kl + ku + 1;
	const AB = new Float64Array([
		0,
		1,
		3,
		7,    // column 1: *, A(1,1)=1, A(2,1)=3, A(3,1)=7
		2,
		4,
		6,
		1,    // column 2: A(1,2)=2, A(2,2)=4, A(3,2)=6, A(4,2)=1
		5,
		8,
		3,
		0,    // column 3: A(2,3)=5, A(3,3)=8, A(4,3)=3, *
		9,
		4,
		0,
		0     // column 4: A(3,4)=9, A(4,4)=4, *, *
	]);
	const r = new Float64Array( 4 );
	const c = new Float64Array( 4 );
	const result = dgbequ( 4, 4, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgbequ: zero row returns info=i', function t() {

	const tc = zero_row;
	const kl = 2;
	const ku = 1;
	const ldab = kl + ku + 1;
	const AB = new Float64Array([
		0,
		1,
		0,
		0,    // column 1: *, A(1,1)=1, A(2,1)=0, A(3,1)=0
		2,
		0,
		3,
		0     // column 2: A(1,2)=2, A(2,2)=0, A(3,2)=3, *
	]);
	const r = new Float64Array( 3 );
	const c = new Float64Array( 2 );
	const result = dgbequ( 3, 2, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dgbequ: zero column returns info=M+j', function t() {

	const tc = zero_col;
	const kl = 1;
	const ku = 0;
	const ldab = kl + ku + 1;
	const AB = new Float64Array([
		1,
		2,    // column 1: A(1,1)=1, A(2,1)=2
		0,
		0     // column 2: A(1,2)=0, A(2,2)=0
	]);
	const r = new Float64Array( 2 );
	const c = new Float64Array( 2 );
	const result = dgbequ( 2, 2, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
});

test( 'dgbequ: quick return M=0', function t() {

	const tc = m_zero;
	const r = new Float64Array( 0 );
	const c = new Float64Array( 3 );
	const result = dgbequ( 0, 3, 0, 0, new Float64Array( 0 ), 1, 1, 0, r, 1, 0, c, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgbequ: quick return N=0', function t() {

	const tc = n_zero;
	const r = new Float64Array( 3 );
	const c = new Float64Array( 0 );
	const result = dgbequ( 3, 0, 0, 0, new Float64Array( 0 ), 1, 1, 0, r, 1, 0, c, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0, 'info' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgbequ: diagonal only (KL=0, KU=0)', function t() {

	const tc = diagonal;
	const AB = new Float64Array([
		3,    // A(1,1)
		1,    // A(2,2)
		2     // A(3,3)
	]);
	const r = new Float64Array( 3 );
	const c = new Float64Array( 3 );
	const result = dgbequ( 3, 3, 0, 0, AB, 1, 1, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});

test( 'dgbequ: non-square 2x4 band (KL=0, KU=1)', function t() {

	const tc = nonsquare;
	const kl = 0;
	const ku = 1;
	const ldab = kl + ku + 1;
	const AB = new Float64Array([
		0,
		1,    // column 1: *, A(1,1)=1
		3,
		4,    // column 2: A(1,2)=3, A(2,2)=4
		5,
		0,    // column 3: A(2,3)=5, *
		0,
		0     // column 4: no valid entries
	]);
	const r = new Float64Array( 2 );
	const c = new Float64Array( 4 );
	const result = dgbequ( 2, 4, kl, ku, AB, 1, ldab, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ).slice( 0, 3 ), tc.c.slice( 0, 3 ), 1e-14, 'c (first 3)' ); // eslint-disable-line max-len
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
});

test( 'dgbequ: 1x1 matrix', function t() {

	const tc = one_by_one;
	const AB = new Float64Array( [ 7 ] );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const result = dgbequ( 1, 1, 0, 0, AB, 1, 1, 0, r, 1, 0, c, 1, 0 );
	assert.equal( result.info, tc.info, 'info' );
	assertArrayClose( toArray( r ), tc.r, 1e-14, 'r' );
	assertArrayClose( toArray( c ), tc.c, 1e-14, 'c' );
	assertClose( result.rowcnd, tc.rowcnd, 1e-14, 'rowcnd' );
	assertClose( result.colcnd, tc.colcnd, 1e-14, 'colcnd' );
	assertClose( result.amax, tc.amax, 1e-14, 'amax' );
});
