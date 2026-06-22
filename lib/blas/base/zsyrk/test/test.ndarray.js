/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyrk from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_trans from './fixtures/upper_trans.json' with { type: 'json' };
import lower_trans from './fixtures/lower_trans.json' with { type: 'json' };
import complex_alpha_beta from './fixtures/complex_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
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

test( 'zsyrk: main export is a function', function t() {
	assert.strictEqual( typeof zsyrk, 'function' );
});

test( 'zsyrk: upper_no_trans', function t() {
	var tc = upper_no_trans;

	// A is 3x2 complex (col-major: 3 rows, 2 cols), C is 3x3

	// a(1)=(1,0.5), a(2)=(2,-1), a(3)=(3,1), a(4)=(4,2), a(5)=(5,0), a(6)=(6,-0.5)
	var A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );
	var C = new Complex128Array( 9 ); // 3x3 zeroed
	zsyrk( 'upper', 'no-transpose', 3, 2, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0, 0 ), C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: lower_no_trans', function t() {
	var tc = lower_no_trans;
	var A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );
	var C = new Complex128Array( 9 );
	zsyrk( 'lower', 'no-transpose', 3, 2, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0, 0 ), C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: upper_trans', function t() {
	var tc = upper_trans;

	// A is 3x2 col-major, trans='T', so C is 2x2: C := alpha*A^T*A + beta*C
	var A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );
	var C = new Complex128Array( 4 ); // 2x2 zeroed
	zsyrk( 'upper', 'transpose', 2, 3, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: lower_trans', function t() {
	var tc = lower_trans;
	var A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );
	var C = new Complex128Array( 4 );
	zsyrk( 'lower', 'transpose', 2, 3, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: complex_alpha_beta', function t() {
	var tc = complex_alpha_beta;

	// alpha=(2,1), beta=(0.5,-0.5), uplo='U', trans='N', N=3, K=2
	var A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );

	// C initial: c(1)=(1,1), c(4)=(2,-1), c(5)=(0.5,0.5), c(8)=(1,0), c(9)=(3,-1), rest=0 // eslint-disable-line max-len

	// Column-major 3x3:

	// Col 0: (1,1), (0,0), (0,0)

	// Col 1: (2,-1), (0.5,0.5), (0,0)

	// Col 2: (1,0), (0,0), (3,-1)   -- wait, c(8) is col 2 row 1, c(9) is col 2 row 2 // eslint-disable-line max-len

	// Fortran 1-based: c(1)=col0,row0; c(2)=col0,row1; c(3)=col0,row2; c(4)=col1,row0; c(5)=col1,row1; c(6)=col1,row2; c(7)=col2,row0; c(8)=col2,row1; c(9)=col2,row2 // eslint-disable-line max-len

	// Fortran 1-based col-major 3x3:

	// c(1)=(1,1)->C[0,0], c(4)=(2,-1)->C[0,1], c(5)=(0.5,0.5)->C[1,1],

	// c(8)=(1,0)->C[1,2], c(9)=(3,-1)->C[2,2], rest=0
	var C = new Complex128Array([
		1,
		1,
		0,
		0,
		0,
		0,
		2,
		-1,
		0.5,
		0.5,
		0,
		0,
		0,
		0,
		1,
		0,
		3,
		-1
	]);
	zsyrk( 'upper', 'no-transpose', 3, 2, new Complex128( 2, 1 ), A, 1, 3, 0, new Complex128( 0.5, -0.5 ), C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: alpha_zero (scale C by beta only)', function t() {
	var tc = alpha_zero;

	// alpha=0, beta=(2,0), uplo='U', trans='N', N=2, K=2

	// c(1)=(1,2), c(2)=(3,4), c(3)=(5,6), c(4)=(7,8)
	var A = new Complex128Array( 6 ); // doesn't matter
	var C = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	zsyrk( 'upper', 'no-transpose', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, new Complex128( 2, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: n_zero (quick return)', function t() {
	var tc = n_zero;
	var A = new Complex128Array( 2 );
	var C = new Complex128Array( [ 99, 0 ] );
	zsyrk( 'upper', 'no-transpose', 0, 2, new Complex128( 1, 0 ), A, 1, 1, 0, new Complex128( 0, 0 ), C, 1, 1, 0 ); // eslint-disable-line max-len

	// C should be unchanged
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: alpha_zero_beta_zero (zero out upper)', function t() {
	var tc = alpha_zero_beta_zero;

	// alpha=0, beta=0, uplo='U', N=2, K=2

	// c(1)=(99,88), c(2)=(77,66), c(3)=(55,44), c(4)=(33,22)
	var A = new Complex128Array( 4 );
	var C = new Complex128Array( [ 99, 88, 77, 66, 55, 44, 33, 22 ] );
	zsyrk( 'upper', 'no-transpose', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, new Complex128( 0, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: alpha_zero_beta_one (no-op, lower)', function t() {
	var tc = alpha_zero_beta_one;

	// alpha=0, beta=1, uplo='L', N=2, K=2
	var A = new Complex128Array( 4 );
	var C = new Complex128Array( [ 42, 13, 7, 8, 9, 10, 11, 12 ] );
	zsyrk( 'lower', 'no-transpose', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, new Complex128( 1, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: lower_nonzero_beta', function t() {
	var tc = lower_nonzero_beta;

	// alpha=1, beta=0.5, uplo='L', trans='N', N=3, K=2
	var A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );

	// c(1)=(1,1), c(2)=(2,-1), c(3)=(0.5,0.5), c(4)=0, c(5)=(0,2), c(6)=(3,-1), c(7)=0, c(8)=0, c(9)=(1,0) // eslint-disable-line max-len
	var C = new Complex128Array([
		1,
		1,
		2,
		-1,
		0.5,
		0.5,
		0,
		0,
		0,
		2,
		3,
		-1,
		0,
		0,
		0,
		0,
		1,
		0
	]);
	zsyrk( 'lower', 'no-transpose', 3, 2, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0.5, 0 ), C, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: scalar (1x1 case)', function t() {
	var tc = scalar;

	// a(1)=(3,2), alpha=(2,1), beta=0, N=1, K=1
	var A = new Complex128Array( [ 3, 2 ] );
	var C = new Complex128Array( 1 );
	zsyrk( 'upper', 'no-transpose', 1, 1, new Complex128( 2, 1 ), A, 1, 1, 0, new Complex128( 0, 0 ), C, 1, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.C, 1e-14, 'C' );
});

test( 'zsyrk: returns C', function t() {
	var ret;
	var A;
	var C;

	A = new Complex128Array( [ 1, 0, 2, 0 ] );
	C = new Complex128Array( 1 );
	ret = zsyrk( 'upper', 'no-transpose', 1, 2, new Complex128( 1, 0 ), A, 1, 1, 0, new Complex128( 0, 0 ), C, 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( ret, C );
});

test( 'zsyrk: K=0 with beta!=1 still scales C', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( 0 );
	C = new Complex128Array( [ 3, 4 ] );
	zsyrk( 'upper', 'no-transpose', 1, 0, new Complex128( 1, 0 ), A, 1, 1, 0, new Complex128( 2, 1 ), C, 1, 1, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 2.0, 1e-14, 'real' );
	assertClose( Cv[ 1 ], 11.0, 1e-14, 'imag' );
});

test( 'zsyrk: lower alpha_zero scaling', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( 4 );
	C = new Complex128Array( [ 2, 0, 4, 0, 6, 0, 8, 0 ] );
	zsyrk( 'lower', 'no-transpose', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, new Complex128( 0.5, 0.5 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 1.0, 1e-14, 'C00r' );
	assertClose( Cv[ 1 ], 1.0, 1e-14, 'C00i' );
	assertClose( Cv[ 2 ], 2.0, 1e-14, 'C10r' );
	assertClose( Cv[ 3 ], 2.0, 1e-14, 'C10i' );
	assertClose( Cv[ 6 ], 4.0, 1e-14, 'C11r' );
	assertClose( Cv[ 7 ], 4.0, 1e-14, 'C11i' );
});

test( 'zsyrk: lower alpha_zero beta_zero zeroes lower triangle', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( 4 );
	C = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	zsyrk( 'lower', 'no-transpose', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, new Complex128( 0, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 0.0, 1e-14, 'C00r' );
	assertClose( Cv[ 1 ], 0.0, 1e-14, 'C00i' );
	assertClose( Cv[ 2 ], 0.0, 1e-14, 'C10r' );
	assertClose( Cv[ 3 ], 0.0, 1e-14, 'C10i' );
	assertClose( Cv[ 4 ], 5.0, 1e-14, 'C01r' );
	assertClose( Cv[ 5 ], 6.0, 1e-14, 'C01i' );
	assertClose( Cv[ 6 ], 0.0, 1e-14, 'C11r' );
	assertClose( Cv[ 7 ], 0.0, 1e-14, 'C11i' );
});

test( 'zsyrk: upper trans with nonzero beta', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );
	C = new Complex128Array( [ 1, 1, 0, 0, 0, 0, 2, -1 ] );
	zsyrk( 'upper', 'transpose', 2, 3, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0.5, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 12.25, 1e-14, 'C00r' );
	assertClose( Cv[ 1 ], 3.5, 1e-14, 'C00i' );
	assertClose( Cv[ 4 ], 31.5, 1e-14, 'C01r' );
	assertClose( Cv[ 5 ], 3.5, 1e-14, 'C01i' );
	assertClose( Cv[ 6 ], 73.75, 1e-14, 'C11r' );
	assertClose( Cv[ 7 ], 9.5, 1e-14, 'C11i' );
});

test( 'zsyrk: lower trans with nonzero beta', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( [ 1, 0.5, 2, -1, 3, 1, 4, 2, 5, 0, 6, -0.5 ] );
	C = new Complex128Array( [ 1, 1, 0, 0, 0, 0, 2, -1 ] );
	zsyrk( 'lower', 'transpose', 2, 3, new Complex128( 1, 0 ), A, 1, 3, 0, new Complex128( 0.5, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 12.25, 1e-14, 'C00r' );
	assertClose( Cv[ 1 ], 3.5, 1e-14, 'C00i' );
	assertClose( Cv[ 2 ], 31.5, 1e-14, 'C10r' );
	assertClose( Cv[ 3 ], 3.5, 1e-14, 'C10i' );
	assertClose( Cv[ 6 ], 73.75, 1e-14, 'C11r' );
	assertClose( Cv[ 7 ], 9.5, 1e-14, 'C11i' );
});

test( 'zsyrk: complex alpha with transpose', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( [ 1, 0, 0, 1, 2, 0, 0, 2 ] );
	C = new Complex128Array( 4 );
	zsyrk( 'upper', 'transpose', 2, 2, new Complex128( 1, 1 ), A, 1, 2, 0, new Complex128( 0, 0 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 0.0, 1e-14, 'C00r' );
	assertClose( Cv[ 1 ], 0.0, 1e-14, 'C00i' );
	assertClose( Cv[ 4 ], 0.0, 1e-14, 'C01r' );
	assertClose( Cv[ 5 ], 0.0, 1e-14, 'C01i' );
	assertClose( Cv[ 6 ], 0.0, 1e-14, 'C11r' );
	assertClose( Cv[ 7 ], 0.0, 1e-14, 'C11i' );
});

test( 'zsyrk: K=0 alpha=1 beta=1 quick return', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( 0 );
	C = new Complex128Array( [ 5, 6 ] );
	zsyrk( 'upper', 'no-transpose', 1, 0, new Complex128( 1, 0 ), A, 1, 1, 0, new Complex128( 1, 0 ), C, 1, 1, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 5.0, 1e-14, 'real' );
	assertClose( Cv[ 1 ], 6.0, 1e-14, 'imag' );
});

test( 'zsyrk: complex beta scaling with alpha_zero lower', function t() {
	var Cv;
	var A;
	var C;

	A = new Complex128Array( 4 );
	C = new Complex128Array( [ 1, 0, 0, 1, 2, 0, 3, 0 ] );
	zsyrk( 'lower', 'no-transpose', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, new Complex128( 1, 2 ), C, 1, 2, 0 ); // eslint-disable-line max-len
	Cv = reinterpret( C, 0 );
	assertClose( Cv[ 0 ], 1.0, 1e-14, 'C00r' );
	assertClose( Cv[ 1 ], 2.0, 1e-14, 'C00i' );
	assertClose( Cv[ 2 ], -2.0, 1e-14, 'C10r' );
	assertClose( Cv[ 3 ], 1.0, 1e-14, 'C10i' );
	assertClose( Cv[ 6 ], 3.0, 1e-14, 'C11r' );
	assertClose( Cv[ 7 ], 6.0, 1e-14, 'C11i' );
});
