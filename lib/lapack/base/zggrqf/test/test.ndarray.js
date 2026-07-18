/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggrqf from './../lib/ndarray.js';

// FIXTURES //

import basic_3x3 from './fixtures/basic_3x3.json' with { type: 'json' };
import m_lt_n from './fixtures/m_lt_n.json' with { type: 'json' };
import m_gt_n from './fixtures/m_gt_n.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import m_one from './fixtures/m_one.json' with { type: 'json' };
import wide_short from './fixtures/wide_short.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are close within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {

	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;

	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

/**
* Converts a typed array to a plain Array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} plain array
*/
function toArray( arr ) {
	let i;

	const out = [];
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Builds a column-major interleaved array for a complex M-by-N matrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Array} vals - flat array of re/im pairs in row-major order
* @returns {Array} interleaved re/im in column-major layout
*/
function colMajorComplex( M, N, vals ) {
	let idx, i, j;

	const out = [];
	out.length = 2 * M * N;
	for ( j = 0; j < N; j += 1 ) {
		for ( i = 0; i < M; i += 1 ) {
			idx = ((i * N) + j) * 2;
			out[ ((j * M) + i) * 2 ] = vals[ idx ];
			out[ (((j * M) + i) * 2) + 1 ] = vals[ idx + 1 ];
		}
	}
	return out;
}

/**
* Calls zggrqf with the given parameters.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} P - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Array} aFlat - interleaved re/im values for A (column-major)
* @param {Array} bFlat - interleaved re/im values for B (column-major)
* @returns {Object} results containing info, A, TAUA, B, TAUB
*/
function callZggrqf( M, P, N, aFlat, bFlat ) {

	const WORK = new Complex128Array( Math.max( 1, Math.max( N, M, P ) * 64 ) );
	const TAUA = new Complex128Array( Math.min( M, N ) );
	const TAUB = new Complex128Array( Math.min( P, N ) );
	const A = new Complex128Array( new Float64Array( aFlat ) );
	const B = new Complex128Array( new Float64Array( bFlat ) );

	// Column-major: strideA1=1, strideA2=M (in complex elements)
	const info = zggrqf( M, P, N, A, 1, M, 0, TAUA, 1, 0, B, 1, P, 0, TAUB, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	return {
		'info': info,
		'A': toArray( reinterpret( A, 0 ) ),
		'TAUA': toArray( reinterpret( TAUA, 0 ) ),
		'B': toArray( reinterpret( B, 0 ) ),
		'TAUB': toArray( reinterpret( TAUB, 0 ) )
	};
}

// TESTS //

test( 'zggrqf is a function', function t() {
	assert.equal( typeof zggrqf, 'function' );
});

test( 'zggrqf: basic_3x3', function t() {

	const tc = basic_3x3;
	const A = colMajorComplex( 3, 3, [
		2,
		1,
		1,
		2,
		3,
		0,
		1,
		0,
		4,
		1,
		2,
		-1,
		3,
		-1,
		2,
		0,
		5,
		2
	]);
	const B = colMajorComplex( 3, 3, [
		1,
		0.5,
		2,
		1,
		1,
		-1,
		3,
		0,
		1,
		-1,
		2,
		0.5,
		2,
		1,
		3,
		0,
		1,
		1
	]);
	const res = callZggrqf( 3, 3, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'zggrqf: m_lt_n', function t() {

	const tc = m_lt_n;
	const A = colMajorComplex( 2, 4, [
		2,
		1,
		1,
		2,
		3,
		0,
		1,
		1,
		1,
		0,
		4,
		1,
		2,
		-1,
		3,
		0
	]);
	const B = colMajorComplex( 3, 4, [
		1,
		0.5,
		2,
		1,
		1,
		-1,
		3,
		0,
		3,
		0,
		1,
		-1,
		2,
		0.5,
		1,
		1,
		2,
		1,
		3,
		0,
		1,
		1,
		2,
		-1
	]);
	const res = callZggrqf( 2, 3, 4, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'zggrqf: m_gt_n', function t() {

	const tc = m_gt_n;
	const A = colMajorComplex( 4, 3, [
		2,
		1,
		1,
		2,
		3,
		0,
		1,
		0,
		4,
		1,
		2,
		-1,
		3,
		-1,
		2,
		0,
		5,
		2,
		1,
		1,
		3,
		-1,
		1,
		0.5
	]);
	const B = colMajorComplex( 3, 3, [
		1,
		0.5,
		2,
		1,
		1,
		-1,
		3,
		0,
		1,
		-1,
		2,
		0.5,
		2,
		1,
		3,
		0,
		1,
		1
	]);
	const res = callZggrqf( 4, 3, 3, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'zggrqf: m_zero (quick return)', function t() {

	const tc = m_zero;
	const WORK = new Complex128Array( 64 );
	const TAUA = new Complex128Array( 0 );
	const TAUB = new Complex128Array( 0 );
	const A = new Complex128Array( 0 );
	const B = new Complex128Array( 0 );
	const info = zggrqf( 0, 3, 3, A, 1, 0, 0, TAUA, 1, 0, B, 1, 3, 0, TAUB, 1, 0, WORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});

test( 'zggrqf: m_one', function t() {

	const tc = m_one;
	const A = [
		5, 2
	];
	const B = [
		3, -1
	];
	const res = callZggrqf( 1, 1, 1, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});

test( 'zggrqf: wide_short', function t() {

	const tc = wide_short;
	const A = colMajorComplex( 2, 5, [
		1,
		0.5,
		2,
		1,
		3,
		0,
		1,
		-1,
		2,
		0,
		3,
		0,
		1,
		-1,
		2,
		0.5,
		1,
		1,
		0.5,
		0
	]);
	const B = colMajorComplex( 5, 5, [
		1,
		0.5,
		0.5,
		1,
		2,
		0,
		1,
		0,
		0.5,
		-0.5,
		0.5,
		0,
		3,
		-1,
		1,
		0.5,
		2,
		0,
		1,
		1,
		2,
		1,
		1,
		0,
		1,
		-1,
		0.5,
		0.5,
		3,
		0,
		1,
		-1,
		2,
		0.5,
		0.5,
		0,
		1,
		1,
		2,
		-0.5,
		3,
		0,
		1,
		1,
		2,
		-0.5,
		0.5,
		0,
		1,
		0.5
	]);
	const res = callZggrqf( 2, 5, 5, A, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.A, tc.A, 1e-14, 'A' );
	assertArrayClose( res.TAUA, tc.TAUA, 1e-14, 'TAUA' );
	assertArrayClose( res.B, tc.B, 1e-14, 'B' );
	assertArrayClose( res.TAUB, tc.TAUB, 1e-14, 'TAUB' );
});
