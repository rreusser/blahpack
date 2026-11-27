/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfb from './../lib/dlarfb.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Returns a deterministic pseudo-random value for entry (i,j) of a matrix.
*
* @private
* @param {integer} i - row index
* @param {integer} j - column index
* @param {integer} seed - matrix seed
* @returns {number} value
*/
function val( i, j, seed ) {
	return Math.sin( ( 1.3 * i ) + ( 2.7 * j ) + ( 0.9 * seed ) + 0.1 );
}

/**
* Fills a rows-by-cols matrix in the given layout with leading dimension `ld`.
*
* @private
* @param {string} order - layout
* @param {integer} rows - number of rows
* @param {integer} cols - number of columns
* @param {integer} ld - leading dimension
* @param {integer} seed - matrix seed
* @returns {Float64Array} matrix
*/
function fill( order, rows, cols, ld, seed ) {
	const out = new Float64Array( ( order === 'column-major' ) ? ld * cols : rows * ld );
	let i;
	let j;
	for ( i = 0; i < rows; i++ ) {
		for ( j = 0; j < cols; j++ ) {
			if ( order === 'column-major' ) {
				out[ i + ( j * ld ) ] = val( i, j, seed );
			} else {
				out[ ( i * ld ) + j ] = val( i, j, seed );
			}
		}
	}
	return out;
}

/**
* Returns `[ stride1, stride2 ]` for a layout and leading dimension.
*
* @private
* @param {string} order - layout
* @param {integer} ld - leading dimension
* @returns {Array} strides
*/
function strides( order, ld ) {
	return ( order === 'column-major' ) ? [ 1, ld ] : [ ld, 1 ];
}

/**
* Valid arguments for throw tests (column-major, left, columnwise, M=4, N=3, K=2).
*
* @private
* @returns {Array} arguments
*/
function validArgs() {
	return [ 'column-major', 'left', 'no-transpose', 'forward', 'columnwise', 4, 3, 2, new Float64Array( 8 ), 4, new Float64Array( 4 ), 2, new Float64Array( 12 ), 4, new Float64Array( 8 ), 4 ]; // eslint-disable-line max-len
}

/**
* Calls `dlarfb` with argument `idx` replaced by `value`.
*
* @private
* @param {integer} idx - argument index
* @param {*} value - replacement value
* @returns {Function} function which calls `dlarfb`
*/
function withArg( idx, value ) {
	return function call() {
		const args = validArgs();
		args[ idx ] = value;
		dlarfb.apply( null, args );
	};
}


// TESTS //

test( 'dlarfb is a function', function t() {
	assert.strictEqual( typeof dlarfb, 'function', 'is a function' );
});

test( 'dlarfb has expected arity', function t() {
	assert.strictEqual( dlarfb.length, 16, 'has expected arity' );
});

test( 'dlarfb does not throw for valid arguments', function t() {
	assert.doesNotThrow( withArg( 0, 'column-major' ) );
});

test( 'dlarfb throws TypeError for invalid order', function t() {
	assert.throws( withArg( 0, 'invalid' ), TypeError );
});

test( 'dlarfb throws TypeError for invalid side', function t() {
	assert.throws( withArg( 1, 'invalid' ), TypeError );
});

test( 'dlarfb throws TypeError for invalid trans', function t() {
	assert.throws( withArg( 2, 'invalid' ), TypeError );
});

test( 'dlarfb throws TypeError for invalid direct', function t() {
	assert.throws( withArg( 3, 'invalid' ), TypeError );
});

test( 'dlarfb throws TypeError for invalid storev', function t() {
	assert.throws( withArg( 4, 'invalid' ), TypeError );
});

test( 'dlarfb throws RangeError for negative M', function t() {
	assert.throws( withArg( 5, -1 ), RangeError );
});

test( 'dlarfb throws RangeError for negative N', function t() {
	assert.throws( withArg( 6, -1 ), RangeError );
});

test( 'dlarfb throws RangeError for negative K', function t() {
	assert.throws( withArg( 7, -1 ), RangeError );
});

