
/* eslint-disable max-len, stdlib/first-unit-test, no-restricted-syntax */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import trim from '@stdlib/string/trim/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dggev from './../lib/ndarray.js';


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

/**
* Compares eigenvector matrices allowing per-column sign flips.
*
* @private
* @param {Float64Array} actual - computed eigenvector matrix (column-major flat)
* @param {Array} expected - expected eigenvector matrix (column-major flat)
* @param {NonNegativeInteger} N - matrix dimension
* @param {Array} alphai - imaginary parts of eigenvalues
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function assertEigenvectorsClose( actual, expected, N, alphai, tol, msg ) {
	var bestErr;
	var posErr;
	var negErr;
	var jc;
	var jr;
	var k;
	var d;

	jc = 0;
	while ( jc < N ) {
		if ( alphai[ jc ] === 0.0 ) {
			// Real eigenvalue: compare column jc, allow sign flip
			posErr = 0.0;
			negErr = 0.0;
			for ( jr = 0; jr < N; jr++ ) {
				k = ( jc * N ) + jr;
				d = Math.abs( actual[ k ] - expected[ k ] );
				posErr = Math.max( posErr, d );
				d = Math.abs( actual[ k ] + expected[ k ] );
				negErr = Math.max( negErr, d );
			}
			bestErr = Math.min( posErr, negErr );
			assert.ok( bestErr <= tol, msg + ' col ' + jc + ': err=' + bestErr );
			jc += 1;
		} else {
			// Complex pair: columns jc and jc+1
			posErr = 0.0;
			negErr = 0.0;
			for ( jr = 0; jr < N; jr++ ) {
				k = ( jc * N ) + jr;
				d = Math.abs( actual[ k ] - expected[ k ] );
				posErr = Math.max( posErr, d );
				d = Math.abs( actual[ k ] + expected[ k ] );
				negErr = Math.max( negErr, d );
				k = ( ( jc + 1 ) * N ) + jr;
				d = Math.abs( actual[ k ] - expected[ k ] );
				posErr = Math.max( posErr, d );
				d = Math.abs( actual[ k ] + expected[ k ] );
				negErr = Math.max( negErr, d );
			}
			bestErr = Math.min( posErr, negErr );
			assert.ok( bestErr <= tol, msg + ' cols ' + jc + '-' + ( jc + 1 ) + ': err=' + bestErr );
			jc += 2;
		}
	}
}

/**
* Maps Fortran jobvl to JS string.
*
* @private
* @param {Object} tc - test case
* @returns {string} JS job string
*/
function jobvlStr( tc ) {
	return ( tc.jobvl === 'V' ) ? 'compute-vectors' : 'no-vectors';
}

/**
* Maps Fortran jobvr to JS string.
*
* @private
* @param {Object} tc - test case
* @returns {string} JS job string
*/
function jobvrStr( tc ) {
	return ( tc.jobvr === 'V' ) ? 'compute-vectors' : 'no-vectors';
}

/**
* Runs a test case from fixtures.
*
* @private
* @param {Object} tc - test case object
*/
function runTest( tc ) {
	var ALPHAR;
	var ALPHAI;
	var WORK;
	var BETA;
	var info;
	var VL;
	var VR;
	var N;
	var A;
	var B;

	N = tc.n;
	A = new Float64Array( tc.A );
	B = new Float64Array( tc.B );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( Math.max( N * N, 1 ) );
	VR = new Float64Array( Math.max( N * N, 1 ) );
	WORK = new Float64Array( Math.max( 1, 8 * N ) );

	info = dggev( jobvlStr( tc ), jobvrStr( tc ), N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, WORK, 1, 0 );

	assert.equal( info, tc.info, 'info' );
	assertArrayClose( ALPHAR, tc.alphar, 1e-12, 'alphar' );
	assertArrayClose( ALPHAI, tc.alphai, 1e-12, 'alphai' );
	assertArrayClose( BETA, tc.beta, 1e-12, 'beta' );

	if ( tc.VL ) {
		assertEigenvectorsClose( VL, tc.VL, N, tc.alphai, 1e-10, 'VL' );
	}
	if ( tc.VR ) {
		assertEigenvectorsClose( VR, tc.VR, N, tc.alphai, 1e-10, 'VR' );
	}
}


// TESTS //

test( 'dggev (ndarray): 2x2 diagonal, eigenvalues only', function t() {
	runTest( findCase( '2x2_diag_eig_only' ) );
});

