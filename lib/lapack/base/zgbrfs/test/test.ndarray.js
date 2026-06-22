// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgbtrf from './../../zgbtrf/lib/base.js';
import zgbtrs from './../../zgbtrs/lib/base.js';
import zgbrfs from './../lib/ndarray.js';

// FIXTURES //

import tridiag_notrans from './fixtures/tridiag_notrans.json' with { type: 'json' };
import tridiag_conjtrans from './fixtures/tridiag_conjtrans.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import kl2_ku1 from './fixtures/kl2_ku1.json' with { type: 'json' };
import one_by_one from './fixtures/one_by_one.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts two values are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are close.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Creates a complex banded matrix.
*
* @private
* @param {integer} ldab - leading dimension (rows)
* @param {integer} n - number of columns
* @param {Array} entries - array of [row, col, re, im]
* @returns {Complex128Array} banded matrix
*/
function complexBandedMatrix( ldab, n, entries ) {
	var abv;
	var idx;
	var ab;
	var i;

	ab = new Complex128Array( ldab * n );
	abv = reinterpret( ab, 0 );
	for ( i = 0; i < entries.length; i++ ) {
		idx = ( ( entries[ i ][ 1 ] * ldab ) + entries[ i ][ 0 ] ) * 2;
		abv[ idx ] = entries[ i ][ 2 ];
		abv[ idx + 1 ] = entries[ i ][ 3 ];
	}
	return ab;
}

/**
* Copies complex elements from source to destination.
*
* @private
* @param {Complex128Array} src - source array
* @param {integer} srcOff - source offset (complex elements)
* @param {Complex128Array} dst - destination array
* @param {integer} dstOff - destination offset (complex elements)
* @param {integer} n - number of complex elements
*/
function copyComplex( src, srcOff, dst, dstOff, n ) {
	var sv = reinterpret( src, 0 );
	var dv = reinterpret( dst, 0 );
	var i;
	for ( i = 0; i < n * 2; i++ ) {
		dv[ ( dstOff * 2 ) + i ] = sv[ ( srcOff * 2 ) + i ];
	}
}

/**
* Copies original band matrix into factored storage layout.
*
* @private
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {integer} n - number of columns
* @param {integer} abLdab - leading dimension of AB
* @param {Complex128Array} ab - original band matrix
* @param {integer} afbLdab - leading dimension of AFB
* @returns {Complex128Array} factored band storage
*/
function copyBandToFactored( kl, ku, n, abLdab, ab, afbLdab ) {
	var origRows;
	var srcIdx;
	var dstIdx;
	var afbv;
	var abv;
	var afb;
	var i;
	var j;

	afb = new Complex128Array( afbLdab * n );
	abv = reinterpret( ab, 0 );
	afbv = reinterpret( afb, 0 );
	origRows = kl + ku + 1;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < origRows; i++ ) {
			srcIdx = ( ( j * abLdab ) + i ) * 2;
			dstIdx = ( ( j * afbLdab ) + kl + i ) * 2;
			afbv[ dstIdx ] = abv[ srcIdx ];
			afbv[ dstIdx + 1 ] = abv[ srcIdx + 1 ];
		}
	}
	return afb;
}

// TESTS //

