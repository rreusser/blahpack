/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines-per-function, max-lines */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgbsvx from './../lib/ndarray.js';

// FIXTURES //

import nofact_notrans_tridiag from './fixtures/nofact_notrans_tridiag.json' with { type: 'json' };
import nofact_trans_tridiag from './fixtures/nofact_trans_tridiag.json' with { type: 'json' };
import equil_notrans_tridiag from './fixtures/equil_notrans_tridiag.json' with { type: 'json' };
import factored_notrans_tridiag from './fixtures/factored_notrans_tridiag.json' with { type: 'json' };
import nofact_notrans_2rhs from './fixtures/nofact_notrans_2rhs.json' with { type: 'json' };
import nofact_notrans_pentadiag from './fixtures/nofact_notrans_pentadiag.json' with { type: 'json' };
import equil_trans_asymmetric from './fixtures/equil_trans_asymmetric.json' with { type: 'json' };
import singular_matrix from './fixtures/singular_matrix.json' with { type: 'json' };
import pivot_asymmetric from './fixtures/pivot_asymmetric.json' with { type: 'json' };

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
* @param {*} actual - actual array
* @param {*} expected - expected array
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

/**
* Creates workspace arrays for dgbsvx.
*
* @private
* @param {NonNegativeInteger} n - matrix order
* @returns {Object} workspace arrays
*/
function makeWork( n ) {
	return {
		'WORK': new Float64Array( 3 * Math.max( 1, n ) ),
		'IWORK': new Int32Array( Math.max( 1, n ) )
	};
}

/**
* Stores a dense matrix into band storage format (column-major).
*
* @private
* @param {Array} dense - dense column-major N-by-N matrix
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @returns {Float64Array} band matrix in band storage (KL+KU+1 by N, col-major)
*/
function denseToGB( dense, N, kl, ku ) {
	var bandRow;
	var nRows;
	var AB;
	var i;
	var j;

	nRows = kl + ku + 1;
	AB = new Float64Array( nRows * N );
	for ( j = 0; j < N; j++ ) {
		for ( i = Math.max( 0, j - ku ); i < Math.min( N, j + kl + 1 ); i++ ) {
			bandRow = ( ku + i ) - j;
			AB[ bandRow + ( j * nRows ) ] = dense[ i + ( j * N ) ];
		}
	}
	return AB;
}

// TESTS //

test( 'dgbsvx: main export is a function', function t() {
	assert.strictEqual( typeof dgbsvx, 'function' );
});

