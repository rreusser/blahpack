// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlartv from './../lib/index.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import non_unit_stride from './fixtures/non_unit_stride.json' with { type: 'json' };
import identity from './fixtures/identity.json' with { type: 'json' };
import swap from './fixtures/swap.json' with { type: 'json' };
import imag_s from './fixtures/imag_s.json' with { type: 'json' };
import mixed_strides from './fixtures/mixed_strides.json' with { type: 'json' };

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

// TESTS //

test( 'zlartv: main export is a function', function t() {
	assert.strictEqual( typeof zlartv, 'function' );
});

test( 'zlartv: attached to the main export is an `ndarray` method', function t() {
	assert.strictEqual( typeof zlartv.ndarray, 'function' );
});

test( 'zlartv: basic', function t() {
	const tc = basic;
	const x = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	const y = new Complex128Array( [ 9, 10, 11, 12, 13, 14, 15, 16 ] );
	const c = new Float64Array( [ 0.8, 0.6, 0.5, 0.0 ] );
	const s = new Complex128Array( [ 0.6, 0.0, 0.0, 0.8, 0.5, 0.5, 1.0, 0.0 ] );

	zlartv.ndarray( 4, x, 1, 0, y, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: n_zero', function t() {
	const tc = n_zero;
	const x = new Complex128Array( [ 1, 2 ] );
	const y = new Complex128Array( [ 3, 4 ] );
	const c = new Float64Array( [ 0.5 ] );
	const s = new Complex128Array( [ 0.8, 0.1 ] );

	zlartv.ndarray( 0, x, 1, 0, y, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: n_one', function t() {
	const tc = n_one;
	const x = new Complex128Array( [ 3, 4 ] );
	const y = new Complex128Array( [ 5, 6 ] );
	const c = new Float64Array( [ 0.6 ] );
	const s = new Complex128Array( [ 0.8, 0.0 ] );

	zlartv.ndarray( 1, x, 1, 0, y, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: non_unit_stride', function t() {
	const tc = non_unit_stride;
	const x = new Complex128Array( [ 1, 2, 0, 0, 3, 4, 0, 0, 5, 6 ] );
	const y = new Complex128Array( [ 7, 8, 0, 0, 9, 10, 0, 0, 11, 12 ] );
	const c = new Float64Array( [ 0.8, 0, 0.6, 0, 0.5 ] );
	const s = new Complex128Array( [ 0.6, 0.1, 0, 0, 0.5, 0.3, 0, 0, 0.7, 0.2 ] );

	zlartv.ndarray( 3, x, 2, 0, y, 2, 0, c, 2, 0, s, 2, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: identity', function t() {
	const tc = identity;
	const x = new Complex128Array( [ 10, 20, 30, 40, 50, 60 ] );
	const y = new Complex128Array( [ 70, 80, 90, 100, 110, 120 ] );
	const c = new Float64Array( [ 1, 1, 1 ] );
	const s = new Complex128Array( [ 0, 0, 0, 0, 0, 0 ] );

	zlartv.ndarray( 3, x, 1, 0, y, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: swap', function t() {
	const tc = swap;
	const x = new Complex128Array( [ 1, 2, 3, 4 ] );
	const y = new Complex128Array( [ 5, 6, 7, 8 ] );
	const c = new Float64Array( [ 0, 0 ] );
	const s = new Complex128Array( [ 1, 0, 1, 0 ] );

	zlartv.ndarray( 2, x, 1, 0, y, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: imag_s', function t() {
	const tc = imag_s;
	const x = new Complex128Array( [ 1, 0, 0, 1 ] );
	const y = new Complex128Array( [ 0, 1, 1, 0 ] );
	const c = new Float64Array( [ 0, 0 ] );
	const s = new Complex128Array( [ 0, 1, 0, 1 ] );

	zlartv.ndarray( 2, x, 1, 0, y, 1, 0, c, 1, 0, s, 1, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});

test( 'zlartv: mixed_strides', function t() {
	const tc = mixed_strides;
	const x = new Complex128Array( [ 2, 1, 4, 3 ] );
	const y = new Complex128Array( [ 6, 5, 0, 0, 0, 0, 8, 7 ] );
	const c = new Float64Array( [ 0.8, 0, 0.6 ] );
	const s = new Complex128Array( [ 0.6, 0.1, 0, 0, 0.8, 0.2 ] );

	zlartv.ndarray( 2, x, 1, 0, y, 3, 0, c, 2, 0, s, 2, 0 );

	assertArrayClose( Array.from( reinterpret( x, 0 ) ), tc.x, 1e-14, 'x' );
	assertArrayClose( Array.from( reinterpret( y, 0 ) ), tc.y, 1e-14, 'y' );
});
