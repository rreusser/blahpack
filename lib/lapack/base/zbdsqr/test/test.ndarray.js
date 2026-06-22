/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zbdsqr from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4_values_only from './fixtures/upper_4x4_values_only.json' with { type: 'json' };
import upper_3x3_with_vt from './fixtures/upper_3x3_with_vt.json' with { type: 'json' };
import upper_3x3_with_vt_and_u from './fixtures/upper_3x3_with_vt_and_u.json' with { type: 'json' };
import lower_3x3_values_only from './fixtures/lower_3x3_values_only.json' with { type: 'json' };
import lower_3x3_with_u from './fixtures/lower_3x3_with_u.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import upper_2x2_with_vectors from './fixtures/upper_2x2_with_vectors.json' with { type: 'json' };
import n_1_neg_with_vt from './fixtures/n_1_neg_with_vt.json' with { type: 'json' };
import upper_3x3_with_c from './fixtures/upper_3x3_with_c.json' with { type: 'json' };
import upper_4x4_idir2 from './fixtures/upper_4x4_idir2.json' with { type: 'json' };
import upper_3x3_zero_shift from './fixtures/upper_3x3_zero_shift.json' with { type: 'json' };
import lower_3x3_with_c from './fixtures/lower_3x3_with_c.json' with { type: 'json' };
import upper_3x3_idir2_with_vectors from './fixtures/upper_3x3_idir2_with_vectors.json' with { type: 'json' };
import upper_3x3_negative_d from './fixtures/upper_3x3_negative_d.json' with { type: 'json' };
import nearly_diagonal from './fixtures/nearly_diagonal.json' with { type: 'json' };
import lower_3x3_with_vt_and_u from './fixtures/lower_3x3_with_vt_and_u.json' with { type: 'json' };
import lower_3x3_all_vectors from './fixtures/lower_3x3_all_vectors.json' with { type: 'json' };
import upper_3x3_zero_d from './fixtures/upper_3x3_zero_d.json' with { type: 'json' };
import upper_3x3_zero_shift_all_vecs from './fixtures/upper_3x3_zero_shift_all_vecs.json' with { type: 'json' };
import upper_4x4_idir2_all_vecs from './fixtures/upper_4x4_idir2_all_vecs.json' with { type: 'json' };
import upper_4x4_idir1_zero_shift_all_vecs from './fixtures/upper_4x4_idir1_zero_shift_all_vecs.json' with { type: 'json' };
import upper_3x3_near_zero_shift from './fixtures/upper_3x3_near_zero_shift.json' with { type: 'json' };

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
* Creates a complex identity matrix of size n as Complex128Array.
* Column-major: stride1 = 1 (row stride in complex elements), stride2 = n.
*/
function complexIdentity( n ) {
	var out = new Complex128Array( n * n );
	var buf = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < n; i++ ) {
		// Element (i,i): real part at offset 2*(i*1 + i*n) = 2*(i + i*n)
		buf[ 2 * ( i + i * n ) ] = 1.0;
	}
	return out;
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

test( 'zbdsqr: upper_4x4_values_only', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_4x4_values_only;
	d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 4, 0, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
});

test( 'zbdsqr: upper_3x3_with_vt', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_with_vt;
	d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 0.5, 0.5 ] );
	vt = complexIdentity( 3 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
});

test( 'zbdsqr: upper_3x3_with_vt_and_u', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_with_vt_and_u;
	d = new Float64Array( [ 5.0, 3.0, 1.0 ] );
	e = new Float64Array( [ 2.0, 1.0 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
});

test( 'zbdsqr: lower_3x3_values_only', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = lower_3x3_values_only;
	d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
	e = new Float64Array( [ 1.5, 0.5 ] );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'lower', 3, 0, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
});

test( 'zbdsqr: lower_3x3_with_u', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = lower_3x3_with_u;
	d = new Float64Array( [ 4.0, 3.0, 2.0 ] );
	e = new Float64Array( [ 1.5, 0.5 ] );
	vt = new Complex128Array( 0 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'lower', 3, 0, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
});

