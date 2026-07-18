/* eslint-disable max-len, max-params, no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgbbrd from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = readFileSync( path.join( fixtureDir, 'dgbbrd.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dgbbrd, 'function', 'main export is a function' );
});

test( 'dgbbrd: tri_5x5_N', function t() {

	const tc = findCase( 'tri_5x5_N' );
	const ldab = 3;
	const m = 5;
	const n = 5;
	const AB = new Float64Array([
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
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Float64Array( 1 );
	const PT = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const W = new Float64Array( 2 * n );
	const info = dgbbrd( 'no-vectors', m, n, 0, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( AB, tc.AB, 1e-13, 'AB' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: penta_5x5_B', function t() {

	const tc = findCase( 'penta_5x5_B' );
	const ldab = 5;
	const m = 5;
	const n = 5;
	const AB = new Float64Array([
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
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Float64Array( m * m );
	const PT = new Float64Array( n * n );
	const C = new Float64Array( 1 );
	const W = new Float64Array( 2 * Math.max( m, n ) );
	const info = dgbbrd( 'both', m, n, 0, 2, 2, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( Q, tc.Q, 1e-13, 'Q' );
	assertArrayClose( PT, tc.PT, 1e-13, 'PT' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: tall_6x4_Q', function t() {

	const tc = findCase( 'tall_6x4_Q' );
	const ldab = 3;
	const m = 6;
	const n = 4;
	const ncc = 2;
	const AB = new Float64Array([
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
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Float64Array( m * m );
	const PT = new Float64Array( 1 );
	const C = new Float64Array([
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
	const W = new Float64Array( 2 * Math.max( m, n ) );
	const info = dgbbrd( 'q-only', m, n, ncc, 1, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, 1, 0, C, 1, m, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( Q, tc.Q, 1e-13, 'Q' );
	assertArrayClose( C, tc.C, 1e-13, 'C' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: wide_4x6_P', function t() {

	const tc = findCase( 'wide_4x6_P' );
	const ldab = 2;
	const m = 4;
	const n = 6;
	const AB = new Float64Array([
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
	const D = new Float64Array( m );
	const E = new Float64Array( Math.max( 1, m - 1 ) );
	const Q = new Float64Array( 1 );
	const PT = new Float64Array( n * n );
	const C = new Float64Array( 1 );
	const W = new Float64Array( 2 * Math.max( m, n ) );
	const info = dgbbrd( 'p-only', m, n, 0, 0, 1, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( PT, tc.PT, 1e-13, 'PT' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: lower_4x4_B', function t() {

	const tc = findCase( 'lower_4x4_B' );
	const ldab = 2;
	const m = 4;
	const n = 4;
	const AB = new Float64Array([
		2.0,
		-1.0,
		3.0,
		-1.0,
		4.0,
		-1.0,
		5.0,
		0.0
	]);
	const D = new Float64Array( n );
	const E = new Float64Array( n - 1 );
	const Q = new Float64Array( m * m );
	const PT = new Float64Array( n * n );
	const C = new Float64Array( 1 );
	const W = new Float64Array( 2 * Math.max( m, n ) );
	const info = dgbbrd( 'both', m, n, 0, 1, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, m, 0, PT, 1, n, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E, tc.E, 1e-13, 'E' );
	assertArrayClose( Q, tc.Q, 1e-13, 'Q' );
	assertArrayClose( PT, tc.PT, 1e-13, 'PT' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: diag_4x4_N', function t() {

	const tc = findCase( 'diag_4x4_N' );
	const ldab = 1;
	const m = 4;
	const n = 4;
	const AB = new Float64Array( [ 2.5, -1.5, 3.5, 4.5 ] );
	const D = new Float64Array( n );
	const E = new Float64Array( Math.max( 1, n - 1 ) );
	const Q = new Float64Array( 1 );
	const PT = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const W = new Float64Array( 2 * Math.max( m, n ) );
	const info = dgbbrd( 'no-vectors', m, n, 0, 0, 0, AB, 1, ldab, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( D, tc.D, 1e-13, 'D' );
	assertArrayClose( E.slice( 0, n - 1 ), tc.E.slice( 0, n - 1 ), 1e-13, 'E' );
	assert.equal( info, tc.info, 'info' );
});

test( 'dgbbrd: m_zero', function t() {

	const tc = findCase( 'm_zero' );
	const AB = new Float64Array( 12 );
	const D = new Float64Array( 1 );
	const E = new Float64Array( 1 );
	const Q = new Float64Array( 1 );
	const PT = new Float64Array( 1 );
	const C = new Float64Array( 1 );
	const W = new Float64Array( 8 );
	const info = dgbbrd( 'no-vectors', 0, 4, 0, 1, 1, AB, 1, 3, 0, D, 1, 0, E, 1, 0, Q, 1, 1, 0, PT, 1, 1, 0, C, 1, 1, 0, W, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
});
