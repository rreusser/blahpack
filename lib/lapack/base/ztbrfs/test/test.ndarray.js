/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines, node/no-sync */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbtrs from './../../ztbtrs/lib/base.js';
import ztbrfs from './../lib/ndarray.js';

// FIXTURES //

import upper_no_trans from './fixtures/upper_no_trans.json' with { type: 'json' };
import lower_no_trans from './fixtures/lower_no_trans.json' with { type: 'json' };
import upper_conj_trans from './fixtures/upper_conj_trans.json' with { type: 'json' };
import lower_conj_trans from './fixtures/lower_conj_trans.json' with { type: 'json' };
import upper_unit_diag from './fixtures/upper_unit_diag.json' with { type: 'json' };
import lower_unit_diag from './fixtures/lower_unit_diag.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import nrhs_zero from './fixtures/nrhs_zero.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import upper_kd2 from './fixtures/upper_kd2.json' with { type: 'json' };
import lower_kd2_conj_trans from './fixtures/lower_kd2_conj_trans.json' with { type: 'json' };

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
* Sets a complex value at (row, col) in a column-major band matrix (Float64 interleaved).
*
* @private
* @param {Float64Array} data - matrix data
* @param {integer} ld - leading dimension (number of complex rows)
* @param {integer} row - 0-based row index
* @param {integer} col - 0-based column index
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setAB( data, ld, row, col, re, im ) {
	var idx = 2 * ( row + ( col * ld ) );
	data[ idx ] = re;
	data[ idx + 1 ] = im;
}

