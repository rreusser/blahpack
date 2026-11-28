/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlabrd from './../lib/zlabrd.js';

// FIXTURES //

import m_ge_n_5x4_nb2 from './fixtures/m_ge_n_5x4_nb2.json' with { type: 'json' };


// VARIABLES //

// Column-major 5-by-4 input (interleaved re/im) of the `m_ge_n_5x4_nb2` fixture:
const A_5X4 = [ 1.0, 0.5, 2.0, -1.0, -0.5, 0.3, 0.7, -0.2, 1.5, 0.8, 0.3, 0.4, -1.0, 0.5, 0.6, -0.7, 1.2, 0.1, -0.3, 0.9, 0.5, -0.1, 0.8, 0.2, -0.4, 1.0, 0.2, -0.5, 1.1, 0.3, -0.2, 0.6, 0.4, -0.3, 0.9, 0.1, -0.6, 0.8, 0.3, -0.4 ]; // eslint-disable-line max-len


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
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= 1e-12 * Math.max( Math.abs( expected[ i ] ), 1.0 ), msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
	}
}

/**
* Transposes an interleaved column-major complex `rows`-by-`cols` matrix into row-major order.
*
* @private
* @param {Collection} x - interleaved column-major matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Float64Array} interleaved row-major matrix
*/
function toRowMajor( x, rows, cols ) {
	const out = new Float64Array( 2 * rows * cols );
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			out[ 2 * ( ( i * cols ) + j ) ] = x[ 2 * ( ( j * rows ) + i ) ];
			out[ ( 2 * ( ( i * cols ) + j ) ) + 1 ] = x[ ( 2 * ( ( j * rows ) + i ) ) + 1 ];
		}
	}
	return out;
}


// TESTS //

test( 'zlabrd is a function', function t() {
	assert.strictEqual( typeof zlabrd, 'function', 'is a function' );
});

test( 'zlabrd has expected arity', function t() {
	assert.strictEqual( zlabrd.length, 18, 'has expected arity' );
});

test( 'zlabrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlabrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlabrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlabrd( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlabrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlabrd( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlabrd accepts LDX = M and LDY = N in column-major order (M > N)', function t() {
	const tc = m_ge_n_5x4_nb2;
	const A = new Complex128Array( A_5X4 );
	const d = new Float64Array( 2 );
	const e = new Float64Array( 2 );
	const TAUQ = new Complex128Array( 2 );
	const TAUP = new Complex128Array( 2 );
	const X = new Complex128Array( 5 * 2 );
	const Y = new Complex128Array( 4 * 2 );
	const out = zlabrd( 'column-major', 5, 4, 2, A, 5, d, 1, e, 1, TAUQ, 1, TAUP, 1, X, 5, Y, 4 );
	assert.strictEqual( out, Y, 'returns Y' );
	assertArrayClose( reinterpret( A, 0 ), tc.A, 'A' );
	assertArrayClose( d, tc.D, 'd' );
	assertArrayClose( e, tc.E, 'e' );
	assertArrayClose( reinterpret( TAUQ, 0 ), tc.TAUQ, 'TAUQ' );
	assertArrayClose( reinterpret( TAUP, 0 ), tc.TAUP, 'TAUP' );
	assertArrayClose( reinterpret( X, 0 ), tc.X, 'X' );
	assertArrayClose( reinterpret( Y, 0 ), tc.Y, 'Y' );
});

test( 'zlabrd accepts LDX = LDY = nb in row-major order', function t() {
	const tc = m_ge_n_5x4_nb2;
	const A = new Complex128Array( toRowMajor( A_5X4, 5, 4 ) );
	const d = new Float64Array( 2 );
	const e = new Float64Array( 2 );
	const TAUQ = new Complex128Array( 2 );
	const TAUP = new Complex128Array( 2 );
	const X = new Complex128Array( 5 * 2 );
	const Y = new Complex128Array( 4 * 2 );
	zlabrd( 'row-major', 5, 4, 2, A, 4, d, 1, e, 1, TAUQ, 1, TAUP, 1, X, 2, Y, 2 );
	assertArrayClose( reinterpret( A, 0 ), toRowMajor( tc.A, 5, 4 ), 'A' );
	assertArrayClose( d, tc.D, 'd' );
	assertArrayClose( e, tc.E, 'e' );
	assertArrayClose( reinterpret( TAUQ, 0 ), tc.TAUQ, 'TAUQ' );
	assertArrayClose( reinterpret( TAUP, 0 ), tc.TAUP, 'TAUP' );
	assertArrayClose( reinterpret( X, 0 ), toRowMajor( tc.X, 5, 2 ), 'X' );
	assertArrayClose( reinterpret( Y, 0 ), toRowMajor( tc.Y, 4, 2 ), 'Y' );
});

test( 'zlabrd throws RangeError for LDX < max(1,M) or LDY < max(1,N) in column-major order', function t() {
	const A = new Complex128Array( 20 );
	const v = new Complex128Array( 2 );
	const r = new Float64Array( 2 );
	assert.throws( function throws() {
		zlabrd( 'column-major', 5, 4, 2, A, 5, r, 1, r, 1, v, 1, v, 1, new Complex128Array( 10 ), 4, new Complex128Array( 8 ), 4 );
	}, RangeError );
	assert.throws( function throws() {
		zlabrd( 'column-major', 5, 4, 2, A, 5, r, 1, r, 1, v, 1, v, 1, new Complex128Array( 10 ), 5, new Complex128Array( 8 ), 3 );
	}, RangeError );
});

test( 'zlabrd throws RangeError for LDX < max(1,nb) or LDY < max(1,nb) in row-major order', function t() {
	const A = new Complex128Array( 20 );
	const v = new Complex128Array( 2 );
	const r = new Float64Array( 2 );
	assert.throws( function throws() {
		zlabrd( 'row-major', 5, 4, 2, A, 4, r, 1, r, 1, v, 1, v, 1, new Complex128Array( 10 ), 1, new Complex128Array( 8 ), 2 );
	}, RangeError );
	assert.throws( function throws() {
		zlabrd( 'row-major', 5, 4, 2, A, 4, r, 1, r, 1, v, 1, v, 1, new Complex128Array( 10 ), 2, new Complex128Array( 8 ), 1 );
	}, RangeError );
});
