/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlagtf from '../../dlagtf/lib/base.js';
import dlagts from './../lib/ndarray.js';

// FIXTURES //

import solve_job_m1 from './fixtures/solve_job_m1.json' with { type: 'json' };
import solve_job_m2 from './fixtures/solve_job_m2.json' with { type: 'json' };
import solve_job_1 from './fixtures/solve_job_1.json' with { type: 'json' };
import solve_job_2 from './fixtures/solve_job_2.json' with { type: 'json' };
import n_equals_1 from './fixtures/n_equals_1.json' with { type: 'json' };
import solve_job_1_n2 from './fixtures/solve_job_1_n2.json' with { type: 'json' };
import solve_job_2_n2 from './fixtures/solve_job_2_n2.json' with { type: 'json' };
import solve_job_m2_n2 from './fixtures/solve_job_m2_n2.json' with { type: 'json' };
import solve_job_m1_explicit_tol from './fixtures/solve_job_m1_explicit_tol.json' with { type: 'json' };

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
* SetupFactorization5.
*
* @private
* @returns {*} result
*/
function setupFactorization5() {
	var tol = 0.0;
	var IN = new Int32Array( 5 );
	var a = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
	var b = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var c = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	var d = new Float64Array( 3 );

	dlagtf( 5, a, 1, 0, 1.0, b, 1, 0, c, 1, 0, tol, d, 1, 0, IN, 1, 0 );
	return {
		'a': a,
		'b': b,
		'c': c,
		'd': d,
		'IN': IN
	};
}

/**
* SetupFactorization2.
*
* @private
* @returns {*} result
*/
function setupFactorization2() {
	var tol = 0.0;
	var IN = new Int32Array( 2 );
	var a = new Float64Array( [ 5.0, 3.0 ] );
	var b = new Float64Array( [ 2.0 ] );
	var c = new Float64Array( [ 0.5 ] );
	var d = new Float64Array( 1 );

	dlagtf( 2, a, 1, 0, 0.0, b, 1, 0, c, 1, 0, tol, d, 1, 0, IN, 1, 0 );
	return {
		'a': a,
		'b': b,
		'c': c,
		'd': d,
		'IN': IN
	};
}

/**
* SetupFactorization1.
*
* @private
* @returns {*} result
*/
function setupFactorization1() {
	var tol = 0.0;
	var IN = new Int32Array( 1 );
	var a = new Float64Array( [ 3.0 ] );
	var b = new Float64Array( 1 );
	var c = new Float64Array( 1 );
	var d = new Float64Array( 1 );

	dlagtf( 1, a, 1, 0, 0.5, b, 1, 0, c, 1, 0, tol, d, 1, 0, IN, 1, 0 );
	return {
		'a': a,
		'b': b,
		'c': c,
		'd': d,
		'IN': IN
	};
}

// TESTS //

