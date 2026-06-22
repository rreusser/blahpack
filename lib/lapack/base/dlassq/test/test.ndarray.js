/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlassq from './../lib/ndarray.js';

// FIXTURES //

import dlassq_basic from './fixtures/dlassq_basic.json' with { type: 'json' };
import dlassq_accumulate from './fixtures/dlassq_accumulate.json' with { type: 'json' };
import dlassq_n_zero from './fixtures/dlassq_n_zero.json' with { type: 'json' };
import dlassq_stride from './fixtures/dlassq_stride.json' with { type: 'json' };
import dlassq_zeros from './fixtures/dlassq_zeros.json' with { type: 'json' };
import dlassq_big from './fixtures/dlassq_big.json' with { type: 'json' };
import dlassq_small from './fixtures/dlassq_small.json' with { type: 'json' };
import dlassq_big_normal from './fixtures/dlassq_big_normal.json' with { type: 'json' };
import dlassq_small_normal from './fixtures/dlassq_small_normal.json' with { type: 'json' };
import dlassq_neg_stride from './fixtures/dlassq_neg_stride.json' with { type: 'json' };
import dlassq_big_existing from './fixtures/dlassq_big_existing.json' with { type: 'json' };
import dlassq_small_existing from './fixtures/dlassq_small_existing.json' with { type: 'json' };
import dlassq_pure_small from './fixtures/dlassq_pure_small.json' with { type: 'json' };
import dlassq_scale_zero from './fixtures/dlassq_scale_zero.json' with { type: 'json' };
import dlassq_big_existing_scale_gt1 from './fixtures/dlassq_big_existing_scale_gt1.json' with { type: 'json' };
import dlassq_small_existing_scale_lt1 from './fixtures/dlassq_small_existing_scale_lt1.json' with { type: 'json' };
import dlassq_single from './fixtures/dlassq_single.json' with { type: 'json' };
import dlassq_negative from './fixtures/dlassq_negative.json' with { type: 'json' };
import dlassq_stride3 from './fixtures/dlassq_stride3.json' with { type: 'json' };

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
	var relErr;
	if ( expected === 0.0 ) {
		assert.equal( actual, 0.0, msg + ': expected 0, got ' + actual );
		return;
	}
	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

// TESTS //

