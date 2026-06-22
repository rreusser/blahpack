/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeru from './../lib/ndarray.js';

// FIXTURES //

import basic_2x3 from './fixtures/basic_2x3.json' with { type: 'json' };
import alpha_2_neg1 from './fixtures/alpha_2_neg1.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import stride_2 from './fixtures/stride_2.json' with { type: 'json' };
import neg_incy from './fixtures/neg_incy.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };

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

test( 'zgeru: main export is a function', function t() {
	assert.strictEqual( typeof zgeru, 'function' );
});

test( 'zgeru: basic 2x3 rank-1 update', function t() {
	var tc = basic_2x3;

	// A = 2x3 col-major, x = 2-elem, y = 3-elem, alpha = (1,0)
	var A = new Complex128Array([
		1,
		2,
		7,
		8,    // col 1: A(1,1)=1+2i, A(2,1)=7+8i
		3,
		4,
		9,
		10,   // col 2: A(1,2)=3+4i, A(2,2)=9+10i
		5,
		6,
		11,
		12   // col 3: A(1,3)=5+6i, A(2,3)=11+12i
	]);
	var x = new Complex128Array( [ 1, 1, 2, 2 ] );
	var y = new Complex128Array( [ 1, 0, 0, 1, 1, 1 ] );

	zgeru( 2, 3, new Complex128( 1, 0 ), x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: alpha = (2, -1)', function t() {
	var tc = alpha_2_neg1;

	// A = 2x2 identity, x = [(1,2), (3,4)], y = [(2,1), (1,-1)]
	var A = new Complex128Array([
		1,
		0,
		0,
		0,   // col 1
		0,
		0,
		1,
		0    // col 2
	]);
	var x = new Complex128Array( [ 1, 2, 3, 4 ] );
	var y = new Complex128Array( [ 2, 1, 1, -1 ] );

	zgeru( 2, 2, new Complex128( 2, -1 ), x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: alpha = 0 (no update)', function t() {
	var tc = alpha_zero;
	var A = new Complex128Array([
		5,
		6,
		7,
		8,

		// Note: the fixture has 8 doubles for a 2x2 matrix, but the alpha_zero test

		// In Fortran only prints the first column since M=2 N=2. Let me check.
		7,
		-1,
		16,
		-5
	]);
	var x = new Complex128Array( [ 1, 1, 2, 2 ] );
	var y = new Complex128Array( [ 3, 3, 4, 4 ] );

	zgeru( 2, 2, new Complex128( 0, 0 ), x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: N=0 quick return', function t() {
	var tc = n_zero;
	var A = new Complex128Array( [ 5, 6 ] );
	var x = new Complex128Array( [ 1, 1, 2, 2 ] );
	var y = new Complex128Array( [ 3, 3 ] );

	zgeru( 2, 0, new Complex128( 1, 0 ), x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: M=0 quick return', function t() {
	var tc = m_zero;
	var A = new Complex128Array( [ 5, 6 ] );
	var x = new Complex128Array( [ 1, 1 ] );
	var y = new Complex128Array( [ 3, 3, 4, 4 ] );

	zgeru( 0, 2, new Complex128( 1, 0 ), x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: non-unit strides (incx=2, incy=2)', function t() {
	var tc = stride_2;

	// x stored: [(1,0), (99,99), (0,1)], stride 2 picks elements 0 and 2

	// y stored: [(2,0), (88,88), (0,2)], stride 2 picks elements 0 and 2
	var A = new Complex128Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	var x = new Complex128Array( [ 1, 0, 99, 99, 0, 1 ] );
	var y = new Complex128Array( [ 2, 0, 88, 88, 0, 2 ] );

	zgeru( 2, 2, new Complex128( 1, 0 ), x, 2, 0, y, 2, 0, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: negative stride incy=-1', function t() {
	var tc = neg_incy;

	// x = [(1,1), (2,0)], y = [(3,0), (0,3)], incy=-1 reads y in reverse
	var A = new Complex128Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	var x = new Complex128Array( [ 1, 1, 2, 0 ] );
	var y = new Complex128Array( [ 3, 0, 0, 3 ] );

	// In Fortran incy=-1, so y is read backward.

	// In our base.js convention, we pass offset = N-1 = 1, stride = -1
	zgeru( 2, 2, new Complex128( 1, 0 ), x, 1, 0, y, -1, 1, A, 1, 2, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: 1x1 matrix', function t() {
	var tc = one_by_one;
	var A = new Complex128Array( [ 1, 1 ] );
	var x = new Complex128Array( [ 2, 3 ] );
	var y = new Complex128Array( [ 4, 5 ] );

	zgeru( 1, 1, new Complex128( 1, 0 ), x, 1, 0, y, 1, 0, A, 1, 1, 0 );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zgeru: y element zero skips column update', function t() {
	var Av;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		1,
		2,
		3,
		4,   // col 1
		5,
		6,
		7,
		8    // col 2
	]);
	x = new Complex128Array( [ 10, 20, 30, 40 ] );
	y = new Complex128Array( [ 0, 0, 1, 0 ] );
	zgeru( 2, 2, new Complex128( 1, 0 ), x, 1, 0, y, 1, 0, A, 1, 2, 0 );
	Av = toArray( reinterpret( A, 0 ) );
	assertClose( Av[ 0 ], 1, 1e-14, 'A[0,0] re' );
	assertClose( Av[ 1 ], 2, 1e-14, 'A[0,0] im' );
	assertClose( Av[ 2 ], 3, 1e-14, 'A[1,0] re' );
	assertClose( Av[ 3 ], 4, 1e-14, 'A[1,0] im' );
	assertClose( Av[ 4 ], 15, 1e-14, 'A[0,1] re' );
	assertClose( Av[ 5 ], 26, 1e-14, 'A[0,1] im' );
	assertClose( Av[ 6 ], 37, 1e-14, 'A[1,1] re' );
	assertClose( Av[ 7 ], 48, 1e-14, 'A[1,1] im' );
});

test( 'zgeru: offset support', function t() {
	var Av;
	var A;
	var x;
	var y;

	A = new Complex128Array([
		99,
		99,        // garbage at index 0
		0,
		0,
		0,
		0,   // actual 1x2 col-major matrix starts at index 1
		0,
		0
	]);
	x = new Complex128Array( [ 88, 88, 2, 3 ] );
	y = new Complex128Array( [ 77, 77, 4, 5, 6, 7 ] );
	zgeru( 1, 2, new Complex128( 1, 0 ), x, 1, 1, y, 1, 1, A, 1, 1, 1 );
	Av = toArray( reinterpret( A, 0 ) );
	assertClose( Av[ 0 ], 99, 1e-14, 'garbage re' );
	assertClose( Av[ 1 ], 99, 1e-14, 'garbage im' );
	assertClose( Av[ 2 ], -7, 1e-14, 'A[0,0] re' );
	assertClose( Av[ 3 ], 22, 1e-14, 'A[0,0] im' );
	assertClose( Av[ 4 ], -9, 1e-14, 'A[0,1] re' );
	assertClose( Av[ 5 ], 32, 1e-14, 'A[0,1] im' );
});
