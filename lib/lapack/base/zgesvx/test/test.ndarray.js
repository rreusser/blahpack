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
const EQUED_MAP = {
	'N': 'none',
	'R': 'row',
	'C': 'column',
	'B': 'both'
};

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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'zgesvx: fact_N_trans_N', function t() {

	const tc = fact_n_trans_n;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	const bData = zmatvec( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	const B = new Complex128Array( bData );
	const X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
	assertClose( result.rpvgrw, tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'zgesvx: fact_N_trans_C', function t() {

	const tc = fact_n_trans_c;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	const bData = zmatvecH( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	const B = new Complex128Array( bData );
	const X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'not-factored', 'conjugate-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
});

test( 'zgesvx: fact_E (equilibrate)', function t() {

	const tc = fact_e;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array([
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
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	const B = new Complex128Array( [ 1e6 + 2, 0, 2.001, 0, 1.002e3, 0 ] );
	const X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'equilibrate', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-6, 'x' );
	assertClose( result.rcond, tc.rcond, 0.5, 'rcond' );
});

test( 'zgesvx: fact_F (pre-factored)', function t() {
	let bData, A, B, X;

	const tc = fact_f;
	const n = 3;
	const nrhs = 1;
	A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	bData = zmatvec( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	B = new Complex128Array( bData );
	X = new Complex128Array( n * nrhs );
	zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	A = new Complex128Array( A_DATA.slice() );
	bData = zmatvec( A_DATA, [ 2, 1, -1, 1, 0.5, -0.5 ], n );
	B = new Complex128Array( bData );
	X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
});

test( 'zgesvx: singular', function t() {

	const tc = singular;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array([
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
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	const B = new Complex128Array( [ 1, 0, 2, 0, 3, 0 ] );
	const X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.ok( result.info > 0, 'info > 0 for singular matrix' );
	assert.equal( result.rcond, tc.rcond );
});

test( 'zgesvx: n_zero', function t() {

	const A = new Complex128Array( 1 );
	const AF = new Complex128Array( 1 );
	const IPIV = new Int32Array( 1 );
	const r = new Float64Array( 1 );
	const c = new Float64Array( 1 );
	const B = new Complex128Array( 1 );
	const X = new Complex128Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 2 );
	const result = zgesvx( 'not-factored', 'no-transpose', 0, 1, A, 1, 1, 0, AF, 1, 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.equal( result.rcond, 1.0 );
	assert.equal( result.rpvgrw, 1.0 );
});

test( 'zgesvx: multi_rhs', function t() {
	let i;

	const tc = multi_rhs;
	const n = 3;
	const nrhs = 2;
	const A = new Complex128Array( A_DATA.slice() );
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	const b1 = zmatvec( A_DATA, [ 1, 0, 1, 0, 1, 0 ], n );
	const b2 = zmatvec( A_DATA, [ 2, 1, -1, 1, 0.5, -0.5 ], n );
	const Bdata = new Float64Array( 2 * n * nrhs );
	for ( i = 0; i < 2 * n; i++ ) {
		Bdata[ i ] = b1[ i ];
		Bdata[ 2 * n + i ] = b2[ i ];
	}
	const B = new Complex128Array( Bdata );
	const X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'not-factored', 'no-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-6, 'rcond' );
});

test( 'zgesvx: fact_E_trans_C', function t() {

	const tc = fact_e_trans_c;
	const n = 3;
	const nrhs = 1;
	const A = new Complex128Array([
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
	const AF = new Complex128Array( n * n );
	const IPIV = new Int32Array( n );
	const r = new Float64Array( n );
	const c = new Float64Array( n );
	const FERR = new Float64Array( nrhs );
	const BERR = new Float64Array( nrhs );
	const w = makeWork( n );
	const B = new Complex128Array( [ 1e6 + 2, 0, 2.001, 0, 1.002e3, 0 ] );
	const X = new Complex128Array( n * nrhs );
	const result = zgesvx( 'equilibrate', 'conjugate-transpose', n, nrhs, A, 1, n, 0, AF, 1, n, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, n, 0, X, 1, n, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, EQUED_MAP[ tc.equed ] );
	const Xv = reinterpret( X, 0 );
	assertArrayClose( toArray( Xv ), tc.x, 1e-6, 'x' );
	assertClose( result.rcond, tc.rcond, 0.5, 'rcond' );
});
