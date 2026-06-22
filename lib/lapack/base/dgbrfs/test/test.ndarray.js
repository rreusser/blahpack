/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbtrf from './../../dgbtrf/lib/base.js';
import dgbtrs from './../../dgbtrs/lib/base.js';
import dgbrfs from './../lib/ndarray.js';

// FIXTURES //

import tridiag_notrans from './fixtures/tridiag_notrans.json' with { type: 'json' };
import tridiag_trans from './fixtures/tridiag_trans.json' with { type: 'json' };
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
* Creates a real banded matrix.
*
* @private
* @param {integer} ldab - leading dimension (rows)
* @param {integer} n - number of columns
* @param {Array} entries - array of [row, col, value]
* @returns {Float64Array} banded matrix
*/
function bandedMatrix( ldab, n, entries ) {
	var ab;
	var i;

	ab = new Float64Array( ldab * n );
	for ( i = 0; i < entries.length; i++ ) {
		ab[ ( entries[ i ][ 1 ] * ldab ) + entries[ i ][ 0 ] ] = entries[ i ][ 2 ];
	}
	return ab;
}

/**
* Copies original band matrix into factored storage layout.
*
* @private
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {integer} n - number of columns
* @param {integer} abLdab - leading dimension of AB
* @param {Float64Array} ab - original band matrix
* @param {integer} afbLdab - leading dimension of AFB
* @returns {Float64Array} factored band storage
*/
function copyBandToFactored( kl, ku, n, abLdab, ab, afbLdab ) {
	var origRows;
	var afb;
	var i;
	var j;

	afb = new Float64Array( afbLdab * n );
	origRows = kl + ku + 1;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < origRows; i++ ) {
			afb[ ( j * afbLdab ) + kl + i ] = ab[ ( j * abLdab ) + i ];
		}
	}
	return afb;
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

