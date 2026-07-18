/* eslint-disable no-restricted-syntax, max-lines, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dpbtrf from '../../dpbtrf/lib/base.js';
import dpbsvx from './../lib/ndarray.js';

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
import n4_upper_kd1 from './fixtures/n4_upper_kd1.json' with { type: 'json' };

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
* Helper: call dpbsvx with band storage arrays.
*
* @private
* @param {string} fact - 'not-factored', 'factored', or 'equilibrate'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - number of super/sub diagonals
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Float64Array} AB - original band matrix, (KD+1)*N
* @param {Float64Array} AFB - factored band matrix (input if factored)
* @param {string} equedVal - initial equed value ('none' or 'yes')
* @param {Float64Array} S - scaling factors
* @param {Float64Array} B - RHS matrix (col-major, N-by-nrhs)
* @returns {Object} result with info, x, rcond, ferr, berr, afb, s, equed
*/
function callDpbsvx( fact, uplo, N, kd, nrhs, AB, AFB, equedVal, S, B ) {
	const equed = [ equedVal ];
	const rcond = new Float64Array( 1 );
	const IWORK = new Int32Array( Math.max( 1, N ) );
	const ldab = kd + 1;
	const FERR = new Float64Array( Math.max( 1, nrhs ) );
	const BERR = new Float64Array( Math.max( 1, nrhs ) );
	const WORK = new Float64Array( Math.max( 1, 3 * N ) );
	const X = new Float64Array( Math.max( 1, N * nrhs ) );

	const info = dpbsvx( fact, uplo, N, kd, nrhs, AB, 1, ldab, 0, AFB, 1, ldab, 0, equed, S, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': X,
		'rcond': rcond[ 0 ],
		'ferr': FERR,
		'berr': BERR,
		'afb': AFB,
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dpbsvx: fact_n_upper', function t() {

	const tc = fact_n_upper;
	const AB = new Float64Array( [ 0.0, 0.0, 4.0, 0.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	const res = callDpbsvx( 'not-factored', 'upper', 3, 2, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afb ), tc.afb, 1e-14, 'afb' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dpbsvx: fact_n_lower', function t() {

	const tc = fact_n_lower;
	const AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	const res = callDpbsvx( 'not-factored', 'lower', 3, 2, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afb ), tc.afb, 1e-14, 'afb' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dpbsvx: fact_f_upper', function t() {

	const tc = fact_f_upper;
	const AB = new Float64Array( [ 0.0, 0.0, 4.0, 0.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const AFB = new Float64Array( AB );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	dpbtrf( 'upper', 3, 2, AFB, 1, 3, 0 );
	const res = callDpbsvx( 'factored', 'upper', 3, 2, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dpbsvx: fact_f_lower', function t() {

	const tc = fact_f_lower;
	const AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
	const AFB = new Float64Array( AB );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	dpbtrf( 'lower', 3, 2, AFB, 1, 3, 0 );
	const res = callDpbsvx( 'factored', 'lower', 3, 2, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dpbsvx: n_zero', function t() {

	const tc = n_zero;
	const AB = new Float64Array( 1 );
	const AFB = new Float64Array( 1 );
	const S = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const res = callDpbsvx( 'not-factored', 'upper', 0, 0, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
});

test( 'dpbsvx: n_one_upper', function t() {

	const tc = n_one_upper;
	const AB = new Float64Array( [ 4.0 ] );
	const AFB = new Float64Array( 1 );
	const S = new Float64Array( 1 );
	const B = new Float64Array( [ 8.0 ] );
	const res = callDpbsvx( 'not-factored', 'upper', 1, 0, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dpbsvx: fact_e_upper', function t() {

	const tc = fact_e_upper;
	const AB = new Float64Array( [ 0.0, 0.0, 4.0, 0.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	const res = callDpbsvx( 'equilibrate', 'upper', 3, 2, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afb ), tc.afb, 1e-14, 'afb' );
	assertArrayClose( toArray( res.s ), tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dpbsvx: fact_e_lower', function t() {

	const tc = fact_e_lower;
	const AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0 ] );
	const res = callDpbsvx( 'equilibrate', 'lower', 3, 2, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.afb ), tc.afb, 1e-14, 'afb' );
	assertArrayClose( toArray( res.s ), tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dpbsvx: fact_f_equed_y_upper', function t() {

	const tc = fact_f_equed_y_upper;
	const AB = new Float64Array( [ 0.0, 0.0, 4.0, 0.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const S = new Float64Array( [ 0.5, 1.0 / Math.sqrt( 5.0 ), 1.0 / Math.sqrt( 6.0 ) ] ); // eslint-disable-line max-len
	const AFB = new Float64Array( 9 );
	AFB[ 2 ] = S[ 0 ] * 4.0 * S[ 0 ];
	AFB[ 4 ] = S[ 0 ] * 2.0 * S[ 1 ];
	AFB[ 5 ] = S[ 1 ] * 5.0 * S[ 1 ];
	AFB[ 6 ] = S[ 0 ] * 1.0 * S[ 2 ];
	AFB[ 7 ] = S[ 1 ] * 3.0 * S[ 2 ];
	AFB[ 8 ] = S[ 2 ] * 6.0 * S[ 2 ];
	dpbtrf( 'upper', 3, 2, AFB, 1, 3, 0 );
	const B = new Float64Array( [ S[ 0 ] * 7.0, S[ 1 ] * 10.0, S[ 2 ] * 10.0 ] );
	const res = callDpbsvx( 'factored', 'upper', 3, 2, 1, AB, AFB, 'yes', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-12, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-12, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-6, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-6, 'berr' );
});

test( 'dpbsvx: multi_rhs', function t() {

	const tc = multi_rhs;
	const AB = new Float64Array( [ 0.0, 0.0, 4.0, 0.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	const res = callDpbsvx( 'not-factored', 'upper', 3, 2, 2, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dpbsvx: multi_rhs_lower', function t() {

	const tc = multi_rhs_lower;
	const AB = new Float64Array( [ 4.0, 2.0, 1.0, 5.0, 3.0, 0.0, 6.0, 0.0, 0.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	const res = callDpbsvx( 'not-factored', 'lower', 3, 2, 2, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});

test( 'dpbsvx: fact_e_multi_rhs', function t() {

	const tc = fact_e_multi_rhs;
	const AB = new Float64Array( [ 0.0, 0.0, 4.0, 0.0, 2.0, 5.0, 1.0, 3.0, 6.0 ] );
	const AFB = new Float64Array( 9 );
	const S = new Float64Array( 3 );
	const B = new Float64Array( [ 7.0, 10.0, 10.0, 18.0, 31.0, 35.0 ] );
	const res = callDpbsvx( 'equilibrate', 'upper', 3, 2, 2, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
	assertArrayClose( toArray( res.s ), tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'dpbsvx: not_pos_def', function t() {

	const tc = not_pos_def;
	const AB = new Float64Array( [ 0.0, 1.0, 2.0, 1.0 ] );
	const AFB = new Float64Array( 4 );
	const S = new Float64Array( 2 );
	const B = new Float64Array( [ 1.0, 2.0 ] );
	const res = callDpbsvx( 'not-factored', 'upper', 2, 1, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'dpbsvx: n4_upper_kd1', function t() {

	const tc = n4_upper_kd1;
	const AB = new Float64Array( [ 0.0, 10.0, 2.0, 12.0, 3.0, 15.0, 4.0, 20.0 ] );
	const AFB = new Float64Array( 8 );
	const S = new Float64Array( 4 );
	const B = new Float64Array( [ 12.0, 17.0, 22.0, 24.0 ] );
	const res = callDpbsvx( 'not-factored', 'upper', 4, 1, 1, AB, AFB, 'none', S, B );
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( toArray( res.x ), tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( toArray( res.ferr ), tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( toArray( res.berr ), tc.berr, 1e-10, 'berr' );
});
