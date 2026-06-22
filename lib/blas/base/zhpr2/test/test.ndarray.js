/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpr2 from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import complex_alpha from './fixtures/complex_alpha.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };
import zero_elements from './fixtures/zero_elements.json' with { type: 'json' };
import lower_stride_2 from './fixtures/lower_stride_2.json' with { type: 'json' };

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
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

// TESTS //

test( 'zhpr2 is a function', function t() {
	assert.strictEqual( typeof zhpr2, 'function' );
});

test( 'zhpr2: upper triangle, N=3, alpha=(1,0)', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = upper_basic;
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, 1.0, 4.0, 0.0, 3.0, -2.0, 2.0, 1.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	y = new Complex128Array( [ 0.5, 1.0, 1.5, -0.5, 2.5, 0.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'upper', 3, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: lower triangle, N=3, alpha=(1,0)', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = lower_basic;
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, -1.0, 3.0, 2.0, 4.0, 0.0, 2.0, -1.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	y = new Complex128Array( [ 0.5, 1.0, 1.5, -0.5, 2.5, 0.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'lower', 3, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: complex alpha=(2,1)', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = complex_alpha;
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, 1.0, 4.0, 0.0, 3.0, -2.0, 2.0, 1.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	y = new Complex128Array( [ 0.5, 1.0, 1.5, -0.5, 2.5, 0.0 ] );
	alpha = new Complex128( 2.0, 1.0 );
	zhpr2( 'upper', 3, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: alpha=0 is a no-op', function t() {
	var expected;
	var alpha;
	var ap;
	var rv;
	var x;
	var y;

	expected = [ 2.0, 0.0, 1.0, 1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, 1.0, 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 2.0, -1.0, 3.0, 1.0 ] );
	y = new Complex128Array( [ 0.5, 1.0, 1.5, -0.5, 2.5, 0.0 ] );
	alpha = new Complex128( 0.0, 0.0 );
	zhpr2( 'upper', 3, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, expected, 1e-14, 'AP' );
});

test( 'zhpr2: N=0 quick return', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = n_zero;
	ap = new Complex128Array( [ 99.0, 0.0 ] );
	x = new Complex128Array( [ 1.0, 0.5 ] );
	y = new Complex128Array( [ 0.5, 1.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'upper', 0, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: N=1 scalar case', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = scalar;
	ap = new Complex128Array( [ 3.0, 0.0 ] );
	x = new Complex128Array( [ 2.0, 1.0 ] );
	y = new Complex128Array( [ 1.0, -0.5 ] );
	alpha = new Complex128( 1.0, 0.5 );
	zhpr2( 'upper', 1, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: non-unit stride (incx=2, incy=2)', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = stride_2;
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, 1.0, 4.0, 0.0, 3.0, -2.0, 2.0, 1.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 2.0, -1.0, 0.0, 0.0, 3.0, 1.0 ] ); // eslint-disable-line max-len
	y = new Complex128Array( [ 0.5, 1.0, 0.0, 0.0, 1.5, -0.5, 0.0, 0.0, 2.5, 0.0 ] ); // eslint-disable-line max-len
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'upper', 3, alpha, x, 2, 0, y, 2, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: zero elements in x and y', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = zero_elements;
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, 1.0, 4.0, 0.0, 3.0, -2.0, 2.0, 1.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 3.0, 1.0 ] );
	y = new Complex128Array( [ 0.5, 1.0, 0.0, 0.0, 2.5, 0.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'upper', 3, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});

test( 'zhpr2: lower triangle with zero elements in x and y', function t() {
	var alpha;
	var ap;
	var rv;
	var x;
	var y;

	ap = new Complex128Array( [ 2.0, 0.5, 1.0, -1.0, 3.0, 2.0, 4.0, 0.3, 2.0, -1.0, 5.0, 0.1 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 3.0, 1.0 ] );
	y = new Complex128Array( [ 0.5, 1.0, 0.0, 0.0, 2.5, 0.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'lower', 3, alpha, x, 1, 0, y, 1, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assert.ok( Math.abs( rv[0] - 4.0 ) < 1e-14, 'ap[0,0] real' );
	assert.ok( Math.abs( rv[1] - 0.0 ) < 1e-14, 'ap[0,0] imag' );
	assert.ok( Math.abs( rv[7] - 0.0 ) < 1e-14, 'ap[1,1] imag forced to 0' );
	assert.ok( Math.abs( rv[11] - 0.0 ) < 1e-14, 'ap[2,2] imag' );
});

test( 'zhpr2: lower triangle with non-unit stride', function t() {
	var alpha;
	var tc;
	var ap;
	var rv;
	var x;
	var y;

	tc = lower_stride_2;
	ap = new Complex128Array( [ 2.0, 0.0, 1.0, -1.0, 3.0, 2.0, 4.0, 0.0, 2.0, -1.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	x = new Complex128Array( [ 1.0, 0.5, 0.0, 0.0, 2.0, -1.0, 0.0, 0.0, 3.0, 1.0 ] ); // eslint-disable-line max-len
	y = new Complex128Array( [ 0.5, 1.0, 0.0, 0.0, 1.5, -0.5, 0.0, 0.0, 2.5, 0.0 ] ); // eslint-disable-line max-len
	alpha = new Complex128( 1.0, 0.0 );
	zhpr2( 'lower', 3, alpha, x, 2, 0, y, 2, 0, ap, 1, 0 );
	rv = reinterpret( ap, 0 );
	assertArrayClose( rv, tc.AP, 1e-14, 'AP' );
});
