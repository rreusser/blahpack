// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zspr from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import upper_stride_2 from './fixtures/upper_stride_2.json' with { type: 'json' };
import zero_element from './fixtures/zero_element.json' with { type: 'json' };
import lower_stride_2 from './fixtures/lower_stride_2.json' with { type: 'json' };
import complex_alpha_upper from './fixtures/complex_alpha_upper.json' with { type: 'json' };
import complex_alpha_lower from './fixtures/complex_alpha_lower.json' with { type: 'json' };
import upper_neg_stride from './fixtures/upper_neg_stride.json' with { type: 'json' };
import lower_zero_element from './fixtures/lower_zero_element.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zspr is a function', function t() {
	assert.strictEqual( typeof zspr, 'function' );
});

test( 'zspr: upper_basic (uplo=upper, N=3, alpha=(2,0), unit stride)', function t() {
	var tc = upper_basic;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, 1.0, 4.0, -0.5,
		3.0, -2.0, 2.0, 1.0, 5.0, 0.3
	] );
	var x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'upper', 3, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: lower_basic (uplo=lower, N=3, alpha=(2,0), unit stride)', function t() {
	var tc = lower_basic;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, -1.0, 3.0, 2.0,
		4.0, -0.5, 2.0, -1.0, 5.0, 0.3
	] );
	var x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'lower', 3, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: alpha_zero (alpha=(0,0), no-op)', function t() {
	var tc = alpha_zero;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, 1.0, 4.0, -0.5,
		3.0, -2.0, 2.0, 1.0, 5.0, 0.3
	] );
	var x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	var alpha = new Complex128( 0.0, 0.0 );

	var result = zspr( 'upper', 3, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: n_zero (N=0 quick return)', function t() {
	var tc = n_zero;
	var AP = new Complex128Array( [ 99.0, 1.0 ] );
	var x = new Complex128Array( [ 1.0, 0.5 ] );
	var alpha = new Complex128( 1.0, 0.0 );

	var result = zspr( 'upper', 0, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: scalar (N=1, alpha=(1.5, 0.5))', function t() {
	var tc = scalar;
	var AP = new Complex128Array( [ 3.0, 1.0 ] );
	var x = new Complex128Array( [ 2.0, 1.0 ] );
	var alpha = new Complex128( 1.5, 0.5 );

	var result = zspr( 'upper', 1, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: upper_stride_2 (uplo=upper, N=3, strideX=2)', function t() {
	var tc = upper_stride_2;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, 1.0, 4.0, -0.5,
		3.0, -2.0, 2.0, 1.0, 5.0, 0.3
	] );
	// x with stride 2 in complex elements:
	// x(0) = (1, 0.5), x(2) = (2, -1), x(4) = (3, 1)
	var x = new Complex128Array( [
		1.0, 0.5, 0.0, 0.0,
		2.0, -1.0, 0.0, 0.0,
		3.0, 1.0, 0.0, 0.0
	] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'upper', 3, alpha, x, 2, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: zero_element (x[1]=0, exercises skip branch)', function t() {
	var tc = zero_element;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, 1.0, 4.0, -0.5,
		3.0, -2.0, 2.0, 1.0, 5.0, 0.3
	] );
	// x = [(1,0.5), (0,0), (3,1)]
	var x = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 3.0, 1.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'upper', 3, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: lower_stride_2 (uplo=lower, N=3, strideX=2)', function t() {
	var tc = lower_stride_2;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, -1.0, 3.0, 2.0,
		4.0, -0.5, 2.0, -1.0, 5.0, 0.3
	] );
	var x = new Complex128Array( [
		1.0, 0.5, 0.0, 0.0,
		2.0, -1.0, 0.0, 0.0,
		3.0, 1.0, 0.0, 0.0
	] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'lower', 3, alpha, x, 2, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: complex_alpha_upper (alpha=(1,2), N=2, upper)', function t() {
	var tc = complex_alpha_upper;
	var AP = new Complex128Array( [
		1.0, 0.0, 0.0, 0.0, 1.0, 0.0
	] );
	var x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	var alpha = new Complex128( 1.0, 2.0 );

	var result = zspr( 'upper', 2, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: complex_alpha_lower (alpha=(1,2), N=2, lower)', function t() {
	var tc = complex_alpha_lower;
	var AP = new Complex128Array( [
		1.0, 0.0, 0.0, 0.0, 1.0, 0.0
	] );
	var x = new Complex128Array( [ 1.0, 0.0, 0.0, 1.0 ] );
	var alpha = new Complex128( 1.0, 2.0 );

	var result = zspr( 'lower', 2, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: upper_neg_stride (uplo=upper, N=3, strideX=-1)', function t() {
	var tc = upper_neg_stride;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, 1.0, 4.0, -0.5,
		3.0, -2.0, 2.0, 1.0, 5.0, 0.3
	] );
	var x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'upper', 3, alpha, x, -1, 2, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: lower_zero_element (lower, x[0]=0)', function t() {
	var tc = lower_zero_element;
	var AP = new Complex128Array( [
		2.0, 0.5, 1.0, -1.0, 3.0, 2.0,
		4.0, -0.5, 2.0, -1.0, 5.0, 0.3
	] );
	var x = new Complex128Array( [ 0.0, 0.0, 2.0, -1.0, 3.0, 1.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	var result = zspr( 'lower', 3, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
	var APv = reinterpret( AP, 0 );
	assertArrayClose( Array.from( APv ), tc.AP, 1e-14, 'AP' );
});

test( 'zspr: returns AP', function t() {
	var AP = new Complex128Array( [ 1.0, 0.0 ] );
	var x = new Complex128Array( [ 1.0, 0.0 ] );
	var alpha = new Complex128( 1.0, 0.0 );
	var result = zspr( 'upper', 1, alpha, x, 1, 0, AP, 1, 0 );
	assert.strictEqual( result, AP );
});

test( 'zspr: all zero x leaves AP unchanged (upper)', function t() {
	var AP = new Complex128Array( [
		1.0, 0.5, 2.0, 1.0, 3.0, 0.7,
		4.0, 0.3, 5.0, 0.2, 6.0, 0.9
	] );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	zspr( 'upper', 3, alpha, x, 1, 0, AP, 1, 0 );

	var APv = reinterpret( AP, 0 );

	// Unlike zhpr, zspr does NOT force diagonal imaginary to zero.
	// All elements remain unchanged when x is all zero.
	assert.strictEqual( APv[ 0 ], 1.0 );
	assert.strictEqual( APv[ 1 ], 0.5 ); // imaginary preserved
	assert.strictEqual( APv[ 2 ], 2.0 );
	assert.strictEqual( APv[ 3 ], 1.0 );
	assert.strictEqual( APv[ 4 ], 3.0 );
	assert.strictEqual( APv[ 5 ], 0.7 ); // imaginary preserved
	assert.strictEqual( APv[ 6 ], 4.0 );
	assert.strictEqual( APv[ 7 ], 0.3 );
	assert.strictEqual( APv[ 8 ], 5.0 );
	assert.strictEqual( APv[ 9 ], 0.2 );
	assert.strictEqual( APv[ 10 ], 6.0 );
	assert.strictEqual( APv[ 11 ], 0.9 ); // imaginary preserved
});

test( 'zspr: all zero x leaves AP unchanged (lower)', function t() {
	var AP = new Complex128Array( [
		1.0, 0.5, 2.0, 1.0, 3.0, 0.7,
		4.0, 0.3, 5.0, 0.2, 6.0, 0.9
	] );
	var x = new Complex128Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	var alpha = new Complex128( 2.0, 0.0 );

	zspr( 'lower', 3, alpha, x, 1, 0, AP, 1, 0 );

	var APv = reinterpret( AP, 0 );

	// All elements remain unchanged (no diagonal zeroing like zhpr):
	assert.strictEqual( APv[ 0 ], 1.0 );
	assert.strictEqual( APv[ 1 ], 0.5 );
	assert.strictEqual( APv[ 2 ], 2.0 );
	assert.strictEqual( APv[ 3 ], 1.0 );
	assert.strictEqual( APv[ 4 ], 3.0 );
	assert.strictEqual( APv[ 5 ], 0.7 );
	assert.strictEqual( APv[ 6 ], 4.0 );
	assert.strictEqual( APv[ 7 ], 0.3 );
	assert.strictEqual( APv[ 8 ], 5.0 );
	assert.strictEqual( APv[ 9 ], 0.2 );
	assert.strictEqual( APv[ 10 ], 6.0 );
	assert.strictEqual( APv[ 11 ], 0.9 );
});

test( 'zspr: offset support for x and AP', function t() {
	// Test with non-zero offsets (in complex elements)
	var AP = new Complex128Array( [
		999.0, 999.0,      // padding (1 complex element)
		3.0, 1.0            // AP(0,0) = (3,1)
	] );
	var x = new Complex128Array( [
		999.0, 999.0,       // padding (1 complex element)
		2.0, 1.0            // x(0) = (2,1)
	] );
	var alpha = new Complex128( 1.5, 0.5 );

	zspr( 'upper', 1, alpha, x, 1, 1, AP, 1, 1 );

	var APv = reinterpret( AP, 0 );

	// AP(0,0) += alpha * x(0) * x(0)
	// alpha * x(0) = (1.5+0.5i)*(2+i) = (3+1.5i+i+0.5i^2) = (2.5+2.5i)
	// x(0) * temp = (2+i)*(2.5+2.5i) = (5+5i+2.5i+2.5i^2) = (2.5+7.5i)
	// AP(0,0) = (3+i) + (2.5+7.5i) = (5.5+8.5i)
	assert.strictEqual( APv[ 0 ], 999.0 ); // padding untouched
	assert.strictEqual( APv[ 1 ], 999.0 );
	assertClose( APv[ 2 ], 5.5, 1e-14, 'AP[0] real' );
	assertClose( APv[ 3 ], 8.5, 1e-14, 'AP[0] imag' );
});
