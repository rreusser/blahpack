/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbmv from './../lib/ndarray.js';

// FIXTURES //

import notrans from './fixtures/notrans.json' with { type: 'json' };
import trans from './fixtures/trans.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };

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

// Band storage for a 4x5 matrix with KL=1, KU=2, stored in (KL+KU+1)x5 = 4x5 band format. // eslint-disable-line max-len
// Full matrix A (4x5):
//   [ 1  2  3  0  0 ]
//   [ 4  5  6  7  0 ]
//   [ 0  8  9 10 11 ]
//   [ 0  0 12 13 14 ]

// Band storage (column-major, 4 rows per column, diagonal at row KU=2):
// Col 0: row2=1, row3=4
// Col 1: row1=2, row2=5, row3=8
// Col 2: row0=3, row1=6, row2=9, row3=12
// Col 3: row0=7, row1=10, row2=13
// Col 4: row0=11, row1=14

/**
* BandA.
*
* @private
* @returns {*} result
*/
function bandA() {
	var a = new Float64Array( 20 );

	// Column-major: a[ row + col*4 ]

	// Col 0
	a[ 2 + 0 * 4 ] = 1.0;
	a[ 3 + 0 * 4 ] = 4.0;

	// Col 1
	a[ 1 + 1 * 4 ] = 2.0;
	a[ 2 + 1 * 4 ] = 5.0;
	a[ 3 + 1 * 4 ] = 8.0;

	// Col 2
	a[ 0 + 2 * 4 ] = 3.0;
	a[ 1 + 2 * 4 ] = 6.0;
	a[ 2 + 2 * 4 ] = 9.0;
	a[ 3 + 2 * 4 ] = 12.0;

	// Col 3
	a[ 0 + 3 * 4 ] = 7.0;
	a[ 1 + 3 * 4 ] = 10.0;
	a[ 2 + 3 * 4 ] = 13.0;

	// Col 4
	a[ 0 + 4 * 4 ] = 11.0;
	a[ 1 + 4 * 4 ] = 14.0;

	return a;
}

test( 'dgbmv: notrans', function t() {
	var tc = notrans;
	var a = bandA();
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( 4 );

	dgbmv( 'no-transpose', 4, 5, 1, 2, 1.0, a, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dgbmv: trans', function t() {
	var tc = trans;
	var a = bandA();
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	var y = new Float64Array( 5 );

	dgbmv( 'transpose', 4, 5, 1, 2, 1.0, a, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dgbmv: alpha_beta', function t() {
	var tc = alpha_beta;
	var a = bandA();
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 10.0, 20.0, 30.0, 40.0 ] );

	dgbmv( 'no-transpose', 4, 5, 1, 2, 2.0, a, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dgbmv: n_zero', function t() {
	var tc = n_zero;
	var y = new Float64Array( [ 99.0 ] );
	var a = new Float64Array( 1 );
	var x = new Float64Array( 1 );

	dgbmv( 'no-transpose', 0, 0, 0, 0, 1.0, a, 1, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dgbmv: alpha_zero', function t() {
	var tc = alpha_zero;
	var a = bandA();
	var x = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
	var y = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );

	dgbmv( 'no-transpose', 4, 5, 1, 2, 0.0, a, 1, 4, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dgbmv: stride', function t() {
	var tc = stride;
	var a = bandA();
	var x = new Float64Array( [ 1.0, 0.0, 2.0, 0.0, 3.0, 0.0, 4.0, 0.0, 5.0, 0.0 ] ); // eslint-disable-line max-len
	var y = new Float64Array( 8 );

	dgbmv( 'no-transpose', 4, 5, 1, 2, 1.0, a, 1, 4, 0, x, 2, 0, 0.0, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});
