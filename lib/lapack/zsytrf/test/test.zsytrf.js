/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrf from './../lib/zsytrf.js';

import zsytrfStrided from './../lib/strided.js';

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

test( 'zsytrf is a function', function t() {
	assert.strictEqual( typeof zsytrf, 'function', 'is a function' );
});

test( 'zsytrf has expected arity', function t() {
	assert.strictEqual( zsytrf.length, 8, 'has expected arity' );
});

test( 'zsytrf throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytrf( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, null );
	}, TypeError );
});

test( 'zsytrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytrf( 'column-major', 'upper', -1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, null );
	}, RangeError );
});

test( 'zsytrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytrf( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, null );
	}, TypeError );
});

test( 'zsytrf throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		zsytrf( 'column-major', 'upper', 3, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, null );
	}, RangeError );
	assert.throws( function throws() {
		zsytrf( 'row-major', 'upper', 3, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, null );
	}, RangeError );
});

test( 'zsytrf: column-major and row-major match the strided interface; negative strideIPIV reverses IPIV', function t() {
	const uplos = [ 'upper', 'lower' ];
	let Ac, Ar, An, Ip1, Ip2, Ip3, Ip4, N, k;
	N = 5;
	for ( k = 0; k < uplos.length; k++ ) {
		An = cmatrix( N, N, 1.1 + k );
		Ac = cmatrix( N, N, 1.1 + k );
		Ar = toRowMajor( cmatrix( N, N, 1.1 + k ), N, N );
		Ip1 = new Int32Array( N );
		Ip2 = new Int32Array( N );
		Ip3 = new Int32Array( N );
		Ip4 = new Int32Array( N );
		assert.strictEqual( zsytrf( 'column-major', uplos[ k ], N, Ac, N, Ip2, 1, null ), zsytrfStrided( uplos[ k ], N, An, 1, N, 0, Ip1, 1, 0, new Complex128Array( N * 32 ), 1, 0 ), 'info' );
		assert.deepStrictEqual( reinterpret( Ac, 0 ), reinterpret( An, 0 ), 'column-major A' );
		assert.deepStrictEqual( Ip2, Ip1, 'column-major IPIV' );

		An = toRowMajor( cmatrix( N, N, 1.1 + k ), N, N );
		zsytrfStrided( uplos[ k ], N, An, N, 1, 0, Ip3, 1, 0, new Complex128Array( N * 32 ), 1, 0 );
		zsytrf( 'row-major', uplos[ k ], N, Ar, N, Ip4, -1, null );
		assert.deepStrictEqual( reinterpret( Ar, 0 ), reinterpret( An, 0 ), 'row-major A' );
		assert.deepStrictEqual( Array.from( Ip4 ).reverse(), Array.from( Ip3 ), 'row-major IPIV (reversed)' );
	}
});
