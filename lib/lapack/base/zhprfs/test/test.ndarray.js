/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrf from './../../zhptrf/lib/base.js';
import zhptrs from './../../zhptrs/lib/base.js';
import zhprfs from './../lib/ndarray.js';

// FIXTURES //

import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_3x3_2rhs from './fixtures/upper_3x3_2rhs.json' with { type: 'json' };
import n0 from './fixtures/n0.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extracts N*nrhs complex elements from Fortran column-major data with padding.
*
* Fortran stores B(LDB, nrhs) with LDB=NMAX=4, but we only want N rows.
* The Fortran EQUIVALENCE gives us interleaved re/im for the full array.
*
* @private
* @param {Array} data - interleaved real/imag from fixture (length 2*LDB*nrhs)
* @param {number} n - number of rows we want
* @param {number} nrhs - number of columns
* @param {number} ldb - leading dimension (NMAX=4 in our test)
* @returns {Float64Array} - interleaved re/im of N*nrhs complex values, col-major with stride N
*/
function extractColMajor( data, n, nrhs, ldb ) {
	const out = new Float64Array( 2 * n * nrhs );
	let j, i;
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < n; i++ ) {
			out[ ((j * n) + i) * 2 ] = data[ ((j * ldb) + i) * 2 ];
			out[ (((j * n) + i) * 2) + 1 ] = data[ (((j * ldb) + i) * 2) + 1 ];
		}
	}
	return out;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zhprfs: upper_3x3', function t() {
	let i;

	const tc = upper_3x3;
	const n = tc.N;
	const nrhs = tc.nrhs;
	const nap = n * (n + 1) / 2;
	const AP = new Complex128Array( nap );
	const APv = reinterpret( AP, 0 );
	for ( i = 0; i < 2 * nap; i++ ) {
		APv[ i ] = tc.AP[ i ];
	}
	const AFP = new Complex128Array( nap );
	const AFPv = reinterpret( AFP, 0 );
	for ( i = 0; i < 2 * nap; i++ ) {
		AFPv[ i ] = APv[ i ];
	}
	const IPIV = new Int32Array( n );
	zhptrf( 'upper', n, AFP, 1, 0, IPIV, 1, 0 );
	const Bdata = extractColMajor( tc.B, n, nrhs, 4 );
	const B = new Complex128Array( n * nrhs );
	const Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bdata.length; i++ ) {
		Bv[ i ] = Bdata[ i ];
	}
	const X = new Complex128Array( n * nrhs );
	const Xv = reinterpret( X, 0 );
	for ( i = 0; i < Bdata.length; i++ ) {
		Xv[ i ] = Bdata[ i ];
	}
	zhptrs( 'upper', n, nrhs, AFP, 1, 0, IPIV, 1, 0, X, 1, n, 0 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zhprfs( 'upper', n, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	const expectedX = extractColMajor( tc.X, n, nrhs, 4 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( Xv ).slice( 0, 2 * n * nrhs ), toArray( expectedX ), 1e-12, 'X' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zhprfs: lower_3x3', function t() {
	let i;

	const tc = lower_3x3;
	const n = tc.N;
	const nrhs = tc.nrhs;
	const nap = n * (n + 1) / 2;
	const AP = new Complex128Array( nap );
	const APv = reinterpret( AP, 0 );
	for ( i = 0; i < 2 * nap; i++ ) {
		APv[ i ] = tc.AP[ i ];
	}
	const AFP = new Complex128Array( nap );
	const AFPv = reinterpret( AFP, 0 );
	for ( i = 0; i < 2 * nap; i++ ) {
		AFPv[ i ] = APv[ i ];
	}
	const IPIV = new Int32Array( n );
	zhptrf( 'lower', n, AFP, 1, 0, IPIV, 1, 0 );
	const Bdata = extractColMajor( tc.B, n, nrhs, 4 );
	const B = new Complex128Array( n * nrhs );
	const Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bdata.length; i++ ) {
		Bv[ i ] = Bdata[ i ];
	}
	const X = new Complex128Array( n * nrhs );
	const Xv = reinterpret( X, 0 );
	for ( i = 0; i < Bdata.length; i++ ) {
		Xv[ i ] = Bdata[ i ];
	}
	zhptrs( 'lower', n, nrhs, AFP, 1, 0, IPIV, 1, 0, X, 1, n, 0 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zhprfs( 'lower', n, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	const expectedX = extractColMajor( tc.X, n, nrhs, 4 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( Xv ).slice( 0, 2 * n * nrhs ), toArray( expectedX ), 1e-12, 'X' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BERR ), tc.berr, 1e-10, 'berr' );
});

test( 'zhprfs: upper_3x3_2rhs', function t() {
	let i;

	const tc = upper_3x3_2rhs;
	const n = tc.N;
	const nrhs = tc.nrhs;
	const nap = n * (n + 1) / 2;
	const AP = new Complex128Array( nap );
	const APv = reinterpret( AP, 0 );
	for ( i = 0; i < 2 * nap; i++ ) {
		APv[ i ] = tc.AP[ i ];
	}
	const AFP = new Complex128Array( nap );
	const AFPv = reinterpret( AFP, 0 );
	for ( i = 0; i < 2 * nap; i++ ) {
		AFPv[ i ] = APv[ i ];
	}
	const IPIV = new Int32Array( n );
	zhptrf( 'upper', n, AFP, 1, 0, IPIV, 1, 0 );
	const Bdata = extractColMajor( tc.B, n, nrhs, 4 );
	const B = new Complex128Array( n * nrhs );
	const Bv = reinterpret( B, 0 );
	for ( i = 0; i < Bdata.length; i++ ) {
		Bv[ i ] = Bdata[ i ];
	}
	const X = new Complex128Array( n * nrhs );
	const Xv = reinterpret( X, 0 );
	for ( i = 0; i < Bdata.length; i++ ) {
		Xv[ i ] = Bdata[ i ];
	}
	zhptrs( 'upper', n, nrhs, AFP, 1, 0, IPIV, 1, 0, X, 1, n, 0 );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zhprfs( 'upper', n, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	const expectedX = extractColMajor( tc.X, n, nrhs, 4 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( Xv ).slice( 0, 2 * n * nrhs ), toArray( expectedX ), 1e-12, 'X' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BERR ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-10, 'ferr' );
});

test( 'zhprfs: n0', function t() {

	const tc = n0;
	const AP = new Complex128Array( 1 );
	const AFP = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 1 );
	const RWORK = new Float64Array( 1 );
	const info = zhprfs( 'upper', 0, 1, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( FERR[ 0 ], tc.ferr[ 0 ], 1e-14, 'ferr' );
	assertClose( BERR[ 0 ], tc.berr[ 0 ], 1e-14, 'berr' );
});

test( 'zhprfs: n1', function t() {

	const tc = n1;
	const n = tc.N;
	const nrhs = tc.nrhs;
	const nap = 1;
	const AP = new Complex128Array( nap );
	const APv = reinterpret( AP, 0 );
	APv[ 0 ] = tc.AP[ 0 ];
	APv[ 1 ] = tc.AP[ 1 ];
	const AFP = new Complex128Array( nap );
	const AFPv = reinterpret( AFP, 0 );
	AFPv[ 0 ] = tc.AFP[ 0 ];
	AFPv[ 1 ] = tc.AFP[ 1 ];
	const IPIV = new Int32Array( [ tc.IPIV[ 0 ] - 1 ] );
	const Bdata = extractColMajor( tc.B, n, nrhs, 4 );
	const B = new Complex128Array( n * nrhs );
	const Bv = reinterpret( B, 0 );
	Bv[ 0 ] = Bdata[ 0 ];
	Bv[ 1 ] = Bdata[ 1 ];
	const Xdata = extractColMajor( tc.X, n, nrhs, 4 );
	const X = new Complex128Array( n * nrhs );
	const Xv = reinterpret( X, 0 );
	Xv[ 0 ] = Xdata[ 0 ];
	Xv[ 1 ] = Xdata[ 1 ];
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const info = zhprfs( 'upper', n, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	const expectedX = extractColMajor( tc.X, n, nrhs, 4 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( Xv ).slice( 0, 2 * n ), toArray( expectedX ), 1e-12, 'X' ); // eslint-disable-line max-len
	assertArrayClose( toArray( BERR ), tc.berr, 1e-10, 'berr' );
});
