/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbsv from './../lib/ndarray.js';

// FIXTURES //

import upper_notrans_nonunit from './fixtures/upper_notrans_nonunit.json' with { type: 'json' };
import lower_notrans_nonunit from './fixtures/lower_notrans_nonunit.json' with { type: 'json' };
import upper_trans_nonunit from './fixtures/upper_trans_nonunit.json' with { type: 'json' };
import upper_conjtrans_nonunit from './fixtures/upper_conjtrans_nonunit.json' with { type: 'json' };
import lower_trans_nonunit from './fixtures/lower_trans_nonunit.json' with { type: 'json' };
import lower_conjtrans_nonunit from './fixtures/lower_conjtrans_nonunit.json' with { type: 'json' };
import upper_unit from './fixtures/upper_unit.json' with { type: 'json' };
import upper_complex from './fixtures/upper_complex.json' with { type: 'json' };
import upper_k2 from './fixtures/upper_k2.json' with { type: 'json' };

// FUNCTIONS //

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
		assert.ok(Math.abs( actual[ i ] - expected[ i ] ) <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ]);
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

test( 'ztbsv: main export is a function', function t() {
	assert.strictEqual( typeof ztbsv, 'function' );
});

test( 'ztbsv: upper, no-transpose, non-unit (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = upper_notrans_nonunit;
	AB = new Complex128Array( [ 0, 0, 4, 0, 2, 0, 5, 0, 3, 0, 6, 0 ] );
	x = new Complex128Array( [ 10, 0, 19, 0, 18, 0 ] );
	ztbsv( 'upper', 'no-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: lower, no-transpose, non-unit (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = lower_notrans_nonunit;
	AB = new Complex128Array( [ 2, 0, 1, 0, 3, 0, 1, 0, 4, 0, 0, 0 ] );
	x = new Complex128Array( [ 2, 0, 7, 0, 14, 0 ] );
	ztbsv( 'lower', 'no-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: upper, transpose, non-unit (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = upper_trans_nonunit;
	AB = new Complex128Array( [ 0, 0, 4, 0, 2, 0, 5, 0, 3, 0, 6, 0 ] );
	x = new Complex128Array( [ 4, 0, 12, 0, 24, 0 ] );
	ztbsv( 'upper', 'transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: upper, conjugate-transpose, non-unit (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = upper_conjtrans_nonunit;
	AB = new Complex128Array( [ 0, 0, 2, 0, 1, 1, 3, 0, 2, -1, 4, 0 ] );
	x = new Complex128Array( [ 2, 0, 4, -1, 6, 1 ] );
	ztbsv( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 ); // eslint-disable-line max-len
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: lower, transpose, non-unit (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = lower_trans_nonunit;
	AB = new Complex128Array( [ 2, 0, 1, 0, 3, 0, 1, 0, 4, 0, 0, 0 ] );
	x = new Complex128Array( [ 4, 0, 9, 0, 12, 0 ] );
	ztbsv( 'lower', 'transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: lower, conjugate-transpose, non-unit (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = lower_conjtrans_nonunit;
	AB = new Complex128Array( [ 2, 0, 1, 1, 3, 1, 2, -1, 4, 0, 0, 0 ] );
	x = new Complex128Array( [ 3, -1, 5, 0, 4, 0 ] );
	ztbsv( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 ); // eslint-disable-line max-len
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: upper, unit diagonal (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = upper_unit;
	AB = new Complex128Array( [ 0, 0, 99, 0, 2, 0, 99, 0, 3, 0, 99, 0 ] );
	x = new Complex128Array( [ 7, 0, 7, 0, 1, 0 ] );
	ztbsv( 'upper', 'no-transpose', 'unit', 3, 1, AB, 1, 2, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: N=0 quick return', function t() {
	var result;
	var AB;
	var xv;
	var x;

	AB = new Complex128Array( 1 );
	x = new Complex128Array( [ 5, 5 ] );
	result = ztbsv( 'upper', 'no-transpose', 'non-unit', 0, 1, AB, 1, 1, 0, x, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( result, x );
	xv = reinterpret( x, 0 );
	assert.strictEqual( xv[ 0 ], 5 );
	assert.strictEqual( xv[ 1 ], 5 );
});

test( 'ztbsv: upper, complex entries (N=3, K=1)', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = upper_complex;
	AB = new Complex128Array( [ 0, 0, 3, 0, 1, 1, 2, 1, 2, -1, 4, -1 ] );
	x = new Complex128Array( [ 3, 2, 5, 1, 8, -2 ] );
	ztbsv( 'upper', 'no-transpose', 'non-unit', 3, 1, AB, 1, 2, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});

test( 'ztbsv: upper, K=2, N=4', function t() {
	var tc;
	var AB;
	var xv;
	var x;

	tc = upper_k2;
	AB = new Complex128Array([
		0,
		0,
		0,
		0,
		4,
		0,
		0,
		0,
		2,
		0,
		4,
		0,
		1,
		0,
		2,
		0,
		4,
		0,
		1,
		0,
		2,
		0,
		4,
		0
	]);
	x = new Complex128Array( [ 7, 0, 7, 0, 6, 0, 4, 0 ] );
	ztbsv( 'upper', 'no-transpose', 'non-unit', 4, 2, AB, 1, 3, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertArrayClose( toArray( xv ), tc.x, 1e-12, 'x' );
});
