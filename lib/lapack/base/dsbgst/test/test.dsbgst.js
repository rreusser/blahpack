/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsbgst from './../lib/dsbgst.js';


// FUNCTIONS //

/**
* Returns the row-major copy of a column-major `rows`-by-`cols` matrix (leading dimension `rows`).
*
* @private
* @param {Float64Array} A - column-major matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Float64Array} row-major copy (leading dimension `cols`)
*/
function toRowMajor( A, rows, cols ) {
	const out = new Float64Array( rows * cols );
	for ( let i = 0; i < rows; i++ ) {
		for ( let j = 0; j < cols; j++ ) {
			out[ ( i * cols ) + j ] = A[ ( j * rows ) + i ];
		}
	}
	return out;
}

/**
* Runs dsbgst in column-major and row-major order on the same band data and asserts identical results.
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
	const ABc = new Float64Array( ( ka + 1 ) * N );
	const BBc = new Float64Array( ( kb + 1 ) * N );
	for ( let j = 0; j < N; j++ ) {
		for ( let r = 0; r <= ka; r++ ) {
			ABc[ ( j * ( ka + 1 ) ) + r ] = ( r === diagA ) ? 10.0 + j : 0.5 + ( 0.25 * r ) - ( 0.125 * j );
		}
		for ( let r = 0; r <= kb; r++ ) {
			BBc[ ( j * ( kb + 1 ) ) + r ] = ( r === diagB ) ? 2.0 + ( 0.5 * j ) : 0.3 - ( 0.1 * j );
		}
	}
	const ABr = toRowMajor( ABc, ka + 1, N );
	const BBr = toRowMajor( BBc, kb + 1, N );
	const Xc = new Float64Array( N * N );
	const Xr = new Float64Array( N * N );

	const infoc = dsbgst( 'column-major', 'update', uplo, N, ka, kb, ABc, ka + 1, BBc, kb + 1, Xc, N, new Float64Array( 2 * N ) );
	const infor = dsbgst( 'row-major', 'update', uplo, N, ka, kb, ABr, N, BBr, N, Xr, N, new Float64Array( 2 * N ) );

	assert.strictEqual( infoc, 0, 'info (column-major)' );
	assert.strictEqual( infor, infoc, 'info' );
	assert.deepStrictEqual( ABr, toRowMajor( ABc, ka + 1, N ), 'AB matches' );
	assert.deepStrictEqual( BBr, toRowMajor( BBc, kb + 1, N ), 'BB matches' );
	assert.deepStrictEqual( Xr, toRowMajor( Xc, N, N ), 'X matches' );

	// The transformation must be non-trivial (X differs from the identity):
	let off = 0.0;
	for ( let i = 0; i < N * N; i++ ) {
		off += Math.abs( Xc[ i ] - ( ( i % ( N + 1 ) === 0 ) ? 1.0 : 0.0 ) );
	}
	assert.ok( off > 1e-3, 'X is not the identity' );
}


// TESTS //

test( 'dsbgst is a function', function t() {
	assert.strictEqual( typeof dsbgst, 'function', 'is a function' );
});

test( 'dsbgst has expected arity', function t() {
	assert.strictEqual( dsbgst.length, 13, 'has expected arity' );
});

test( 'dsbgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dsbgst( 'column-major', 'none', 'invalid', 3, 1, 1, new Float64Array( 9 ), 2, new Float64Array( 9 ), 2, new Float64Array( 9 ), 3, new Float64Array( 6 ) );
	}, /must be one of the following: "upper", "lower"|valid matrix triangle/ );
});

test( 'dsbgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dsbgst( 'column-major', 'none', 'upper', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dsbgst accepts vect = "none" and rejects an unknown vect (reference VECT = N or V)', function t() {
	// The wrapper accepted only 'update', so 'none' (VECT = 'N') threw.
	const AB = new Float64Array( 6 );
	const BB = new Float64Array( 6 );
	assert.doesNotThrow( function none() {
		dsbgst( 'column-major', 'none', 'upper', 3, 1, 1, AB, 2, BB, 2, new Float64Array( 1 ), 1, new Float64Array( 6 ) );
	});
	assert.throws( function bad() {
		dsbgst( 'column-major', 'initialize', 'upper', 3, 1, 1, AB, 2, BB, 2, new Float64Array( 9 ), 3, new Float64Array( 6 ) );
	}, /Second argument must be one of the following: "none", "update"/ );
});


test( 'dsbgst: row-major order equals column-major order on transposed storage (upper, vect=update)', function t() {
	checkRowMajor( 'upper' );
});

test( 'dsbgst: row-major order equals column-major order on transposed storage (lower, vect=update)', function t() {
	checkRowMajor( 'lower' );
});
