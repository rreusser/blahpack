/* eslint-disable max-len, max-params, no-restricted-syntax, stdlib/first-unit-test, max-lines, max-statements */


// MODULES //

import test from 'node:test';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js'; // eslint-disable-line max-len
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbbrd from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'zgbbrd.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( function parse( line ) {
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
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
	let i;
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
	let i, j;
	const n = cols.length;
	const arr = new Complex128Array( ldab * n );
	const view = reinterpret( arr, 0 );
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

	const tc = findCase( 'tri_5x5_N' );
	const m = 5;
	const n = 5;
	const ldab = 3;
	const AB = buildAB( ldab, [
		[ 0, 0, 4.0, 0.5, -1.0, 0.2 ],
		[ -1.0, -0.2, 4.0, -0.3, -1.0, 0.1 ],
		[ -1.0, 0.4, 4.0, 0.0, -1.0, -0.5 ],
		[ -1.0, -0.1, 4.0, 0.6, -1.0, 0.3 ],
		[ -1.0, 0.2, 4.0, -0.4, 0, 0 ]
	]);
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const W = new Complex128Array( Math.max( m, n ) );
	const R = new Float64Array( Math.max( m, n ) );
	const info = zgbbrd( 'no-vectors', m, n, 0, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( AB, 0 ), tc.AB, 1e-12, 'AB' );
});

test( 'zgbbrd: penta_5x5_B', function t() {

	const tc = findCase( 'penta_5x5_B' );
	const m = 5;
	const n = 5;
	const ldab = 5;
	const AB = buildAB( ldab, [
		[ 0, 0, 0, 0, 6.0, 0.0, -2.0, 0.5, 1.0, 0.1 ],
		[ 0, 0, -2.0, -0.5, 6.0, 0.2, -2.0, -0.3, 1.0, 0.4 ],
		[ 1.0, -0.1, -2.0, 0.3, 6.0, -0.2, -2.0, 0.1, 1.0, -0.5 ],
		[ 1.0, -0.4, -2.0, -0.1, 6.0, 0.3, -2.0, 0.2, 0, 0 ],
		[ 1.0, 0.5, -2.0, -0.2, 6.0, 0.6, 0, 0, 0, 0 ]
	]);
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Complex128Array( m * m );
	const PT = new Complex128Array( n * n );
	const C = new Complex128Array( 1 );
	const W = new Complex128Array( Math.max( m, n ) );
	const R = new Float64Array( Math.max( m, n ) );
	const info = zgbbrd( 'both', m, n, 0, 2, 2, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( Q, 0 ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( reinterpret( PT, 0 ), tc.PT, 1e-12, 'PT' );
});

test( 'zgbbrd: tall_6x4_Q', function t() {

	const tc = findCase( 'tall_6x4_Q' );
	const m = 6;
	const n = 4;
	const ncc = 2;
	const ldab = 3;
	const AB = buildAB( ldab, [
		[ 0, 0, 3.0, 0.1, -1.0, 0.2 ],
		[ -1.0, -0.2, 3.0, -0.3, -1.0, 0.4 ],
		[ -1.0, -0.4, 3.0, 0.5, -1.0, -0.1 ],
		[ -1.0, 0.1, 3.0, 0.0, -1.0, 0.3 ]
	]);
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Complex128Array( m * m );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array([
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
	const W = new Complex128Array( Math.max( m, n ) );
	const R = new Float64Array( Math.max( m, n ) );
	const info = zgbbrd( 'q-only', m, n, ncc, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, 1, 0, C, 1, m, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( Q, 0 ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( reinterpret( C, 0 ), tc.C, 1e-12, 'C' );
});

test( 'zgbbrd: wide_4x6_P', function t() {

	const tc = findCase( 'wide_4x6_P' );
	const m = 4;
	const n = 6;
	const ldab = 2;
	const AB = buildAB( ldab, [
		[ 0, 0, 2.0, 0.1 ],
		[ 1.0, -0.2, 3.0, 0.3 ],
		[ 1.0, 0.4, 4.0, -0.5 ],
		[ 1.0, -0.1, 5.0, 0.2 ],
		[ 1.0, 0.6, 0, 0 ],
		[ 1.0, -0.3, 0, 0 ]
	]);
	const D = new Float64Array( m );
	const E = new Float64Array( Math.max( 1, m - 1 ) );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( n * n );
	const C = new Complex128Array( 1 );
	const W = new Complex128Array( Math.max( m, n ) );
	const R = new Float64Array( Math.max( m, n ) );
	const info = zgbbrd( 'p-only', m, n, 0, 0, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( PT, 0 ), tc.PT, 1e-12, 'PT' );
});

test( 'zgbbrd: lower_4x4_B', function t() {

	const tc = findCase( 'lower_4x4_B' );
	const m = 4;
	const n = 4;
	const ldab = 2;
	const AB = buildAB( ldab, [
		[ 2.0, 0.1, -1.0, 0.2 ],
		[ 3.0, -0.2, -1.0, 0.3 ],
		[ 4.0, 0.4, -1.0, -0.4 ],
		[ 5.0, -0.1, 0, 0 ]
	]);
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Complex128Array( m * m );
	const PT = new Complex128Array( n * n );
	const C = new Complex128Array( 1 );
	const W = new Complex128Array( Math.max( m, n ) );
	const R = new Float64Array( Math.max( m, n ) );
	const info = zgbbrd( 'both', m, n, 0, 1, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
	assertArrayClose( E, tc.E, 1e-12, 'E' );
	assertArrayClose( reinterpret( Q, 0 ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( reinterpret( PT, 0 ), tc.PT, 1e-12, 'PT' );
});

test( 'zgbbrd: diag_4x4_N', function t() {

	const tc = findCase( 'diag_4x4_N' );
	const m = 4;
	const n = 4;
	const ldab = 1;
	const AB = new Complex128Array([
		2.5,
		0.5,
		-1.5,
		-0.3,
		3.5,
		0.2,
		4.5,
		-0.6
	]);
	const D = new Float64Array( n );
	const E = new Float64Array( Math.max( 1, n - 1 ) );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const W = new Complex128Array( Math.max( m, n ) );
	const R = new Float64Array( Math.max( m, n ) );
	const info = zgbbrd( 'no-vectors', m, n, 0, 0, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( D, tc.D, 1e-12, 'D' );
});

test( 'zgbbrd: m_zero', function t() {

	const tc = findCase( 'm_zero' );
	const AB = new Complex128Array( 12 );
	const D = new Float64Array( 1 );
	const E = new Float64Array( 1 );
	const Q = new Complex128Array( 1 );
	const PT = new Complex128Array( 1 );
	const C = new Complex128Array( 1 );
	const W = new Complex128Array( 8 );
	const R = new Float64Array( 8 );
	const info = zgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0, R, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});
