/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztptrs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import lower_conj_trans from './fixtures/lower_conj_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import lower_unit_diag from './fixtures/lower_unit_diag.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import upper_unit_conj_trans from './fixtures/upper_unit_conj_trans.json' with { type: 'json' };

// FUNCTIONS //

/**
* Converts a Float64Array to an array.
*
* @private
* @param {Float64Array} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out;
	var i;

	out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual value
* @param {Array} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Creates a Complex128Array from interleaved real/imaginary doubles.
*
* @private
* @param {Array} arr - interleaved real/imaginary values
* @returns {Complex128Array} complex array
*/
function c128( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

// TESTS //

test( 'ztptrs is a function', function t() {
	assert.equal( typeof ztptrs, 'function' );
});

test( 'ztptrs: upper, no-transpose, non-unit (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_no_trans;
	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 4.0, 1.0, 3.0, 0.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = ztptrs( 'upper', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: lower, no-transpose, non-unit (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_no_trans;
	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 3.0, 0.0, 4.0, 1.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = ztptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: upper, conjugate-transpose, non-unit (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_conj_trans;
	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 4.0, 1.0, 3.0, 0.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = ztptrs( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: lower, conjugate-transpose, non-unit (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_conj_trans;
	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 3.0, 0.0, 4.0, 1.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = ztptrs( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: upper, unit diagonal, no-transpose (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_unit_diag;
	ap = c128( [ 1.0, 0.0, 2.0, 1.0, 1.0, 0.0, 3.0, -1.0, 4.0, 2.0, 1.0, 0.0 ] );
	b = c128( [ 10.0, 5.0, 5.0, -2.0, 1.0, 1.0 ] );
	info = ztptrs( 'upper', 'no-transpose', 'unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: lower, unit diagonal, no-transpose (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_unit_diag;
	ap = c128( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 1.0, 0.0, 4.0, 2.0, 1.0, 0.0 ] );
	b = c128( [ 10.0, 5.0, 5.0, -2.0, 1.0, 1.0 ] );
	info = ztptrs( 'lower', 'no-transpose', 'unit', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: N=0 quick return', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 1.0, 0.0 ] );
	b = c128( [ 1.0, 0.0 ] );
	info = ztptrs( 'upper', 'no-transpose', 'non-unit', 0, 1, ap, 1, 0, b, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
});

test( 'ztptrs: N=1 edge case', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = n_one;
	ap = c128( [ 5.0, 2.0 ] );
	b = c128( [ 15.0, 1.0 ] );
	info = ztptrs( 'upper', 'no-transpose', 'non-unit', 1, 1, ap, 1, 0, b, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 2 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: singular upper (zero diagonal at position 2)', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 0.0, 0.0, 3.0, 0.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	info = ztptrs( 'upper', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 2 );
});

test( 'ztptrs: singular lower (zero diagonal at position 1)', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 0.0, 0.0, 1.0, 2.0, 3.0, 0.0, 4.0, 1.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	info = ztptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 1 );
});

test( 'ztptrs: singular lower (zero diagonal at last position)', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 3.0, 0.0, 4.0, 1.0, 5.0, -1.0, 0.0, 0.0 ] );
	b = c128( [ 1.0, 0.0, 1.0, 0.0, 1.0, 0.0 ] );
	info = ztptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 3 );
});

test( 'ztptrs: multiple RHS (NRHS=2), upper, no-transpose', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = multi_rhs;
	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 4.0, 1.0, 3.0, 0.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5, 4.0, 0.0, 5.0, -2.0, 6.0, 1.0 ] );
	info = ztptrs( 'upper', 'no-transpose', 'non-unit', 3, 2, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 12 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: lower, no-transpose, non-unit (4x4)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_4x4;
	ap = c128([
		3.0,
		1.0,
		1.0,
		2.0,
		4.0,
		-1.0,
		2.0,
		0.0,
		2.0,
		1.0,
		1.0,
		0.0,
		3.0,
		-1.0,
		5.0,
		2.0,
		1.0,
		1.0,
		4.0,
		0.0
	]);
	b = c128( [ 10.0, 5.0, 20.0, -3.0, 30.0, 1.0, 40.0, -10.0 ] );
	info = ztptrs( 'lower', 'no-transpose', 'non-unit', 4, 1, ap, 1, 0, b, 1, 4, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 8 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: upper, unit diagonal, conjugate-transpose (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_unit_conj_trans;
	ap = c128( [ 1.0, 0.0, 2.0, 1.0, 1.0, 0.0, 3.0, -1.0, 4.0, 2.0, 1.0, 0.0 ] );
	b = c128( [ 10.0, 5.0, 5.0, -2.0, 1.0, 1.0 ] );
	info = ztptrs( 'upper', 'conjugate-transpose', 'unit', 3, 1, ap, 1, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: works with non-zero AP offset', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_no_trans;
	ap = c128( [ 99.0, 99.0, 77.0, 77.0, 2.0, 1.0, 1.0, 2.0, 4.0, 1.0, 3.0, 0.0, 5.0, -1.0, 6.0, 2.0 ] ); // eslint-disable-line max-len
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = ztptrs( 'upper', 'no-transpose', 'non-unit', 3, 1, ap, 1, 2, b, 1, 3, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'ztptrs: works with non-zero B offset', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_no_trans;
	ap = c128( [ 2.0, 1.0, 1.0, 2.0, 3.0, 0.0, 4.0, 1.0, 5.0, -1.0, 6.0, 2.0 ] );
	b = c128( [ 99.0, 99.0, 77.0, 77.0, 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = ztptrs( 'lower', 'no-transpose', 'non-unit', 3, 1, ap, 1, 0, b, 1, 3, 2 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	bv = new Float64Array( b.buffer, b.byteOffset, 10 );
	assert.equal( bv[ 0 ], 99.0 );
	assert.equal( bv[ 1 ], 99.0 );
	assert.equal( bv[ 2 ], 77.0 );
	assert.equal( bv[ 3 ], 77.0 );
	assertArrayClose( toArray( bv ).slice( 4 ), tc.x, 1e-14, 'x' );
});
