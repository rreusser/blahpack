
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggev from './../lib/dggev.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = trim( readFileSync( path.join( fixtureDir, 'dggev.jsonl' ), 'utf8' ) ).split( '\n' );
var fixture = lines.map( parse );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parse( line ) {
	return JSON.parse( line );
}

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts two values are close.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertClose( actual, expected, tol, msg ) {
	var d;
	if ( expected === 0.0 ) {
		d = Math.abs( actual );
	} else {
		d = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	}
	assert.ok( d <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (err=' + d + ')' );
}

/**
* Asserts arrays are element-wise close.
*
* @private
* @param {Float64Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'dggev is a function', function t() {
	assert.strictEqual( typeof dggev, 'function', 'is a function' );
});

test( 'dggev has expected arity', function t() {
	assert.strictEqual( dggev.length, 17, 'has expected arity' );
});

test( 'dggev throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dggev( 'invalid', 'no-vectors', 'no-vectors', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), new Float64Array( 2 ), new Float64Array( 2 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dggev throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dggev( 'row-major', 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 2 ), new Float64Array( 2 ), new Float64Array( 2 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'dggev throws RangeError for invalid LDA', function t() {
	assert.throws( function throws() {
		dggev( 'row-major', 'no-vectors', 'no-vectors', 3, new Float64Array( 9 ), 1, new Float64Array( 9 ), 3, new Float64Array( 3 ), new Float64Array( 3 ), new Float64Array( 3 ), new Float64Array( 9 ), 3, new Float64Array( 9 ), 3 );
	}, RangeError );
});

test( 'dggev throws RangeError for invalid LDB', function t() {
	assert.throws( function throws() {
		dggev( 'row-major', 'no-vectors', 'no-vectors', 3, new Float64Array( 9 ), 3, new Float64Array( 9 ), 1, new Float64Array( 3 ), new Float64Array( 3 ), new Float64Array( 3 ), new Float64Array( 9 ), 3, new Float64Array( 9 ), 3 );
	}, RangeError );
});

test( 'dggev: column-major 2x2 both eigenvectors', function t() {
	var ALPHAR;
	var ALPHAI;
	var BETA;
	var info;
	var VL;
	var VR;
	var tc;
	var N;
	var A;
	var B;

	tc = findCase( '2x2_both_vectors' );
	N = tc.n;
	A = new Float64Array( tc.A );
	B = new Float64Array( tc.B );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );

	info = dggev( 'column-major', 'compute-vectors', 'compute-vectors', N, A, N, B, N, ALPHAR, ALPHAI, BETA, VL, N, VR, N );
	assert.equal( info, 0, 'info' );
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );
});

test( 'dggev: row-major 2x2 eigenvalues only', function t() {
	var ALPHAR;
	var ALPHAI;
	var BETA;
	var info;
	var VL;
	var VR;
	var N;
	var A;
	var B;

	N = 2;

	// Row-major: A = [[2,0],[0,3]], B = [[1,0],[0,1]]
	A = new Float64Array( [ 2, 0, 0, 3 ] );
	B = new Float64Array( [ 1, 0, 0, 1 ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( 1 );
	VR = new Float64Array( 1 );

	info = dggev( 'row-major', 'no-vectors', 'no-vectors', N, A, N, B, N, ALPHAR, ALPHAI, BETA, VL, 1, VR, 1 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( ALPHAR, [ 2.0, 3.0 ], 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, [ 0.0, 0.0 ], 1e-12, 'alphai' );
	assertArrayClose( BETA, [ 1.0, 1.0 ], 1e-12, 'beta' );
});

test( 'dggev: column-major 4x4 general both', function t() {
	var ALPHAR;
	var ALPHAI;
	var BETA;
	var info;
	var VL;
	var VR;
	var tc;
	var N;
	var A;
	var B;

	tc = findCase( '4x4_general_both' );
	N = tc.n;
	A = new Float64Array( tc.A );
	B = new Float64Array( tc.B );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );

	info = dggev( 'column-major', 'compute-vectors', 'compute-vectors', N, A, N, B, N, ALPHAR, ALPHAI, BETA, VL, N, VR, N );
	assert.equal( info, 0, 'info' );
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );
});
