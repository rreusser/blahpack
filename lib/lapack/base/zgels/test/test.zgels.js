/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgels from './../lib/zgels.js';
import { computeOptimalWorkSize } from './../lib/base.js';


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

test( 'zgels is a function', function t() {
	assert.strictEqual( typeof zgels, 'function', 'is a function' );
});

test( 'zgels has expected arity', function t() {
	assert.strictEqual( zgels.length, 10, 'has expected arity' );
});

test( 'zgels throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zgels( 'column-major', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zgels throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgels( 'column-major', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgels throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgels( 'column-major', 'no-transpose', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgels throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zgels( 'column-major', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zgels throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgels( 'invalid', 'no-transpose', 2, 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 2, null );
	}, TypeError );
});

test( 'zgels throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		zgels( 'column-major', 'no-transpose', 3, 2, 1, new Complex128Array( 6 ), 2, new Complex128Array( 3 ), 3, null );
	}, RangeError );
	assert.throws( function throws() {
		zgels( 'row-major', 'no-transpose', 3, 2, 1, new Complex128Array( 6 ), 1, new Complex128Array( 3 ), 1, null );
	}, RangeError );
});

test( 'zgels throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		zgels( 'column-major', 'no-transpose', 2, 3, 1, new Complex128Array( 6 ), 2, new Complex128Array( 3 ), 2, null );
	}, RangeError );
	assert.throws( function throws() {
		zgels( 'row-major', 'no-transpose', 2, 3, 2, new Complex128Array( 6 ), 3, new Complex128Array( 6 ), 1, null );
	}, RangeError );
});

test( 'zgels: row-major matches column-major (overdetermined and underdetermined)', function t() {
	const cases = [ [ 'no-transpose', 5, 3, 2 ], [ 'no-transpose', 3, 5, 2 ], [ 'conjugate-transpose', 5, 3, 2 ], [ 'conjugate-transpose', 3, 5, 2 ] ];
	let infoC, infoR, ldb, Ac, Bc, Ar, Br, M, N, k, c;
	for ( k = 0; k < cases.length; k++ ) {
		c = cases[ k ];
		M = c[ 1 ];
		N = c[ 2 ];
		ldb = Math.max( M, N );
		Ac = cmatrix( M, N, 1.3 + k );
		Bc = cmatrix( ldb, c[ 3 ], 2.1 + k );
		Ar = toRowMajor( Ac, M, N );
		Br = toRowMajor( Bc, ldb, c[ 3 ] );
		infoC = zgels( 'column-major', c[ 0 ], M, N, c[ 3 ], Ac, M, Bc, ldb, null );
		infoR = zgels( 'row-major', c[ 0 ], M, N, c[ 3 ], Ar, N, Br, c[ 3 ], null );
		assert.strictEqual( infoR, infoC, 'info' );
		assert.deepStrictEqual( reinterpret( Br, 0 ), reinterpret( toRowMajor( Bc, ldb, c[ 3 ] ), 0 ), 'B case ' + k );
		assert.deepStrictEqual( reinterpret( Ar, 0 ), reinterpret( toRowMajor( Ac, M, N ), 0 ), 'A case ' + k );
	}
});

test( 'zgels: computeOptimalWorkSize returns MN + max( MN*NB, nrhs*NB + TSIZE ) (NB = ILAENV( 1, ZGEQRF, ZUNMQR, ZGELQF, ZUNMLQ ) = 32, TSIZE = 4160)', function t() {
	assert.strictEqual( computeOptimalWorkSize( 'no-transpose', 6, 4, 2 ), 4228, 'QR, no-transpose' );
	assert.strictEqual( computeOptimalWorkSize( 'conjugate-transpose', 200, 150, 2 ), 4950, 'QR, transpose' );
	assert.strictEqual( computeOptimalWorkSize( 'no-transpose', 4, 6, 200 ), 10564, 'LQ, no-transpose' );
	assert.strictEqual( computeOptimalWorkSize( 'conjugate-transpose', 4, 6, 2 ), 4228, 'LQ, transpose' );
	assert.strictEqual( computeOptimalWorkSize( 'no-transpose', 0, 0, 0 ), 4160, 'empty' );
});
