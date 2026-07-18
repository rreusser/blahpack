/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrk from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dlarrk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( function find( t ) {
		return t.name === name;
	} );
}

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
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
		return;
	}
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}


// TESTS //

test( 'dlarrk: n0_quick (N=0 quick return)', function t() {

	const tc = findCase( 'n0_quick' );
	const d = new Float64Array( [ 0.0 ] );
	const e2 = new Float64Array( [ 0.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 0, 1, -1.0, 1.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-14, 'w' );
	assertClose( werr[ 0 ], tc.werr, 1e-14, 'werr' );
});

test( 'dlarrk: n1 (1x1 matrix)', function t() {

	const tc = findCase( 'n1' );
	const d = new Float64Array( [ 2.0 ] );
	const e2 = new Float64Array( [ 0.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 1, 1, 0.0, 4.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n2_iw1 (2x2 first eigenvalue)', function t() {

	const tc = findCase( 'n2_iw1' );
	const d = new Float64Array( [ 1.0, 4.0 ] );
	const e2 = new Float64Array( [ 1.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 2, 1, 0.0, 5.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n2_iw2 (2x2 second eigenvalue)', function t() {

	const tc = findCase( 'n2_iw2' );
	const d = new Float64Array( [ 1.0, 4.0 ] );
	const e2 = new Float64Array( [ 1.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 2, 2, 0.0, 5.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n5_iw1 (5x5 first eigenvalue)', function t() {

	const tc = findCase( 'n5_iw1' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e2 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 5, 1, -10.0, 10.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n5_iw3 (5x5 middle eigenvalue)', function t() {

	const tc = findCase( 'n5_iw3' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e2 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 5, 3, -10.0, 10.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n5_iw5 (5x5 largest eigenvalue)', function t() {

	const tc = findCase( 'n5_iw5' );
	const d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	const e2 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 5, 5, -10.0, 10.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n4_neg_iw2 (negative eigenvalues)', function t() {

	const tc = findCase( 'n4_neg_iw2' );
	const d = new Float64Array( [ -5.0, -3.0, -7.0, -1.0 ] );
	const e2 = new Float64Array( [ 0.25, 0.25, 0.25 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 4, 2, -10.0, 0.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n3_diag_iw2 (diagonal matrix)', function t() {

	const tc = findCase( 'n3_diag_iw2' );
	const d = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	const e2 = new Float64Array( [ 0.0, 0.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 3, 2, 0.0, 4.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk: n1_loose (loose tolerance)', function t() {

	const tc = findCase( 'n1_loose' );
	const d = new Float64Array( [ 1.0 ] );
	const e2 = new Float64Array( [ 0.0 ] );
	const w = new Float64Array( 1 );
	const werr = new Float64Array( 1 );
	const info = dlarrk( 1, 1, -1.0, 3.0, d, 1, 0, e2, 1, 0, 1.0e-16, 1.0e-2, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-6, 'w' );
	assertClose( werr[ 0 ], tc.werr, 1e-6, 'werr' );
});
