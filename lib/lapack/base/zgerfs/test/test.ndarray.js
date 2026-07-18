/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetrf from './../../zgetrf/lib/base.js';
import zgetrs from './../../zgetrs/lib/base.js';
import zgerfs from './../lib/ndarray.js';

// FIXTURES //

import trans_n from './fixtures/trans_n.json' with { type: 'json' };
import trans_c from './fixtures/trans_c.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import trans_t from './fixtures/trans_t.json' with { type: 'json' };

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
* Complex matrix-vector multiply: b = A*x (col-major, interleaved re/im).
*/
function zmatvec( Adata, xdata, N ) {
	let are, aim, xre, xim;
	const b = new Float64Array( 2 * N );
	let i, j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			are = Adata[ 2 * ( i + j * N ) ];
			aim = Adata[ 2 * ( i + j * N ) + 1 ];
			xre = xdata[ 2 * j ];
			xim = xdata[ 2 * j + 1 ];
			b[ 2 * i ] += are * xre - aim * xim;
			b[ 2 * i + 1 ] += are * xim + aim * xre;
		}
	}
	return b;
}

/**
* Complex matrix-conjugate-transpose-vector multiply: b = A^H * x.
*/
function zmatvecH( Adata, xdata, N ) {
	let are, aim, xre, xim;
	const b = new Float64Array( 2 * N );
	let i, j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			// A^H(i,j) = conj(A(j,i)) = conj of col-major A[j + i*N]
			are = Adata[ 2 * ( j + i * N ) ];
			aim = -Adata[ 2 * ( j + i * N ) + 1 ]; // conjugate
			xre = xdata[ 2 * j ];
			xim = xdata[ 2 * j + 1 ];
			b[ 2 * i ] += are * xre - aim * xim;
			b[ 2 * i + 1 ] += are * xim + aim * xre;
		}
	}
	return b;
}

// 3x3 test matrix data (interleaved re/im, col-major)
const A_DATA = [
	4,
	1,
	1,
	-1,
	0.5,
	0.2,
	1,
	0.5,
	3,
	2,
	1,
	-0.5,
	0.5,
	0.1,
	1,
	0.3,
	2,
	1
];

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

test( 'zgerfs: trans_N', function t() {

	const tc = trans_n;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( A_DATA.slice() );
	const IPIV = new Int32Array( n );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const xExact = [ 1, 0, 1, 0, 1, 0 ];
	const bData = zmatvec( A_DATA, xExact, n );
	const B = new Complex128Array( bData );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	const X = new Complex128Array( bData.slice() );
	zgetrs( 'no-transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	const info = zgerfs( 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assert.ok( BERR[ 0 ] < 1e-10, 'berr small' );
});

test( 'zgerfs: trans_C', function t() {

	const tc = trans_c;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( A_DATA.slice() );
	const IPIV = new Int32Array( n );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const xExact = [ 1, 0, 1, 0, 1, 0 ];
	const bData = zmatvecH( A_DATA, xExact, n );
	const B = new Complex128Array( bData );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	const X = new Complex128Array( bData.slice() );
	zgetrs( 'conjugate-transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	const info = zgerfs( 'conjugate-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});

test( 'zgerfs: n_zero', function t() {

	const tc = n_zero;
	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const info = zgerfs( 'no-transpose', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgerfs: nrhs_zero', function t() {

	const tc = nrhs_zero;
	const A = new Complex128Array( 9 );
	const AF = new Complex128Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Complex128Array( 3 );
	const X = new Complex128Array( 3 );
	const WORK = new Complex128Array( 6 );
	const RWORK = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const info = zgerfs( 'no-transpose', 3, 0, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgerfs: multi_rhs', function t() {
	let i;

	const tc = multi_rhs;
	const n = 3;
	const nrhs = 2;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( A_DATA.slice() );
	const IPIV = new Int32Array( n );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const x1 = [ 1, 0, 1, 0, 1, 0 ];
	const b1 = zmatvec( A_DATA, x1, n );
	const x2 = [ 1, 1, 2, -1, 0.5, 0.5 ];
	const b2 = zmatvec( A_DATA, x2, n );
	const Bdata = new Float64Array( 2 * n * nrhs );
	for ( i = 0; i < 2 * n; i++ ) {
		Bdata[ i ] = b1[ i ];
		Bdata[ 2 * n + i ] = b2[ i ];
	}
	const B = new Complex128Array( Bdata );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	const X = new Complex128Array( Bdata.slice() );
	zgetrs( 'no-transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	const info = zgerfs( 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});

test( 'zgerfs: trans_T', function t() {
	let i, j;

	const tc = trans_t;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( A_DATA.slice() );
	const IPIV = new Int32Array( n );
	const WORK = new Complex128Array( 2 * n );
	const RWORK = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const bData = new Float64Array( 2 * n );
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			// A^T: element (i,j) = A(j,i) in col-major = A_DATA[2*(j + i*n)]
			bData[ 2 * i ] += A_DATA[ 2 * ( j + i * n ) ];
			bData[ 2 * i + 1 ] += A_DATA[ 2 * ( j + i * n ) + 1 ];
		}
	}
	const B = new Complex128Array( bData );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	const X = new Complex128Array( bData.slice() );
	zgetrs( 'transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	const info = zgerfs( 'transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});
