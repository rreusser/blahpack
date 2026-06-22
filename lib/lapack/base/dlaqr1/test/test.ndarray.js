/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqr1 from './../lib/ndarray.js';

// FIXTURES //

import _2x2_real_shifts from './fixtures/2x2_real_shifts.json' with { type: 'json' };
import _2x2_complex_shifts from './fixtures/2x2_complex_shifts.json' with { type: 'json' };
import _3x3_real_shifts from './fixtures/3x3_real_shifts.json' with { type: 'json' };
import _3x3_complex_shifts from './fixtures/3x3_complex_shifts.json' with { type: 'json' };
import _2x2_zero_matrix from './fixtures/2x2_zero_matrix.json' with { type: 'json' };
import _3x3_zero_matrix from './fixtures/3x3_zero_matrix.json' with { type: 'json' };
import _2x2_large_subdiag from './fixtures/2x2_large_subdiag.json' with { type: 'json' };

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

// TESTS //

test( 'dlaqr1: 2x2 with real shifts', function t() {
	var tc = _2x2_real_shifts;

	// H = [4 3; 2 1], column-major, LDH=3 (padded row)

	// strideH1=1 (row), strideH2=3 (col)
	var H = new Float64Array( [ 4.0, 2.0, 0.0, 3.0, 1.0, 0.0 ] );
	var v = new Float64Array( 2 );
	dlaqr1( 2, H, 1, 3, 0, 1.0, 0.0, 2.0, 0.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: 2x2 with complex conjugate shifts', function t() {
	var tc = _2x2_complex_shifts;

	// H = [5 2; 3 4], column-major, LDH=3
	var H = new Float64Array( [ 5.0, 3.0, 0.0, 2.0, 4.0, 0.0 ] );
	var v = new Float64Array( 2 );
	dlaqr1( 2, H, 1, 3, 0, 3.0, 1.0, 3.0, -1.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: 3x3 with real shifts', function t() {
	var tc = _3x3_real_shifts;

	// H = [6 2 1; 3 5 4; 1 2 3], column-major, LDH=3
	var H = new Float64Array( [ 6.0, 3.0, 1.0, 2.0, 5.0, 2.0, 1.0, 4.0, 3.0 ] );
	var v = new Float64Array( 3 );
	dlaqr1( 3, H, 1, 3, 0, 1.0, 0.0, 2.0, 0.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: 3x3 with complex conjugate shifts', function t() {
	var tc = _3x3_complex_shifts;

	// H = [6 2 1; 3 5 4; 1 2 3], column-major, LDH=3
	var H = new Float64Array( [ 6.0, 3.0, 1.0, 2.0, 5.0, 2.0, 1.0, 4.0, 3.0 ] );
	var v = new Float64Array( 3 );
	dlaqr1( 3, H, 1, 3, 0, 4.0, 2.0, 4.0, -2.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: 2x2 zero matrix (S=0 branch)', function t() {
	var tc = _2x2_zero_matrix;
	var H = new Float64Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	var v = new Float64Array( [ 99.0, 99.0 ] );
	dlaqr1( 2, H, 1, 3, 0, 0.0, 0.0, 0.0, 0.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: 3x3 zero matrix (S=0 branch)', function t() {
	var tc = _3x3_zero_matrix;
	var H = new Float64Array( 9 );
	var v = new Float64Array( [ 99.0, 99.0, 99.0 ] );
	dlaqr1( 3, H, 1, 3, 0, 0.0, 0.0, 0.0, 0.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: N=1 quick return (does nothing)', function t() {
	var v = new Float64Array( [ 99.0 ] );
	dlaqr1( 1, new Float64Array( 1 ), 1, 1, 0, 0.0, 0.0, 0.0, 0.0, v, 1, 0 );
	assert.equal( v[ 0 ], 99.0 );
});

test( 'dlaqr1: N=0 quick return', function t() {
	var v = new Float64Array( [ 99.0 ] );
	dlaqr1( 0, new Float64Array( 1 ), 1, 1, 0, 0.0, 0.0, 0.0, 0.0, v, 1, 0 );
	assert.equal( v[ 0 ], 99.0 );
});

test( 'dlaqr1: 2x2 with large subdiagonal (scaling)', function t() {
	var tc = _2x2_large_subdiag;

	// H = [1 1; 1e100 1], column-major, LDH=3
	var H = new Float64Array( [ 1.0, 1e100, 0.0, 1.0, 1.0, 0.0 ] );
	var v = new Float64Array( 2 );
	dlaqr1( 2, H, 1, 3, 0, 1.0, 0.0, 1.0, 0.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});

test( 'dlaqr1: 2x2 with non-unit stride and offset for v', function t() {
	var tc = _2x2_real_shifts;
	var H = new Float64Array( [ 4.0, 2.0, 0.0, 3.0, 1.0, 0.0 ] );
	var v = new Float64Array( 5 );
	// Write result at offset=1, stride=2 => v[1], v[3]
	dlaqr1( 2, H, 1, 3, 0, 1.0, 0.0, 2.0, 0.0, v, 2, 1 );
	assertClose( v[ 1 ], tc.v[ 0 ], 1e-14, 'v[0]' );
	assertClose( v[ 3 ], tc.v[ 1 ], 1e-14, 'v[1]' );
});

test( 'dlaqr1: 3x3 with offset for H', function t() {
	var tc = _3x3_real_shifts;

	// H = [6 2 1; 3 5 4; 1 2 3], embedded at offset 1, LDH=4
	var H = new Float64Array([
		0.0,
		6.0,
		3.0,
		1.0,  // col 0 padded
		0.0,
		2.0,
		5.0,
		2.0,  // col 1 padded
		0.0,
		1.0,
		4.0,
		3.0   // col 2 padded
	]);
	var v = new Float64Array( 3 );
	dlaqr1( 3, H, 1, 4, 1, 1.0, 0.0, 2.0, 0.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-14, 'v' );
});
