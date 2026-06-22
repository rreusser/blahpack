/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyr2k from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import alpha_zero_beta_zero from './fixtures/alpha_zero_beta_zero.json' with { type: 'json' };
import alpha_zero_beta_one from './fixtures/alpha_zero_beta_one.json' with { type: 'json' };
import lower_nonzero_beta from './fixtures/lower_nonzero_beta.json' with { type: 'json' };
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
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Common input data matching Fortran test
// A: 3x2 column-major (for trans='no-transpose') or 3x2 as K=3, N=2 (for trans='transpose') // eslint-disable-line max-len
// a(1)=(1,0.5), a(2)=(2,-1), a(3)=(3,1), a(4)=(4,2), a(5)=(5,0), a(6)=(6,-0.5)
var A_data = [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ];
var B_data = [ 0.5, 1, 1.5, -0.5, 2.5, 0, 3, 1.5, 4, -1, 5, 0.5 ];

/**
* MakeA.
*
* @private
* @returns {*} result
*/
function makeA( ) {
	return new Complex128Array( A_data );
}
/**
* MakeB.
*
* @private
* @returns {*} result
*/
function makeB( ) {
	return new Complex128Array( B_data );
}

/**
* MakeC.
*
* @private
* @param {*} n - n
* @returns {*} result
*/
function makeC( n ) {
	return new Complex128Array( n * n );
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

test( 'zsyr2k: main export is a function', function t() {
	assert.strictEqual( typeof zsyr2k, 'function' );
});

test( 'zsyr2k: upper, no-transpose', function t() {
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	var tc = upper_no_trans;
	var A = makeA();
	var B = makeB();
	var C = makeC( 3 );
	zsyr2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: lower, no-transpose', function t() {
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	var tc = lower_no_trans;
	var A = makeA();
	var B = makeB();
	var C = makeC( 3 );
	zsyr2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: upper, transpose', function t() {
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	var tc = upper_trans;
	var A = makeA();
	var B = makeB();
	var C = makeC( 2 );

	// A is 3x2 col-major (LDA=3), trans='T' means C = alpha*A^T*B + alpha*B^T*A, N=2, K=3 // eslint-disable-line max-len
	zsyr2k( 'upper', 'transpose', 2, 3, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: lower, transpose', function t() {
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	var tc = lower_trans;
	var A = makeA();
	var B = makeB();
	var C = makeC( 2 );
	zsyr2k( 'lower', 'transpose', 2, 3, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: complex alpha and beta', function t() {
	var alpha = new Complex128( 2.0, 1.0 );
	var beta = new Complex128( 0.5, -0.5 );
	var tc = complex_alpha_beta;
	var A = makeA();
	var B = makeB();
	var C = new Complex128Array([
		1.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		-1.0,
		0.5,
		0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0,
		3.0,
		-1.0
	]);
	zsyr2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: alpha=0 scales C by beta', function t() {
	var alpha = new Complex128( 0.0, 0.0 );
	var beta = new Complex128( 2.0, 0.0 );
	var tc = alpha_zero;
	var A = makeA();
	var B = makeB();
	var C = new Complex128Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0,
		7.0,
		8.0
	]);
	zsyr2k( 'upper', 'no-transpose', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: N=0 quick return', function t() {
	var result;
	var alpha;
	var beta;
	var Cv;
	var C;
	var A;
	var B;

	C = new Complex128Array( [ 99.0, 0.0 ] );
	A = makeA();
	B = makeB();
	alpha = new Complex128( 1.0, 0.0 );
	beta = new Complex128( 0.0, 0.0 );
	result = zsyr2k( 'upper', 'no-transpose', 0, 2, alpha, A, 1, 1, 0, B, 1, 1, 0, beta, C, 1, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
	Cv = reinterpret( C, 0 );
	assert.strictEqual( Cv[ 0 ], 99.0 );
	assert.strictEqual( Cv[ 1 ], 0.0 );
});

test( 'zsyr2k: alpha=0, beta=0 zeros C', function t() {
	var alpha = new Complex128( 0.0, 0.0 );
	var beta = new Complex128( 0.0, 0.0 );
	var tc = alpha_zero_beta_zero;
	var C = new Complex128Array([
		99.0,
		88.0,
		77.0,
		66.0,
		55.0,
		44.0,
		33.0,
		22.0
	]);
	var A = makeA();
	var B = makeB();
	zsyr2k( 'lower', 'no-transpose', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: alpha=0, beta=1 (no-op)', function t() {
	var result;
	var alpha;
	var beta;
	var tc;
	var C;
	var A;
	var B;

	tc = alpha_zero_beta_one;
	C = new Complex128Array([
		42.0,
		13.0,
		7.0,
		8.0,
		9.0,
		10.0,
		11.0,
		12.0
	]);
	A = makeA();
	B = makeB();
	alpha = new Complex128( 0.0, 0.0 );
	beta = new Complex128( 1.0, 0.0 );
	result = zsyr2k( 'lower', 'no-transpose', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: lower with nonzero beta', function t() {
	var alpha = new Complex128( 1.0, 0.0 );
	var beta = new Complex128( 0.5, 0.0 );
	var tc = lower_nonzero_beta;
	var A = makeA();
	var B = makeB();
	var C = new Complex128Array([
		1.0,
		1.0,
		2.0,
		-1.0,
		0.5,
		0.5,
		0.0,
		0.0,
		0.0,
		2.0,
		3.0,
		-1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	zsyr2k( 'lower', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: 1x1 scalar case', function t() {
	var alpha = new Complex128( 2.0, 1.0 );
	var beta = new Complex128( 0.0, 0.0 );
	var tc = scalar;
	var A = new Complex128Array( [ 3.0, 2.0 ] );
	var B = new Complex128Array( [ 1.0, -1.0 ] );
	var C = new Complex128Array( 1 );
	zsyr2k( 'upper', 'no-transpose', 1, 1, alpha, A, 1, 1, 0, B, 1, 1, 0, beta, C, 1, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyr2k: K=0 with alpha!=0 and beta=1 is quick return', function t() {
	var result;
	var alpha;
	var beta;
	var Cv;
	var C;
	var A;
	var B;

	C = new Complex128Array( [ 42.0, 13.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
	A = makeA();
	B = makeB();
	alpha = new Complex128( 1.0, 0.0 );
	beta = new Complex128( 1.0, 0.0 );
	result = zsyr2k( 'upper', 'no-transpose', 2, 0, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
	Cv = reinterpret( C, 0 );
	assert.strictEqual( Cv[ 0 ], 42.0 );
	assert.strictEqual( Cv[ 1 ], 13.0 );
});

test( 'zsyr2k: K=0 with beta!=1 scales C', function t() {
	var alpha;
	var beta;
	var Cv;
	var C;
	var A;
	var B;

	C = new Complex128Array( [ 2.0, 4.0, 1.0, 2.0, 3.0, 6.0, 8.0, 10.0 ] );
	A = makeA();
	B = makeB();
	alpha = new Complex128( 1.0, 0.0 );
	beta = new Complex128( 0.5, 0.0 );
	zsyr2k( 'upper', 'no-transpose', 2, 0, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 1.0, 1e-14, 'C[0,0] re' );
	assertClose( Cv[ 1 ], 2.0, 1e-14, 'C[0,0] im' );
	assertClose( Cv[ 4 ], 1.5, 1e-14, 'C[0,1] re' );
	assertClose( Cv[ 5 ], 3.0, 1e-14, 'C[0,1] im' );
	assertClose( Cv[ 6 ], 4.0, 1e-14, 'C[1,1] re' );
	assertClose( Cv[ 7 ], 5.0, 1e-14, 'C[1,1] im' );
});

test( 'zsyr2k: complex beta with alpha=0 (upper)', function t() {
	var alpha;
	var beta;
	var Cv;
	var C;
	var A;
	var B;

	C = new Complex128Array( [ 2.0, 3.0, 0.0, 0.0, 4.0, 5.0, 6.0, 7.0 ] );
	A = makeA();
	B = makeB();
	alpha = new Complex128( 0.0, 0.0 );
	beta = new Complex128( 1.0, 1.0 );
	zsyr2k( 'upper', 'no-transpose', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], -1.0, 1e-14, 'C[0,0] re' );
	assertClose( Cv[ 1 ], 5.0, 1e-14, 'C[0,0] im' );
	assertClose( Cv[ 4 ], -1.0, 1e-14, 'C[0,1] re' );
	assertClose( Cv[ 5 ], 9.0, 1e-14, 'C[0,1] im' );
	assertClose( Cv[ 6 ], -1.0, 1e-14, 'C[1,1] re' );
	assertClose( Cv[ 7 ], 13.0, 1e-14, 'C[1,1] im' );
});

test( 'zsyr2k: complex beta with alpha=0 (lower)', function t() {
	var alpha;
	var beta;
	var Cv;
	var C;
	var A;
	var B;

	C = new Complex128Array( [ 4.0, 2.0, 6.0, 8.0, 0.0, 0.0, 10.0, 12.0 ] );
	A = makeA();
	B = makeB();
	alpha = new Complex128( 0.0, 0.0 );
	beta = new Complex128( 0.5, -0.5 );
	zsyr2k( 'lower', 'no-transpose', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 3.0, 1e-14, 'C[0,0] re' );
	assertClose( Cv[ 1 ], -1.0, 1e-14, 'C[0,0] im' );
	assertClose( Cv[ 2 ], 7.0, 1e-14, 'C[1,0] re' );
	assertClose( Cv[ 3 ], 1.0, 1e-14, 'C[1,0] im' );
	assertClose( Cv[ 6 ], 11.0, 1e-14, 'C[1,1] re' );
	assertClose( Cv[ 7 ], 1.0, 1e-14, 'C[1,1] im' );
});

test( 'zsyr2k: upper, transpose with nonzero beta', function t() {
	var alpha;
	var beta;
	var Cv;
	var A;
	var B;
	var C;

	A = makeA();
	B = makeB();
	C = new Complex128Array( [ 10.0, 20.0, 0.0, 0.0, 30.0, 40.0, 50.0, 60.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	beta = new Complex128( 0.5, 0.0 );
	zsyr2k( 'upper', 'transpose', 2, 3, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 25.0, 1e-14, 'C[0,0] re' );
	assertClose( Cv[ 1 ], 12.5, 1e-14, 'C[0,0] im' );
	assertClose( Cv[ 4 ], 61.25, 1e-14, 'C[0,1] re' );
	assertClose( Cv[ 5 ], 24.75, 1e-14, 'C[0,1] im' );
	assertClose( Cv[ 6 ], 143.5, 1e-14, 'C[1,1] re' );
	assertClose( Cv[ 7 ], 45.0, 1e-14, 'C[1,1] im' );
});

test( 'zsyr2k: lower, transpose with nonzero beta', function t() {
	var alpha;
	var beta;
	var Cv;
	var A;
	var B;
	var C;

	A = makeA();
	B = makeB();
	C = new Complex128Array( [ 10.0, 20.0, 30.0, 40.0, 0.0, 0.0, 50.0, 60.0 ] );
	alpha = new Complex128( 1.0, 0.0 );
	beta = new Complex128( 0.5, 0.0 );
	zsyr2k( 'lower', 'transpose', 2, 3, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 25.0, 1e-14, 'C[0,0] re' );
	assertClose( Cv[ 1 ], 12.5, 1e-14, 'C[0,0] im' );
	assertClose( Cv[ 2 ], 61.25, 1e-14, 'C[1,0] re' );
	assertClose( Cv[ 3 ], 24.75, 1e-14, 'C[1,0] im' );
	assertClose( Cv[ 6 ], 143.5, 1e-14, 'C[1,1] re' );
	assertClose( Cv[ 7 ], 45.0, 1e-14, 'C[1,1] im' );
});

test( 'zsyr2k: alpha=0, beta=0 zeros upper C', function t() {
	var alpha;
	var beta;
	var Cv;
	var C;
	var A;
	var B;

	C = new Complex128Array([
		99.0,
		88.0,
		77.0,
		66.0,
		55.0,
		44.0,
		33.0,
		22.0
	]);
	A = makeA();
	B = makeB();
	alpha = new Complex128( 0.0, 0.0 );
	beta = new Complex128( 0.0, 0.0 );
	zsyr2k( 'upper', 'no-transpose', 2, 2, alpha, A, 1, 2, 0, B, 1, 2, 0, beta, C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 0.0, 1e-14, 'C[0,0] re' );
	assertClose( Cv[ 1 ], 0.0, 1e-14, 'C[0,0] im' );
	assertClose( Cv[ 4 ], 0.0, 1e-14, 'C[0,1] re' );
	assertClose( Cv[ 5 ], 0.0, 1e-14, 'C[0,1] im' );
	assertClose( Cv[ 6 ], 0.0, 1e-14, 'C[1,1] re' );
	assertClose( Cv[ 7 ], 0.0, 1e-14, 'C[1,1] im' );
});

test( 'zsyr2k: returns C', function t() {
	var result;
	var alpha;
	var beta;
	var A;
	var B;
	var C;

	A = makeA();
	B = makeB();
	C = makeC( 3 );
	alpha = new Complex128( 1.0, 0.0 );
	beta = new Complex128( 0.0, 0.0 );
	result = zsyr2k( 'upper', 'no-transpose', 3, 2, alpha, A, 1, 3, 0, B, 1, 3, 0, beta, C, 1, 3, 0 ); // eslint-disable-line max-len
	assert.ok( result === C );
});