test( 'zbdsqr: n_1', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 10 );
	tc = n_1;
	d = new Float64Array( [ -5.0 ] );
	e = new Float64Array( 0 );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 1, 0, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
});

test( 'zbdsqr: n_0', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 10 );
	tc = n_0;
	d = new Float64Array( 0 );
	e = new Float64Array( 0 );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 0, 0, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
});

test( 'zbdsqr: upper_2x2_with_vectors', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_2x2_with_vectors;
	d = new Float64Array( [ 3.0, 1.0 ] );
	e = new Float64Array( [ 2.0 ] );
	vt = complexIdentity( 2 );
	u = complexIdentity( 2 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 2, 2, 2, 0, d, 1, 0, e, 1, 0, vt, 1, 2, 0, u, 1, 2, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
});

test( 'zbdsqr: n_1_neg_with_vt', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 10 );
	tc = n_1_neg_with_vt;
	d = new Float64Array( [ -3.0 ] );
	e = new Float64Array( 0 );
	vt = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 1, 2, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
});

test( 'zbdsqr: upper_3x3_with_c', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_with_c;
	d = new Float64Array( [ 4.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 1.0, 0.5 ] );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0,
		1.0,
		1.0,   // column 0: 3 complex elements
		2.0,
		0.0,
		0.0,
		2.0,
		2.0,
		2.0    // column 1: 3 complex elements
	]);
	info = zbdsqr( 'upper', 3, 0, 0, 2, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 3, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( c, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zbdsqr: upper_4x4_idir2', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_4x4_idir2;
	d = new Float64Array( [ 0.5, 1.0, 2.0, 4.0 ] );
	e = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 4, 0, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
});

test( 'zbdsqr: upper_3x3_zero_shift', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_zero_shift;
	d = new Float64Array( [ 1.0, 1e-15, 1.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-13, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-13, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-13, 'u' );
});

