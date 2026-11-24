/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlabrd from './../lib/dlabrd.js';

// FIXTURES //

import m_ge_n_6x5_nb3 from './fixtures/m_ge_n_6x5_nb3.json' with { type: 'json' };


// VARIABLES //

// Column-major 6-by-5 input of the `m_ge_n_6x5_nb3` fixture:
const A_6X5 = [ 1.0, 2.0, -0.5, 0.7, 1.5, -0.3, 0.3, -1.0, 0.6, 1.2, -0.3, 0.4, 0.5, 0.8, -0.4, 0.2, 1.1, -0.6, -0.2, 0.4, 0.9, -0.6, 0.3, 0.7, 0.8, -0.1, 0.2, 1.3, -0.5, 0.9 ]; // eslint-disable-line max-len


// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Collection} actual - actual values
* @param {Collection} expected - expected values
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 1e-14 * Math.max( Math.abs( expected[ i ] ), 1.0 ), msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Transposes a column-major `rows`-by-`cols` matrix into row-major order.
*
* @private
* @param {Collection} x - column-major matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Float64Array} row-major matrix
*/
function toRowMajor( x, rows, cols ) {
	const out = new Float64Array( rows * cols );
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			out[ ( i * cols ) + j ] = x[ ( j * rows ) + i ];
		}
	}
	return out;
}


// TESTS //

test( 'dlabrd is a function', function t() {
	assert.strictEqual( typeof dlabrd, 'function', 'is a function' );
});

test( 'dlabrd has expected arity', function t() {
	assert.strictEqual( dlabrd.length, 18, 'has expected arity' );
});

test( 'dlabrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlabrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlabrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dlabrd( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlabrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlabrd( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dlabrd accepts LDX = M and LDY = N in column-major order (M > N)', function t() {
	const tc = m_ge_n_6x5_nb3;
	const A = new Float64Array( A_6X5 );
	const d = new Float64Array( 3 );
	const e = new Float64Array( 3 );
	const TAUQ = new Float64Array( 3 );
	const TAUP = new Float64Array( 3 );
	const X = new Float64Array( 6 * 3 );
	const Y = new Float64Array( 5 * 3 );
	const out = dlabrd( 'column-major', 6, 5, 3, A, 6, d, 1, e, 1, TAUQ, 1, TAUP, 1, X, 6, Y, 5 );
	assert.strictEqual( out, Y, 'returns Y' );
	assertArrayClose( A, tc.A, 'A' );
	assertArrayClose( d, tc.D, 'D' );
	assertArrayClose( e, tc.E, 'E' );
	assertArrayClose( TAUQ, tc.TAUQ, 'TAUQ' );
	assertArrayClose( TAUP, tc.TAUP, 'TAUP' );
	assertArrayClose( X, tc.X, 'X' );
	assertArrayClose( Y, tc.Y, 'Y' );
});

test( 'dlabrd accepts LDX = LDY = nb in row-major order', function t() {
	const tc = m_ge_n_6x5_nb3;
	const A = toRowMajor( A_6X5, 6, 5 );
	const d = new Float64Array( 3 );
	const e = new Float64Array( 3 );
	const TAUQ = new Float64Array( 3 );
	const TAUP = new Float64Array( 3 );
	const X = new Float64Array( 6 * 3 );
	const Y = new Float64Array( 5 * 3 );
	dlabrd( 'row-major', 6, 5, 3, A, 5, d, 1, e, 1, TAUQ, 1, TAUP, 1, X, 3, Y, 3 );
	assertArrayClose( A, toRowMajor( tc.A, 6, 5 ), 'A' );
	assertArrayClose( d, tc.D, 'D' );
	assertArrayClose( e, tc.E, 'E' );
	assertArrayClose( TAUQ, tc.TAUQ, 'TAUQ' );
	assertArrayClose( TAUP, tc.TAUP, 'TAUP' );
	assertArrayClose( X, toRowMajor( tc.X, 6, 3 ), 'X' );
	assertArrayClose( Y, toRowMajor( tc.Y, 5, 3 ), 'Y' );
});

test( 'dlabrd throws RangeError for LDX < max(1,M) or LDY < max(1,N) in column-major order', function t() {
	const A = new Float64Array( 30 );
	const v = new Float64Array( 3 );
	assert.throws( function throws() {
		dlabrd( 'column-major', 6, 5, 3, A, 6, v, 1, v, 1, v, 1, v, 1, new Float64Array( 18 ), 5, new Float64Array( 15 ), 5 );
	}, RangeError );
	assert.throws( function throws() {
		dlabrd( 'column-major', 6, 5, 3, A, 6, v, 1, v, 1, v, 1, v, 1, new Float64Array( 18 ), 6, new Float64Array( 15 ), 4 );
	}, RangeError );
});

test( 'dlabrd throws RangeError for LDX < max(1,nb) or LDY < max(1,nb) in row-major order', function t() {
	const A = new Float64Array( 30 );
	const v = new Float64Array( 3 );
	assert.throws( function throws() {
		dlabrd( 'row-major', 6, 5, 3, A, 5, v, 1, v, 1, v, 1, v, 1, new Float64Array( 18 ), 2, new Float64Array( 15 ), 3 );
	}, RangeError );
	assert.throws( function throws() {
		dlabrd( 'row-major', 6, 5, 3, A, 5, v, 1, v, 1, v, 1, v, 1, new Float64Array( 18 ), 3, new Float64Array( 15 ), 2 );
	}, RangeError );
});
