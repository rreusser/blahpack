/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zppsv from './../lib/ndarray.js';

// FIXTURES //

import _3x3_upper_1rhs from './fixtures/3x3_upper_1rhs.json' with { type: 'json' };
import _3x3_lower_1rhs from './fixtures/3x3_lower_1rhs.json' with { type: 'json' };
import _3x3_lower_2rhs from './fixtures/3x3_lower_2rhs.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import _3x3_upper_2rhs from './fixtures/3x3_upper_2rhs.json' with { type: 'json' };

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

test( 'zppsv is a function', function t() {
	assert.equal( typeof zppsv, 'function' );
});

test( 'zppsv: 3x3 upper, 1 RHS', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = _3x3_upper_1rhs;
	ap = c128([
		10.0,
		0.0,
		3.0,
		-1.0,
		8.0,
		0.0,
		1.0,
		2.0,
		2.0,
		-1.0,
		6.0,
		0.0
	]);
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zppsv( 'upper', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( new Float64Array( ap.buffer, ap.byteOffset, 12 ) ), tc.ap, 1e-14, 'ap' ); // eslint-disable-line max-len
});

test( 'zppsv: 3x3 lower, 1 RHS', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = _3x3_lower_1rhs;
	ap = c128([
		10.0,
		0.0,
		3.0,
		1.0,
		1.0,
		-2.0,
		8.0,
		0.0,
		2.0,
		1.0,
		6.0,
		0.0
	]);
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zppsv( 'lower', 3, 1, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( new Float64Array( ap.buffer, ap.byteOffset, 12 ) ), tc.ap, 1e-14, 'ap' ); // eslint-disable-line max-len
});

test( 'zppsv: 3x3 lower, 2 RHS', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = _3x3_lower_2rhs;
	ap = c128([
		10.0,
		0.0,
		3.0,
		1.0,
		1.0,
		-2.0,
		8.0,
		0.0,
		2.0,
		1.0,
		6.0,
		0.0
	]);
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
	info = zppsv( 'lower', 3, 2, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 12 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
});

test( 'zppsv: not HPD (info > 0), upper', function t() {
	var info;
	var ap;
	var b;

	ap = c128([
		1.0,
		0.0,
		2.0,
		1.0,
		1.0,
		0.0
	]);
	b = c128( [ 1.0, 0.0, 2.0, 0.0 ] );
	info = zppsv( 'upper', 2, 1, ap, 1, 0, b, 1, 2, 0 );
	assert.equal( info, 2 );
});

test( 'zppsv: N=0 quick return', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 1.0, 0.0 ] );
	b = c128( [ 1.0, 0.0 ] );
	info = zppsv( 'lower', 0, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zppsv: NRHS=0 quick return', function t() {
	var info;
	var ap;
	var b;

	ap = c128( [ 5.0, 0.0 ] );
	b = c128( [ 1.0, 0.0 ] );
	info = zppsv( 'lower', 1, 0, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zppsv: N=1 lower', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = n_one_lower;
	ap = c128( [ 4.0, 0.0 ] );
	b = c128( [ 8.0, 4.0 ] );
	info = zppsv( 'lower', 1, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 2 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( new Float64Array( ap.buffer, ap.byteOffset, 2 ) ), tc.ap, 1e-14, 'ap' ); // eslint-disable-line max-len
});

test( 'zppsv: N=1 upper', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = n_one_upper;
	ap = c128( [ 9.0, 0.0 ] );
	b = c128( [ 27.0, -9.0 ] );
	info = zppsv( 'upper', 1, 1, ap, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 2 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( new Float64Array( ap.buffer, ap.byteOffset, 2 ) ), tc.ap, 1e-14, 'ap' ); // eslint-disable-line max-len
});

test( 'zppsv: 3x3 upper, 2 RHS', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = _3x3_upper_2rhs;
	ap = c128([
		10.0,
		0.0,
		3.0,
		-1.0,
		8.0,
		0.0,
		1.0,
		2.0,
		2.0,
		-1.0,
		6.0,
		0.0
	]);
	b = c128([
		1.0,
		1.0,
		2.0,
		-1.0,
		3.0,
		0.5,
		5.0,
		-2.0,
		-1.0,
		3.0,
		4.0,
		1.0
	]);
	info = zppsv( 'upper', 3, 2, ap, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 12 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
	assertArrayClose( toArray( new Float64Array( ap.buffer, ap.byteOffset, 12 ) ), tc.ap, 1e-14, 'ap' ); // eslint-disable-line max-len
});

test( 'zppsv: works with non-zero AP offset', function t() {
	var apRaw;
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = _3x3_upper_1rhs;
	apRaw = [ 99.0, 99.0, 77.0, 77.0 ].concat([
		10.0,
		0.0,
		3.0,
		-1.0,
		8.0,
		0.0,
		1.0,
		2.0,
		2.0,
		-1.0,
		6.0,
		0.0
	]);
	ap = c128( apRaw );
	b = c128( [ 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zppsv( 'upper', 3, 1, ap, 1, 2, b, 1, 3, 0 );
	assert.equal( info, 0 );
	bv = toArray( new Float64Array( b.buffer, b.byteOffset, 6 ) );
	assertArrayClose( bv, tc.b, 1e-14, 'b' );
});

test( 'zppsv: works with non-zero B offset', function t() {
	var info;
	var tc;
	var ap;
	var bv;
	var b;

	tc = _3x3_lower_1rhs;
	ap = c128([
		10.0,
		0.0,
		3.0,
		1.0,
		1.0,
		-2.0,
		8.0,
		0.0,
		2.0,
		1.0,
		6.0,
		0.0
	]);
	b = c128( [ 99.0, 99.0, 77.0, 77.0, 1.0, 1.0, 2.0, -1.0, 3.0, 0.5 ] );
	info = zppsv( 'lower', 3, 1, ap, 1, 0, b, 1, 3, 2 );
	assert.equal( info, 0 );
	bv = new Float64Array( b.buffer, b.byteOffset, 10 );
	assert.equal( bv[ 0 ], 99.0 );
	assert.equal( bv[ 1 ], 99.0 );
	assert.equal( bv[ 2 ], 77.0 );
	assert.equal( bv[ 3 ], 77.0 );
	assertArrayClose( toArray( bv ).slice( 4 ), tc.b, 1e-14, 'b' );
});
