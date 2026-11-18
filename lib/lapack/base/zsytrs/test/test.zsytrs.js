/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrs from './../lib/zsytrs.js';

import zsytrf from './../../zsytrf/lib/zsytrf.js';

// FUNCTIONS //

/**
* Returns a deterministic complex column-major matrix.
*
* @private
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @param {number} seed - seed
* @returns {Complex128Array} matrix
*/
function cmatrix( rows, cols, seed ) {
	const out = new Float64Array( 2 * rows * cols );
	let i;
	for ( i = 0; i < out.length; i++ ) {
		out[ i ] = Math.sin( ( seed * ( i + 1 ) ) + ( 0.37 * i * i ) ) + ( ( i % 5 === 0 ) ? 3.0 : 0.0 );
	}
	return new Complex128Array( out.buffer );
}

/**
* Converts a column-major complex matrix to row-major.
*
* @private
* @param {Complex128Array} X - column-major matrix (leading dimension `rows`)
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Complex128Array} row-major matrix (leading dimension `cols`)
*/
function toRowMajor( X, rows, cols ) {
	const out = new Complex128Array( rows * cols );
	const xv = reinterpret( X, 0 );
	const ov = reinterpret( out, 0 );
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			ov[ 2 * ( ( i * cols ) + j ) ] = xv[ 2 * ( ( j * rows ) + i ) ];
			ov[ ( 2 * ( ( i * cols ) + j ) ) + 1 ] = xv[ ( 2 * ( ( j * rows ) + i ) ) + 1 ];
		}
	}
	return out;
}


// TESTS //

test( 'zsytrs is a function', function t() {
	assert.strictEqual( typeof zsytrs, 'function', 'is a function' );
});

test( 'zsytrs has expected arity', function t() {
	assert.strictEqual( zsytrs.length, 10, 'has expected arity' );
});

test( 'zsytrs throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrs( 'column-major', 'invalid', new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zsytrs throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrs( 'column-major', 'upper', -1, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zsytrs throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zsytrs( 'column-major', 'upper', new Float64Array( 4 ), -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zsytrs throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytrs( 'invalid', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zsytrs throws RangeError for invalid LDA and LDB', function t() {
	assert.throws( function throws() {
		zsytrs( 'column-major', 'upper', 3, 1, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 3 );
	}, RangeError );
	assert.throws( function throws() {
		zsytrs( 'column-major', 'upper', 3, 1, new Complex128Array( 9 ), 3, new Int32Array( 3 ), 1, new Complex128Array( 3 ), 2 );
	}, RangeError );
	assert.throws( function throws() {
		zsytrs( 'row-major', 'upper', 3, 2, new Complex128Array( 9 ), 3, new Int32Array( 3 ), 1, new Complex128Array( 6 ), 1 );
	}, RangeError );
});

test( 'zsytrs: row-major solve matches column-major solve', function t() {
	const uplos = [ 'upper', 'lower' ];
	const nrhs = 3;
	const N = 5;
	let Ac, Ar, Bc, Br, Ipc, Ipr, xr, xc, i, k;
	for ( k = 0; k < uplos.length; k++ ) {
		Ac = cmatrix( N, N, 0.3 + k );
		Ar = toRowMajor( Ac, N, N );
		Bc = cmatrix( N, nrhs, 2.7 + k );
		Br = toRowMajor( Bc, N, nrhs );
		Ipc = new Int32Array( N );
		Ipr = new Int32Array( N );
		zsytrf( 'column-major', uplos[ k ], N, Ac, N, Ipc, 1, null );
		zsytrf( 'row-major', uplos[ k ], N, Ar, N, Ipr, 1, null );
		assert.strictEqual( zsytrs( 'column-major', uplos[ k ], N, nrhs, Ac, N, Ipc, 1, Bc, N ), 0, 'info' );
		assert.strictEqual( zsytrs( 'row-major', uplos[ k ], N, nrhs, Ar, N, Ipr, 1, Br, nrhs ), 0, 'info' );
		// zgemv/zgeru reorder their sums on a col<->row flip (~1 ULP; see
		// test.validate.js), so cross-order agreement is to rounding, not bit-exact:
		xr = reinterpret( Br, 0 );
		xc = reinterpret( toRowMajor( Bc, N, nrhs ), 0 );
		for ( i = 0; i < xc.length; i++ ) {
			assert.ok( Math.abs( xr[ i ] - xc[ i ] ) <= 1e-14 * Math.max( 1.0, Math.abs( xc[ i ] ) ), 'solution[' + i + ']' );
		}
	}
});
