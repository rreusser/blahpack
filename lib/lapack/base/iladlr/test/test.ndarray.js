/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import iladlr from './../lib/ndarray.js';

// FIXTURES //

import basic_3x4 from './fixtures/basic_3x4.json' with { type: 'json' };
import all_zeros from './fixtures/all_zeros.json' with { type: 'json' };
import last_row_nonzero from './fixtures/last_row_nonzero.json' with { type: 'json' };
import first_row_only from './fixtures/first_row_only.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import bottom_right from './fixtures/bottom_right.json' with { type: 'json' };

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

test( 'iladlr: basic 3x4 diagonal', function t() {
	const tc = basic_3x4;
	const A = new Float64Array( 4 * 4 );
	A[ 0 + 0 * 4 ] = 1.0;
	A[ 1 + 1 * 4 ] = 2.0;
	A[ 2 + 2 * 4 ] = 3.0;
	assert.strictEqual( iladlr( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlr: all zeros', function t() {
	const tc = all_zeros;
	const A = new Float64Array( 4 * 4 );
	assert.strictEqual( iladlr( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlr: last row non-zero', function t() {
	const tc = last_row_nonzero;
	const A = new Float64Array( 4 * 4 );
	A[ 2 + 0 * 4 ] = 5.0;
	assert.strictEqual( iladlr( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlr: first row only', function t() {
	const tc = first_row_only;
	const A = new Float64Array( 4 * 4 );
	A[ 0 + 0 * 4 ] = 1.0;
	A[ 0 + 2 * 4 ] = 2.0;
	assert.strictEqual( iladlr( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlr: M=0', function t() {
	const tc = m_zero;
	const A = new Float64Array( 4 * 4 );
	assert.strictEqual( iladlr( 0, 4, A, 1, 4, 0 ), expected( tc ) );
});

test( 'iladlr: bottom right corner', function t() {
	const tc = bottom_right;
	const A = new Float64Array( 4 * 4 );
	A[ 2 + 3 * 4 ] = 9.0;
	assert.strictEqual( iladlr( 3, 4, A, 1, 4, 0 ), expected( tc ) );
});