test( 'dggev (ndarray): 2x2 with both eigenvectors', function t() {
	runTest( findCase( '2x2_both_vectors' ) );
});

test( 'dggev (ndarray): 3x3 general with right eigenvectors only', function t() {
	runTest( findCase( '3x3_right_only' ) );
});

test( 'dggev (ndarray): 3x3 with left eigenvectors only', function t() {
	runTest( findCase( '3x3_left_only' ) );
});

test( 'dggev (ndarray): 4x4 complex conjugate pairs, both eigenvectors', function t() {
	runTest( findCase( '4x4_complex_both' ) );
});

test( 'dggev (ndarray): 4x4 general nonsymmetric, both eigenvectors', function t() {
	runTest( findCase( '4x4_general_both' ) );
});

test( 'dggev (ndarray): 1x1 trivial case', function t() {
	runTest( findCase( '1x1_trivial' ) );
});

test( 'dggev (ndarray): N=0 returns 0', function t() {
	var ALPHAR = new Float64Array( 1 );
	var ALPHAI = new Float64Array( 1 );
	var BETA = new Float64Array( 1 );
	var WORK = new Float64Array( 1 );
	var info;
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );

	info = dggev( 'no-vectors', 'no-vectors', 0, A, 1, 1, 0, B, 1, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dggev (ndarray): handles very small matrix entries (scaling path)', function t() {
	var ALPHAR;
	var ALPHAI;
	var scale;
	var WORK;
	var BETA;
	var info;
	var VL;
	var VR;
	var N;
	var A;
	var B;

	N = 2;
	scale = 1e-200;

	// Column-major: A = scale * [[2,0],[0,3]], B = scale * [[1,0],[0,1]]
	A = new Float64Array( [ 2 * scale, 0, 0, 3 * scale ] );
	B = new Float64Array( [ scale, 0, 0, scale ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	WORK = new Float64Array( Math.max( 1, 8 * N ) );

	info = dggev( 'compute-vectors', 'compute-vectors', N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Eigenvalues should be 2 and 3 (ratios alphar/beta)
	assertClose( ALPHAR[ 0 ] / BETA[ 0 ], 2.0, 1e-10, 'eigenvalue 0' );
	assertClose( ALPHAR[ 1 ] / BETA[ 1 ], 3.0, 1e-10, 'eigenvalue 1' );
});

test( 'dggev (ndarray): handles very large matrix entries (scaling path)', function t() {
	var ALPHAR;
	var ALPHAI;
	var scale;
	var WORK;
	var BETA;
	var info;
	var VL;
	var VR;
	var N;
	var A;
	var B;

	N = 2;
	scale = 1e200;
	A = new Float64Array( [ 2 * scale, 0, 0, 3 * scale ] );
	B = new Float64Array( [ scale, 0, 0, scale ] );
	ALPHAR = new Float64Array( N );
	ALPHAI = new Float64Array( N );
	BETA = new Float64Array( N );
	VL = new Float64Array( N * N );
	VR = new Float64Array( N * N );
	WORK = new Float64Array( Math.max( 1, 8 * N ) );

	info = dggev( 'no-vectors', 'no-vectors', N, A, 1, N, 0, B, 1, N, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, VL, 1, N, 0, VR, 1, N, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );

	// Eigenvalues should be 2 and 3
	assertClose( ALPHAR[ 0 ] / BETA[ 0 ], 2.0, 1e-10, 'eigenvalue 0' );
	assertClose( ALPHAR[ 1 ] / BETA[ 1 ], 3.0, 1e-10, 'eigenvalue 1' );
});

test( 'dggev (ndarray): throws on invalid jobvl', function t() {
	assert.throws( function badJobvl() {
		dggev( 'bad', 'no-vectors', 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 16 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dggev (ndarray): throws on invalid jobvr', function t() {
	assert.throws( function badJobvr() {
		dggev( 'no-vectors', 'bad', 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 16 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dggev (ndarray): throws on negative N', function t() {
	assert.throws( function badN() {
		dggev( 'no-vectors', 'no-vectors', -1, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 16 ), 1, 0 );
	}, /invalid argument/ );
});

test( 'dggev (ndarray): throws on insufficient WORK length', function t() {
	assert.throws( function badWork() {
		dggev( 'no-vectors', 'no-vectors', 2, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 1 ), 1, 0 );
	}, /invalid argument/ );
});
