/* eslint-disable no-restricted-syntax, max-lines, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpptrf from '../../dpptrf/lib/base.js';
import dppsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import fact_e_upper from './fixtures/fact_e_upper.json' with { type: 'json' };
import fact_e_lower from './fixtures/fact_e_lower.json' with { type: 'json' };
import fact_f_equed_y_upper from './fixtures/fact_f_equed_y_upper.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };
import fact_e_multi_rhs from './fixtures/fact_e_multi_rhs.json' with { type: 'json' };
import not_pos_def from './fixtures/not_pos_def.json' with { type: 'json' };
import n4_upper from './fixtures/n4_upper.json' with { type: 'json' };

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
* Helper: call dppsvx with packed storage arrays.
*
* @private
* @param {string} fact - 'not-factored', 'factored', or 'equilibrate'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Float64Array} AP - original packed matrix
* @param {Float64Array} AFP - factored packed matrix (input if factored)
* @param {string} equedVal - initial equed value ('none' or 'yes')
* @param {Float64Array} S - scaling factors
* @param {Float64Array} B - RHS matrix (col-major, N-by-nrhs)
* @returns {Object} result with info, x, rcond, ferr, berr, afp, s, equed
*/
function callDppsvx( fact, uplo, N, nrhs, AP, AFP, equedVal, S, B ) {
	var equed = [ equedVal ];
	var rcond = new Float64Array( 1 );
	var IWORK = new Int32Array( Math.max( 1, N ) );
	var FERR = new Float64Array( Math.max( 1, nrhs ) );
	var BERR = new Float64Array( Math.max( 1, nrhs ) );
	var WORK = new Float64Array( Math.max( 1, 3 * N ) );
	var info;
	var X = new Float64Array( Math.max( 1, N * nrhs ) );

	info = dppsvx( fact, uplo, N, nrhs, AP, 1, 0, AFP, 1, 0, equed, S, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': X,
		'rcond': rcond[ 0 ],
		'ferr': FERR,
		'berr': BERR,
		'afp': AFP,
		's': S,
		'equed': equed[ 0 ]
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

test( 'dppsvx: fact_n_upper', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_n_upper;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	res = callDppsvx( 'not-factored', 'upper', 3, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dppsvx: fact_n_lower', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_n_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	res = callDppsvx( 'not-factored', 'lower', 3, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dppsvx: fact_f_upper', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_f_upper;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( AP );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	dpptrf( 'upper', 3, AFP, 1, 0 );
	res = callDppsvx( 'factored', 'upper', 3, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dppsvx: fact_f_lower', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_f_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( AP );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	dpptrf( 'lower', 3, AFP, 1, 0 );
	res = callDppsvx( 'factored', 'lower', 3, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dppsvx: n_zero', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = n_zero;
	AP = new Float64Array( 1 );
	AFP = new Float64Array( 1 );
	S = new Float64Array( 1 );
	B = new Float64Array( 1 );
	res = callDppsvx( 'not-factored', 'upper', 0, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
});

test( 'dppsvx: n_one_upper', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = n_one_upper;
	AP = new Float64Array( [ 4.0 ] );
	AFP = new Float64Array( 1 );
	S = new Float64Array( 1 );
	B = new Float64Array( [ 8.0 ] );
	res = callDppsvx( 'not-factored', 'upper', 1, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dppsvx: fact_e_upper', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_e_upper;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	res = callDppsvx( 'equilibrate', 'upper', 3, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
	assertArrayClose( toArray( res.s ), tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dppsvx: fact_e_lower', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_e_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	res = callDppsvx( 'equilibrate', 'lower', 3, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afp ), tc.afp, 1e-14, 'afp' );
	assertArrayClose( toArray( res.s ), tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dppsvx: fact_f_equed_y_upper', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_f_equed_y_upper;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	S = new Float64Array( [ 0.5, 1.0 / Math.sqrt( 5.0 ), 1.0 / Math.sqrt( 6.0 ) ] ); // eslint-disable-line max-len
	AFP = new Float64Array( 6 );
	AFP[ 0 ] = S[ 0 ] * AP[ 0 ] * S[ 0 ];
	AFP[ 1 ] = S[ 0 ] * AP[ 1 ] * S[ 1 ];
	AFP[ 2 ] = S[ 1 ] * AP[ 2 ] * S[ 1 ];
	AFP[ 3 ] = S[ 0 ] * AP[ 3 ] * S[ 2 ];
	AFP[ 4 ] = S[ 1 ] * AP[ 4 ] * S[ 2 ];
	AFP[ 5 ] = S[ 2 ] * AP[ 5 ] * S[ 2 ];
	dpptrf( 'upper', 3, AFP, 1, 0 );
	B = new Float64Array( [ S[ 0 ] * 7.0, S[ 1 ] * 10.0, S[ 2 ] * 10.0 ] );
	res = callDppsvx( 'factored', 'upper', 3, 1, AP, AFP, 'yes', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-12, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-12, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-6, 'berr' );
});

test( 'dppsvx: multi_rhs', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = multi_rhs;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	res = callDppsvx( 'not-factored', 'upper', 3, 2, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dppsvx: multi_rhs_lower', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = multi_rhs_lower;
	AP = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	res = callDppsvx( 'not-factored', 'lower', 3, 2, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dppsvx: fact_e_multi_rhs', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = fact_e_multi_rhs;
	AP = new Float64Array( [ 4.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	AFP = new Float64Array( 6 );
	S = new Float64Array( 3 );
	B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	res = callDppsvx( 'equilibrate', 'upper', 3, 2, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.s ), tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dppsvx: not_pos_def', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = not_pos_def;
	AP = new Float64Array( [ 1.0, 2.0, 1.0 ] );
	AFP = new Float64Array( 3 );
	S = new Float64Array( 2 );
	B = new Float64Array( [ 1.0, 2.0 ] );
	res = callDppsvx( 'not-factored', 'upper', 2, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'dppsvx: n4_upper', function t() {
	var AFP;
	var res;
	var tc;
	var AP;
	var S;
	var B;

	tc = n4_upper;
	AP = new Float64Array( [ 10.0, 2.0, 12.0, 1.0, 3.0, 15.0, 0.0, 1.0, 4.0, 20.0 ] ); // eslint-disable-line max-len
	AFP = new Float64Array( 10 );
	S = new Float64Array( 4 );
	B = new Float64Array( [ 13.0, 18.0, 23.0, 25.0 ] );
	res = callDppsvx( 'not-factored', 'upper', 4, 1, AP, AFP, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});