test( 'zgbrfs: tridiag_notrans (KL=1, KU=1, N=4)', function t() {
	var rwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var xv;
	var bv;
	var n;
	var b;
	var x;

	tc = tridiag_notrans;
	n = 4;

	ab = complexBandedMatrix( 6, n, [
		[ 1, 0, 4.0, 1.0 ], [ 2, 0, -1.0, 0.5 ],
		[ 0, 1, 0.5, -0.5 ], [ 1, 1, 4.0, 1.0 ], [ 2, 1, -1.0, 0.5 ],
		[ 0, 2, 0.5, -0.5 ], [ 1, 2, 4.0, 1.0 ], [ 2, 2, -1.0, 0.5 ],
		[ 0, 3, 0.5, -0.5 ], [ 1, 3, 4.0, 1.0 ]
	] );

	b = new Complex128Array( 4 );
	bv = reinterpret( b, 0 );
	bv[ 0 ] = 1.0; bv[ 1 ] = 0.0;   // eslint-disable-line max-statements-per-line
	bv[ 2 ] = 2.0; bv[ 3 ] = 1.0;   // eslint-disable-line max-statements-per-line
	bv[ 4 ] = 3.0; bv[ 5 ] = -1.0;  // eslint-disable-line max-statements-per-line
	bv[ 6 ] = 4.0; bv[ 7 ] = 0.5;   // eslint-disable-line max-statements-per-line

	afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = zgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'zgbtrf info' );

	x = new Complex128Array( 4 );
	xv = reinterpret( x, 0 );
	copyComplex( b, 0, x, 0, n );
	info = zgbtrs( 'no-transpose', n, 1, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 );
	assert.equal( info, 0, 'zgbtrs info' );

	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 2 * n );
	rwork = new Float64Array( n );

	info = zgbrfs( 'no-transpose', n, 1, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( xv ), tc.x_r, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'zgbrfs: tridiag_conjtrans (KL=1, KU=1, N=4)', function t() {
	var rwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var xv;
	var bv;
	var n;
	var b;
	var x;

	tc = tridiag_conjtrans;
	n = 4;

	ab = complexBandedMatrix( 6, n, [
		[ 1, 0, 4.0, 1.0 ], [ 2, 0, -1.0, 0.5 ],
		[ 0, 1, 0.5, -0.5 ], [ 1, 1, 4.0, 1.0 ], [ 2, 1, -1.0, 0.5 ],
		[ 0, 2, 0.5, -0.5 ], [ 1, 2, 4.0, 1.0 ], [ 2, 2, -1.0, 0.5 ],
		[ 0, 3, 0.5, -0.5 ], [ 1, 3, 4.0, 1.0 ]
	] );

	b = new Complex128Array( 4 );
	bv = reinterpret( b, 0 );
	bv[ 0 ] = 1.0; bv[ 1 ] = 0.0;   // eslint-disable-line max-statements-per-line
	bv[ 2 ] = 2.0; bv[ 3 ] = 1.0;   // eslint-disable-line max-statements-per-line
	bv[ 4 ] = 3.0; bv[ 5 ] = -1.0;  // eslint-disable-line max-statements-per-line
	bv[ 6 ] = 4.0; bv[ 7 ] = 0.5;   // eslint-disable-line max-statements-per-line

	afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = zgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );

	x = new Complex128Array( 4 );
	xv = reinterpret( x, 0 );
	copyComplex( b, 0, x, 0, n );
	info = zgbtrs( 'conjugate-transpose', n, 1, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 );
	assert.equal( info, 0 );

	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 2 * n );
	rwork = new Float64Array( n );

	info = zgbrfs( 'conjugate-transpose', n, 1, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( xv ), tc.x_r, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'zgbrfs: multi_rhs (KL=1, KU=1, N=4, NRHS=2)', function t() {
	var rwork;
	var nrhs;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var xv;
	var bv;
	var n;
	var b;
	var x;

	tc = multi_rhs;
	n = 4;
	nrhs = 2;

	ab = complexBandedMatrix( 6, n, [
		[ 1, 0, 4.0, 1.0 ], [ 2, 0, -1.0, 0.5 ],
		[ 0, 1, 0.5, -0.5 ], [ 1, 1, 4.0, 1.0 ], [ 2, 1, -1.0, 0.5 ],
		[ 0, 2, 0.5, -0.5 ], [ 1, 2, 4.0, 1.0 ], [ 2, 2, -1.0, 0.5 ],
		[ 0, 3, 0.5, -0.5 ], [ 1, 3, 4.0, 1.0 ]
	] );

	b = new Complex128Array( n * nrhs );
	bv = reinterpret( b, 0 );
	bv[ 0 ] = 1.0; bv[ 1 ] = 0.0;   // eslint-disable-line max-statements-per-line
	bv[ 2 ] = 2.0; bv[ 3 ] = 1.0;   // eslint-disable-line max-statements-per-line
	bv[ 4 ] = 3.0; bv[ 5 ] = -1.0;  // eslint-disable-line max-statements-per-line
	bv[ 6 ] = 4.0; bv[ 7 ] = 0.5;   // eslint-disable-line max-statements-per-line
	bv[ 8 ] = 0.0; bv[ 9 ] = 1.0;   // eslint-disable-line max-statements-per-line
	bv[ 10 ] = 1.0; bv[ 11 ] = 0.0; // eslint-disable-line max-statements-per-line
	bv[ 12 ] = -1.0; bv[ 13 ] = 2.0; // eslint-disable-line max-statements-per-line
	bv[ 14 ] = 2.0; bv[ 15 ] = -1.0; // eslint-disable-line max-statements-per-line

	afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = zgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );

	x = new Complex128Array( n * nrhs );
	xv = reinterpret( x, 0 );
	copyComplex( b, 0, x, 0, n * nrhs );
	info = zgbtrs( 'no-transpose', n, 1, 1, nrhs, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 );
	assert.equal( info, 0 );

	ferr = new Float64Array( nrhs );
	berr = new Float64Array( nrhs );
	work = new Complex128Array( 2 * n );
	rwork = new Float64Array( n );

	info = zgbrfs( 'no-transpose', n, 1, 1, nrhs, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( xv ), tc.x_r, 1e-10, 'x' );
	assertArrayClose( Array.from( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( Array.from( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'zgbrfs: n_zero', function t() {
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var afb;
	var tc;
	var ab;
	var b;
	var x;

	tc = n_zero;
	ab = new Complex128Array( 1 );
	afb = new Complex128Array( 1 );
	ipiv = new Int32Array( 0 );
	b = new Complex128Array( 1 );
	x = new Complex128Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 1 );
	rwork = new Float64Array( 1 );

	info = zgbrfs( 'no-transpose', 0, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( ferr[ 0 ], tc.ferr[ 0 ], 'ferr' );
	assert.equal( berr[ 0 ], tc.berr[ 0 ], 'berr' );
});

test( 'zgbrfs: nrhs_zero', function t() {
	var rwork;
	var work;
	var ipiv;
	var ferr;
	var berr;
	var info;
	var afb;
	var tc;
	var ab;
	var b;
	var x;

	tc = nrhs_zero;
	ab = new Complex128Array( 1 );
	afb = new Complex128Array( 1 );
	ipiv = new Int32Array( 4 );
	b = new Complex128Array( 1 );
	x = new Complex128Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 1 );
	rwork = new Float64Array( 1 );

	info = zgbrfs( 'no-transpose', 4, 1, 1, 0, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});

test( 'zgbrfs: kl2_ku1 (KL=2, KU=1, N=4)', function t() {
	var rwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var xv;
	var bv;
	var n;
	var b;
	var x;

	tc = kl2_ku1;
	n = 4;

	ab = complexBandedMatrix( 6, n, [
		[ 1, 0, 5.0, 1.0 ], [ 2, 0, 2.0, 0.5 ], [ 3, 0, 1.0, 0.0 ],
		[ 0, 1, 1.0, 0.0 ], [ 1, 1, 6.0, 1.0 ], [ 2, 1, 1.0, 0.5 ], [ 3, 1, 2.0, 1.0 ],
		[ 0, 2, 2.0, 0.5 ], [ 1, 2, 7.0, 2.0 ], [ 2, 2, 3.0, 0.0 ],
		[ 0, 3, 1.0, 1.0 ], [ 1, 3, 8.0, 1.0 ]
	] );

	b = new Complex128Array( n );
	bv = reinterpret( b, 0 );
	bv[ 0 ] = 1.0; bv[ 1 ] = 0.5;   // eslint-disable-line max-statements-per-line
	bv[ 2 ] = 2.0; bv[ 3 ] = -1.0;  // eslint-disable-line max-statements-per-line
	bv[ 4 ] = 3.0; bv[ 5 ] = 1.0;   // eslint-disable-line max-statements-per-line
	bv[ 6 ] = 4.0; bv[ 7 ] = 2.0;   // eslint-disable-line max-statements-per-line

	afb = copyBandToFactored( 2, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = zgbtrf( n, n, 2, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'zgbtrf info' );

	x = new Complex128Array( n );
	xv = reinterpret( x, 0 );
	copyComplex( b, 0, x, 0, n );
	info = zgbtrs( 'no-transpose', n, 2, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 );
	assert.equal( info, 0 );

	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 2 * n );
	rwork = new Float64Array( n );

	info = zgbrfs( 'no-transpose', n, 2, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( xv ), tc.x_r, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'zgbrfs: one_by_one (N=1, KL=0, KU=0)', function t() {
	var rwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afbv;
	var afb;
	var tc;
	var ab;
	var abv;
	var xv;
	var bv;
	var b;
	var x;

	tc = one_by_one;

	ab = new Complex128Array( 6 );
	abv = reinterpret( ab, 0 );
	abv[ 0 ] = 3.0;
	abv[ 1 ] = 2.0;

	afb = new Complex128Array( 6 );
	afbv = reinterpret( afb, 0 );
	afbv[ 0 ] = 3.0;
	afbv[ 1 ] = 2.0;

	b = new Complex128Array( 1 );
	bv = reinterpret( b, 0 );
	bv[ 0 ] = 5.0;
	bv[ 1 ] = 1.0;

	ipiv = new Int32Array( 1 );
	info = zgbtrf( 1, 1, 0, 0, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );

	x = new Complex128Array( 1 );
	xv = reinterpret( x, 0 );
	copyComplex( b, 0, x, 0, 1 );
	info = zgbtrs( 'no-transpose', 1, 0, 0, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, 1, 0 );
	assert.equal( info, 0 );

	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Complex128Array( 2 );
	rwork = new Float64Array( 1 );

	info = zgbrfs( 'no-transpose', 1, 0, 0, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, rwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( xv ), tc.x_r, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});
