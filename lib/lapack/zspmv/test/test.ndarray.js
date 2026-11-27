

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zspmv from './../lib/ndarray.js';

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };
import scalar from './fixtures/scalar.json' with { type: 'json' };
import lower_nonzero_beta from './fixtures/lower_nonzero_beta.json' with { type: 'json' };
import negative_incx from './fixtures/negative_incx.json' with { type: 'json' };
import beta_one from './fixtures/beta_one.json' with { type: 'json' };
import lower_stride2_complex_beta from './fixtures/lower_stride2_complex_beta.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// 3x3 complex symmetric matrix (packed upper):
// A = [2+i    1+i   3-2i]
//     [1+i    4-i   2+i ]
//     [3-2i   2+i   5+3i]
function upperAP() {
	return new Complex128Array( [ 2, 1, 1, 1, 4, -1, 3, -2, 2, 1, 5, 3 ] );
}

// Same matrix packed lower:
function lowerAP() {
	return new Complex128Array( [ 2, 1, 1, 1, 3, -2, 4, -1, 2, 1, 5, 3 ] );
}

function stdX() {
	return new Complex128Array( [ 1, 0.5, 2, -1, 3, 1 ] );
}

// TESTS //

test( 'zspmv is a function', function t() {
	assert.equal( typeof zspmv, 'function' );
});

test( 'zspmv: upper_basic', function t() {
	const tc = upper_basic;
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( 3 );
	const result = zspmv( 'upper', 3, new Complex128( 1, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 0, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: lower_basic', function t() {
	const tc = lower_basic;
	const ap = lowerAP();
	const x = stdX();
	const y = new Complex128Array( 3 );
	const result = zspmv( 'lower', 3, new Complex128( 1, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 0, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: complex_alpha_beta', function t() {
	const tc = complex_alpha_beta;
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5 ] );
	const result = zspmv( 'upper', 3, new Complex128( 2, 1 ), ap, 1, 0, x, 1, 0, new Complex128( 0.5, -0.5 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: alpha_zero', function t() {
	const tc = alpha_zero;
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	const result = zspmv( 'upper', 3, new Complex128( 0, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 2, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: n_zero', function t() {
	const tc = n_zero;
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( [ 99, 0 ] );
	const result = zspmv( 'upper', 0, new Complex128( 1, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 0, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: alpha_zero_beta_zero', function t() {
	const tc = alpha_zero_beta_zero;
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( [ 99, 88, 77, 66, 55, 44 ] );
	const result = zspmv( 'upper', 3, new Complex128( 0, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 0, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: stride_2', function t() {
	const tc = stride_2;
	const ap = upperAP();
	const x = new Complex128Array( [ 1, 0.5, 0, 0, 2, -1, 0, 0, 3, 1, 0, 0 ] );
	const y = new Complex128Array( 6 );
	const result = zspmv( 'upper', 3, new Complex128( 1, 0 ), ap, 1, 0, x, 2, 0, new Complex128( 0, 0 ), y, 2, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: scalar', function t() {
	const tc = scalar;
	const ap = new Complex128Array( [ 3, 2 ] );
	const x = new Complex128Array( [ 5, 2 ] );
	const y = new Complex128Array( 1 );
	const result = zspmv( 'upper', 1, new Complex128( 2, 1 ), ap, 1, 0, x, 1, 0, new Complex128( 0, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: lower_nonzero_beta', function t() {
	const tc = lower_nonzero_beta;
	const ap = lowerAP();
	const x = stdX();
	const y = new Complex128Array( [ 1, 1, 2, -1, 0.5, 0.5 ] );
	const result = zspmv( 'lower', 3, new Complex128( 1, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 0.5, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: negative_incx', function t() {
	const tc = negative_incx;
	// Fortran: x(1)=3+i, x(2)=2-i, x(3)=1+0.5i, incx=-1
	// With negative stride, start from end: elements are reversed
	const ap = upperAP();
	const x = new Complex128Array( [ 3, 1, 2, -1, 1, 0.5 ] );
	const y = new Complex128Array( 3 );
	const result = zspmv( 'upper', 3, new Complex128( 1, 0 ), ap, 1, 0, x, -1, 2, new Complex128( 0, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: beta_one', function t() {
	const tc = beta_one;
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( [ 1, 2, 3, -1, 2, 1 ] );
	const result = zspmv( 'upper', 3, new Complex128( 1, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 1, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: lower_stride2_complex_beta', function t() {
	const tc = lower_stride2_complex_beta;
	const ap = lowerAP();
	const x = new Complex128Array( [ 1, 0.5, 0, 0, 2, -1, 0, 0, 3, 1, 0, 0 ] );
	const y = new Complex128Array( [ 1, 1, 0, 0, 2, -1, 0, 0, 0.5, 0.5, 0, 0 ] );
	const result = zspmv( 'lower', 3, new Complex128( 2, 1 ), ap, 1, 0, x, 2, 0, new Complex128( 0.5, -0.5 ), y, 2, 0 );
	const view = reinterpret( result, 0 );
	assertArrayClose( Array.from( view ), tc.y, 1e-14, 'y' );
});

test( 'zspmv: alpha_zero_beta_one quick return', function t() {
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( [ 1, 2, 3, 4, 5, 6 ] );
	const result = zspmv( 'upper', 3, new Complex128( 0, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 1, 0 ), y, 1, 0 );
	const view = reinterpret( result, 0 );
	// y should be unchanged
	assertArrayClose( Array.from( view ), [ 1, 2, 3, 4, 5, 6 ], 1e-14, 'y' );
});

test( 'zspmv: returns y', function t() {
	const ap = upperAP();
	const x = stdX();
	const y = new Complex128Array( 3 );
	const result = zspmv( 'upper', 3, new Complex128( 1, 0 ), ap, 1, 0, x, 1, 0, new Complex128( 0, 0 ), y, 1, 0 );
	assert.equal( result, y );
});
