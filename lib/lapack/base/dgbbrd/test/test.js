/* eslint-disable max-len, max-params, no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbbrd from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dgbbrd.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgbbrd, 'function', 'main export is a function' );
});

test( 'dgbbrd: tri_5x5_N', function t() {
	var ldab;
	var info;
	var tc;
	var AB;
	var PT;
	var m;
	var n;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'tri_5x5_N' );
	ldab = 3;
	m = 5;
	n = 5;
	AB = new Float64Array([
		0.0,
		4.0,
		-1.0,
		-1.0,
		4.0,
		-1.0,
		-1.0,
		4.0,
		-1.0,
		-1.0,
		4.0,
		-1.0,
		-1.0,
		4.0,
		0.0
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Float64Array( 1 );
	PT = new Float64Array( 1 );
	C = new Float64Array( 1 );
	W = new Float64Array( 2 * n );
	info = dgbbrd( 'no-vectors', m, n, 0, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( AB, tc.AB, 1e-13, 'AB' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: penta_5x5_B', function t() {
	var ldab;
	var info;
	var tc;
	var AB;
	var PT;
	var m;
	var n;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'penta_5x5_B' );
	ldab = 5;
	m = 5;
	n = 5;
	AB = new Float64Array([
		0.0,
		0.0,
		6.0,
		-2.0,
		1.0,
		0.0,
		-2.0,
		6.0,
		-2.0,
		1.0,
		1.0,
		-2.0,
		6.0,
		-2.0,
		1.0,
		1.0,
		-2.0,
		6.0,
		-2.0,
		0.0,
		1.0,
		-2.0,
		6.0,
		0.0,
		0.0
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Float64Array( m * m );
	PT = new Float64Array( n * n );
	C = new Float64Array( 1 );
	W = new Float64Array( 2 * Math.max( m, n ) );
	info = dgbbrd( 'both', m, n, 0, 2, 2, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( Q, tc.Q, 1e-13, 'Q' );
	assertArrayClose( PT, tc.PT, 1e-13, 'PT' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: tall_6x4_Q', function t() {
	var ldab;
	var info;
	var ncc;
	var tc;
	var AB;
	var PT;
	var m;
	var n;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'tall_6x4_Q' );
	ldab = 3;
	m = 6;
	n = 4;
	ncc = 2;
	AB = new Float64Array([
		0.0,
		3.0,
		-1.0,
		-1.0,
		3.0,
		-1.0,
		-1.0,
		3.0,
		-1.0,
		-1.0,
		3.0,
		-1.0
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Float64Array( m * m );
	PT = new Float64Array( 1 );
	C = new Float64Array([
		1.0,
		3.0,
		5.0,
		7.0,
		9.0,
		11.0,
		2.0,
		4.0,
		6.0,
		8.0,
		10.0,
		12.0
	]);
	W = new Float64Array( 2 * Math.max( m, n ) );
	info = dgbbrd( 'q-only', m, n, ncc, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, 1, 0, C, 1, m, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( Q, tc.Q, 1e-13, 'Q' );
	assertArrayClose( C, tc.C, 1e-13, 'C' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: wide_4x6_P', function t() {
	var ldab;
	var info;
	var tc;
	var AB;
	var PT;
	var m;
	var n;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'wide_4x6_P' );
	ldab = 2;
	m = 4;
	n = 6;
	AB = new Float64Array([
		0.0,
		2.0,
		1.0,
		3.0,
		1.0,
		4.0,
		1.0,
		5.0,
		1.0,
		0.0,
		1.0,
		0.0
	]);
	D = new Float64Array( m );
	E = new Float64Array( Math.max( 1, m - 1 ) );
	Q = new Float64Array( 1 );
	PT = new Float64Array( n * n );
	C = new Float64Array( 1 );
	W = new Float64Array( 2 * Math.max( m, n ) );
	info = dgbbrd( 'p-only', m, n, 0, 0, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( PT, tc.PT, 1e-13, 'PT' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: lower_4x4_B', function t() {
	var ldab;
	var info;
	var tc;
	var AB;
	var PT;
	var m;
	var n;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'lower_4x4_B' );
	ldab = 2;
	m = 4;
	n = 4;
	AB = new Float64Array([
		2.0,
		-1.0,
		3.0,
		-1.0,
		4.0,
		-1.0,
		5.0,
		0.0
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Float64Array( m * m );
	PT = new Float64Array( n * n );
	C = new Float64Array( 1 );
	W = new Float64Array( 2 * Math.max( m, n ) );
	info = dgbbrd( 'both', m, n, 0, 1, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( Q, tc.Q, 1e-13, 'Q' );
	assertArrayClose( PT, tc.PT, 1e-13, 'PT' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: diag_4x4_N', function t() {
	var ldab;
	var info;
	var tc;
	var AB;
	var PT;
	var m;
	var n;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'diag_4x4_N' );
	ldab = 1;
	m = 4;
	n = 4;
	AB = new Float64Array( [ 2.5, -1.5, 3.5, 4.5 ] );
	D = new Float64Array( n );
	E = new Float64Array( Math.max( 1, n - 1 ) );
	Q = new Float64Array( 1 );
	PT = new Float64Array( 1 );
	C = new Float64Array( 1 );
	W = new Float64Array( 2 * Math.max( m, n ) );
	info = dgbbrd( 'no-vectors', m, n, 0, 0, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E.slice( 0, n - 1 ), tc.E.slice( 0, n - 1 ), 1e-13, 'E' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: m_zero', function t() {
	var info;
	var tc;
	var AB;
	var PT;
	var D;
	var E;
	var Q;
	var C;
	var W;

	tc = findCase( 'm_zero' );
	AB = new Float64Array( 12 );
	D = new Float64Array( 1 );
	E = new Float64Array( 1 );
	Q = new Float64Array( 1 );
	PT = new Float64Array( 1 );
	C = new Float64Array( 1 );
	W = new Float64Array( 8 );
	info = dgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});
