/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgesvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_trans_n from './fixtures/fact_n_trans_n.json' with { type: 'json' };
import fact_n_trans_c from './fixtures/fact_n_trans_c.json' with { type: 'json' };
import fact_e from './fixtures/fact_e.json' with { type: 'json' };
import fact_f from './fixtures/fact_f.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import fact_e_trans_c from './fixtures/fact_e_trans_c.json' with { type: 'json' };

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
			are = Adata[ 2 * ( j + i * N ) ];
			aim = -Adata[ 2 * ( j + i * N ) + 1 ];
			xre = xdata[ 2 * j ];
			xim = xdata[ 2 * j + 1 ];
			b[ 2 * i ] += are * xre - aim * xim;
			b[ 2 * i + 1 ] += are * xim + aim * xre;
		}
	}
	return b;
}

// Map Fortran equed chars to long-form strings
var EQUED_MAP = {
	'N': 'none',
	'R': 'row',
	'C': 'column',
	'B': 'both'
};

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
* Create workspace arrays for zgesvx.
*/
function makeWork( n ) {
	return {
		'WORK': new Complex128Array( 2 * Math.max( 1, n ) ),
		'RWORK': new Float64Array( 2 * Math.max( 1, n ) )
	};
}

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

test( 'zgesvx: fact_N_trans_N', function t() {
	var result;
	var bData;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = fact_n_trans_n;
	n = 3;
	nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	bData = zmatvec( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	B = new Complex128Array( bData );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
	assertClose( result.rpvgrw, tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'zgesvx: fact_N_trans_C', function t() {
	var result;
	var bData;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = fact_n_trans_c;
	n = 3;
	nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	bData = zmatvecH( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	B = new Complex128Array( bData );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'not-factored', 'conjugate-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
});

test( 'zgesvx: fact_E (equilibrate)', function t() {
	var result;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = fact_e;
	n = 3;
	nrhs = 1;
	A = new Complex128Array([
		1e6,
		0,
		1,
		0,
		1,
		0,
		1,
		0,
		1e-3,
		0,
		1,
		0,
		1,
		0,
		1,
		0,
		1e3,
		0
	]);
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	B = new Complex128Array( [ 1e6 + 2, 0, 2.001, 0, 1.002e3, 0 ] );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'equilibrate', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-6, 'x' );
	assertClose( result.rcond, tc.rcond, 0.5, 'rcond' );
});

test( 'zgesvx: fact_F (pre-factored)', function t() {
	var result;
	var bData;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = fact_f;
	n = 3;
	nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	bData = zmatvec( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	B = new Complex128Array( bData );
	X = new Complex128Array( n * nrhs );
	zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	A = new Complex128Array( A_DATA.slice() );
	bData = zmatvec( A_DATA, [ 2, 1, -1, 1, 0.5, -0.5 ], n );
	B = new Complex128Array( bData );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
});

test( 'zgesvx: singular', function t() {
	var result;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var n;
	var A;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = singular;
	n = 3;
	nrhs = 1;
	A = new Complex128Array([
		1,
		0,
		2,
		0,
		3,
		0,
		1,
		0,
		2,
		0,
		3,
		0,
		1,
		0,
		2,
		0,
		3,
		0
	]);
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result.info > 0, 'info > 0 for singular matrix' );
	assert.equal( result.rcond, tc.rcond );
});

test( 'zgesvx: n_zero', function t() {
	var result;
	var RWORK;
	var IPIV;
	var FERR;
	var BERR;
	var WORK;
	var AF;
	var A;
	var r;
	var c;
	var B;
	var X;

	A = new Complex128Array( 1 );
	AF = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	r = new Float64Array( 1 );
	c = new Float64Array( 1 );
	B = new Complex128Array( 1 );
	X = new Complex128Array( 1 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 2 );
	result = zgesvx( 'not-factored', 'no-transpose', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.equal( result.rcond, 1.0 );
	assert.equal( result.rpvgrw, 1.0 );
});

test( 'zgesvx: multi_rhs', function t() {
	var result;
	var Bdata;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var b1;
	var b2;
	var Xv;
	var n;
	var A;
	var r;
	var c;
	var w;
	var i;
	var B;
	var X;

	tc = multi_rhs;
	n = 3;
	nrhs = 2;
	A = new Complex128Array( A_DATA.slice() );
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	b1 = zmatvec( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	b2 = zmatvec( A_DATA, [ 2, 1, -1, 1, 0.5, -0.5 ], n );
	Bdata = new Float64Array( 2 * n * nrhs );
	for ( i = 0; i < 2 * n; i++ ) {
		Bdata[ i ] = b1[ i ];
		Bdata[ 2 * n + i ] = b2[ i ];
	}
	B = new Complex128Array( Bdata );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
});

test( 'zgesvx: fact_E_trans_C', function t() {
	var result;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var tc;
	var AF;
	var Xv;
	var n;
	var A;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = fact_e_trans_c;
	n = 3;
	nrhs = 1;
	A = new Complex128Array([
		1e6,
		0,
		1,
		0,
		1,
		0,
		1,
		0,
		1e-3,
		0,
		1,
		0,
		1,
		0,
		1,
		0,
		1e3,
		0
	]);
	AF = new Complex128Array( n * n );
	IPIV = new Int32Array( n );
	r = new Float64Array( n );
	c = new Float64Array( n );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( n );
	B = new Complex128Array( [ 1e6 + 2, 0, 2.001, 0, 1.002e3, 0 ] );
	X = new Complex128Array( n * nrhs );
	result = zgesvx( 'equilibrate', 'conjugate-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-6, 'x' );
	assertClose( result.rcond, tc.rcond, 0.5, 'rcond' );
});