test( 'dlagts: solve (T-lambda*I)x=y with perturbation (job=-1)', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_m1;
	f = setupFactorization5();
	y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dlagts( -1, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: solve transpose with perturbation (job=-2)', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_m2;
	f = setupFactorization5();
	y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dlagts( -2, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: N=0', function t() {
	var info;
	var f;
	var y;

	f = setupFactorization5();
	y = new Float64Array( 1 );
	info = dlagts( -1, 0, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: solve without perturbation (job=1)', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_1;
	f = setupFactorization5();
	y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dlagts( 1, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: solve transpose without perturbation (job=2)', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_2;
	f = setupFactorization5();
	y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dlagts( 2, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: N=1', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = n_equals_1;
	f = setupFactorization1();
	y = new Float64Array( [ 7.0 ] );
	info = dlagts( -1, 1, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: job=1 N=2', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_1_n2;
	f = setupFactorization2();
	y = new Float64Array( [ 1.0, 2.0 ] );
	info = dlagts( 1, 2, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: job=2 N=2', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_2_n2;
	f = setupFactorization2();
	y = new Float64Array( [ 1.0, 2.0 ] );
	info = dlagts( 2, 2, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: job=-2 N=2', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_m2_n2;
	f = setupFactorization2();
	y = new Float64Array( [ 1.0, 2.0 ] );
	info = dlagts( -2, 2, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: job=-1 with explicit tol', function t() {
	var info;
	var tc;
	var f;
	var y;

	tc = solve_job_m1_explicit_tol;
	f = setupFactorization5();
	y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	info = dlagts( -1, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 1e-8 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dlagts: invalid job returns -1', function t() {
	var info;
	var f;
	var y;

	f = setupFactorization5();
	y = new Float64Array( [ 1.0 ] );
	info = dlagts( 0, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, -1, 'info' );
	info = dlagts( 3, 5, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, -1, 'info for job=3' );
});

test( 'dlagts: throws RangeError for N<0', function t() {
	var f = setupFactorization5();
	var y = new Float64Array( [ 1.0 ] );
	assert.throws( function() {
		dlagts( 1, -1, f.a, 1, 0, f.b, 1, 0, f.c, 1, 0, f.d, 1, 0, f.IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dlagts: pivot swap path, job=1 with IN!=0', function t() {
	// Construct a system where dlagtf produces IN[k]=1 (pivot swap).
	// a small relative to c triggers piv2 > piv1.
	var IN = new Int32Array( 4 );
	var a = new Float64Array( [ 0.1, 0.1, 0.1, 0.1 ] );
	var b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var c = new Float64Array( [ 5.0, 5.0, 5.0 ] );
	var d = new Float64Array( 2 );
	var y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var info;
	var k;
	var hasSwap;
	dlagtf( 4, a, 1, 0, 0.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	hasSwap = false;
	for ( k = 0; k < 3; k++ ) {
		if ( IN[ k ] === 1 ) {
			hasSwap = true;
		}
	}
	assert.ok( hasSwap, 'expected at least one pivot swap' );
	info = dlagts( 1, 4, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: pivot swap path, job=2 transpose with IN!=0', function t() {
	var IN = new Int32Array( 4 );
	var a = new Float64Array( [ 0.1, 0.1, 0.1, 0.1 ] );
	var b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var c = new Float64Array( [ 5.0, 5.0, 5.0 ] );
	var d = new Float64Array( 2 );
	var y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var info;
	dlagtf( 4, a, 1, 0, 0.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	info = dlagts( 2, 4, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: pivot swap path, job=-1 with IN!=0', function t() {
	var IN = new Int32Array( 4 );
	var a = new Float64Array( [ 0.1, 0.1, 0.1, 0.1 ] );
	var b = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var c = new Float64Array( [ 5.0, 5.0, 5.0 ] );
	var d = new Float64Array( 2 );
	var y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var info;
	dlagtf( 4, a, 1, 0, 0.0, b, 1, 0, c, 1, 0, 0.0, d, 1, 0, IN, 1, 0 );
	info = dlagts( -1, 4, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: tol auto-compute when all factors are zero', function t() {
	// All-zero a/b/c/d -> tol auto-compute yields zero, then falls back to EPS
	var IN = new Int32Array( 5 );
	var a = new Float64Array( 5 ); // all zero
	var b = new Float64Array( 4 );
	var c = new Float64Array( 4 );
	var d = new Float64Array( 3 );
	var y = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	var info = dlagts( -1, 5, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	// Perturbation kicks in because all diagonals are zero.
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: overflow at element returns positive info (job=1, ak=0)', function t() {
	// Construct synthetic factors with a[k]=0 and nonzero RHS -> overflow.
	var IN = new Int32Array( [ 0, 0, 0 ] );
	var a = new Float64Array( [ 1.0, 0.0, 1.0 ] );
	var b = new Float64Array( [ 0.0, 0.0 ] );
	var c = new Float64Array( [ 0.0, 0.0 ] );
	var d = new Float64Array( [ 0.0 ] );
	var y = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var info = dlagts( 1, 3, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.ok( info > 0, 'overflow detected' );
});

test( 'dlagts: overflow at element returns positive info (job=2, ak=0)', function t() {
	var IN = new Int32Array( [ 0, 0, 0 ] );
	var a = new Float64Array( [ 1.0, 0.0, 1.0 ] );
	var b = new Float64Array( [ 0.0, 0.0 ] );
	var c = new Float64Array( [ 0.0, 0.0 ] );
	var d = new Float64Array( [ 0.0 ] );
	var y = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	var info = dlagts( 2, 3, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.ok( info > 0, 'overflow detected' );
});

test( 'dlagts: small ak triggers BIGNUM scaling (job=1)', function t() {
	// |a[k]| < SFMIN with safe RHS magnitude triggers temp*=BIGNUM, ak*=BIGNUM
	var SFMIN = 2.2250738585072014e-308;
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1.0, 0.5 * SFMIN ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1.0, 1e-300 ] );
	var info = dlagts( 1, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: |temp|>absak*BIGNUM triggers overflow (job=1)', function t() {
	// |a[k]| < 1 but >= SFMIN, |temp| > absak*BIGNUM -> overflow
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1.0, 1e-200 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1.0, 1e200 ] );
	var info = dlagts( 1, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.ok( info > 0, 'overflow detected' );
});

test( 'dlagts: small ak triggers BIGNUM scaling (job=2)', function t() {
	var SFMIN = 2.2250738585072014e-308;
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 0.5 * SFMIN, 1.0 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1e-300, 1.0 ] );
	var info = dlagts( 2, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: |temp|>absak*BIGNUM triggers overflow (job=2)', function t() {
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1e-200, 1.0 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1e200, 1.0 ] );
	var info = dlagts( 2, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 0.0 ); // eslint-disable-line max-len
	assert.ok( info > 0, 'overflow detected' );
});

test( 'dlagts: perturbation loop with ak=0 (job=-1)', function t() {
	// ak=0 with nonzero temp triggers perturbation while-loop branches.
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1.0, 0.0 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1.0, 1.0 ] );
	var info = dlagts( -1, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 1e-10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: perturbation loop with small ak (job=-1)', function t() {
	// |a|<SFMIN -> temp*=BIGNUM, ak*=BIGNUM
	var SFMIN = 2.2250738585072014e-308;
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1.0, 0.5 * SFMIN ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1.0, 1e-300 ] );
	var info = dlagts( -1, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 1e-10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: perturbation loop with |temp|>absak*BIGNUM (job=-1)', function t() {
	// |a|<1 but >=SFMIN with large temp triggers ak += pert; pert *= 2 path
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1.0, 1e-200 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1.0, 1e200 ] );
	var info = dlagts( -1, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 1e-10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: perturbation loop with ak=0 (job=-2)', function t() {
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 0.0, 1.0 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1.0, 1.0 ] );
	var info = dlagts( -2, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 1e-10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: perturbation loop with small ak (job=-2)', function t() {
	var SFMIN = 2.2250738585072014e-308;
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 0.5 * SFMIN, 1.0 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1e-300, 1.0 ] );
	var info = dlagts( -2, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 1e-10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});

test( 'dlagts: perturbation loop with |temp|>absak*BIGNUM (job=-2)', function t() {
	var IN = new Int32Array( [ 0, 0 ] );
	var a = new Float64Array( [ 1e-200, 1.0 ] );
	var b = new Float64Array( [ 0.0 ] );
	var c = new Float64Array( [ 0.0 ] );
	var d = new Float64Array( 1 );
	var y = new Float64Array( [ 1e200, 1.0 ] );
	var info = dlagts( -2, 2, a, 1, 0, b, 1, 0, c, 1, 0, d, 1, 0, IN, 1, 0, y, 1, 0, 1e-10 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
});
