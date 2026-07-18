/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarrb from './../lib/ndarray.js';


// VARIABLES //

const SAFMIN = 2.2250738585072014e-308;
const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dlarrb.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts that `actual` is close to `expected` within `tol`.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
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
* Slices a typed array into a plain array of length `n`.
*
* @private
* @param {Float64Array} arr - input array
* @param {NonNegativeInteger} n - length
* @returns {Array} copy
*/
function toArray( arr, n ) {
	const out = [];
	let i;
	for ( i = 0; i < n; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'dlarrb: diagonal_4x4', function t() {

	const tc = findCase( 'diagonal_4x4' );
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	const LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const w = new Float64Array( [ 1.1, 2.9, 5.2, 6.8 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5 ] );
	const WGAP = new Float64Array( [ 1.5, 1.5, 1.5, 0.0 ] );
	const WORK = new Float64Array( 8 );
	const IWORK = new Int32Array( 8 );

	const info = dlarrb( 4, d, 1, 0, LLD, 1, 0, 1, 4, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 6.0, -1 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( w, 4 ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR, 4 ), tc.werr, 1e-6, 'werr' );
	assertArrayClose( toArray( WGAP, 3 ), tc.wgap, 1e-6, 'wgap' );
});

test( 'dlarrb: tridiag_3x3', function t() {

	const tc = findCase( 'tridiag_3x3' );
	const d = new Float64Array( [ 2.0, 2.5, 1.6 ] );
	const LLD = new Float64Array( [ 0.5, 0.4, 0.0 ] );
	const w = new Float64Array( [ 1.1, 2.1, 3.9 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const WGAP = new Float64Array( [ 0.8, 1.5, 0.0 ] );
	const WORK = new Float64Array( 6 );
	const IWORK = new Int32Array( 6 );

	const info = dlarrb( 3, d, 1, 0, LLD, 1, 0, 1, 3, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 3.0, -1 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( w, 3 ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR, 3 ), tc.werr, 1e-6, 'werr' );
	assertArrayClose( toArray( WGAP, 2 ), tc.wgap, 1e-6, 'wgap' );
});

test( 'dlarrb: n_one', function t() {

	const tc = findCase( 'n_one' );
	const d = new Float64Array( [ 5.0 ] );
	const LLD = new Float64Array( [ 0.0 ] );
	const w = new Float64Array( [ 5.1 ] );
	const WERR = new Float64Array( [ 0.5 ] );
	const WGAP = new Float64Array( [ 0.0 ] );
	const WORK = new Float64Array( 2 );
	const IWORK = new Int32Array( 2 );

	const info = dlarrb( 1, d, 1, 0, LLD, 1, 0, 1, 1, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 1.0, -1 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( w, 1 ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR, 1 ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrb: n_zero', function t() {

	const tc = findCase( 'n_zero' );
	const d = new Float64Array( 1 );
	const LLD = new Float64Array( 1 );
	const w = new Float64Array( 1 );
	const WERR = new Float64Array( 1 );
	const WGAP = new Float64Array( 1 );
	const WORK = new Float64Array( 2 );
	const IWORK = new Int32Array( 2 );

	const info = dlarrb( 0, d, 1, 0, LLD, 1, 0, 1, 0, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 1.0, -1 );
	assert.equal( info, tc.info, 'info' );
});

test( 'dlarrb: subset', function t() {

	const tc = findCase( 'subset' );
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	const LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const w = new Float64Array( [ 0.0, 3.1, 4.9, 0.0 ] );
	const WERR = new Float64Array( [ 0.0, 0.5, 0.5, 0.0 ] );
	const WGAP = new Float64Array( [ 0.0, 1.5, 1.5, 0.0 ] );
	const WORK = new Float64Array( 8 );
	const IWORK = new Int32Array( 8 );

	const info = dlarrb( 4, d, 1, 0, LLD, 1, 0, 2, 3, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 6.0, -1 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( [ w[ 1 ], w[ 2 ] ], tc.w, 1e-12, 'w' );
	assertArrayClose( [ WERR[ 1 ], WERR[ 2 ] ], tc.werr, 1e-6, 'werr' );
});

test( 'dlarrb: with_offset', function t() {

	// OFFSET=2, IFIRST=3, ILAST=4 — W(I-OFFSET) maps to slots 0 and 1.
	const tc = findCase( 'with_offset' );
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	const LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const w = new Float64Array( [ 5.1, 6.9 ] );
	const WERR = new Float64Array( [ 0.5, 0.5 ] );
	const WGAP = new Float64Array( [ 1.5, 0.0 ] );
	const WORK = new Float64Array( 8 );
	const IWORK = new Int32Array( 8 );

	const info = dlarrb( 4, d, 1, 0, LLD, 1, 0, 3, 4, 1e-8, 1e-14, 2, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 6.0, -1 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( w, 2 ), tc.w, 1e-12, 'w' );
	assertArrayClose( toArray( WERR, 2 ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrb: twist_set', function t() {

	const tc = findCase( 'twist_set' );
	const d = new Float64Array( [ 2.0, 2.5, 1.6 ] );
	const LLD = new Float64Array( [ 0.5, 0.4, 0.0 ] );
	const w = new Float64Array( [ 1.1, 2.1, 3.9 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5 ] );
	const WGAP = new Float64Array( [ 0.8, 1.5, 0.0 ] );
	const WORK = new Float64Array( 6 );
	const IWORK = new Int32Array( 6 );

	const info = dlarrb( 3, d, 1, 0, LLD, 1, 0, 1, 3, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 3.0, 2 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( w, 3 ), tc.w, 1e-8, 'w' );
	assertArrayClose( toArray( WERR, 3 ), tc.werr, 1e-6, 'werr' );
});

test( 'dlarrb: already-converged intervals on entry', function t() {

	// Extremely tight WERR so the entry width <= CVRGD branch fires.
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	const LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const w = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	const WERR = new Float64Array( [ 1e-16, 1e-16, 1e-16, 1e-16 ] );
	const WGAP = new Float64Array( [ 2.0, 2.0, 2.0, 0.0 ] );
	const WORK = new Float64Array( 8 );
	const IWORK = new Int32Array( 8 );

	const info = dlarrb( 4, d, 1, 0, LLD, 1, 0, 1, 4, 1e-8, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 6.0, -1 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( toArray( w, 4 ), [ 1.0, 3.0, 5.0, 7.0 ], 1e-12, 'w' );
});

test( 'dlarrb: left/right expansion via DLANEG re-bracketing', function t() {

	// Initial `w ± WERR` brackets miss the true eigenvalues so DLANEG-driven expansion loops must run.
	const d = new Float64Array( [ 1.0, 3.0, 5.0, 7.0 ] );
	const LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] );
	const w = new Float64Array( [ 1.9, 2.2, 5.5, 6.3 ] );
	const WERR = new Float64Array( [ 0.01, 0.01, 0.01, 0.01 ] );
	const WGAP = new Float64Array( [ 0.3, 3.3, 0.7, 0.0 ] );
	const WORK = new Float64Array( 8 );
	const IWORK = new Int32Array( 8 );

	const info = dlarrb( 4, d, 1, 0, LLD, 1, 0, 1, 4, 1e-10, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 6.0, -1 );
	assert.strictEqual( info, 0, 'info' );
	assertArrayClose( toArray( w, 4 ), [ 1.0, 3.0, 5.0, 7.0 ], 1e-8, 'w' );
});

test( 'dlarrb: tridiag_5x5_coarse', function t() {

	const tc = findCase( 'tridiag_5x5_coarse' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 5.0, 6.0 ] );
	const LLD = new Float64Array( [ 0.0, 0.0, 0.0, 0.0, 0.0 ] );
	const w = new Float64Array( [ 1.8, 3.2, 4.1, 4.9, 6.2 ] );
	const WERR = new Float64Array( [ 0.5, 0.5, 0.5, 0.5, 0.5 ] );
	const WGAP = new Float64Array( [ 0.8, 0.8, 0.8, 0.8, 0.0 ] );
	const WORK = new Float64Array( 10 );
	const IWORK = new Int32Array( 10 );

	const info = dlarrb( 5, d, 1, 0, LLD, 1, 0, 1, 5, 1e-4, 1e-14, 0, w, 1, 0, WGAP, 1, 0, WERR, 1, 0, WORK, 1, 0, IWORK, 1, 0, SAFMIN, 4.0, -1 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( w, 5 ), tc.w, 1e-3, 'w' );
	assertArrayClose( toArray( WERR, 5 ), tc.werr, 1e-3, 'werr' );
	assertArrayClose( toArray( WGAP, 4 ), tc.wgap, 1e-3, 'wgap' );
});
