/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zpptrs from './../lib/ndarray.js';

// FIXTURES //

import upper_single_rhs from './fixtures/upper_single_rhs.json' with { type: 'json' };
import lower_single_rhs from './fixtures/lower_single_rhs.json' with { type: 'json' };
import lower_multi_rhs from './fixtures/lower_multi_rhs.json' with { type: 'json' };
import upper_multi_rhs_3 from './fixtures/upper_multi_rhs_3.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };
import upper_single_rhs_2 from './fixtures/upper_single_rhs_2.json' with { type: 'json' };
import upper_one_by_one from './fixtures/upper_one_by_one.json' with { type: 'json' };

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

test( 'zpptrs is a function', function t() {
	assert.equal( typeof zpptrs, 'function' );
});

test( 'zpptrs: upper, single RHS (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_single_rhs;
	ap = c128( tc.AP );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zpptrs( 'upper', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: lower, single RHS (3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_single_rhs;
	ap = c128( tc.AP );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zpptrs( 'lower', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: lower, multiple RHS (NRHS=2, 3x3)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_multi_rhs;
	ap = c128( lower_single_rhs.AP );
	b = c128([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0
	]);
	info = zpptrs( 'lower', 3, 2, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 12 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: upper, multiple RHS (NRHS=3, 3x3) - compute inverse', function t() { // eslint-disable-line max-len
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_multi_rhs_3;
	ap = c128( upper_single_rhs.AP );
	b = c128([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	info = zpptrs( 'upper', 3, 3, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 18 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: N=0 quick return', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 1.0, 0.0 ] );
	b = c128( [ 1.0, 0.0 ] );
	info = zpptrs( 'upper', 0, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zpptrs: NRHS=0 quick return', function t() {
	var info;
	var ap;
	var bv;
	var b;

	ap = c128( lower_single_rhs.AP );
	b = c128( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
	info = zpptrs( 'lower', 3, 0, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = new Float64Array( b.buffer, b.byteOffset, 6 );
	assert.equal( bv[ 0 ], 1.0 );
	assert.equal( bv[ 1 ], 2.0 );
	assert.equal( bv[ 2 ], 3.0 );
	assert.equal( bv[ 3 ], 4.0 );
	assert.equal( bv[ 4 ], 5.0 );
	assert.equal( bv[ 5 ], 6.0 );
});

test( 'zpptrs: 1x1 system (lower)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = one_by_one;
	ap = c128( [ 2.0, 0.0 ] );
	b = c128( [ 6.0, 3.0 ] );
	info = zpptrs( 'lower', 1, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 2 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: upper, single RHS (3x3, different RHS)', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_single_rhs_2;
	ap = c128( upper_single_rhs.AP );
	b = c128( [ 5.0, -2.0, -1.0, 3.0, 4.0, 1.0 ] );
	info = zpptrs( 'upper', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: upper, 1x1 system', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_one_by_one;
	ap = c128( [ 3.0, 0.0 ] );
	b = c128( [ 18.0, -9.0 ] );
	info = zpptrs( 'upper', 1, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 2 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: works with non-zero AP offset', function t() {
	var apRaw;
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = upper_single_rhs;
	apRaw = [ 99.0, 99.0, 77.0, 77.0 ].concat( toArray( new Float64Array( tc.AP ) ) ); // eslint-disable-line max-len
	ap = c128( apRaw );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zpptrs( 'upper', 3, 1, ap, 1, 2, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.x, 1e-14, 'x' );
});

test( 'zpptrs: works with non-zero B offset', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = lower_single_rhs;
	ap = c128( tc.AP );
	b = c128( [ 99.0, 99.0, 77.0, 77.0, 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zpptrs( 'lower', 3, 1, ap, 1, 0, b, 1, 3, 2 );
	assert.equal( info, 0 );
	bv = new Float64Array( b.buffer, b.byteOffset, 10 );
	assert.equal( bv[ 0 ], 99.0 );
	assert.equal( bv[ 1 ], 99.0 );
	assert.equal( bv[ 2 ], 77.0 );
	assert.equal( bv[ 3 ], 77.0 );
	assertArrayClose( toArray( bv ).slice( 4 ), tc.x, 1e-14, 'x' );
});