test( 'dgbrfs: tridiag_notrans (KL=1, KU=1, N=4)', function t() {
	var iwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var n;
	var b;
	var x;

	tc = tridiag_notrans;
	n = 4;
	ab = bandedMatrix( 6, n, [
		[ 1, 0, 4.0 ],
		[ 2, 0, -1.0 ],
		[ 0, 1, 0.5 ],
		[ 1, 1, 4.0 ],
		[ 2, 1, -1.0 ],
		[ 0, 2, 0.5 ],
		[ 1, 2, 4.0 ],
		[ 2, 2, -1.0 ],
		[ 0, 3, 0.5 ],
		[ 1, 3, 4.0 ]
	]);
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'dgbtrf info' );
	x = new Float64Array( n );
	x.set( b );
	info = dgbtrs( 'no-transpose', n, 1, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0, 'dgbtrs info' );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	info = dgbrfs( 'no-transpose', n, 1, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: tridiag_trans (KL=1, KU=1, N=4)', function t() {
	var iwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var n;
	var b;
	var x;

	tc = tridiag_trans;
	n = 4;
	ab = bandedMatrix( 6, n, [
		[ 1, 0, 4.0 ],
		[ 2, 0, -1.0 ],
		[ 0, 1, 0.5 ],
		[ 1, 1, 4.0 ],
		[ 2, 1, -1.0 ],
		[ 0, 2, 0.5 ],
		[ 1, 2, 4.0 ],
		[ 2, 2, -1.0 ],
		[ 0, 3, 0.5 ],
		[ 1, 3, 4.0 ]
	]);
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	x = new Float64Array( n );
	x.set( b );
	info = dgbtrs( 'transpose', n, 1, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 );
	assert.equal( info, 0 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	info = dgbrfs( 'transpose', n, 1, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: multi_rhs (KL=1, KU=1, N=4, NRHS=2)', function t() {
	var iwork;
	var nrhs;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var n;
	var b;
	var x;

	tc = multi_rhs;
	n = 4;
	nrhs = 2;
	ab = bandedMatrix( 6, n, [
		[ 1, 0, 4.0 ],
		[ 2, 0, -1.0 ],
		[ 0, 1, 0.5 ],
		[ 1, 1, 4.0 ],
		[ 2, 1, -1.0 ],
		[ 0, 2, 0.5 ],
		[ 1, 2, 4.0 ],
		[ 2, 2, -1.0 ],
		[ 0, 3, 0.5 ],
		[ 1, 3, 4.0 ]
	]);
	b = new Float64Array( n * nrhs );
	b[ 0 ] = 1.0;
	b[ 1 ] = 2.0;
	b[ 2 ] = 3.0;
	b[ 3 ] = 4.0;
	b[ 4 ] = 0.5;
	b[ 5 ] = 1.5;
	b[ 6 ] = -1.0;
	b[ 7 ] = 2.0;
	afb = copyBandToFactored( 1, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 1, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	x = new Float64Array( n * nrhs );
	x.set( b );
	info = dgbtrs( 'no-transpose', n, 1, 1, nrhs, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	ferr = new Float64Array( nrhs );
	berr = new Float64Array( nrhs );
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	info = dgbrfs( 'no-transpose', n, 1, 1, nrhs, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ).slice( 0, n ), tc.x, 1e-10, 'x col1' );
	assertArrayClose( toArray( x ).slice( n, 2 * n ), tc.x2, 1e-10, 'x col2' );
	assertArrayClose( toArray( ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( berr ), tc.berr, 1e-6, 'berr' );
});

test( 'dgbrfs: n_zero', function t() {
	var iwork;
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
	ab = new Float64Array( 1 );
	afb = new Float64Array( 1 );
	ipiv = new Int32Array( 0 );
	b = new Float64Array( 1 );
	x = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 1 );
	iwork = new Int32Array( 1 );
	info = dgbrfs( 'no-transpose', 0, 0, 0, 1, ab, 1, 1, 0, afb, 1, 1, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( ferr[ 0 ], tc.ferr[ 0 ], 'ferr' );
	assert.equal( berr[ 0 ], tc.berr[ 0 ], 'berr' );
});

test( 'dgbrfs: nrhs_zero', function t() {
	var iwork;
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
	ab = new Float64Array( 1 );
	afb = new Float64Array( 1 );
	ipiv = new Int32Array( 4 );
	b = new Float64Array( 1 );
	x = new Float64Array( 1 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 1 );
	iwork = new Int32Array( 1 );
	info = dgbrfs( 'no-transpose', 4, 1, 1, 0, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, 4, 0, x, 1, 4, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbrfs: kl2_ku1 (KL=2, KU=1, N=4)', function t() {
	var iwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var n;
	var b;
	var x;

	tc = kl2_ku1;
	n = 4;
	ab = bandedMatrix( 6, n, [
		[ 1, 0, 5.0 ],
		[ 2, 0, 2.0 ],
		[ 3, 0, 1.0 ],
		[ 0, 1, 1.0 ],
		[ 1, 1, 6.0 ],
		[ 2, 1, 1.0 ],
		[ 3, 1, 2.0 ],
		[ 0, 2, 2.0 ],
		[ 1, 2, 7.0 ],
		[ 2, 2, 3.0 ],
		[ 0, 3, 1.0 ],
		[ 1, 3, 8.0 ]
	]);
	b = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	afb = copyBandToFactored( 2, 1, n, 6, ab, 6 );
	ipiv = new Int32Array( n );
	info = dgbtrf( n, n, 2, 1, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'dgbtrf info' );
	x = new Float64Array( n );
	x.set( b );
	info = dgbtrs( 'no-transpose', n, 2, 1, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, n, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 3 * n );
	iwork = new Int32Array( n );
	info = dgbrfs( 'no-transpose', n, 2, 1, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, n, 0, x, 1, n, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});

test( 'dgbrfs: one_by_one (N=1, KL=0, KU=0)', function t() {
	var iwork;
	var work;
	var ipiv;
	var info;
	var ferr;
	var berr;
	var afb;
	var tc;
	var ab;
	var b;
	var x;

	tc = one_by_one;
	ab = new Float64Array( 6 );
	ab[ 0 ] = 3.0;
	afb = new Float64Array( 6 );
	afb[ 0 ] = 3.0;
	b = new Float64Array( [ 5.0 ] );
	ipiv = new Int32Array( 1 );
	info = dgbtrf( 1, 1, 0, 0, afb, 1, 6, 0, ipiv, 1, 0 );
	assert.equal( info, 0 );
	x = new Float64Array( 1 );
	x[ 0 ] = b[ 0 ];
	info = dgbtrs( 'no-transpose', 1, 0, 0, 1, afb, 1, 6, 0, ipiv, 1, 0, x, 1, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, 0 );
	ferr = new Float64Array( 1 );
	berr = new Float64Array( 1 );
	work = new Float64Array( 3 );
	iwork = new Int32Array( 1 );
	info = dgbrfs( 'no-transpose', 1, 0, 0, 1, ab, 1, 6, 0, afb, 1, 6, 0, ipiv, 1, 0, b, 1, 1, 0, x, 1, 1, 0, ferr, 1, 0, berr, 1, 0, work, 1, 0, iwork, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( x ), tc.x, 1e-10, 'x' );
	assertClose( berr[ 0 ], tc.berr[ 0 ], 1e-6, 'berr' );
	assertClose( ferr[ 0 ], tc.ferr[ 0 ], 1e-6, 'ferr' );
});