test( 'dlassq: basic - x=[3,4], scl=1, sumsq=0', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_basic;
	x = new Float64Array( [ 3.0, 4.0 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: accumulate - x=[1], scl=2, sumsq=3', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_accumulate;
	x = new Float64Array( [ 1.0 ] );
	result = dlassq( 1, x, 1, 0, 2.0, 3.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: N=0 quick return', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_n_zero;
	x = new Float64Array( [ 1.0 ] );
	result = dlassq( 0, x, 1, 0, 2.0, 5.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: stride=2 - x=[3,99,4], picks 3 and 4', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_stride;
	x = new Float64Array( [ 3.0, 99.0, 4.0 ] );
	result = dlassq( 2, x, 2, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: all zeros', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_zeros;
	x = new Float64Array( [ 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	result = dlassq( 5, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: very large values (abig accumulator)', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_big;
	x = new Float64Array( [ 1e300, 2e300 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: very small values (asml accumulator)', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_small;
	x = new Float64Array( [ 1e-300, 2e-300 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: mix of big and normal values (abig+amed)', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_big_normal;
	x = new Float64Array( [ 1e300, 1.0 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: mix of small and normal values (asml+amed)', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_small_normal;
	x = new Float64Array( [ 1e-300, 1.0 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: negative stride', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_neg_stride;
	x = new Float64Array( [ 3.0, 4.0 ] );
	result = dlassq( 2, x, -1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: big existing sum + big values', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_big_existing;
	x = new Float64Array( [ 1e300 ] );
	result = dlassq( 1, x, 1, 0, 1e200, 1.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: small existing sum + small values', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_small_existing;
	x = new Float64Array( [ 1e-300 ] );
	result = dlassq( 1, x, 1, 0, 1e-200, 1.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: pure small values only (asml-only branch)', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_pure_small;
	x = new Float64Array( [ 1e-300, 2e-300 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: scale=0, sumsq=0 initial', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_scale_zero;
	x = new Float64Array( [ 3.0, 4.0 ] );
	result = dlassq( 2, x, 1, 0, 0.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: big existing sum with scale > 1', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_big_existing_scale_gt1;
	x = new Float64Array( [ 1e300 ] );
	result = dlassq( 1, x, 1, 0, 2.0, 1e308 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: small existing sum with scale < 1', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_small_existing_scale_lt1;
	x = new Float64Array( [ 1e-300 ] );
	result = dlassq( 1, x, 1, 0, 0.5, 1e-300 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: single element', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_single;
	x = new Float64Array( [ 7.0 ] );
	result = dlassq( 1, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: negative values (abs taken)', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_negative;
	x = new Float64Array( [ -3.0, -4.0 ] );
	result = dlassq( 2, x, 1, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: stride=3', function t() {
	var result;
	var tc;
	var x;

	tc = dlassq_stride3;
	x = new Float64Array( [ 2.0, 0.0, 0.0, 3.0, 0.0, 0.0, 6.0 ] );
	result = dlassq( 3, x, 3, 0, 1.0, 0.0 );
	assertClose( result.scl, tc.scl, 1e-14, 'scl' );
	assertClose( result.sumsq, tc.sumsq, 1e-14, 'sumsq' );
});

test( 'dlassq: NaN scale quick return', function t() {
	var result;
	var x;

	x = new Float64Array( [ 1.0 ] );
	result = dlassq( 1, x, 1, 0, NaN, 1.0 );
	assert.ok( result.scl !== result.scl, 'scl should be NaN' );
});

test( 'dlassq: NaN sumsq quick return', function t() {
	var result;
	var x;

	x = new Float64Array( [ 1.0 ] );
	result = dlassq( 1, x, 1, 0, 1.0, NaN );
	assert.ok( result.sumsq !== result.sumsq, 'sumsq should be NaN' );
});

test( 'dlassq: offset parameter', function t() {
	var result;
	var x;

	x = new Float64Array( [ 99.0, 99.0, 3.0, 4.0 ] );
	result = dlassq( 2, x, 1, 2, 1.0, 0.0 );
	assertClose( result.scl, 1.0, 1e-14, 'scl' );
	assertClose( result.sumsq, 25.0, 1e-14, 'sumsq' );
});

test( 'dlassq: sumsq=0 resets scale to 1', function t() {
	var result;
	var x;

	x = new Float64Array( [ 3.0 ] );
	result = dlassq( 1, x, 1, 0, 5.0, 0.0 );
	assertClose( result.scl, 1.0, 1e-14, 'scl' );
	assertClose( result.sumsq, 9.0, 1e-14, 'sumsq' );
});

test( 'dlassq: scale=0, sumsq!=0 resets both', function t() {
	var result;
	var x;

	x = new Float64Array( [ 3.0 ] );
	result = dlassq( 1, x, 1, 0, 0.0, 5.0 );
	assertClose( result.scl, 1.0, 1e-14, 'scl' );
	assertClose( result.sumsq, 9.0, 1e-14, 'sumsq' );
});

test( 'dlassq: big existing sumsq with scale <= 1 (line 113)', function t() {
	var result;
	var SBIG;
	var x;

	x = new Float64Array( [ 1e300 ] );
	result = dlassq( 1, x, 1, 0, 0.5, 1e308 );
	SBIG = Math.pow( 2, -538 );
	assert.ok( result.scl === 1.0 / SBIG, 'scl should be 1/SBIG' );
	assert.ok( isFinite( result.sumsq ), 'sumsq should be finite' );
	assert.ok( result.sumsq > 0, 'sumsq should be positive' );
});

test( 'dlassq: small existing sumsq with scale >= 1 (line 122)', function t() {
	var totalSS;
	var result;
	var x;

	x = new Float64Array( [ 1e-300 ] );
	result = dlassq( 1, x, 1, 0, 1.0, 1e-320 );
	totalSS = result.scl * result.scl * result.sumsq;
	assertClose( totalSS, 1e-320 + 1e-600, 1e-10, 'total sum of squares' );
});

test( 'dlassq: asml > amed branch in combination (line 145)', function t() {
	var expected;
	var totalSS;
	var result;
	var i;
	var x;

	x = new Float64Array( 1001 );
	for ( i = 0; i < 1000; i++ ) {
		x[ i ] = 1.0e-155;
	}
	x[ 1000 ] = 1.5e-154;
	result = dlassq( 1001, x, 1, 0, 1.0, 0.0 );
	totalSS = result.scl * result.scl * result.sumsq;
	expected = 1000 * 1e-310 + 2.25e-308;
	assertClose( totalSS, expected, 1e-10, 'total sum of squares' );
});
