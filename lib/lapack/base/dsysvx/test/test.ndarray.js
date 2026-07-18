/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrf from './../../dsytrf/lib/base.js';
import dsysvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_f_upper from './fixtures/fact_f_upper.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import singular from './fixtures/singular.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import ill_conditioned from './fixtures/ill_conditioned.json' with { type: 'json' };

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
* Helper to call dsysvx with standard col-major layout.
*/
function callDsysvx( fact, uplo, N, nrhs, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ) { // eslint-disable-line max-len
	return dsysvx( fact, uplo, N, nrhs, A, 1, N, 0, AF, 1, N, 0, IPIV, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
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

test( 'dsysvx: fact_n_upper', function t() {

	const tc = fact_n_upper;
	const A = new Float64Array( [ 4, 0, 0, 2, 5, 0, 1, 3, 6 ] );
	const AF = new Float64Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1, 2, 3 ] );
	const X = new Float64Array( 3 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 100 );
	const IWORK = new Int32Array( 3 );
	const info = callDsysvx( 'not-factored', 'upper', 3, 1, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
});

test( 'dsysvx: fact_n_lower', function t() {

	const tc = fact_n_lower;
	const A = new Float64Array( [ 4, 2, 1, 0, 5, 3, 0, 0, 6 ] );
	const AF = new Float64Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1, 2, 3 ] );
	const X = new Float64Array( 3 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 100 );
	const IWORK = new Int32Array( 3 );
	const info = callDsysvx( 'not-factored', 'lower', 3, 1, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
});

test( 'dsysvx: fact_f_upper (pre-factored)', function t() {

	const tc = fact_f_upper;
	const A = new Float64Array( [ 4, 0, 0, 2, 5, 0, 1, 3, 6 ] );
	const AF = new Float64Array( [ 4, 0, 0, 2, 5, 0, 1, 3, 6 ] );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1, 2, 3 ] );
	const X = new Float64Array( 3 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 100 );
	const IWORK = new Int32Array( 3 );
	dsytrf( 'upper', 3, AF, 1, 3, 0, IPIV, 1, 0 );
	const info = callDsysvx( 'factored', 'upper', 3, 1, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
});

test( 'dsysvx: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const AF = new Float64Array( 1 );
	const IPIV = new Int32Array( 1 );
	const B = new Float64Array( 1 );
	const X = new Float64Array( 1 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 10 );
	const IWORK = new Int32Array( 1 );
	const info = callDsysvx( 'not-factored', 'upper', 0, 1, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
});

test( 'dsysvx: singular', function t() {

	const tc = singular;
	const A = new Float64Array( [ 1, 0, 0, 0 ] );
	const AF = new Float64Array( 4 );
	const IPIV = new Int32Array( 2 );
	const B = new Float64Array( [ 1, 1 ] );
	const X = new Float64Array( 2 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 100 );
	const IWORK = new Int32Array( 2 );
	const info = callDsysvx( 'not-factored', 'upper', 2, 1, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assert.equal( rcond[ 0 ], tc.rcond );
});

test( 'dsysvx: multi_rhs', function t() {

	const tc = multi_rhs;
	const A = new Float64Array( [ 4, 0, 0, 2, 5, 0, 1, 3, 6 ] );
	const AF = new Float64Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );
	const X = new Float64Array( 6 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 2 );
	const BERR = new Float64Array( 2 );
	const WORK = new Float64Array( 100 );
	const IWORK = new Int32Array( 3 );
	const info = callDsysvx( 'not-factored', 'upper', 3, 2, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-12, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-6, 'rcond' );
});

test( 'dsysvx: ill_conditioned', function t() {

	const tc = ill_conditioned;
	const A = new Float64Array( [ 1, 0, 0, 0.5, 1.0 / 3.0, 0, 1.0 / 3.0, 0.25, 0.2 ] );
	const AF = new Float64Array( 9 );
	const IPIV = new Int32Array( 3 );
	const B = new Float64Array( [ 1, 1, 1 ] );
	const X = new Float64Array( 3 );
	const rcond = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const WORK = new Float64Array( 100 );
	const IWORK = new Int32Array( 3 );
	const info = callDsysvx( 'not-factored', 'upper', 3, 1, A, AF, IPIV, B, X, rcond, FERR, BERR, WORK, IWORK ); // eslint-disable-line max-len
	assert.equal( info, tc.info );
	assertArrayClose( toArray( X ), tc.x, 1e-6, 'x' );
	assertClose( rcond[ 0 ], tc.rcond, 1e-2, 'rcond' );
});
