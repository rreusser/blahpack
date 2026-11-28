/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlahr2 from './../lib/dlahr2.js';
import strided from './../lib/strided.js';


// VARIABLES //

const N = 8;
const K = 2;
const NB = 3;
const C = N - K + 1;


// FUNCTIONS //

/**
* Returns the input array (real-valued arrays need no view).
*
* @private
* @param {Float64Array} x - input array
* @returns {Float64Array} input array
*/
function view( x ) {
	return x;
}

/**
* Returns a deterministic `rows`-by-`cols` matrix stored column-major (`LD = rows`).
*
* @private
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Float64Array} matrix
*/
function matrix( rows, cols ) {
	const out = new Float64Array( rows * cols );
	const v = view( out );
	let i;
	for ( i = 0; i < v.length; i++ ) {
		v[ i ] = Math.sin( ( i * i * 0.37 ) + 1.3 );
	}
	return out;
}

/**
* Converts a `rows`-by-`cols` matrix between column-major (`LD = rows`) and row-major (`LD = cols`) storage.
*
* @private
* @param {Float64Array} A - input matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @param {boolean} toRow - whether the input is column-major
* @returns {Float64Array} converted storage
*/
function convert( A, rows, cols, toRow ) {
	const out = new Float64Array( rows * cols );
	const a = view( A );
	const o = view( out );
	let src;
	let dst;
	let i;
	let j;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			src = ( toRow ) ? ( j * rows ) + i : ( i * cols ) + j;
			dst = ( toRow ) ? ( i * cols ) + j : ( j * rows ) + i;
			o[ dst ] = a[ src ];
		}
	}
	return out;
}

/**
* Asserts that two arrays agree to within a relative tolerance.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Float64Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	let i;
	assert.strictEqual( actual.length, expected.length, msg + ': length' );
	for ( i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( actual[ i ] - expected[ i ] ) <= tol * Math.max( 1.0, Math.abs( expected[ i ] ) ), msg + '[' + i + ']: ' + actual[ i ] + ' vs ' + expected[ i ] );
	}
}


// TESTS //

test( 'dlahr2 is a function', function t() {
	assert.strictEqual( typeof dlahr2, 'function', 'is a function' );
});

test( 'dlahr2 has expected arity', function t() {
	assert.strictEqual( dlahr2.length, 12, 'has expected arity' );
});

test( 'dlahr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlahr2( 'invalid', N, K, NB, new Float64Array( N * C ), N, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N );
	}, TypeError );
});

test( 'dlahr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlahr2( 'column-major', -1, K, NB, new Float64Array( N * C ), N, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N );
	}, RangeError );
});

test( 'dlahr2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlahr2( 'column-major', N, -1, NB, new Float64Array( N * C ), N, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N );
	}, RangeError );
});

test( 'dlahr2 throws RangeError for an invalid LDA', function t() {
	assert.throws( function throws() {
		dlahr2( 'column-major', N, K, NB, new Float64Array( N * C ), N - 1, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N );
	}, RangeError );
	assert.throws( function throws() {
		dlahr2( 'row-major', N, K, NB, new Float64Array( N * C ), C - 1, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), NB );
	}, RangeError );
});

test( 'dlahr2 throws RangeError for an invalid LDT', function t() {
	assert.throws( function throws() {
		dlahr2( 'column-major', N, K, NB, new Float64Array( N * C ), N, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB - 1, new Float64Array( N * NB ), N );
	}, RangeError );
	assert.throws( function throws() {
		dlahr2( 'row-major', N, K, NB, new Float64Array( N * C ), C, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB - 1, new Float64Array( N * NB ), NB );
	}, RangeError );
});

test( 'dlahr2 throws RangeError for an invalid LDY', function t() {
	assert.throws( function throws() {
		dlahr2( 'column-major', N, K, NB, new Float64Array( N * C ), N, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N - 1 );
	}, RangeError );
	assert.throws( function throws() {
		dlahr2( 'row-major', N, K, NB, new Float64Array( N * C ), C, new Float64Array( NB ), 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), NB - 1 );
	}, RangeError );
});

test( 'dlahr2 (column-major) matches the strided interface bit-exactly', function t() {
	const A1 = matrix( N, C );
	const A2 = matrix( N, C );
	const tau1 = new Float64Array( NB );
	const tau2 = new Float64Array( NB );
	const T1 = new Float64Array( NB * NB );
	const T2 = new Float64Array( NB * NB );
	const Y1 = new Float64Array( N * NB );
	const Y2 = new Float64Array( N * NB );
	dlahr2( 'column-major', N, K, NB, A1, N, tau1, 1, T1, NB, Y1, N );
	strided( N, K, NB, A2, 1, N, 0, tau2, 1, 0, T2, 1, NB, 0, Y2, 1, N, 0 );
	assert.deepStrictEqual( view( A1 ), view( A2 ), 'A' );
	assert.deepStrictEqual( view( tau1 ), view( tau2 ), 'tau' );
	assert.deepStrictEqual( view( T1 ), view( T2 ), 'T' );
	assert.deepStrictEqual( view( Y1 ), view( Y2 ), 'Y' );
});

test( 'dlahr2 (row-major) matches column-major on transposed storage', function t() {
	const Ac = matrix( N, C );
	const Ar = convert( Ac, N, C, true );
	const tauc = new Float64Array( NB );
	const taur = new Float64Array( NB );
	const Tc = new Float64Array( NB * NB );
	const Tr = new Float64Array( NB * NB );
	const Yc = new Float64Array( N * NB );
	const Yr = new Float64Array( N * NB );
	dlahr2( 'column-major', N, K, NB, Ac, N, tauc, 1, Tc, NB, Yc, N );
	dlahr2( 'row-major', N, K, NB, Ar, C, taur, 1, Tr, NB, Yr, NB );
	assertClose( view( convert( Ar, N, C, false ) ), view( Ac ), 1e-13, 'A' );
	assertClose( view( taur ), view( tauc ), 1e-13, 'tau' );
	assertClose( view( convert( Tr, NB, NB, false ) ), view( Tc ), 1e-13, 'T' );
	assertClose( view( convert( Yr, N, NB, false ) ), view( Yc ), 1e-13, 'Y' );
});

test( 'dlahr2 supports a negative tau stride', function t() {
	const A1 = matrix( N, C );
	const A2 = matrix( N, C );
	const tau1 = new Float64Array( NB );
	const tau2 = new Float64Array( NB );
	const t1 = view( tau1 );
	const t2 = view( tau2 );
	let i;
	dlahr2( 'column-major', N, K, NB, A1, N, tau1, 1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N );
	dlahr2( 'column-major', N, K, NB, A2, N, tau2, -1, new Float64Array( NB * NB ), NB, new Float64Array( N * NB ), N );
	assert.deepStrictEqual( view( A2 ), view( A1 ), 'A' );
	for ( i = 0; i < NB; i++ ) {
		assert.strictEqual( t2[ NB - 1 - i ], t1[ i ], 'tau' );
	}
});
