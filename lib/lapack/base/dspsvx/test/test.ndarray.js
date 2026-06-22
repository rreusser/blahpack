/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsptrf from '../../dsptrf/lib/base.js';
import dspsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import ill_conditioned from './fixtures/ill_conditioned.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };

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
* Helper: call dspsvx with packed storage arrays.
*
* @private
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Float64Array} AP - original packed matrix
* @param {Float64Array} AFP - factored packed matrix (input if factored)
* @param {Int32Array} IPIV - pivot indices (input if factored)
* @param {Float64Array} B - RHS matrix (col-major, N-by-nrhs)
* @returns {Object} result with info, x, rcond, ferr, berr, afp, ipiv
*/
function callDspsvx( fact, uplo, N, nrhs, AP, AFP, IPIV, B ) {
	var rcond = new Float64Array( 1 );
	var IWORK = new Int32Array( N );
	var FERR = new Float64Array( nrhs );
	var BERR = new Float64Array( nrhs );
	var WORK = new Float64Array( Math.max( 1, 3 * N ) );
	var info;
	var X = new Float64Array( N * nrhs );

	info = dspsvx( fact, uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': X,
		'rcond': rcond[ 0 ],
		'ferr': FERR,
		'berr': BERR,
		'afp': AFP,
		'ipiv': IPIV
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

test( 'dspsvx: fact_n_upper', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_n_upper;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	res = callDspsvx( 'not-factored', 'upper', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});

test( 'dspsvx: fact_n_lower', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_n_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	res = callDspsvx( 'not-factored', 'lower', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
});

test( 'dspsvx: fact_f_upper', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_f_upper;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( AP );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	dsptrf( 'upper', 3, AFP, 1, 0, IPIV, 1, 0 );
	res = callDspsvx( 'factored', 'upper', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dspsvx: fact_f_lower', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = fact_f_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( AP );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	dsptrf( 'lower', 3, AFP, 1, 0, IPIV, 1, 0 );
	res = callDspsvx( 'factored', 'lower', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dspsvx: n_zero', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = n_zero;
	AP = new Float64Array( 1 );
	AFP = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( 1 );
	res = callDspsvx( 'not-factored', 'upper', 0, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
});

test( 'dspsvx: n_one_upper', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = n_one_upper;
	AP = new Float64Array( [ 4.0 ] );
	AFP = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( [ 8.0 ] );
	res = callDspsvx( 'not-factored', 'upper', 1, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dspsvx: n_one_lower', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = n_one_lower;
	AP = new Float64Array( [ 5.0 ] );
	AFP = new Float64Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Float64Array( [ 15.0 ] );
	res = callDspsvx( 'not-factored', 'lower', 1, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dspsvx: singular', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = singular;
	AP = new Float64Array( [ 1.0, 2.0, 4.0 ] );
	AFP = new Float64Array( 3 );
	IPIV = new Int32Array( 2 );
	B = new Float64Array( [ 1.0, 2.0 ] );
	res = callDspsvx( 'not-factored', 'upper', 2, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'dspsvx: ill_conditioned', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = ill_conditioned;
	AP = new Float64Array( [ 1.0, 0.5, 1.0/3.0, 1.0/3.0, 0.25, 0.2 ] );
	AFP = new Float64Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 1.0, 1.0, 1.0 ] );
	res = callDspsvx( 'not-factored', 'upper', 3, 1, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-10, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-6, 'berr' );
});

test( 'dspsvx: multi_rhs', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = multi_rhs;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	res = callDspsvx( 'not-factored', 'upper', 3, 2, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dspsvx: multi_rhs_lower', function t() {
	var IPIV;
	var AFP;
	var res;
	var tc;
	var AP;
	var B;

	tc = multi_rhs_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	IPIV = new Int32Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	res = callDspsvx( 'not-factored', 'lower', 3, 2, AP, AFP, IPIV, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});