test( 'dgbsvx: fact=not-factored, trans=no-transpose, 4x4 tridiag', function t() { // eslint-disable-line max-len
	var result;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = nofact_notrans_tridiag;
	nrhs = 1;
	nRows = 3;
	AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	AFB = new Float64Array( 5 * 4 );
	IPIV = new Int32Array( 4 );
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	B = new Float64Array( [ 3, 2, 2, 3 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result = dgbsvx( 'not-factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.equed, 'none' );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
	assertClose( result.rpvgrw, tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'dgbsvx: fact=not-factored, trans=transpose, 4x4 symmetric tridiag', function t() { // eslint-disable-line max-len
	var result;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = nofact_trans_tridiag;
	nrhs = 1;
	nRows = 3;
	AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	AFB = new Float64Array( 5 * 4 );
	IPIV = new Int32Array( 4 );
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	B = new Float64Array( [ 3, 2, 2, 3 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result = dgbsvx( 'not-factored', 'transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: fact=equilibrate, trans=no-transpose, 4x4 tridiag', function t() { // eslint-disable-line max-len
	var result;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = equil_notrans_tridiag;
	nrhs = 1;
	nRows = 3;
	AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	AFB = new Float64Array( 5 * 4 );
	IPIV = new Int32Array( 4 );
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	B = new Float64Array( [ 3, 2, 2, 3 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result = dgbsvx( 'equilibrate', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
	assert.equal( result.equed, 'none' );
});

test( 'dgbsvx: fact=factored, reuse LU factorization', function t() {
	var result1;
	var result2;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = factored_notrans_tridiag;
	nrhs = 1;
	nRows = 3;
	AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	AFB = new Float64Array( 5 * 4 );
	IPIV = new Int32Array( 4 );
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	B = new Float64Array( [ 3, 2, 2, 3 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result1 = dgbsvx( 'not-factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result1.info, 0 );
	B = new Float64Array( [ 5, 8, 8, 16 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result2 = dgbsvx( 'factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result2.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result2.rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: fact=not-factored, trans=no-transpose, 2 RHS', function t() {
	var result;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = nofact_notrans_2rhs;
	nrhs = 2;
	nRows = 3;
	AB = denseToGB( [ 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4, -1, 0, 0, -1, 4 ], 4, 1, 1 ); // eslint-disable-line max-len
	AFB = new Float64Array( 5 * 4 );
	IPIV = new Int32Array( 4 );
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	B = new Float64Array( [ 3, 2, 2, 3, 2, 5, 8, 13 ] );
	X = new Float64Array( 4 * nrhs );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result = dgbsvx( 'not-factored', 'no-transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: fact=not-factored, 5x5 pentadiagonal (KL=2, KU=2)', function t() { // eslint-disable-line max-len
	var result;
	var dense;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = nofact_notrans_pentadiag;
	nrhs = 1;
	nRows = 5;
	dense = [
		6,
		-2,
		1,
		0,
		0,
		-2,
		6,
		-2,
		1,
		0,
		1,
		-2,
		6,
		-2,
		1,
		0,
		1,
		-2,
		6,
		-2,
		0,
		0,
		1,
		-2,
		6
	];
	AB = denseToGB( dense, 5, 2, 2 );
	AFB = new Float64Array( 7 * 5 );
	IPIV = new Int32Array( 5 );
	r = new Float64Array( 5 );
	c = new Float64Array( 5 );
	B = new Float64Array( [ 5, 3, 4, 3, 5 ] );
	X = new Float64Array( 5 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 5 );
	result = dgbsvx( 'not-factored', 'no-transpose', 5, 2, 2, nrhs, AB, 1, nRows, 0, AFB, 1, 7, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 5, 0, X, 1, 5, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
	assertClose( result.rpvgrw, tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'dgbsvx: fact=equilibrate, trans=transpose, asymmetric 4x4', function t() { // eslint-disable-line max-len
	var result;
	var dense;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = equil_trans_asymmetric;
	nrhs = 1;
	nRows = 3;
	dense = [
		2,
		1,
		0,
		0,
		3,
		5,
		1,
		0,
		0,
		2,
		4,
		2,
		0,
		0,
		3,
		6
	];
	AB = denseToGB( dense, 4, 1, 1 );
	AFB = new Float64Array( 5 * 4 );
	IPIV = new Int32Array( 4 );
	r = new Float64Array( 4 );
	c = new Float64Array( 4 );
	B = new Float64Array( [ 4, 16, 24, 33 ] );
	X = new Float64Array( 4 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 4 );
	result = dgbsvx( 'equilibrate', 'transpose', 4, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 4, 0, X, 1, 4, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: singular matrix returns info > 0', function t() {
	var result;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = singular_matrix;
	nrhs = 1;
	nRows = 3;
	AB = denseToGB( [ 2, 0, 0, 0, 0, 0, 0, 0, 3 ], 3, 1, 1 );
	AFB = new Float64Array( 5 * 3 );
	IPIV = new Int32Array( 3 );
	r = new Float64Array( 3 );
	c = new Float64Array( 3 );
	B = new Float64Array( [ 1, 2, 3 ] );
	X = new Float64Array( 3 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 3 );
	result = dgbsvx( 'not-factored', 'no-transpose', 3, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assert.equal( result.rcond, tc.rcond );
	assertClose( result.rpvgrw, tc.rpvgrw, 1e-12, 'rpvgrw' );
});

test( 'dgbsvx: pivoting with asymmetric matrix', function t() {
	var result;
	var dense;
	var nRows;
	var nrhs;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var tc;
	var r;
	var c;
	var w;
	var B;
	var X;

	tc = pivot_asymmetric;
	nrhs = 1;
	nRows = 3;
	dense = [ 1, 4, 0, 3, 5, 1, 0, 2, 6 ];
	AB = denseToGB( dense, 3, 1, 1 );
	AFB = new Float64Array( 5 * 3 );
	IPIV = new Int32Array( 3 );
	r = new Float64Array( 3 );
	c = new Float64Array( 3 );
	B = new Float64Array( [ 7, 20, 20 ] );
	X = new Float64Array( 3 );
	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	w = makeWork( 3 );
	result = dgbsvx( 'not-factored', 'no-transpose', 3, 1, 1, nrhs, AB, 1, nRows, 0, AFB, 1, 5, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( result.rcond, tc.rcond, 1e-12, 'rcond' );
});

test( 'dgbsvx: quick return for N=0', function t() {
	var result;
	var IPIV;
	var FERR;
	var BERR;
	var AFB;
	var AB;
	var r;
	var c;
	var w;
	var B;
	var X;

	AB = new Float64Array( 1 );
	AFB = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	r = new Float64Array( 1 );
	c = new Float64Array( 1 );
	B = new Float64Array( 1 );
	X = new Float64Array( 1 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	w = makeWork( 1 );
	result = dgbsvx( 'not-factored', 'no-transpose', 0, 0, 0, 1, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, 'none', r, 1, 0, c, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, w.WORK, 1, 0, w.IWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( result.info, 0 );
	assert.equal( result.rcond, 1.0 );
	assert.equal( result.rpvgrw, 1.0 );
});
