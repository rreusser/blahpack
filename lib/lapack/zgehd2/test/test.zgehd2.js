/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgehd2 from './../lib/zgehd2.js';
import strided from './../lib/strided.js';


// FUNCTIONS //

/**
* Returns a deterministic complex N-by-N matrix stored column-major (`LD = N`).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} matrix
*/
function matrix( N ) {
	const out = new Complex128Array( N * N );
	const v = reinterpret( out, 0 );
	let i;
	for ( i = 0; i < v.length; i++ ) {
		v[ i ] = Math.sin( ( i * i * 0.37 ) + 1.3 );
	}
	return out;
}

/**
* Transposes a complex N-by-N matrix between column-major and row-major storage.
*
* @private
* @param {Complex128Array} A - input matrix
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} transposed storage
*/
function transpose( A, N ) {
	const out = new Complex128Array( N * N );
	const a = reinterpret( A, 0 );
	const o = reinterpret( out, 0 );
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			o[ 2 * ( ( i * N ) + j ) ] = a[ 2 * ( ( j * N ) + i ) ];
			o[ ( 2 * ( ( i * N ) + j ) ) + 1 ] = a[ ( 2 * ( ( j * N ) + i ) ) + 1 ];
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

test( 'zgehd2 is a function', function t() {
	assert.strictEqual( typeof zgehd2, 'function', 'is a function' );
});

test( 'zgehd2 has expected arity', function t() {
	assert.strictEqual( zgehd2.length, 9, 'has expected arity' );
});

test( 'zgehd2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgehd2( 'invalid', 2, 1, 2, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null );
	}, TypeError );
});

test( 'zgehd2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgehd2( 'column-major', -1, 1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 1 ), 1, null );
	}, RangeError );
});

test( 'zgehd2 throws RangeError for LDA < max(1,N) (column-major)', function t() {
	assert.throws( function throws() {
		zgehd2( 'column-major', 3, 1, 3, new Complex128Array( 9 ), 2, new Complex128Array( 2 ), 1, null );
	}, RangeError );
});

test( 'zgehd2 throws RangeError for LDA < max(1,N) (row-major)', function t() {
	assert.throws( function throws() {
		zgehd2( 'row-major', 3, 1, 3, new Complex128Array( 9 ), 2, new Complex128Array( 2 ), 1, null );
	}, RangeError );
});

test( 'zgehd2 (column-major) matches the strided interface bit-exactly', function t() {
	const N = 6;
	const A1 = matrix( N );
	const A2 = matrix( N );
	const T1 = new Complex128Array( N - 1 );
	const T2 = new Complex128Array( N - 1 );
	const info = zgehd2( 'column-major', N, 1, N, A1, N, T1, 1, null );
	strided( N, 1, N, A2, 1, N, 0, T2, 1, 0, new Complex128Array( N ), 1, 0 );
	assert.strictEqual( info, 0, 'returns 0' );
	assert.deepStrictEqual( reinterpret( A1, 0 ), reinterpret( A2, 0 ), 'A' );
	assert.deepStrictEqual( reinterpret( T1, 0 ), reinterpret( T2, 0 ), 'TAU' );
});

test( 'zgehd2 (row-major) matches column-major on transposed storage', function t() {
	const N = 6;
	const Ac = matrix( N );
	const Ar = transpose( Ac, N );
	const Tc = new Complex128Array( N - 1 );
	const Tr = new Complex128Array( N - 1 );
	zgehd2( 'column-major', N, 1, N, Ac, N, Tc, 1, null );
	zgehd2( 'row-major', N, 1, N, Ar, N, Tr, 1, null );
	assertClose( reinterpret( transpose( Ar, N ), 0 ), reinterpret( Ac, 0 ), 1e-12, 'A' );
	assertClose( reinterpret( Tr, 0 ), reinterpret( Tc, 0 ), 1e-12, 'TAU' );
});

test( 'zgehd2 supports a negative TAU stride', function t() {
	const N = 6;
	const A1 = matrix( N );
	const A2 = matrix( N );
	const T1 = new Complex128Array( N - 1 );
	const T2 = new Complex128Array( N - 1 );
	const t1 = reinterpret( T1, 0 );
	const t2 = reinterpret( T2, 0 );
	let i;
	zgehd2( 'column-major', N, 1, N, A1, N, T1, 1, null );
	zgehd2( 'column-major', N, 1, N, A2, N, T2, -1, new Complex128Array( N ) );
	assert.deepStrictEqual( reinterpret( A2, 0 ), reinterpret( A1, 0 ), 'A' );
	for ( i = 0; i < N - 1; i++ ) {
		assert.strictEqual( t2[ 2 * ( N - 2 - i ) ], t1[ 2 * i ], 'TAU re' );
		assert.strictEqual( t2[ ( 2 * ( N - 2 - i ) ) + 1 ], t1[ ( 2 * i ) + 1 ], 'TAU im' );
	}
});
