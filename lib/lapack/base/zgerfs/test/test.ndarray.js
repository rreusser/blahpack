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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Complex matrix-vector multiply: b = A*x (col-major, interleaved re/im).
*/
function zmatvec( Adata, xdata, N ) {
	var are;
	var aim;
	var xre;
	var xim;
	var b = new Float64Array( 2 * N );
	var i;
	var j;
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
	var are;
	var aim;
	var xre;
	var xim;
	var b = new Float64Array( 2 * N );
	var i;
	var j;
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
var A_DATA = [
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgerfs: trans_N', function t() {
	var xExact;
	var RWORK;
	var bData;
	var nrhs;
	var IPIV;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var B;
	var X;

	tc = trans_n;
	n = 3;
	nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( A_DATA.slice() );
	IPIV = new Int32Array( n );
	WORK = new Complex128Array( 2 * n );
	RWORK = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	xExact = [ 1, 0, 1, 0, 1, 0 ];
	bData = zmatvec( A_DATA, xExact, n );
	B = new Complex128Array( bData );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	X = new Complex128Array( bData.slice() );
	zgetrs( 'no-transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	info = zgerfs( 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assert.ok( BERR[ 0 ] < 1e-10, 'berr small' );
});

test( 'zgerfs: trans_C', function t() {
	var xExact;
	var RWORK;
	var bData;
	var nrhs;
	var IPIV;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var B;
	var X;

	tc = trans_c;
	n = 3;
	nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( A_DATA.slice() );
	IPIV = new Int32Array( n );
	WORK = new Complex128Array( 2 * n );
	RWORK = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	xExact = [ 1, 0, 1, 0, 1, 0 ];
	bData = zmatvecH( A_DATA, xExact, n );
	B = new Complex128Array( bData );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	X = new Complex128Array( bData.slice() );
	zgetrs( 'conjugate-transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	info = zgerfs( 'conjugate-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});

test( 'zgerfs: n_zero', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AF;
	var A;
	var B;
	var X;

	tc = n_zero;
	A = new Complex128Array( 1 );
	AF = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( 1 );
	X = new Complex128Array( 1 );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	info = zgerfs( 'no-transpose', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgerfs: nrhs_zero', function t() {
	var RWORK;
	var IPIV;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AF;
	var A;
	var B;
	var X;

	tc = nrhs_zero;
	A = new Complex128Array( 9 );
	AF = new Complex128Array( 9 );
	IPIV = new Int32Array( 3 );
	B = new Complex128Array( 3 );
	X = new Complex128Array( 3 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	info = zgerfs( 'no-transpose', 3, 0, A, 1, 3, 0, AF, 1, 3, 0, IPIV, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'zgerfs: multi_rhs', function t() {
	var RWORK;
	var Bdata;
	var nrhs;
	var IPIV;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AF;
	var x1;
	var b1;
	var x2;
	var b2;
	var Xv;
	var n;
	var A;
	var i;
	var B;
	var X;

	tc = multi_rhs;
	n = 3;
	nrhs = 2;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( A_DATA.slice() );
	IPIV = new Int32Array( n );
	WORK = new Complex128Array( 2 * n );
	RWORK = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	x1 = [ 1, 0, 1, 0, 1, 0 ];
	b1 = zmatvec( A_DATA, x1, n );
	x2 = [ 1, 1, 2, -1, 0.5, 0.5 ];
	b2 = zmatvec( A_DATA, x2, n );
	Bdata = new Float64Array( 2 * n * nrhs );
	for ( i = 0; i < 2 * n; i++ ) {
		Bdata[ i ] = b1[ i ];
		Bdata[ 2 * n + i ] = b2[ i ];
	}
	B = new Complex128Array( Bdata );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	X = new Complex128Array( Bdata.slice() );
	zgetrs( 'no-transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	info = zgerfs( 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});

test( 'zgerfs: trans_T', function t() {
	var RWORK;
	var bData;
	var nrhs;
	var IPIV;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var i;
	var j;
	var B;
	var X;

	tc = trans_t;
	n = 3;
	nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( A_DATA.slice() );
	IPIV = new Int32Array( n );
	WORK = new Complex128Array( 2 * n );
	RWORK = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	bData = new Float64Array( 2 * n );
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			// A^T: element (i,j) = A(j,i) in col-major = A_DATA[2*(j + i*n)]
			bData[ 2 * i ] += A_DATA[ 2 * ( j + i * n ) ];
			bData[ 2 * i + 1 ] += A_DATA[ 2 * ( j + i * n ) + 1 ];
		}
	}
	B = new Complex128Array( bData );
	zgetrf( n, n, AF, 1, n, 0, IPIV, 1, 0 );
	X = new Complex128Array( bData.slice() );
	zgetrs( 'transpose', n, nrhs, AF, 1, n, 0, IPIV, 1, 0, X, 1, n, 0 );
	info = zgerfs( 'transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
});