/**
* Runs a single ztbrfs test case.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - transpose type
* @param {string} diagType - 'unit' or 'non-unit'
* @param {integer} N - order of matrix
* @param {integer} nrhs - number of right-hand sides
* @param {integer} kd - number of super/sub diagonals
* @param {Float64Array} ABdata - band matrix data (interleaved re/im, col-major)
* @param {integer} ldab - leading dimension of AB (complex elements)
* @param {Float64Array} Bdata - right-hand side data (interleaved re/im, col-major)
* @param {integer} ldb - leading dimension of B (complex elements)
* @returns {Object} result containing FERR, BERR, Xv (Float64 view), info
*/
function runCase( uplo, trans, diagType, N, nrhs, kd, ABdata, ldab, Bdata, ldb ) { // eslint-disable-line max-len
	var RWORK;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var Xv;
	var AB;
	var B;
	var X;

	AB = new Complex128Array( ABdata );
	B = new Complex128Array( Bdata );

	// Create X by copying B and solving
	X = new Complex128Array( Bdata.slice() );
	ztbtrs( uplo, trans, diagType, N, kd, nrhs, AB, 1, ldab, 0, X, 1, ldb, 0 );

	FERR = new Float64Array( nrhs );
	BERR = new Float64Array( nrhs );
	WORK = new Complex128Array( 2 * N );
	RWORK = new Float64Array( N );

	info = ztbrfs( uplo, trans, diagType, N, kd, nrhs, AB, 1, ldab, 0, B, 1, ldb, 0, X, 1, ldb, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	Xv = reinterpret( X, 0 );

	return {
		'info': info,
		'ferr': toArray( FERR ),
		'berr': toArray( BERR ),
		'xv': Xv,
		'ldb': ldb
	};
}

/**
* Extracts column j of the X matrix from the Float64 view.
*
* @private
* @param {Float64Array} Xv - Float64 view of X
* @param {integer} ldb - leading dimension
* @param {integer} N - number of rows
* @param {integer} j - 0-based column index
* @returns {Array} array of 2*N doubles
*/
function getCol( Xv, ldb, N, j ) {
	var out = [];
	var idx;
	var i;
	for ( i = 0; i < N; i++ ) {
		idx = 2 * ( i + ( j * ldb ) );
		out.push( Xv[ idx ] );
		out.push( Xv[ idx + 1 ] );
	}
	return out;
}

// TESTS //

test( 'ztbrfs: upper_no_trans (upper, no-transpose, non-unit, N=3, KD=1)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = upper_no_trans;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 0.0, 0.0 );
	setAB( ABdata, ldab, 1, 0, 3.0, 0.0 );
	setAB( ABdata, ldab, 0, 1, 1.0, 1.0 );
	setAB( ABdata, ldab, 1, 1, 4.0, 1.0 );
	setAB( ABdata, ldab, 0, 2, 2.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 5.0, -1.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 4.0, 1.0 );
	setAB( Bdata, ldb, 1, 0, 6.0, 0.0 );
	setAB( Bdata, ldb, 2, 0, 5.0, -1.0 );
	res = runCase( 'upper', 'no-transpose', 'non-unit', 3, 1, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: lower_no_trans (lower, no-transpose, non-unit, N=3, KD=1)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = lower_no_trans;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 2.0, 1.0 );
	setAB( ABdata, ldab, 1, 0, 1.0, 1.0 );
	setAB( ABdata, ldab, 0, 1, 3.0, 0.0 );
	setAB( ABdata, ldab, 1, 1, 2.0, -1.0 );
	setAB( ABdata, ldab, 0, 2, 4.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 0.0, 0.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 2.0, 1.0 );
	setAB( Bdata, ldb, 1, 0, 4.0, 1.0 );
	setAB( Bdata, ldb, 2, 0, 6.0, -2.0 );
	res = runCase( 'lower', 'no-transpose', 'non-unit', 3, 1, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: upper_conj_trans (upper, conjugate-transpose, non-unit, N=3, KD=1)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = upper_conj_trans;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 0.0, 0.0 );
	setAB( ABdata, ldab, 1, 0, 3.0, 0.0 );
	setAB( ABdata, ldab, 0, 1, 1.0, 1.0 );
	setAB( ABdata, ldab, 1, 1, 4.0, 1.0 );
	setAB( ABdata, ldab, 0, 2, 2.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 5.0, -1.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 3.0, 0.0 );
	setAB( Bdata, ldb, 1, 0, 5.0, -2.0 );
	setAB( Bdata, ldb, 2, 0, 7.0, 2.0 );
	res = runCase( 'upper', 'conjugate-transpose', 'non-unit', 3, 1, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: lower_conj_trans (lower, conjugate-transpose, non-unit, N=3, KD=1)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = lower_conj_trans;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 2.0, 1.0 );
	setAB( ABdata, ldab, 1, 0, 1.0, 1.0 );
	setAB( ABdata, ldab, 0, 1, 3.0, 0.0 );
	setAB( ABdata, ldab, 1, 1, 2.0, -1.0 );
	setAB( ABdata, ldab, 0, 2, 4.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 0.0, 0.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 3.0, -2.0 );
	setAB( Bdata, ldb, 1, 0, 5.0, 1.0 );
	setAB( Bdata, ldb, 2, 0, 4.0, 1.0 );
	res = runCase( 'lower', 'conjugate-transpose', 'non-unit', 3, 1, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: upper_unit_diag (upper, no-transpose, unit, N=3, KD=1)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = upper_unit_diag;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 0.0, 0.0 );
	setAB( ABdata, ldab, 1, 0, 99.0, 99.0 );
	setAB( ABdata, ldab, 0, 1, 2.0, 1.0 );
	setAB( ABdata, ldab, 1, 1, 99.0, 99.0 );
	setAB( ABdata, ldab, 0, 2, 3.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 99.0, 99.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 3.0, 1.0 );
	setAB( Bdata, ldb, 1, 0, 4.0, -1.0 );
	setAB( Bdata, ldb, 2, 0, 1.0, 0.0 );
	res = runCase( 'upper', 'no-transpose', 'unit', 3, 1, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: lower_unit_diag (lower, no-transpose, unit, N=3, KD=1)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = lower_unit_diag;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 99.0, 99.0 );
	setAB( ABdata, ldab, 1, 0, 1.0, 1.0 );
	setAB( ABdata, ldab, 0, 1, 99.0, 99.0 );
	setAB( ABdata, ldab, 1, 1, 2.0, -1.0 );
	setAB( ABdata, ldab, 0, 2, 99.0, 99.0 );
	setAB( ABdata, ldab, 1, 2, 0.0, 0.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 1.0, 0.0 );
	setAB( Bdata, ldb, 1, 0, 2.0, 1.0 );
	setAB( Bdata, ldb, 2, 0, 3.0, -1.0 );
	res = runCase( 'lower', 'no-transpose', 'unit', 3, 1, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: n_zero (N=0 quick return)', function t() {
	var RWORK;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AB;
	var B;
	var X;

	tc = n_zero;
	AB = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	X = new Complex128Array( 1 );
	WORK = new Complex128Array( 2 );
	RWORK = new Float64Array( 1 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	FERR[ 0 ] = 999.0;
	BERR[ 0 ] = 999.0;
	info = ztbrfs( 'upper', 'no-transpose', 'non-unit', 0, 0, 1, AB, 1, 1, 0, B, 1, 1, 0, X, 1, 1, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertClose( FERR[ 0 ], 0.0, 1e-14, 'ferr' );
	assertClose( BERR[ 0 ], 0.0, 1e-14, 'berr' );
});

test( 'ztbrfs: nrhs_zero (NRHS=0 quick return)', function t() {
	var RWORK;
	var WORK;
	var FERR;
	var BERR;
	var info;
	var tc;
	var AB;
	var B;
	var X;

	tc = nrhs_zero;
	AB = new Complex128Array( 9 );
	B = new Complex128Array( 3 );
	X = new Complex128Array( 3 );
	WORK = new Complex128Array( 6 );
	RWORK = new Float64Array( 3 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	info = ztbrfs( 'upper', 'no-transpose', 'non-unit', 3, 1, 0, AB, 1, 3, 0, B, 1, 3, 0, X, 1, 3, 0, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'ztbrfs: multi_rhs (upper, no-transpose, non-unit, N=3, KD=1, NRHS=2)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = multi_rhs;
	ldab = 2;
	ldb = 3;
	ABdata = new Float64Array( 2 * ldab * 3 );
	setAB( ABdata, ldab, 0, 0, 0.0, 0.0 );
	setAB( ABdata, ldab, 1, 0, 3.0, 0.0 );
	setAB( ABdata, ldab, 0, 1, 1.0, 1.0 );
	setAB( ABdata, ldab, 1, 1, 4.0, 1.0 );
	setAB( ABdata, ldab, 0, 2, 2.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 5.0, -1.0 );
	Bdata = new Float64Array( 2 * ldb * 2 );
	setAB( Bdata, ldb, 0, 0, 4.0, 1.0 );
	setAB( Bdata, ldb, 1, 0, 6.0, 0.0 );
	setAB( Bdata, ldb, 2, 0, 5.0, -1.0 );
	setAB( Bdata, ldb, 0, 1, 8.0, 3.0 );
	setAB( Bdata, ldb, 1, 1, 6.5, -2.5 );
	setAB( Bdata, ldb, 2, 1, 3.0, 2.0 );
	res = runCase( 'upper', 'no-transpose', 'non-unit', 3, 2, 1, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 3, 0 ), tc.x1, 1e-12, 'x1' );
	assertArrayClose( getCol( res.xv, ldb, 3, 1 ), tc.x2, 1e-12, 'x2' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
});

test( 'ztbrfs: upper_kd2 (upper, no-transpose, non-unit, N=4, KD=2)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = upper_kd2;
	ldab = 3;
	ldb = 4;
	ABdata = new Float64Array( 2 * ldab * 4 );
	setAB( ABdata, ldab, 2, 0, 3.0, 0.0 );
	setAB( ABdata, ldab, 1, 1, 1.0, 0.0 );
	setAB( ABdata, ldab, 2, 1, 4.0, 1.0 );
	setAB( ABdata, ldab, 0, 2, 1.0, 1.0 );
	setAB( ABdata, ldab, 1, 2, 2.0, 1.0 );
	setAB( ABdata, ldab, 2, 2, 5.0, -1.0 );
	setAB( ABdata, ldab, 0, 3, 2.0, 0.0 );
	setAB( ABdata, ldab, 1, 3, 3.0, -1.0 );
	setAB( ABdata, ldab, 2, 3, 6.0, 0.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 5.0, 1.0 );
	setAB( Bdata, ldb, 1, 0, 8.0, 2.0 );
	setAB( Bdata, ldb, 2, 0, 8.0, -2.0 );
	setAB( Bdata, ldb, 3, 0, 6.0, 0.0 );
	res = runCase( 'upper', 'no-transpose', 'non-unit', 4, 1, 2, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 4, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});

test( 'ztbrfs: lower_kd2_conj_trans (lower, conjugate-transpose, non-unit, N=4, KD=2)', function t() { // eslint-disable-line max-len
	var ABdata;
	var Bdata;
	var ldab;
	var res;
	var ldb;
	var tc;

	tc = lower_kd2_conj_trans;
	ldab = 3;
	ldb = 4;
	ABdata = new Float64Array( 2 * ldab * 4 );
	setAB( ABdata, ldab, 0, 0, 3.0, 1.0 );
	setAB( ABdata, ldab, 1, 0, 1.0, 0.5 );
	setAB( ABdata, ldab, 2, 0, 0.5, 0.2 );
	setAB( ABdata, ldab, 0, 1, 4.0, 0.0 );
	setAB( ABdata, ldab, 1, 1, 2.0, -1.0 );
	setAB( ABdata, ldab, 2, 1, 1.0, 0.3 );
	setAB( ABdata, ldab, 0, 2, 5.0, -1.0 );
	setAB( ABdata, ldab, 1, 2, 3.0, 0.5 );
	setAB( ABdata, ldab, 2, 2, 0.0, 0.0 );
	setAB( ABdata, ldab, 0, 3, 6.0, 2.0 );
	setAB( ABdata, ldab, 1, 3, 0.0, 0.0 );
	setAB( ABdata, ldab, 2, 3, 0.0, 0.0 );
	Bdata = new Float64Array( 2 * ldb * 1 );
	setAB( Bdata, ldb, 0, 0, 4.5, -1.7 );
	setAB( Bdata, ldb, 1, 0, 7.0, 0.7 );
	setAB( Bdata, ldb, 2, 0, 8.0, 0.5 );
	setAB( Bdata, ldb, 3, 0, 6.0, -2.0 );
	res = runCase( 'lower', 'conjugate-transpose', 'non-unit', 4, 1, 2, ABdata, ldab, Bdata, ldb ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info );
	assertArrayClose( getCol( res.xv, ldb, 4, 0 ), tc.x, 1e-12, 'x' );
	assertArrayClose( res.berr, tc.berr, 1e-12, 'berr' );
	assertArrayClose( res.ferr, tc.ferr, 1e-6, 'ferr' );
});
