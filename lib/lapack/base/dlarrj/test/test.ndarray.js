/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrj from './../lib/ndarray.js';

// FIXTURES //

import diagonal_4x4 from './fixtures/diagonal_4x4.json' with { type: 'json' };
import tridiag_3x3 from './fixtures/tridiag_3x3.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import subset_refinement from './fixtures/subset_refinement.json' with { type: 'json' };
import with_offset from './fixtures/with_offset.json' with { type: 'json' };
import already_converged from './fixtures/already_converged.json' with { type: 'json' };
import tridiag_5x5 from './fixtures/tridiag_5x5.json' with { type: 'json' };
import coarse_rtol from './fixtures/coarse_rtol.json' with { type: 'json' };
// CONSTANTS //

const PIVMIN = 2.2250738585072014e-308; // Number.MIN_VALUE (DLAMCH('S'))

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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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

test( 'dlarrj is a function', function t() {
	assert.equal( typeof dlarrj, 'function' );
});

test( 'dlarrj: diagonal_4x4', function t() {

	const tc = diagonal_4x4;
	const w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const WORK = new Float64Array( 16 );
	const IWORK = new Int32Array( 16 );
	const info = dlarrj(4, new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0, 0.0 ] ), 1, 0, 1, 4, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 6.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: tridiag_3x3', function t() {

	const tc = tridiag_3x3;
	const w = new Float64Array( [ 1.1, 2.1, 3.9 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const WORK = new Float64Array( 12 );
	const IWORK = new Int32Array( 12 );
	const info = dlarrj(3, new Float64Array( [ 2.0, 3.0, 2.0 ] ), 1, 0, new Float64Array( [ 1.0, 1.0 ] ), 1, 0, 1, 3, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 3.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: n_zero', function t() {

	const w = new Float64Array( 1 );
	const WERR = new Float64Array( 1 );
	const WORK = new Float64Array( 4 );
	const IWORK = new Int32Array( 4 );
	const info = dlarrj(0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 0, 1, 0, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 1.0);
	assert.equal( info, 0 );
});

test( 'dlarrj: n_one', function t() {

	const tc = n_one;
	const w = new Float64Array( [ 5.1 ] );
	const WERR = new Float64Array( [ 0.5 ] );
	const WORK = new Float64Array( 4 );
	const IWORK = new Int32Array( 4 );
	const info = dlarrj(1, new Float64Array( [ 5.0 ] ), 1, 0, new Float64Array( 1 ), 1, 0, 1, 1, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 1.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: subset_refinement', function t() {

	const tc = subset_refinement;
	const w = new Float64Array( [ 0.0, 3.1, 4.9, 0.0 ] );
	const WERR = new Float64Array( [ 0.0, 0.5, 0.5, 0.0 ] );
	const WORK = new Float64Array( 16 );
	const IWORK = new Int32Array( 16 );
	const info = dlarrj(4, new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0, 0.0 ] ), 1, 0, 2, 3, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 6.0);
	assert.equal( info, tc.info );
	assertArrayClose( [ w[ 1 ], w[ 2 ] ], tc.w, 1e-12, 'w' );
	assertArrayClose( [ WERR[ 1 ], WERR[ 2 ] ], tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: with_offset', function t() {

	const tc = with_offset;
	const w = new Float64Array( [ 5.1, 6.9 ] );
	const WERR = new Float64Array( [ 0.5, 0.5 ] );
	const WORK = new Float64Array( 16 );
	const IWORK = new Int32Array( 16 );
	const info = dlarrj(4, new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0, 0.0 ] ), 1, 0, 3, 4, 1e-14, 2, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 6.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: already_converged', function t() {

	const tc = already_converged;
	const w = new Float64Array( [ 1.0, 2.0, 4.0 ] );
	const WERR = new Float64Array( [ 1e-16, 1e-16, 1e-16 ] );
	const WORK = new Float64Array( 12 );
	const IWORK = new Int32Array( 12 );
	const info = dlarrj(3, new Float64Array( [ 2.0, 3.0, 2.0 ] ), 1, 0, new Float64Array( [ 1.0, 1.0 ] ), 1, 0, 1, 3, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 3.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: tridiag_5x5', function t() {

	const tc = tridiag_5x5;
	const w = new Float64Array( [ 1.0, 2.5, 4.0, 5.5, 7.0 ] );
	const WERR = new Float64Array( [ 1.0, 1.0, 1.0, 1.0, 1.0 ] );
	const WORK = new Float64Array( 20 );
	const IWORK = new Int32Array( 20 );
	const info = dlarrj(5, new Float64Array( [ 4.0, 3.0, 2.0, 5.0, 6.0 ] ), 1, 0, new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] ), 1, 0, 1, 5, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 6.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrj: left boundary expansion needed', function t() {

	const w = new Float64Array( [ 1.5, 3.0, 5.0 ] );
	const WERR = new Float64Array( [ 0.1, 0.5, 0.5 ] );
	const WORK = new Float64Array( 12 );
	const IWORK = new Int32Array( 12 );
	const info = dlarrj(3, new Float64Array( [ 1.0, 3.0, 5.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0 ] ), 1, 0, 1, 3, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 4.0);
	assert.equal( info, 0 );
	assertClose( w[ 0 ], 1.0, 1e-10, 'w[0]' );
	assertClose( w[ 1 ], 3.0, 1e-10, 'w[1]' );
	assertClose( w[ 2 ], 5.0, 1e-10, 'w[2]' );
});

test( 'dlarrj: right boundary expansion needed', function t() {

	const w = new Float64Array( [ 1.0, 3.0, 4.5 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.1 ] );
	const WORK = new Float64Array( 12 );
	const IWORK = new Int32Array( 12 );
	const info = dlarrj(3, new Float64Array( [ 1.0, 3.0, 5.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0 ] ), 1, 0, 1, 3, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 4.0);
	assert.equal( info, 0 );
	assertClose( w[ 0 ], 1.0, 1e-10, 'w[0]' );
	assertClose( w[ 1 ], 3.0, 1e-10, 'w[1]' );
	assertClose( w[ 2 ], 5.0, 1e-10, 'w[2]' );
});

test( 'dlarrj: mixed converged and unconverged', function t() {

	const w = new Float64Array( [ 1.0, 3.1, 5.0, 6.8 ] );
	const WERR = new Float64Array( [ 1e-16, 0.5, 1e-16, 0.5 ] );
	const WORK = new Float64Array( 16 );
	const IWORK = new Int32Array( 16 );
	const info = dlarrj(4, new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] ), 1, 0, new Float64Array( [ 0.0, 0.0, 0.0 ] ), 1, 0, 1, 4, 1e-14, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 6.0);
	assert.equal( info, 0 );
	assertClose( w[ 0 ], 1.0, 1e-12, 'w[0] (already converged)' );
	assertClose( w[ 1 ], 3.0, 1e-10, 'w[1] (refined)' );
	assertClose( w[ 2 ], 5.0, 1e-12, 'w[2] (already converged)' );
	assertClose( w[ 3 ], 7.0, 1e-10, 'w[3] (refined)' );
});

test( 'dlarrj: coarse_rtol', function t() {

	const tc = coarse_rtol;
	const w = new Float64Array( [ 1.1, 2.1, 3.9 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const WORK = new Float64Array( 12 );
	const IWORK = new Int32Array( 12 );
	const info = dlarrj(3, new Float64Array( [ 2.0, 3.0, 2.0 ] ), 1, 0, new Float64Array( [ 1.0, 1.0 ] ), 1, 0, 1, 3, 1e-4, 0, w, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, PIVMIN, 3.0);
	assert.equal( info, tc.info );
	assertArrayClose( toArray( w ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR ), tc.werr, 1e-6, 'werr' );
});
