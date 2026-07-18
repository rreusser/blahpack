/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dposvx from './../lib/ndarray.js';

// FIXTURES //

import fact_n_upper from './fixtures/fact_n_upper.json' with { type: 'json' };
import fact_n_lower from './fixtures/fact_n_lower.json' with { type: 'json' };
import fact_e from './fixtures/fact_e.json' with { type: 'json' };
import fact_f from './fixtures/fact_f.json' with { type: 'json' };
import not_posdef from './fixtures/not_posdef.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import multi_rhs from './fixtures/multi_rhs.json' with { type: 'json' };
import fact_e_lower from './fixtures/fact_e_lower.json' with { type: 'json' };

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
* Helper to call dposvx with standard workspace allocation.
*/
function callDposvx( fact, uplo, N, nrhs, A, AF, equed, s, B, X, FERR, BERR ) {
	const IWORK = new Int32Array( Math.max( N, 1 ) );
	const WORK = new Float64Array( Math.max( 3 * N, 1 ) );
	const rcond = new Float64Array( 1 );
	return dposvx( fact, uplo, N, nrhs, A, 1, N, 0, AF, 1, N, 0, equed, s, 1, 0, B, 1, N, 0, X, 1, N, 0, rcond, FERR, 1, 0, BERR, 1, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
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

test( 'dposvx: fact_N_upper', function t() {

	const tc = fact_n_upper;
	const A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 3.0, 1.0, 0.5, 1.0, 2.0 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 5.5, 5.0, 3.5 ]);
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callDposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, tc.equed, 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( X ), tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'dposvx: fact_N_lower', function t() {

	const tc = fact_n_lower;
	const A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 3.0, 1.0, 0.5, 1.0, 2.0 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 5.5, 5.0, 3.5 ]);
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callDposvx( 'not-factored', 'lower', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, tc.equed, 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( X ), tc.x, 1e-10, 'x' );
});

test( 'dposvx: fact_E', function t() {

	const tc = fact_e;
	const A = new Float64Array([ 100.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.1, 0.05, 0.01 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 101.1, 1.05, 0.16 ]);
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callDposvx( 'equilibrate', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, tc.equed, 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( X ), tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( s ), tc.s, 1e-10, 's' );
});

test( 'dposvx: fact_F', function t() {
	let FERR, BERR, A, B, X;

	const tc = fact_f;
	A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 3.0, 1.0, 0.5, 1.0, 2.0 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	B = new Float64Array([ 5.5, 5.0, 3.5 ]);
	X = new Float64Array( 3 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	callDposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 3.0, 1.0, 0.5, 1.0, 2.0 ]);
	B = new Float64Array([ 1.0, 2.0, 3.0 ]);
	X = new Float64Array( 3 );
	FERR = new Float64Array( 1 );
	BERR = new Float64Array( 1 );
	const result = callDposvx( 'factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, tc.equed, 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( X ), tc.x, 1e-10, 'x' );
});

test( 'dposvx: not_posdef', function t() {

	const tc = not_posdef;
	const A = new Float64Array([ 1.0, 0.0, 0.0, 2.0, -1.0, 0.0, 3.0, 4.0, 5.0 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 1.0, 2.0, 3.0 ]);
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callDposvx( 'not-factored', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.rcond, tc.rcond, 'rcond' );
});

test( 'dposvx: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const AF = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const X = new Float64Array( 1 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callDposvx( 'not-factored', 'upper', 0, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
});

test( 'dposvx: multi_rhs', function t() {

	const tc = multi_rhs;
	const A = new Float64Array([ 4.0, 1.0, 0.5, 1.0, 3.0, 1.0, 0.5, 1.0, 2.0 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 5.5, 5.0, 3.5, 1.0, 2.0, 3.0 ]);
	const X = new Float64Array( 6 );
	const FERR = new Float64Array( 2 );
	const BERR = new Float64Array( 2 );
	const result = callDposvx( 'not-factored', 'upper', 3, 2, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( X ), tc.x, 1e-10, 'x' );
	assertArrayClose( toArray( FERR ), tc.ferr, 1e-2, 'ferr' );
	assertArrayClose( toArray( BERR ), tc.berr, 1e-2, 'berr' );
});

test( 'dposvx: fact_F_with_equed_Y', function t() {

	const A = new Float64Array([ 100.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.1, 0.05, 0.01 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 101.1, 1.05, 0.16 ]);
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const r1 = callDposvx( 'equilibrate', 'upper', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	const A2 = new Float64Array([ 100.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.1, 0.05, 0.01 ]);
	const B2 = new Float64Array([ 101.1, 1.05, 0.16 ]);
	const X2 = new Float64Array( 3 );
	const FERR2 = new Float64Array( 1 );
	const BERR2 = new Float64Array( 1 );
	const r2 = callDposvx( 'factored', 'upper', 3, 1, A2, AF, 'yes', s, B2, X2, FERR2, BERR2 ); // eslint-disable-line max-len
	assert.equal( r2.info, 0, 'info' );
	assert.equal( r2.equed, 'yes', 'equed' );
	assert.ok( r2.rcond > 0, 'rcond > 0' );
});

test( 'dposvx: fact_E_lower', function t() {

	const tc = fact_e_lower;
	const A = new Float64Array([ 100.0, 1.0, 0.1, 0.0, 1.0, 0.05, 0.0, 0.0, 0.01 ]);
	const AF = new Float64Array( 9 );
	const s = new Float64Array( 3 );
	const B = new Float64Array([ 101.1, 1.05, 0.16 ]);
	const X = new Float64Array( 3 );
	const FERR = new Float64Array( 1 );
	const BERR = new Float64Array( 1 );
	const result = callDposvx( 'equilibrate', 'lower', 3, 1, A, AF, 'none', s, B, X, FERR, BERR ); // eslint-disable-line max-len
	assert.equal( result.info, tc.info, 'info' );
	assert.equal( result.equed, tc.equed, 'equed' );
	assertClose( result.rcond, tc.rcond, 1e-10, 'rcond' );
	assertArrayClose( toArray( X ), tc.x, 1e-10, 'x' );
});
