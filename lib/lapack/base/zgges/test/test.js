/* eslint-disable max-len, max-lines-per-function, no-restricted-syntax, stdlib/first-unit-test */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgges from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'zgges.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
	return fixture.find( function find( t ) { return t.name === name;
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
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
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

/**
* Nosel.
*
* @private
* @returns {*} result
*/
function nosel() {
	return false;
}

/**
* Run a zgges test case from fixtures.
*
* @private
* @param {Object} tc - test case from fixture
* @param {string} jobvsl - 'compute-vectors' or 'no-vectors'
* @param {string} jobvsr - 'compute-vectors' or 'no-vectors'
*/
function runCase( tc, jobvsl, jobvsr ) {
	var ALPHA;
	var BETA;
	var VSL;
	var VSR;
	var tol;
	var res;
	var N;
	var A;
	var B;

	N = tc.n;
	tol = 1e-10;

	// Create Complex128Arrays from interleaved re/im data
	A = new Complex128Array( new Float64Array( tc.Ain ) );
	B = new Complex128Array( new Float64Array( tc.Bin ) );
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VSL = new Complex128Array( N * N );
	VSR = new Complex128Array( N * N );

	res = zgges( jobvsl, jobvsr, 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0 ); // eslint-disable-line max-len

	assert.equal( res.info, tc.info, 'info' );
	assert.equal( res.sdim, tc.sdim, 'sdim' );

	// Check Schur form S (output A)
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.S, tol, 'S' );

	// Check triangular form T (output B)
	assertArrayClose( toArray( reinterpret( B, 0 ) ), tc.T, tol, 'T' );

	// Check eigenvalue arrays
	assertArrayClose( toArray( reinterpret( ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArray( reinterpret( BETA, 0 ) ), tc.beta, tol, 'beta' );

	// Check Schur vectors if computed
	if ( tc.VSL ) {
		assertArrayClose( toArray( reinterpret( VSL, 0 ) ), tc.VSL, tol, 'VSL' );
	}
	if ( tc.VSR ) {
		assertArrayClose( toArray( reinterpret( VSR, 0 ) ), tc.VSR, tol, 'VSR' );
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
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'zgges is a function', function t() {
	assert.equal( typeof zgges, 'function' );
});

test( 'zgges returns info=0 and sdim=0 for N=0', function t() {
	var res = zgges( 'no-vectors', 'no-vectors', 'not-sorted', nosel, 0, new Complex128Array( 0 ), 1, 0, 0, new Complex128Array( 0 ), 1, 0, 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, new Complex128Array( 0 ), 1, 0, 0, new Complex128Array( 0 ), 1, 0, 0); // eslint-disable-line max-len
	assert.equal( res.info, 0 );
	assert.equal( res.sdim, 0 );
});

test( 'zgges: 2x2_diag_no_vectors', function t() {
	var tc = findCase( '2x2_diag_no_vectors' );
	runCase( tc, 'no-vectors', 'no-vectors' );
});

test( 'zgges: 2x2_both_vectors', function t() {
	var tc = findCase( '2x2_both_vectors' );
	runCase( tc, 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: 3x3_right_only', function t() {
	var tc = findCase( '3x3_right_only' );
	runCase( tc, 'no-vectors', 'compute-vectors' );
});

test( 'zgges: 3x3_left_only', function t() {
	var tc = findCase( '3x3_left_only' );
	runCase( tc, 'compute-vectors', 'no-vectors' );
});

test( 'zgges: 4x4_complex_both', function t() {
	var tc = findCase( '4x4_complex_both' );
	runCase( tc, 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: 1x1_trivial', function t() {
	var tc = findCase( '1x1_trivial' );
	runCase( tc, 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: 4x4_general', function t() {
	var tc = findCase( '4x4_general' );
	runCase( tc, 'compute-vectors', 'compute-vectors' );
});

test( 'zgges: small matrix triggers A-scaling (ilascl)', function t() {
	var ALPHA;
	var BETA;
	var VSL;
	var VSR;
	var res;
	var av;
	var bv;
	var N;
	var A;
	var B;

	N = 2;
	A = new Complex128Array( N * N );
	B = new Complex128Array( N * N );
	av = reinterpret( A, 0 );
	bv = reinterpret( B, 0 );
	av[ 0 ] = 1e-160;
	av[ 1 ] = 0.0;
	av[ 2 * ( 1 + N ) ] = 2e-160;
	av[ 2 * ( 1 + N ) + 1 ] = 0.0;
	bv[ 0 ] = 1.0;
	bv[ 2 * ( 1 + N ) ] = 1.0;
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VSL = new Complex128Array( N * N );
	VSR = new Complex128Array( N * N );
	res = zgges( 'compute-vectors', 'compute-vectors', 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges: large matrix triggers B-scaling (ilbscl)', function t() {
	var ALPHA;
	var BETA;
	var VSL;
	var VSR;
	var res;
	var av;
	var bv;
	var N;
	var A;
	var B;

	N = 2;
	A = new Complex128Array( N * N );
	B = new Complex128Array( N * N );
	av = reinterpret( A, 0 );
	bv = reinterpret( B, 0 );
	av[ 0 ] = 1.0;
	av[ 2 * ( 1 + N ) ] = 2.0;
	bv[ 0 ] = 1e160;
	bv[ 2 * ( 1 + N ) ] = 1e160;
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VSL = new Complex128Array( N * N );
	VSR = new Complex128Array( N * N );
	res = zgges( 'compute-vectors', 'compute-vectors', 'not-sorted', nosel, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, 0, 'info' );
});

test( 'zgges: sorted eigenvalues with selection function', function t() {
	var ALPHA;
	var BETA;
	var VSL;
	var VSR;
	var res;
	var av;
	var bv;
	var N;
	var A;
	var B;

	N = 3;
	A = new Complex128Array( N * N );
	B = new Complex128Array( N * N );
	av = reinterpret( A, 0 );
	bv = reinterpret( B, 0 );
	av[ 0 ] = 1.0;
	av[ 1 ] = 1.0;
	av[ 2 * ( 1 + N ) ] = 2.0;
	av[ 2 * ( 1 + N ) + 1 ] = 0.0;
	av[ 2 * ( 2 + 2 * N ) ] = 3.0;
	av[ 2 * ( 2 + 2 * N ) + 1 ] = -1.0;
	bv[ 0 ] = 1.0;
	bv[ 2 * ( 1 + N ) ] = 1.0;
	bv[ 2 * ( 2 + 2 * N ) ] = 1.0;
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VSL = new Complex128Array( N * N );
	VSR = new Complex128Array( N * N );
	function selctg( alphaRe, alphaIm, betaRe, betaIm ) { // eslint-disable-line no-unused-vars
		if ( betaRe === 0.0 && betaIm === 0.0 ) {
			return false;
		}
		// alpha/beta real part approximation: alphaRe/betaRe (when betaIm ~= 0)
		return alphaRe / betaRe > 1.5;
	}
	res = zgges( 'compute-vectors', 'compute-vectors', 'sorted', selctg, N, A, 1, N, 0, B, 1, N, 0, ALPHA, 1, 0, BETA, 1, 0, VSL, 1, N, 0, VSR, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.sdim, 2, 'sdim should be 2 (eigenvalues with real part > 1.5)' ); // eslint-disable-line max-len
});
