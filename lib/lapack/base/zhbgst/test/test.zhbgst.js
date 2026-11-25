/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhbgst from './../lib/zhbgst.js';


// FUNCTIONS //

/**
* Returns the row-major copy of an interleaved column-major complex `rows`-by-`cols` matrix (leading dimension `rows`).
*
* @private
* @param {Float64Array} A - interleaved column-major matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Float64Array} interleaved row-major copy (leading dimension `cols`)
*/
function toRowMajor( A, rows, cols ) {
	const out = new Float64Array( 2 * rows * cols );
	for ( let i = 0; i < rows; i++ ) {
		for ( let j = 0; j < cols; j++ ) {
			out[ 2 * ( ( i * cols ) + j ) ] = A[ 2 * ( ( j * rows ) + i ) ];
			out[ ( 2 * ( ( i * cols ) + j ) ) + 1 ] = A[ ( 2 * ( ( j * rows ) + i ) ) + 1 ];
		}
	}
	return out;
}

/**
* Runs zhbgst in column-major and row-major order on the same band data and asserts identical results.
*
* @private
* @param {string} uplo - matrix triangle
*/
function checkRowMajor( uplo ) {
	const N = 5;
	const ka = 2;
	const kb = 1;
	const diagA = ( uplo === 'upper' ) ? ka : 0;
	const diagB = ( uplo === 'upper' ) ? kb : 0;
	const abc = new Float64Array( 2 * ( ka + 1 ) * N );
	const bbc = new Float64Array( 2 * ( kb + 1 ) * N );
	for ( let j = 0; j < N; j++ ) {
		for ( let r = 0; r <= ka; r++ ) {
			const idx = 2 * ( ( j * ( ka + 1 ) ) + r );
			abc[ idx ] = ( r === diagA ) ? 10.0 + j : 0.5 + ( 0.25 * r ) - ( 0.125 * j );
			abc[ idx + 1 ] = ( r === diagA ) ? 0.0 : 0.2 - ( 0.15 * r ) + ( 0.05 * j );
		}
		for ( let r = 0; r <= kb; r++ ) {
			const idx = 2 * ( ( j * ( kb + 1 ) ) + r );
			bbc[ idx ] = ( r === diagB ) ? 2.0 + ( 0.5 * j ) : 0.3 - ( 0.1 * j );
			bbc[ idx + 1 ] = ( r === diagB ) ? 0.0 : 0.1 + ( 0.05 * j );
		}
	}
	const ABc = new Complex128Array( abc );
	const BBc = new Complex128Array( bbc );
	const ABr = new Complex128Array( toRowMajor( abc, ka + 1, N ) );
	const BBr = new Complex128Array( toRowMajor( bbc, kb + 1, N ) );
	const Xc = new Complex128Array( N * N );
	const Xr = new Complex128Array( N * N );

	const infoc = zhbgst( 'column-major', 'update', uplo, N, ka, kb, ABc, ka + 1, BBc, kb + 1, Xc, N, new Complex128Array( N ), new Float64Array( N ) );
	const infor = zhbgst( 'row-major', 'update', uplo, N, ka, kb, ABr, N, BBr, N, Xr, N, new Complex128Array( N ), new Float64Array( N ) );

	assert.strictEqual( infoc, 0, 'info (column-major)' );
	assert.strictEqual( infor, infoc, 'info' );
	assert.deepStrictEqual( reinterpret( ABr, 0 ), toRowMajor( reinterpret( ABc, 0 ), ka + 1, N ), 'AB matches' );
	assert.deepStrictEqual( reinterpret( BBr, 0 ), toRowMajor( reinterpret( BBc, 0 ), kb + 1, N ), 'BB matches' );
	assert.deepStrictEqual( reinterpret( Xr, 0 ), toRowMajor( reinterpret( Xc, 0 ), N, N ), 'X matches' );

	// The transformation must be non-trivial and genuinely complex:
	const xv = reinterpret( Xc, 0 );
	let off = 0.0;
	let im = 0.0;
	for ( let i = 0; i < N * N; i++ ) {
		off += Math.abs( xv[ 2 * i ] - ( ( i % ( N + 1 ) === 0 ) ? 1.0 : 0.0 ) );
		im += Math.abs( xv[ ( 2 * i ) + 1 ] );
	}
	assert.ok( off > 1e-3, 'X is not the identity' );
	assert.ok( im > 1e-3, 'X has nonzero imaginary parts' );
}


// TESTS //

test( 'zhbgst is a function', function t() {
	assert.strictEqual( typeof zhbgst, 'function', 'is a function' );
});

test( 'zhbgst has expected arity', function t() {
	assert.strictEqual( zhbgst.length, 14, 'has expected arity' );
});

test( 'zhbgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhbgst( 'column-major', 'none', 'invalid', 3, 1, 1, new Complex128Array( 9 ), 2, new Complex128Array( 9 ), 2, new Complex128Array( 9 ), 3, new Complex128Array( 3 ) );
	}, /must be one of the following: "upper", "lower"|valid matrix triangle/ );
});

test( 'zhbgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhbgst( 'column-major', 'none', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhbgst accepts vect = "none" and rejects an unknown vect (reference VECT = N or V)', function t() {
	// The wrapper accepted only 'update', so 'none' (VECT = 'N') threw.
	const AB = new Complex128Array( 6 );
	const BB = new Complex128Array( 6 );
	assert.doesNotThrow( function none() {
		zhbgst( 'column-major', 'none', 'upper', 3, 1, 1, AB, 2, BB, 2, new Complex128Array( 1 ), 1, new Complex128Array( 3 ) );
	});
	assert.throws( function bad() {
		zhbgst( 'column-major', 'initialize', 'upper', 3, 1, 1, AB, 2, BB, 2, new Complex128Array( 9 ), 3, new Complex128Array( 3 ) );
	}, /Second argument must be one of the following: "none", "update"/ );
});

test( 'zhbgst: row-major order equals column-major order on transposed storage (upper, vect=update)', function t() {
	checkRowMajor( 'upper' );
});

test( 'zhbgst: row-major order equals column-major order on transposed storage (lower, vect=update)', function t() {
	checkRowMajor( 'lower' );
});
