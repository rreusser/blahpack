/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarrk from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dlarrk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
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
	var relErr;
	if ( expected === 0.0 ) {
		assert.ok( Math.abs( actual ) <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
		return;
	}
	relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}


// TESTS //

test( 'dlarrk ndarray: n0_quick (N=0 quick return)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n0_quick' );
	d = new Float64Array( [ 0.0 ] );
	e2 = new Float64Array( [ 0.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 0, 1, -1.0, 1.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-14, 'w' );
	assertClose( werr[ 0 ], tc.werr, 1e-14, 'werr' );
});

test( 'dlarrk ndarray: n1 (1x1 matrix)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n1' );
	d = new Float64Array( [ 2.0 ] );
	e2 = new Float64Array( [ 0.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 1, 1, 0.0, 4.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n2_iw1 (2x2 first eigenvalue)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n2_iw1' );
	d = new Float64Array( [ 1.0, 4.0 ] );
	e2 = new Float64Array( [ 1.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 2, 1, 0.0, 5.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n2_iw2 (2x2 second eigenvalue)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n2_iw2' );
	d = new Float64Array( [ 1.0, 4.0 ] );
	e2 = new Float64Array( [ 1.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 2, 2, 0.0, 5.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n5_iw1 (5x5 first eigenvalue)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n5_iw1' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	e2 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 5, 1, -10.0, 10.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n5_iw3 (5x5 middle eigenvalue)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n5_iw3' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	e2 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 5, 3, -10.0, 10.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n5_iw5 (5x5 largest eigenvalue)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n5_iw5' );
	d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0, 5.0 ] );
	e2 = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 5, 5, -10.0, 10.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n4_neg_iw2 (negative eigenvalues)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n4_neg_iw2' );
	d = new Float64Array( [ -5.0, -3.0, -7.0, -1.0 ] );
	e2 = new Float64Array( [ 0.25, 0.25, 0.25 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 4, 2, -10.0, 0.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n3_diag_iw2 (diagonal matrix)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n3_diag_iw2' );
	d = new Float64Array( [ 1.0, 2.0, 3.0 ] );
	e2 = new Float64Array( [ 0.0, 0.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 3, 2, 0.0, 4.0, d, 1, 0, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-10, 'w' );
});

test( 'dlarrk ndarray: n1_loose (loose tolerance)', function t() {
	var werr;
	var info;
	var tc;
	var e2;
	var d;
	var w;

	tc = findCase( 'n1_loose' );
	d = new Float64Array( [ 1.0 ] );
	e2 = new Float64Array( [ 0.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 1, 1, -1.0, 3.0, d, 1, 0, e2, 1, 0, 1.0e-16, 1.0e-2, w, werr );
	assert.equal( info, tc.info, 'info' );
	assertClose( w[ 0 ], tc.w, 1e-6, 'w' );
	assertClose( werr[ 0 ], tc.werr, 1e-6, 'werr' );
});

test( 'dlarrk ndarray: stride support', function t() {
	var werr;
	var info;
	var e2;
	var d;
	var w;

	d = new Float64Array( [ 2.0, 999.0, 2.0, 999.0, 2.0 ] );
	e2 = new Float64Array( [ 1.0, 999.0, 1.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 3, 2, 0.0, 4.0, d, 2, 0, e2, 2, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertClose( w[ 0 ], 2.0, 1e-10, 'w' );
});

test( 'dlarrk ndarray: offset support', function t() {
	var werr;
	var info;
	var e2;
	var d;
	var w;

	d = new Float64Array( [ 999.0, 2.0 ] );
	e2 = new Float64Array( [ 999.0 ] );
	w = new Float64Array( 1 );
	werr = new Float64Array( 1 );
	info = dlarrk( 1, 1, 0.0, 4.0, d, 1, 1, e2, 1, 0, 1.0e-300, 1.0e-12, w, werr ); // eslint-disable-line max-len
	assert.equal( info, 0, 'info' );
	assertClose( w[ 0 ], 2.0, 1e-10, 'w' );
});
