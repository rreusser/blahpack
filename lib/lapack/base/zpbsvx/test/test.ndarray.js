/* eslint-disable no-restricted-syntax, max-lines, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpbtrf from '../../zpbtrf/lib/base.js';
import zpbsvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import fact_f_lower from './fixtures/fact_f_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import fact_e_upper from './fixtures/fact_e_upper.json' with { type: 'json' };
import fact_e_lower from './fixtures/fact_e_lower.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import multi_rhs_lower from './fixtures/multi_rhs_lower.json' with { type: 'json' };
import not_pos_def from './fixtures/not_pos_def.json' with { type: 'json' };
import fact_e_multi_rhs from './fixtures/fact_e_multi_rhs.json' with { type: 'json' };
import n4_upper_kd2 from './fixtures/n4_upper_kd2.json' with { type: 'json' };

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
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
* Helper: call zpbsvx with band storage arrays.
*
* @private
* @param {string} fact - factorization type
* @param {string} uplo - triangle
* @param {NonNegativeInteger} N - order
* @param {NonNegativeInteger} kd - bandwidth
* @param {NonNegativeInteger} nrhs - right-hand sides
* @param {Complex128Array} AB - original band matrix
* @param {Complex128Array} AFB - factored band matrix
* @param {string} equedVal - initial equed value
* @param {Float64Array} S - scaling factors
* @param {Complex128Array} B - RHS matrix
* @returns {Object} result
*/
function callZpbsvx( fact, uplo, N, kd, nrhs, AB, AFB, equedVal, S, B ) {
	var RWORK;
	var equed;
	var rcond;
	var AFBv;
	var ldab;
	var FERR;
	var BERR;
	var WORK;
	var info;
	var Xv;
	var X;

	equed = [ equedVal ];
	rcond = new Float64Array( 1 );
	ldab = kd + 1;
	FERR = new Float64Array( Math.max( 1, nrhs ) );
	BERR = new Float64Array( Math.max( 1, nrhs ) );
	WORK = new Complex128Array( Math.max( 1, 2 * N ) );
	RWORK = new Float64Array( Math.max( 1, N ) );
	X = new Complex128Array( Math.max( 1, N * nrhs ) );
	Xv = reinterpret( X, 0 );
	AFBv = reinterpret( AFB, 0 );

	info = zpbsvx( fact, uplo, N, kd, nrhs, AB, 1, ldab, 0, AFB, 1, ldab, 0, equed, S, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, RWORK, 1, 0 ); // eslint-disable-line max-len

	return {
		'info': info,
		'x': toArray( Xv ),
		'rcond': rcond[ 0 ],
		'ferr': toArray( FERR ),
		'berr': toArray( BERR ),
		'afb': toArray( AFBv ),
		's': toArray( S ),
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

test( 'zpbsvx: fact_n_upper', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_n_upper;

	// Upper band KD=1: (*, 4), (-1+0.5i, 4), (-1+0.5i, 4)
	AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	res = callZpbsvx( 'not-factored', 'upper', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: fact_n_lower', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_n_lower;

	// Lower band KD=1: (4, -1-0.5i), (4, -1-0.5i), (4, 0)
	AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	res = callZpbsvx( 'not-factored', 'lower', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: fact_f_upper', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_f_upper;
	AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( AB );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	zpbtrf( 'upper', 3, 1, AFB, 1, 2, 0 );
	res = callZpbsvx( 'factored', 'upper', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: fact_f_lower', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_f_lower;
	AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( AB );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	zpbtrf( 'lower', 3, 1, AFB, 1, 2, 0 );
	res = callZpbsvx( 'factored', 'lower', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: n_zero', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = n_zero;
	AB = new Complex128Array( 1 );
	AFB = new Complex128Array( 1 );
	S = new Float64Array( 1 );
	B = new Complex128Array( 1 );
	res = callZpbsvx( 'not-factored', 'upper', 0, 0, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
});

test( 'zpbsvx: n_one_upper', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = n_one_upper;
	AB = new Complex128Array( [ 4, 0 ] );
	AFB = new Complex128Array( 1 );
	S = new Float64Array( 1 );
	B = new Complex128Array( [ 8, 4 ] );
	res = callZpbsvx( 'not-factored', 'upper', 1, 0, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: fact_e_upper', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_e_upper;
	AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	res = callZpbsvx( 'equilibrate', 'upper', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assertArrayClose( res.s, tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: fact_e_lower', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_e_lower;
	AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0 ] );
	res = callZpbsvx( 'equilibrate', 'lower', 3, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.afb, tc.afb, 1e-14, 'afb' );
	assertArrayClose( res.s, tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: multi_rhs', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = multi_rhs;
	AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0, 5, 1, 4, -1, 3, 0 ] ); // eslint-disable-line max-len
	res = callZpbsvx( 'not-factored', 'upper', 3, 1, 2, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: multi_rhs_lower', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = multi_rhs_lower;
	AB = new Complex128Array( [ 4, 0, -1, -0.5, 4, 0, -1, -0.5, 4, 0, 0, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0, 5, 1, 4, -1, 3, 0 ] ); // eslint-disable-line max-len
	res = callZpbsvx( 'not-factored', 'lower', 3, 1, 2, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});

test( 'zpbsvx: not_pos_def', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = not_pos_def;

	// Upper band KD=1: (*, 1), (2+i, 1)
	AB = new Complex128Array( [ 0, 0, 1, 0, 2, 1, 1, 0 ] );
	AFB = new Complex128Array( 4 );
	S = new Float64Array( 2 );
	B = new Complex128Array( [ 1, 0, 1, 0 ] );
	res = callZpbsvx( 'not-factored', 'upper', 2, 1, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.rcond, tc.rcond, 'rcond' );
});

test( 'zpbsvx: fact_e_multi_rhs', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = fact_e_multi_rhs;
	AB = new Complex128Array( [ 0, 0, 4, 0, -1, 0.5, 4, 0, -1, 0.5, 4, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 6 );
	S = new Float64Array( 3 );
	B = new Complex128Array( [ 1, 1, 2, -1, 3, 0, 5, 1, 4, -1, 3, 0 ] ); // eslint-disable-line max-len
	res = callZpbsvx( 'equilibrate', 'upper', 3, 1, 2, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
	assertArrayClose( res.s, tc.s, 1e-14, 's' );
	assert.equal( res.equed, 'none', 'equed' );
});

test( 'zpbsvx: n4_upper_kd2', function t() {
	var AFB;
	var res;
	var tc;
	var AB;
	var S;
	var B;

	tc = n4_upper_kd2;

	// Upper band KD=2, N=4, LDAB=3: 3*4=12 complex elements
	AB = new Complex128Array( [ 0, 0, 0, 0, 6, 0, 0, 0, -0.5, -0.5, 6, 0, 0.25, 0, -0.5, -0.5, 6, 0, 0.25, 0, -0.5, -0.5, 6, 0 ] ); // eslint-disable-line max-len
	AFB = new Complex128Array( 12 );
	S = new Float64Array( 4 );
	B = new Complex128Array( [ 1, 2, 2, -1, 3, 0, 4, 1 ] );
	res = callZpbsvx( 'not-factored', 'upper', 4, 2, 1, AB, AFB, 'none', S, B ); // eslint-disable-line max-len
	assert.equal( res.info, tc.info, 'info' );
	assertArrayClose( res.x, tc.x, 1e-14, 'x' );
	assertClose( res.rcond, tc.rcond, 1e-14, 'rcond' );
	assertArrayClose( res.ferr, tc.ferr, 1e-10, 'ferr' );
	assertArrayClose( res.berr, tc.berr, 1e-10, 'berr' );
});
