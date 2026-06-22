/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpmv from './../../ztpmv/lib/base.js';
import ztpsv from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans_nonunit from './fixtures/upper_no_trans_nonunit.json' with { type: 'json' };
import upper_trans_nonunit from './fixtures/upper_trans_nonunit.json' with { type: 'json' };
import upper_conj_trans_nonunit from './fixtures/upper_conj_trans_nonunit.json' with { type: 'json' };
import upper_no_trans_unit from './fixtures/upper_no_trans_unit.json' with { type: 'json' };
import lower_no_trans_nonunit from './fixtures/lower_no_trans_nonunit.json' with { type: 'json' };
import lower_trans_nonunit from './fixtures/lower_trans_nonunit.json' with { type: 'json' };
import lower_conj_trans_nonunit from './fixtures/lower_conj_trans_nonunit.json' with { type: 'json' };
import lower_no_trans_unit from './fixtures/lower_no_trans_unit.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import upper_stride_2 from './fixtures/upper_stride_2.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };

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
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' ); // eslint-disable-line max-len
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Upper packed AP (4x4) matching Fortran test:
// a11=(5,1), a12=(1,0.5), a22=(6,-1), a13=(0.5,0), a23=(1,-0.5), a33=(7,0.5)
// a14=(0,0), a24=(0.5,1), a34=(1,0), a44=(8,-1)
/**
* UpperAP.
*
* @private
* @returns {*} result
*/
function upperAP( ) {
	return new Complex128Array([
		5,
		1,
		1,
		0.5,
		6,
		-1,
		0.5,
		0,
		1,
		-0.5,
		7,
		0.5,
		0,
		0,
		0.5,
		1,
		1,
		0,
		8,
		-1
	]);
}

// Lower packed AP (4x4) matching Fortran test:
// a11=(5,1), a21=(1,0.5), a31=(0.5,0), a41=(0,0)
// a22=(6,-1), a32=(1,-0.5), a42=(0.5,1)
// a33=(7,0.5), a43=(1,0)
// a44=(8,-1)
/**
* LowerAP.
*
* @private
* @returns {*} result
*/
function lowerAP( ) {
	return new Complex128Array([
		5,
		1,
		1,
		0.5,
		0.5,
		0,
		0,
		0,
		6,
		-1,
		1,
		-0.5,
		0.5,
		1,
		7,
		0.5,
		1,
		0,
		8,
		-1
	]);
}

// Known solution vector: [1+0i, 2+i, 3-i, 4+0.5i]
/**
* KnownX.
*
* @private
* @returns {*} result
*/
function knownX( ) {
	return new Complex128Array( [ 1, 0, 2, 1, 3, -1, 4, 0.5 ] );
}

// FUNCTIONS //

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

test( 'ztpsv: base is a function', function t() {
	assert.strictEqual( typeof ztpsv, 'function' );
});

