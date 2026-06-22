/* eslint-disable max-len, max-params, no-restricted-syntax, stdlib/first-unit-test, max-lines, max-statements */

// MODULES //

import test from 'node:test';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbbrd from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zgbbrd.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );


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
	} );
}

/**
* Asserts two scalars are within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

/**
* Asserts two arrays are element-wise close.
*
* @private
* @param {*} actual - actual array
* @param {*} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a column-major Complex128Array from per-column real-pair lists.
*
* @private
* @param {integer} ldab - leading dimension
* @param {Array} cols - per-column data
* @returns {Complex128Array} array
*/
function buildAB( ldab, cols ) {
	var view;
	var arr;
	var n;
	var i;
	var j;
	n = cols.length;
	arr = new Complex128Array( ldab * n );
	view = reinterpret( arr, 0 );
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < ( 2 * ldab ); i++ ) {
			view[ ( j * ldab * 2 ) + i ] = cols[ j ][ i ] || 0;
		}
	}
	return arr;
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zgbbrd, 'function', 'main export is a function' );
});

test( 'zgbbrd: tri_5x5_N', function t() {
	var info;
	var ldab;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;
	var m;
	var n;

	tc = findCase( 'tri_5x5_N' );
	m = 5;
	n = 5;
	ldab = 3;
	AB = buildAB( ldab, [
		[ 0, 0, 4.0, 0.5, -1.0, 0.2 ],
		[ -1.0, -0.2, 4.0, -0.3, -1.0, 0.1 ],
		[ -1.0, 0.4, 4.0, 0.0, -1.0, -0.5 ],
		[ -1.0, -0.1, 4.0, 0.6, -1.0, 0.3 ],
		[ -1.0, 0.2, 4.0, -0.4, 0, 0 ]
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Complex128Array( 1 );
	PT = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	W = new Complex128Array( Math.max( m, n ) );
	R = new Float64Array( Math.max( m, n ) );
	info = zgbbrd( 'no-vectors', m, n, 0, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( AB, 0 ), tc.AB, 1e-12, 'AB' );
});

test( 'zgbbrd: penta_5x5_B', function t() {
	var info;
	var ldab;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;
	var m;
	var n;

	tc = findCase( 'penta_5x5_B' );
	m = 5;
	n = 5;
	ldab = 5;
	AB = buildAB( ldab, [
		[ 0, 0, 0, 0, 6.0, 0.0, -2.0, 0.5, 1.0, 0.1 ],
		[ 0, 0, -2.0, -0.5, 6.0, 0.2, -2.0, -0.3, 1.0, 0.4 ],
		[ 1.0, -0.1, -2.0, 0.3, 6.0, -0.2, -2.0, 0.1, 1.0, -0.5 ],
		[ 1.0, -0.4, -2.0, -0.1, 6.0, 0.3, -2.0, 0.2, 0, 0 ],
		[ 1.0, 0.5, -2.0, -0.2, 6.0, 0.6, 0, 0, 0, 0 ]
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Complex128Array( m * m );
	PT = new Complex128Array( n * n );
	C = new Complex128Array( 1 );
	W = new Complex128Array( Math.max( m, n ) );
	R = new Float64Array( Math.max( m, n ) );
	info = zgbbrd( 'both', m, n, 0, 2, 2, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( Q, 0 ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( reinterpret( PT, 0 ), tc.PT, 1e-12, 'PT' );
});

test( 'zgbbrd: tall_6x4_Q', function t() {
	var info;
	var ldab;
	var ncc;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;
	var m;
	var n;

	tc = findCase( 'tall_6x4_Q' );
	m = 6;
	n = 4;
	ncc = 2;
	ldab = 3;
	AB = buildAB( ldab, [
		[ 0, 0, 3.0, 0.1, -1.0, 0.2 ],
		[ -1.0, -0.2, 3.0, -0.3, -1.0, 0.4 ],
		[ -1.0, -0.4, 3.0, 0.5, -1.0, -0.1 ],
		[ -1.0, 0.1, 3.0, 0.0, -1.0, 0.3 ]
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Complex128Array( m * m );
	PT = new Complex128Array( 1 );
	C = new Complex128Array([
		1.0,
		0.1,
		3.0,
		-0.2,
		5.0,
		0.3,
		7.0,
		-0.4,
		9.0,
		0.5,
		11.0,
		-0.6,
		2.0,
		-0.1,
		4.0,
		0.2,
		6.0,
		-0.3,
		8.0,
		0.4,
		10.0,
		-0.5,
		12.0,
		0.6
	]);
	W = new Complex128Array( Math.max( m, n ) );
	R = new Float64Array( Math.max( m, n ) );
	info = zgbbrd( 'q-only', m, n, ncc, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, 1, 0, C, 1, m, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( Q, 0 ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zgbbrd: wide_4x6_P', function t() {
	var info;
	var ldab;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;
	var m;
	var n;

	tc = findCase( 'wide_4x6_P' );
	m = 4;
	n = 6;
	ldab = 2;
	AB = buildAB( ldab, [
		[ 0, 0, 2.0, 0.1 ],
		[ 1.0, -0.2, 3.0, 0.3 ],
		[ 1.0, 0.4, 4.0, -0.5 ],
		[ 1.0, -0.1, 5.0, 0.2 ],
		[ 1.0, 0.6, 0, 0 ],
		[ 1.0, -0.3, 0, 0 ]
	]);
	D = new Float64Array( m );
	E = new Float64Array( Math.max( 1, m - 1 ) );
	Q = new Complex128Array( 1 );
	PT = new Complex128Array( n * n );
	C = new Complex128Array( 1 );
	W = new Complex128Array( Math.max( m, n ) );
	R = new Float64Array( Math.max( m, n ) );
	info = zgbbrd( 'p-only', m, n, 0, 0, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( PT, 0 ), tc.PT, 1e-12, 'PT' );
});

test( 'zgbbrd: lower_4x4_B', function t() {
	var info;
	var ldab;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;
	var m;
	var n;

	tc = findCase( 'lower_4x4_B' );
	m = 4;
	n = 4;
	ldab = 2;
	AB = buildAB( ldab, [
		[ 2.0, 0.1, -1.0, 0.2 ],
		[ 3.0, -0.2, -1.0, 0.3 ],
		[ 4.0, 0.4, -1.0, -0.4 ],
		[ 5.0, -0.1, 0, 0 ]
	]);
	D = new Float64Array( n );
	E = new Float64Array( n - 1 );
	Q = new Complex128Array( m * m );
	PT = new Complex128Array( n * n );
	C = new Complex128Array( 1 );
	W = new Complex128Array( Math.max( m, n ) );
	R = new Float64Array( Math.max( m, n ) );
	info = zgbbrd( 'both', m, n, 0, 1, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( Q, 0 ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( reinterpret( PT, 0 ), tc.PT, 1e-12, 'PT' );
});

test( 'zgbbrd: diag_4x4_N', function t() {
	var info;
	var ldab;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;
	var m;
	var n;

	tc = findCase( 'diag_4x4_N' );
	m = 4;
	n = 4;
	ldab = 1;
	AB = new Complex128Array([
		2.5,
		0.5,
		-1.5,
		-0.3,
		3.5,
		0.2,
		4.5,
		-0.6
	]);
	D = new Float64Array( n );
	E = new Float64Array( Math.max( 1, n - 1 ) );
	Q = new Complex128Array( 1 );
	PT = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	W = new Complex128Array( Math.max( m, n ) );
	R = new Float64Array( Math.max( m, n ) );
	info = zgbbrd( 'no-vectors', m, n, 0, 0, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
});

test( 'zgbbrd: m_zero', function t() {
	var info;
	var tc;
	var AB;
	var PT;
	var Q;
	var C;
	var D;
	var E;
	var W;
	var R;

	tc = findCase( 'm_zero' );
	AB = new Complex128Array( 12 );
	D = new Float64Array( 1 );
	E = new Float64Array( 1 );
	Q = new Complex128Array( 1 );
	PT = new Complex128Array( 1 );
	C = new Complex128Array( 1 );
	W = new Complex128Array( 8 );
	R = new Float64Array( 8 );
	info = zgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});