test( 'zbdsqr: lower_3x3_with_c', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = lower_3x3_with_c;
	d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 0.5, 0.5 ] );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array([
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
	info = zbdsqr( 'lower', 3, 0, 0, 2, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 3, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( c, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zbdsqr: upper_3x3_idir2_with_vectors', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_idir2_with_vectors;
	d = new Float64Array( [ 0.1, 0.5, 3.0 ] );
	e = new Float64Array( [ 0.2, 0.3 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
});

test( 'zbdsqr: upper_3x3_negative_d', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_negative_d;
	d = new Float64Array( [ -3.0, 2.0, -1.0 ] );
	e = new Float64Array( [ 0.5, 0.5 ] );
	vt = complexIdentity( 3 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
});

test( 'zbdsqr: nearly_diagonal', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = nearly_diagonal;
	d = new Float64Array( [ 5.0, 3.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 1e-16, 1e-16, 1e-16 ] );
	vt = new Complex128Array( 0 );
	u = new Complex128Array( 0 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 4, 0, 0, 0, d, 1, 0, e, 1, 0, vt, 1, 1, 0, u, 1, 1, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
});

test( 'zbdsqr: lower_3x3_with_vt_and_u', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = lower_3x3_with_vt_and_u;
	d = new Float64Array( [ 3.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 0.5, 0.5 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'lower', 3, 3, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
});

test( 'zbdsqr: lower_3x3_all_vectors (VT, U, and C)', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = lower_3x3_all_vectors;
	d = new Float64Array( [ 4.0, 2.0, 1.0 ] );
	e = new Float64Array( [ 1.0, 0.5 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0,
		1.0,
		1.0,
		2.0,
		0.0,
		0.0,
		2.0,
		2.0,
		2.0
	]);
	info = zbdsqr( 'lower', 3, 3, 3, 2, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 3, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
	assertArrayClose( toArray( reinterpret( c, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zbdsqr: upper_3x3_zero_d (sminoa=0 path)', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_zero_d;
	d = new Float64Array( [ 2.0, 0.0, 3.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-13, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-13, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-13, 'u' );
});

test( 'zbdsqr: upper_3x3_zero_shift_all_vecs (zero shift with NCC > 0)', function t() { // eslint-disable-line max-len
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_zero_shift_all_vecs;
	d = new Float64Array( [ 1e-15, 1.0, 1.0 ] );
	e = new Float64Array( [ 1.0, 1.0 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0,
		1.0,
		1.0,
		2.0,
		0.0,
		0.0,
		2.0,
		2.0,
		2.0
	]);
	info = zbdsqr( 'upper', 3, 3, 3, 2, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 3, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-13, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-13, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-13, 'u' );
	assertArrayClose( toArray( reinterpret( c, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zbdsqr: upper_4x4_idir2_all_vecs (idir=2 with NCC > 0)', function t() {
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var n;
	var u;
	var c;

	rwork = new Float64Array( 80 );
	tc = upper_4x4_idir2_all_vecs;
	d = new Float64Array( [ 0.5, 1.0, 2.0, 4.0 ] );
	e = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	n = 4;
	vt = complexIdentity( n );
	u = complexIdentity( n );
	c = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0,
		1.0,
		1.0,
		0.5,
		0.5,
		2.0,
		0.0,
		0.0,
		2.0,
		2.0,
		2.0,
		1.0,
		0.0
	]);
	info = zbdsqr( 'upper', n, n, n, 2, d, 1, 0, e, 1, 0, vt, 1, n, 0, u, 1, n, 0, c, 1, n, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-14, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-14, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-14, 'u' );
	assertArrayClose( toArray( reinterpret( c, 0 ) ), tc.c, 1e-14, 'c' );
});

test( 'zbdsqr: upper_4x4_idir1_zero_shift_all_vecs (idir=1 zero shift + NCC)', function t() { // eslint-disable-line max-len
	var rwork;
	var info;
	var tc;
	var vt;
	var n;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 80 );
	n = 4;
	tc = upper_4x4_idir1_zero_shift_all_vecs;
	d = new Float64Array( [ 10.0, 1e-15, 5.0, 1.0 ] );
	e = new Float64Array( [ 0.1, 0.1, 0.1 ] );
	vt = complexIdentity( n );
	u = complexIdentity( n );
	c = new Complex128Array([
		1.0,
		0.0,
		0.0,
		1.0,
		1.0,
		1.0,
		0.5,
		0.5,
		2.0,
		0.0,
		0.0,
		2.0,
		2.0,
		2.0,
		1.0,
		0.0
	]);
	info = zbdsqr( 'upper', n, n, n, 2, d, 1, 0, e, 1, 0, vt, 1, n, 0, u, 1, n, 0, c, 1, n, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-13, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-13, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-13, 'u' );
	assertArrayClose( toArray( reinterpret( c, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zbdsqr: upper_3x3_near_zero_shift (shift negligible vs sll)', function t() { // eslint-disable-line max-len
	var rwork;
	var info;
	var tc;
	var vt;
	var d;
	var e;
	var u;
	var c;

	rwork = new Float64Array( 40 );
	tc = upper_3x3_near_zero_shift;
	d = new Float64Array( [ 1e8, 1.0, 1.0 ] );
	e = new Float64Array( [ 0.5, 0.5 ] );
	vt = complexIdentity( 3 );
	u = complexIdentity( 3 );
	c = new Complex128Array( 0 );
	info = zbdsqr( 'upper', 3, 3, 3, 0, d, 1, 0, e, 1, 0, vt, 1, 3, 0, u, 1, 3, 0, c, 1, 1, 0, rwork, 1, 0);
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( d, new Float64Array( tc.d ), 1e-10, 'd' );
	assertArrayClose( toArray( reinterpret( vt, 0 ) ), tc.vt, 1e-10, 'vt' );
	assertArrayClose( toArray( reinterpret( u, 0 ) ), tc.u, 1e-10, 'u' );
});
