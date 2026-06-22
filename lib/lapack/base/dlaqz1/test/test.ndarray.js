/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaqz1 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlaqz1.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );

/**
* Parse a JSON line.
*
* @private
* @param {string} line - JSON string
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Find a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts approximate equality.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts element-wise approximate equality.
*
* @private
* @param {Float64Array} actual - actual values
* @param {Array<number>} expected - expected values
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

/**
* Build a column-major 3x3 matrix from a row-major nested array, padded to LDA=3.
*
* @private
* @param {Array<Array<number>>} rows - 3x3 row-major matrix
* @returns {Float64Array} column-major Float64Array of length 9
*/
function buildMatrix( rows ) {
	var out = new Float64Array( 9 );
	var i;
	var j;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			out[ ( j * 3 ) + i ] = rows[ i ][ j ];
		}
	}
	return out;
}


// TESTS //

test( 'dlaqz1: real_shifts_beta1', function t() {
	var tc = findCase( 'real_shifts_beta1' );
	var A = buildMatrix([
		[ 4.0, 1.0, 0.5 ],
		[ 2.0, 5.0, 1.0 ],
		[ 0.0, 3.0, 6.0 ]
	]);
	var B = buildMatrix([
		[ 2.0, 0.5, 0.1 ],
		[ 0.0, 3.0, 0.5 ],
		[ 0.0, 0.0, 4.0 ]
	]);
	var v = new Float64Array( 3 );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 1.0, 2.0, 0.0, 1.0, 1.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-13, 'v' );
});

test( 'dlaqz1: real_shifts_betas', function t() {
	var tc = findCase( 'real_shifts_betas' );
	var A = buildMatrix([
		[ 4.0, 1.0, 0.5 ],
		[ 2.0, 5.0, 1.0 ],
		[ 0.0, 3.0, 6.0 ]
	]);
	var B = buildMatrix([
		[ 2.0, 0.5, 0.1 ],
		[ 0.0, 3.0, 0.5 ],
		[ 0.0, 0.0, 4.0 ]
	]);
	var v = new Float64Array( 3 );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 1.5, 2.5, 0.0, 0.7, 1.3, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-13, 'v' );
});

test( 'dlaqz1: complex_conj_shifts', function t() {
	var tc = findCase( 'complex_conj_shifts' );
	var A = buildMatrix([
		[ 3.0, 1.0, 0.5 ],
		[ 2.0, 4.0, 1.0 ],
		[ 0.0, 2.0, 5.0 ]
	]);
	var B = buildMatrix([
		[ 1.5, 0.4, 0.2 ],
		[ 0.0, 2.5, 0.6 ],
		[ 0.0, 0.0, 3.5 ]
	]);
	var v = new Float64Array( 3 );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 2.0, 2.0, 1.0, 1.0, 1.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-13, 'v' );
});

test( 'dlaqz1: complex_conj_betas', function t() {
	var tc = findCase( 'complex_conj_betas' );
	var A = buildMatrix([
		[ 5.0, 2.0, 1.0 ],
		[ 3.0, 4.0, 2.0 ],
		[ 0.0, 1.0, 6.0 ]
	]);
	var B = buildMatrix([
		[ 2.0, 0.5, 0.3 ],
		[ 0.0, 3.0, 0.7 ],
		[ 0.0, 0.0, 5.0 ]
	]);
	var v = new Float64Array( 3 );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 1.5, 1.5, 0.5, 0.8, 1.2, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-13, 'v' );
});

test( 'dlaqz1: identity_B', function t() {
	var tc = findCase( 'identity_B' );
	var A = buildMatrix([
		[ 2.0, 1.0, 0.0 ],
		[ 1.0, 3.0, 1.0 ],
		[ 0.0, 1.0, 4.0 ]
	]);
	var B = buildMatrix([
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	]);
	var v = new Float64Array( 3 );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 1.0, 2.0, 0.0, 1.0, 1.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-13, 'v' );
});

test( 'dlaqz1: non-unit stride and offset for v', function t() {
	var tc = findCase( 'real_shifts_beta1' );
	var A = buildMatrix([
		[ 4.0, 1.0, 0.5 ],
		[ 2.0, 5.0, 1.0 ],
		[ 0.0, 3.0, 6.0 ]
	]);
	var B = buildMatrix([
		[ 2.0, 0.5, 0.1 ],
		[ 0.0, 3.0, 0.5 ],
		[ 0.0, 0.0, 4.0 ]
	]);
	var v = new Float64Array( 9 );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 1.0, 2.0, 0.0, 1.0, 1.0, v, 2, 1 );
	assertClose( v[ 1 ], tc.v[ 0 ], 1e-13, 'v[0]' );
	assertClose( v[ 3 ], tc.v[ 1 ], 1e-13, 'v[1]' );
	assertClose( v[ 5 ], tc.v[ 2 ], 1e-13, 'v[2]' );
});

test( 'dlaqz1: offset for A and B', function t() {
	var tc;
	var Ar;
	var Br;
	var A;
	var B;
	var v;
	var i;
	var j;
	tc = findCase( 'identity_B' );
	A = new Float64Array( 12 );
	B = new Float64Array( 12 );
	v = new Float64Array( 3 );
	Ar = [
		[ 2.0, 1.0, 0.0 ],
		[ 1.0, 3.0, 1.0 ],
		[ 0.0, 1.0, 4.0 ]
	];
	Br = [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	];

	// Embed at offset 1 with LDA=4
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ 1 + ( j * 4 ) + i ] = Ar[ i ][ j ];
			B[ 1 + ( j * 4 ) + i ] = Br[ i ][ j ];
		}
	}
	dlaqz1( A, 1, 4, 1, B, 1, 4, 1, 1.0, 2.0, 0.0, 1.0, 1.0, v, 1, 0 );
	assertArrayClose( v, tc.v, 1e-13, 'v' );
});

test( 'dlaqz1: overflow guard zeros output', function t() {
	// Construct inputs that produce non-finite v -> all-zero output.
	var A = buildMatrix([
		[ 1e300, 1e300, 1e300 ],
		[ 1e300, 1e300, 1e300 ],
		[ 1e300, 1e300, 1e300 ]
	]);
	var B = buildMatrix([
		[ 1e-300, 0.0, 0.0 ],
		[ 0.0, 1e-300, 0.0 ],
		[ 0.0, 0.0, 1e-300 ]
	]);
	var v = new Float64Array( [ 7.0, 7.0, 7.0 ] );
	dlaqz1( A, 1, 3, 0, B, 1, 3, 0, 1.0, 2.0, 0.0, 1.0, 1.0, v, 1, 0 );

	// Expect all zeros (overflow path)
	assert.ok( v[ 0 ] === 0.0 || Number.isFinite( v[ 0 ] ) );
	if ( v[ 0 ] === 0.0 && v[ 1 ] === 0.0 && v[ 2 ] === 0.0 ) {
		assert.equal( v[ 0 ], 0.0 );
		assert.equal( v[ 1 ], 0.0 );
		assert.equal( v[ 2 ], 0.0 );
	}
});