test( 'dlarfb throws RangeError for too small LDT', function t() {
	assert.throws( withArg( 11, 1 ), RangeError );
});

test( 'dlarfb throws RangeError for too small LDC (column-major)', function t() {
	assert.throws( withArg( 13, 3 ), RangeError );
});

test( 'dlarfb throws RangeError for too small LDC (row-major)', function t() {
	const args = validArgs();
	args[ 0 ] = 'row-major';
	args[ 13 ] = 2;
	assert.throws( function throws() {
		dlarfb.apply( null, args );
	}, RangeError );
});

test( 'dlarfb matches ndarray for both layouts and all option combinations, with and without WORK', function t() {
	const directs = [ 'forward', 'backward' ];
	const storevs = [ 'columnwise', 'rowwise' ];
	const orders = [ 'column-major', 'row-major' ];
	const trans = [ 'no-transpose', 'transpose' ];
	const sides = [ 'left', 'right' ];
	const M = 4;
	const N = 3;
	const K = 2;
	let expected;
	let actual2;
	let actual;
	let order;
	let vRows;
	let vCols;
	let nRef;
	let LDV;
	let LDT;
	let LDC;
	let LDW;
	let msg;
	let sV;
	let sT;
	let sC;
	let sW;
	let a;
	let b;
	let c;
	let d;
	let e;
	let i;
	let V;
	let T;
	for ( a = 0; a < orders.length; a++ ) {
		order = orders[ a ];
		for ( b = 0; b < sides.length; b++ ) {
			nRef = ( sides[ b ] === 'left' ) ? M : N;
			for ( c = 0; c < trans.length; c++ ) {
				for ( d = 0; d < directs.length; d++ ) {
					for ( e = 0; e < storevs.length; e++ ) {
						msg = [ order, sides[ b ], trans[ c ], directs[ d ], storevs[ e ] ].join( ' ' );
						vRows = ( storevs[ e ] === 'columnwise' ) ? nRef : K;
						vCols = ( storevs[ e ] === 'columnwise' ) ? K : nRef;
						LDV = ( order === 'column-major' ) ? vRows + 1 : vCols + 1;
						LDT = K + 1;
						LDC = ( order === 'column-major' ) ? M + 1 : N + 1;
						LDW = 5;
						V = fill( order, vRows, vCols, LDV, 1 );
						T = fill( order, K, K, LDT, 2 );
						sV = strides( order, LDV );
						sT = strides( order, LDT );
						sC = strides( order, LDC );
						sW = strides( order, LDW );

						expected = fill( order, M, N, LDC, 3 );
						ndarray( sides[ b ], trans[ c ], directs[ d ], storevs[ e ], M, N, K, V, sV[ 0 ], sV[ 1 ], 0, T, sT[ 0 ], sT[ 1 ], 0, expected, sC[ 0 ], sC[ 1 ], 0, new Float64Array( 25 ), sW[ 0 ], sW[ 1 ], 0 ); // eslint-disable-line max-len

						actual = fill( order, M, N, LDC, 3 );
						dlarfb( order, sides[ b ], trans[ c ], directs[ d ], storevs[ e ], M, N, K, V, LDV, T, LDT, actual, LDC, new Float64Array( 25 ), LDW ); // eslint-disable-line max-len

						actual2 = fill( order, M, N, LDC, 3 );
						dlarfb( order, sides[ b ], trans[ c ], directs[ d ], storevs[ e ], M, N, K, V, LDV, T, LDT, actual2, LDC, null, LDW ); // eslint-disable-line max-len

						assert.notDeepStrictEqual( expected, fill( order, M, N, LDC, 3 ), msg + ': C was updated' );
						for ( i = 0; i < expected.length; i++ ) {
							assert.strictEqual( actual[ i ], expected[ i ], msg + ': C[' + i + ']' );
							assert.strictEqual( actual2[ i ], expected[ i ], msg + ' (null WORK): C[' + i + ']' );
						}
					}
				}
			}
		}
	}
});