test( 'ztpsv: upper, no-transpose, non-unit (N=4)', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = upper_no_trans_nonunit;
	ap = upperAP();
	x = knownX();
	ztpmv( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	result = ztpsv( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: upper, transpose, non-unit (N=4)', function t() {
	var tc = upper_trans_nonunit;
	var ap = upperAP();
	var x = knownX();
	ztpmv( 'upper', 'transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'upper', 'transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: upper, conjugate-transpose, non-unit (N=4)', function t() {
	var tc = upper_conj_trans_nonunit;
	var ap = upperAP();
	var x = knownX();
	ztpmv( 'upper', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'upper', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: upper, no-transpose, unit diagonal (N=4)', function t() {
	var tc = upper_no_trans_unit;
	var ap = upperAP();
	var x = knownX();
	ztpmv( 'upper', 'no-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'upper', 'no-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: lower, no-transpose, non-unit (N=4)', function t() {
	var tc = lower_no_trans_nonunit;
	var ap = lowerAP();
	var x = knownX();
	ztpmv( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: lower, transpose, non-unit (N=4)', function t() {
	var tc = lower_trans_nonunit;
	var ap = lowerAP();
	var x = knownX();
	ztpmv( 'lower', 'transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'lower', 'transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: lower, conjugate-transpose, non-unit (N=4)', function t() {
	var tc = lower_conj_trans_nonunit;
	var ap = lowerAP();
	var x = knownX();
	ztpmv( 'lower', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'lower', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: lower, no-transpose, unit diagonal (N=4)', function t() {
	var tc = lower_no_trans_unit;
	var ap = lowerAP();
	var x = knownX();
	ztpmv( 'lower', 'no-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'lower', 'no-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: N=0 quick return', function t() {
	var result;
	var tc;
	var ap;
	var x;

	tc = n_zero;
	ap = upperAP();
	x = new Complex128Array( [ 99, 0 ] );
	result = ztpsv( 'upper', 'no-transpose', 'non-unit', 0, ap, 1, 0, x, 1, 0 );
	assert.strictEqual( result, x );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: upper, no-transpose, non-unit, strideX=2 (N=4)', function t() {
	var tc = upper_stride_2;
	var ap = upperAP();

	// x with stride 2: [(1,0), (0,0), (2,1), (0,0), (3,-1), (0,0), (4,0.5), (0,0)]
	var x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	ztpmv( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	ztpsv( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: N=1, scalar case', function t() {
	var tc = scalar;
	var ap = new Complex128Array( [ 5, 2 ] );
	var x = new Complex128Array( [ 3, -1 ] );

	// For N=1: ztpsv just divides x[0] by A[0,0] = (5+2i)

	// x[0] = (3-i) / (5+2i)
	ztpsv( 'upper', 'no-transpose', 'non-unit', 1, ap, 1, 0, x, 1, 0 );
	assertArrayClose( toArray( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
});

test( 'ztpsv: upper, transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = upperAP();
	x = knownX();
	ztpmv( 'upper', 'transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'upper', 'transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
	assertClose( xv[ 2 ], 2.0, 1e-14, 'x[2]' );
	assertClose( xv[ 3 ], 1.0, 1e-14, 'x[3]' );
});

test( 'ztpsv: lower, transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = knownX();
	ztpmv( 'lower', 'transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'lower', 'transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
	assertClose( xv[ 6 ], 4.0, 1e-14, 'x[6]' );
	assertClose( xv[ 7 ], 0.5, 1e-14, 'x[7]' );
});

test( 'ztpsv: upper, conjugate-transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = upperAP();
	x = knownX();
	ztpmv( 'upper', 'conjugate-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'upper', 'conjugate-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
	assertClose( xv[ 4 ], 3.0, 1e-14, 'x[4]' );
	assertClose( xv[ 5 ], -1.0, 1e-14, 'x[5]' );
});

test( 'ztpsv: lower, conjugate-transpose, unit diagonal (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = knownX();
	ztpmv( 'lower', 'conjugate-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	ztpsv( 'lower', 'conjugate-transpose', 'unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
	assertClose( xv[ 6 ], 4.0, 1e-14, 'x[6]' );
	assertClose( xv[ 7 ], 0.5, 1e-14, 'x[7]' );
});

test( 'ztpsv: x with all zeros remains zeros (upper, no-transpose)', function t() { // eslint-disable-line max-len
	var ap;
	var xv;
	var x;
	var i;

	ap = upperAP();
	x = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	ztpsv( 'upper', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	for ( i = 0; i < 8; i += 1 ) {
		assert.strictEqual( xv[ i ], 0.0, 'x[' + i + '] should be zero' );
	}
});

test( 'ztpsv: x with all zeros remains zeros (lower, no-transpose)', function t() { // eslint-disable-line max-len
	var ap;
	var xv;
	var x;
	var i;

	ap = lowerAP();
	x = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	ztpsv( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 1, 0 );
	xv = reinterpret( x, 0 );
	for ( i = 0; i < 8; i += 1 ) {
		assert.strictEqual( xv[ i ], 0.0, 'x[' + i + '] should be zero' );
	}
});

test( 'ztpsv: lower, no-transpose, stride 2 (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	ztpmv( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	ztpsv( 'lower', 'no-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
	assertClose( xv[ 4 ], 2.0, 1e-14, 'x[4]' );
	assertClose( xv[ 5 ], 1.0, 1e-14, 'x[5]' );
});

test( 'ztpsv: with non-zero offsetAP and offsetX', function t() {
	var result;
	var ap;
	var xv;
	var x;

	ap = new Complex128Array([
		99,
		99,
		99,
		99,
		5,
		2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	x = new Complex128Array( [ 99, 99, 3, -1 ] );
	result = ztpsv( 'upper', 'no-transpose', 'non-unit', 1, ap, 1, 2, x, 1, 1 );
	assert.strictEqual( result, x );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 2 ], 13.0 / 29.0, 1e-14, 'x real' );
	assertClose( xv[ 3 ], -11.0 / 29.0, 1e-14, 'x imag' );
});

test( 'ztpsv: upper, transpose, stride 2 (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = upperAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	ztpmv( 'upper', 'transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	ztpsv( 'upper', 'transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
});

test( 'ztpsv: lower, conjugate-transpose, stride 2 (N=4)', function t() {
	var ap;
	var xv;
	var x;

	ap = lowerAP();
	x = new Complex128Array( [ 1, 0, 0, 0, 2, 1, 0, 0, 3, -1, 0, 0, 4, 0.5, 0, 0 ] ); // eslint-disable-line max-len
	ztpmv( 'lower', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	ztpsv( 'lower', 'conjugate-transpose', 'non-unit', 4, ap, 1, 0, x, 2, 0 );
	xv = reinterpret( x, 0 );
	assertClose( xv[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( xv[ 1 ], 0.0, 1e-14, 'x[1]' );
});
