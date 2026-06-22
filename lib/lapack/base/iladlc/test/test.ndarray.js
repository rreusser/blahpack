/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import iladlc from './../lib/ndarray.js';

// FIXTURES //

import basic_3x4 from './fixtures/basic_3x4.json' with { type: 'json' };
import all_zeros from './fixtures/all_zeros.json' with { type: 'json' };
import last_col_nonzero from './fixtures/last_col_nonzero.json' with { type: 'json' };
import first_col_only from './fixtures/first_col_only.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import bottom_right from './fixtures/bottom_right.json' with { type: 'json' };

// Fortran returns 1-based; JS returns 0-based:
/**
* Expected.
*
* @private
* @param {*} tc - tc
* @returns {*} result
*/
function expected( tc ) {
	return tc.result - 1;
}

test( 'iladlc: basic 3x4 diagonal', function t() {
	var tc = basic_3x4;

	// 3x4 col-major, LDA=4, strideA1=1, strideA2=4
	var A = new Float64Array( 4 * 4 );
	A[ 0 + 0 * 4 ] = 1.0;
	A[ 1 + 1 * 4 ] = 2.0;
	A[ 2 + 2 * 4 ] = 3.0;
	assert.strictEqual( iladlc( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlc: all zeros', function t() {
	var tc = all_zeros;
	var A = new Float64Array( 4 * 4 );
	assert.strictEqual( iladlc( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlc: last column non-zero', function t() {
	var tc = last_col_nonzero;
	var A = new Float64Array( 4 * 4 );
	A[ 0 + 3 * 4 ] = 5.0;
	assert.strictEqual( iladlc( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlc: first column only', function t() {
	var tc = first_col_only;
	var A = new Float64Array( 4 * 4 );
	A[ 0 + 0 * 4 ] = 1.0;
	A[ 1 + 0 * 4 ] = 2.0;
	assert.strictEqual( iladlc( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlc: N=0', function t() {
	var tc = n_zero;
	var A = new Float64Array( 4 * 4 );
	assert.strictEqual( iladlc( 3, 0, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlc: bottom right corner', function t() {
	var tc = bottom_right;
	var A = new Float64Array( 4 * 4 );
	A[ 2 + 3 * 4 ] = 9.0;
	assert.strictEqual( iladlc( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});
