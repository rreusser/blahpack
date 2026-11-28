/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlahr2 from './../lib/zlahr2.js';
import strided from './../lib/strided.js';


// VARIABLES //

const N = 8;
const K = 2;
const NB = 3;
const C = N - K + 1;


// FUNCTIONS //

/**
* Returns a real-valued view of a complex array.
*
* @private
* @param {Complex128Array} x - input array
* @returns {Float64Array} view
*/
function view( x ) {
	return reinterpret( x, 0 );
}

/**
* Returns a deterministic `rows`-by-`cols` matrix stored column-major (`LD = rows`).
*
* @private
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @returns {Complex128Array} matrix
*/
function matrix( rows, cols ) {
	const out = new Complex128Array( rows * cols );
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
* @param {Complex128Array} A - input matrix
* @param {NonNegativeInteger} rows - number of rows
* @param {NonNegativeInteger} cols - number of columns
* @param {boolean} toRow - whether the input is column-major
* @returns {Complex128Array} converted storage
*/
function convert( A, rows, cols, toRow ) {
	const out = new Complex128Array( rows * cols );
	const a = view( A );
	const o = view( out );
	let src;
	let dst;
	let i;
	let j;
	let k;
	for ( j = 0; j < cols; j++ ) {
		for ( i = 0; i < rows; i++ ) {
			src = ( toRow ) ? ( j * rows ) + i : ( i * cols ) + j;
			dst = ( toRow ) ? ( i * cols ) + j : ( j * rows ) + i;
			for ( k = 0; k < 2; k++ ) {
				o[ ( 2 * dst ) + k ] = a[ ( 2 * src ) + k ];
			}
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

test( 'zlahr2 is a function', function t() {
	assert.strictEqual( typeof zlahr2, 'function', 'is a function' );
});

test( 'zlahr2 has expected arity', function t() {
	assert.strictEqual( zlahr2.length, 12, 'has expected arity' );
});

test( 'zlahr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlahr2( 'invalid', N, K, NB, new Complex128Array( N * C ), N, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N );
	}, TypeError );
});

test( 'zlahr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlahr2( 'column-major', -1, K, NB, new Complex128Array( N * C ), N, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N );
	}, RangeError );
});

test( 'zlahr2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlahr2( 'column-major', N, -1, NB, new Complex128Array( N * C ), N, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N );
	}, RangeError );
});

test( 'zlahr2 throws RangeError for an invalid LDA', function t() {
	assert.throws( function throws() {
		zlahr2( 'column-major', N, K, NB, new Complex128Array( N * C ), N - 1, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N );
	}, RangeError );
	assert.throws( function throws() {
		zlahr2( 'row-major', N, K, NB, new Complex128Array( N * C ), C - 1, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), NB );
	}, RangeError );
});

test( 'zlahr2 throws RangeError for an invalid LDT', function t() {
	assert.throws( function throws() {
		zlahr2( 'column-major', N, K, NB, new Complex128Array( N * C ), N, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB - 1, new Complex128Array( N * NB ), N );
	}, RangeError );
	assert.throws( function throws() {
		zlahr2( 'row-major', N, K, NB, new Complex128Array( N * C ), C, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB - 1, new Complex128Array( N * NB ), NB );
	}, RangeError );
});

test( 'zlahr2 throws RangeError for an invalid LDY', function t() {
	assert.throws( function throws() {
		zlahr2( 'column-major', N, K, NB, new Complex128Array( N * C ), N, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N - 1 );
	}, RangeError );
	assert.throws( function throws() {
		zlahr2( 'row-major', N, K, NB, new Complex128Array( N * C ), C, new Complex128Array( NB ), 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), NB - 1 );
	}, RangeError );
});

test( 'zlahr2 (column-major) matches the strided interface bit-exactly', function t() {
	const A1 = matrix( N, C );
	const A2 = matrix( N, C );
	const tau1 = new Complex128Array( NB );
	const tau2 = new Complex128Array( NB );
	const T1 = new Complex128Array( NB * NB );
	const T2 = new Complex128Array( NB * NB );
	const Y1 = new Complex128Array( N * NB );
	const Y2 = new Complex128Array( N * NB );
	zlahr2( 'column-major', N, K, NB, A1, N, tau1, 1, T1, NB, Y1, N );
	strided( N, K, NB, A2, 1, N, 0, tau2, 1, 0, T2, 1, NB, 0, Y2, 1, N, 0 );
	assert.deepStrictEqual( view( A1 ), view( A2 ), 'A' );
	assert.deepStrictEqual( view( tau1 ), view( tau2 ), 'tau' );
	assert.deepStrictEqual( view( T1 ), view( T2 ), 'T' );
	assert.deepStrictEqual( view( Y1 ), view( Y2 ), 'Y' );
});

test( 'zlahr2 (row-major) matches column-major on transposed storage', function t() {
	const Ac = matrix( N, C );
	const Ar = convert( Ac, N, C, true );
	const tauc = new Complex128Array( NB );
	const taur = new Complex128Array( NB );
	const Tc = new Complex128Array( NB * NB );
	const Tr = new Complex128Array( NB * NB );
	const Yc = new Complex128Array( N * NB );
	const Yr = new Complex128Array( N * NB );
	zlahr2( 'column-major', N, K, NB, Ac, N, tauc, 1, Tc, NB, Yc, N );
	zlahr2( 'row-major', N, K, NB, Ar, C, taur, 1, Tr, NB, Yr, NB );
	assertClose( view( convert( Ar, N, C, false ) ), view( Ac ), 1e-13, 'A' );
	assertClose( view( taur ), view( tauc ), 1e-13, 'tau' );
	assertClose( view( convert( Tr, NB, NB, false ) ), view( Tc ), 1e-13, 'T' );
	assertClose( view( convert( Yr, N, NB, false ) ), view( Yc ), 1e-13, 'Y' );
});

test( 'zlahr2 supports a negative tau stride', function t() {
	const A1 = matrix( N, C );
	const A2 = matrix( N, C );
	const tau1 = new Complex128Array( NB );
	const tau2 = new Complex128Array( NB );
	const t1 = view( tau1 );
	const t2 = view( tau2 );
	let i;
	let k;
	zlahr2( 'column-major', N, K, NB, A1, N, tau1, 1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N );
	zlahr2( 'column-major', N, K, NB, A2, N, tau2, -1, new Complex128Array( NB * NB ), NB, new Complex128Array( N * NB ), N );
	assert.deepStrictEqual( view( A2 ), view( A1 ), 'A' );
	for ( i = 0; i < NB; i++ ) {
		for ( k = 0; k < 2; k++ ) {
			assert.strictEqual( t2[ ( 2 * ( NB - 1 - i ) ) + k ], t1[ ( 2 * i ) + k ], 'tau' );
		}
	}
});
