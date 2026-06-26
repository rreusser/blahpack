/* eslint-disable max-len, max-lines-per-function, max-lines, no-restricted-syntax, stdlib/first-unit-test, max-statements */


// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js'; // eslint-disable-line max-len
import zggevx from './../lib/index.js';
import base from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'zggevx.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) {
		return JSON.parse( line );
	} );

// Column-major interleaved (re, im) data for the 3x3 test matrices.

// Column j, row i → index 2*(j*N+i).
var A3 = [
	2.0,
	1.0,
	1.0,
	-1.0,
	0.5,
	0.5,
	1.0,
	0.5,
	3.0,
	0.0,
	0.5,
	-0.5,
	0.5,
	-0.5,
	1.0,
	1.0,
	4.0,
	-1.0
];
var B3 = [
	3.0,
	0.0,
	0.5,
	-0.5,
	0.0,
	0.5,
	1.0,
	0.5,
	2.0,
	1.0,
	0.5,
	0.0,
	0.5,
	0.5,
	1.0,
	0.0,
	1.0,
	0.5
];


// FUNCTIONS //

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {Object} test case object
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
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays of numbers are elementwise approximately equal.
*
* @private
* @param {Collection} actual - actual values
* @param {Collection} expected - expected values
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
* Builds a column-major complex matrix from an interleaved (re, im).
* Float64 array already laid out in column-major order.
*
* @private
* @param {Array} arr - interleaved values
* @returns {Complex128Array} complex matrix
*/
function mkMat( arr ) {
		return new Complex128Array( new Float64Array( arr ) );
	}

/**
* Extracts column `col` of the N x N complex matrix V as a plain array.
* of interleaved (re, im) values.
*
* @private
* @param {Complex128Array} V - input matrix
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} col - column index
* @returns {Array} extracted column
*/
function extractCol( V, N, col ) {
	var out = [];
	var v = reinterpret( V, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		out.push( v[ 2 * ( ( col * N ) + i ) ] );
		out.push( v[ ( 2 * ( ( col * N ) + i ) ) + 1 ] );
	}
	return out;
}

/**
* Converts a TypedArray to a plain array.
*
* @private
* @param {TypedArray} arr - input
* @returns {Array} plain array
*/
function toArr( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Runs a zggevx test case: invokes the routine with the given string params.
* and a matrix pair, then checks core outputs against the fixture.
*
* @private
* @param {Object} tc - fixture case
* @param {string} balanc - balanc option
* @param {string} jobvl - left eigenvector option
* @param {string} jobvr - right eigenvector option
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - matrix A
* @param {Complex128Array} B - matrix B
* @returns {Object} object with { r, VL, VR, ALPHA, BETA, LSCALE, RSCALE }
*/
function runCase( tc, balanc, jobvl, jobvr, N, A, B ) {
	var RCONDE;
	var RCONDV;
	var LSCALE;
	var RSCALE;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var r;
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VL = new Complex128Array( Math.max( 1, N * N ) );
	VR = new Complex128Array( Math.max( 1, N * N ) );
	LSCALE = new Float64Array( Math.max( 1, N ) );
	RSCALE = new Float64Array( Math.max( 1, N ) );
	RCONDE = new Float64Array( Math.max( 1, N ) );
	RCONDV = new Float64Array( Math.max( 1, N ) );
	r = zggevx.ndarray( balanc, jobvl, jobvr, 'none', N, A, 1, Math.max( 1, N ), 0, B, 1, Math.max( 1, N ), 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, Math.max( 1, N ), 0, VR, 1, Math.max( 1, N ), 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info, 'info' );
	if ( N === 0 ) {
		return {
			'r': r,
			'VL': VL,
			'VR': VR,
			'ALPHA': ALPHA,
			'BETA': BETA,
			'LSCALE': LSCALE,
			'RSCALE': RSCALE
		};
	}
	assert.equal( r.ilo, tc.ilo, 'ilo' );
	assert.equal( r.ihi, tc.ihi, 'ihi' );
	assertClose( r.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( r.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( toArr( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-10, 'alpha' );
	assertArrayClose( toArr( reinterpret( BETA, 0 ) ), tc.beta, 1e-10, 'beta' );
	if ( tc.lscale ) {
		assertArrayClose( toArr( LSCALE ), tc.lscale, 1e-12, 'lscale' );
	}
	if ( tc.rscale ) {
		assertArrayClose( toArr( RSCALE ), tc.rscale, 1e-12, 'rscale' );
	}
	return {
		'r': r,
		'VL': VL,
		'VR': VR,
		'ALPHA': ALPHA,
		'BETA': BETA,
		'LSCALE': LSCALE,
		'RSCALE': RSCALE
	};
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zggevx, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zggevx.ndarray, 'function', 'has ndarray method' );
});

test( 'zggevx: n_eq_0', function t() {
	var tc;
	var A;
	var B;
	tc = findCase( 'n_eq_0' );
	A = new Complex128Array( 1 );
	B = new Complex128Array( 1 );
	runCase( tc, 'none', 'no-vectors', 'no-vectors', 0, A, B );
});

test( 'zggevx: n_eq_1', function t() {
	var out;
	var tc;
	var A;
	var B;

	tc = findCase( 'n_eq_1' );
	A = mkMat( [ 3.0, 1.0 ] );
	B = mkMat( [ 2.0, 0.5 ] );
	out = runCase( tc, 'none', 'compute-vectors', 'compute-vectors', 1, A, B );
	assertArrayClose( toArr( reinterpret( out.VL, 0 ) ), tc.VL, 1e-12, 'VL' );
	assertArrayClose( toArr( reinterpret( out.VR, 0 ) ), tc.VR, 1e-12, 'VR' );
});

test( 'zggevx: balN_both_3x3', function t() {
	var out;
	var tc;

	tc = findCase( 'balN_both_3x3' );
	out = runCase( tc, 'none', 'compute-vectors', 'compute-vectors', 3, mkMat( A3 ), mkMat( B3 ) ); // eslint-disable-line max-len
	assertArrayClose( extractCol( out.VL, 3, 0 ), tc.VL_col1, 1e-10, 'VL_col1' );
	assertArrayClose( extractCol( out.VL, 3, 1 ), tc.VL_col2, 1e-10, 'VL_col2' );
	assertArrayClose( extractCol( out.VL, 3, 2 ), tc.VL_col3, 1e-10, 'VL_col3' );
	assertArrayClose( extractCol( out.VR, 3, 0 ), tc.VR_col1, 1e-10, 'VR_col1' );
	assertArrayClose( extractCol( out.VR, 3, 1 ), tc.VR_col2, 1e-10, 'VR_col2' );
	assertArrayClose( extractCol( out.VR, 3, 2 ), tc.VR_col3, 1e-10, 'VR_col3' );
});

test( 'zggevx: balP_eigonly_3x3', function t() {
	var tc;
	tc = findCase( 'balP_eigonly_3x3' );
	runCase( tc, 'permute', 'no-vectors', 'no-vectors', 3, mkMat( A3 ), mkMat( B3 ) ); // eslint-disable-line max-len
});

test( 'zggevx: balB_diag_2x2', function t() {
	var out;
	var tc;
	var A;
	var B;

	tc = findCase( 'balB_diag_2x2' );
	A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 2, A, B );
	assertArrayClose( extractCol( out.VL, 2, 0 ), tc.VL_col1, 1e-12, 'VL_col1' );
	assertArrayClose( extractCol( out.VL, 2, 1 ), tc.VL_col2, 1e-12, 'VL_col2' );
	assertArrayClose( extractCol( out.VR, 2, 0 ), tc.VR_col1, 1e-12, 'VR_col1' );
	assertArrayClose( extractCol( out.VR, 2, 1 ), tc.VR_col2, 1e-12, 'VR_col2' );
});

test( 'zggevx: balS_right_3x3', function t() {
	var out;
	var tc;

	tc = findCase( 'balS_right_3x3' );
	out = runCase( tc, 'scale', 'no-vectors', 'compute-vectors', 3, mkMat( A3 ), mkMat( B3 ) ); // eslint-disable-line max-len
	assertArrayClose( extractCol( out.VR, 3, 0 ), tc.VR_col1, 1e-10, 'VR_col1' );
	assertArrayClose( extractCol( out.VR, 3, 1 ), tc.VR_col2, 1e-10, 'VR_col2' );
	assertArrayClose( extractCol( out.VR, 3, 2 ), tc.VR_col3, 1e-10, 'VR_col3' );
});

/**
* Runs a zggevx test case with a given SENSE and checks RCONDE / RCONDV.
*
* @private
* @param {Object} tc - fixture case
* @param {string} sense - SENSE parameter
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - matrix A
* @param {Complex128Array} B - matrix B
* @returns {Object} result object (for further assertions)
*/
function runSenseCase( tc, sense, N, A, B ) {
	var RCONDE;
	var RCONDV;
	var LSCALE;
	var RSCALE;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var r;
	ALPHA = new Complex128Array( N );
	BETA = new Complex128Array( N );
	VL = new Complex128Array( Math.max( 1, N * N ) );
	VR = new Complex128Array( Math.max( 1, N * N ) );
	LSCALE = new Float64Array( Math.max( 1, N ) );
	RSCALE = new Float64Array( Math.max( 1, N ) );
	RCONDE = new Float64Array( Math.max( 1, N ) );
	RCONDV = new Float64Array( Math.max( 1, N ) );
	r = zggevx.ndarray( 'both', 'compute-vectors', 'compute-vectors', sense, N, A, 1, Math.max( 1, N ), 0, B, 1, Math.max( 1, N ), 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, Math.max( 1, N ), 0, VR, 1, Math.max( 1, N ), 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, tc.info, 'info' );
	assert.equal( r.ilo, tc.ilo, 'ilo' );
	assert.equal( r.ihi, tc.ihi, 'ihi' );
	assertClose( r.abnrm, tc.abnrm, 1e-12, 'abnrm' );
	assertClose( r.bbnrm, tc.bbnrm, 1e-12, 'bbnrm' );
	assertArrayClose( toArr( reinterpret( ALPHA, 0 ) ), tc.alpha, 1e-10, 'alpha' );
	assertArrayClose( toArr( reinterpret( BETA, 0 ) ), tc.beta, 1e-10, 'beta' );
	if ( tc.rconde ) {
		assertArrayClose( toArr( RCONDE ), tc.rconde, 1e-8, 'rconde' );
	}
	if ( tc.rcondv ) {
		assertArrayClose( toArr( RCONDV ), tc.rcondv, 1e-8, 'rcondv' );
	}
	return {
		'r': r,
		'RCONDE': RCONDE,
		'RCONDV': RCONDV
	};
}

test( 'zggevx: sense_E_3x3', function t() {
	var tc = findCase( 'sense_E_3x3' );
	runSenseCase( tc, 'eigenvalues', 3, mkMat( A3 ), mkMat( B3 ) );
});

test( 'zggevx: sense_V_3x3', function t() {
	var tc = findCase( 'sense_V_3x3' );
	runSenseCase( tc, 'right-vectors', 3, mkMat( A3 ), mkMat( B3 ) );
});

test( 'zggevx: sense_B_3x3', function t() {
	var tc = findCase( 'sense_B_3x3' );
	runSenseCase( tc, 'both', 3, mkMat( A3 ), mkMat( B3 ) );
});

test( 'zggevx: base rejects invalid balanc with info=-1', function t() {
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;

	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	r = base( 'bogus', 'no-vectors', 'no-vectors', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, -1, 'info' );
});

test( 'zggevx: base rejects invalid jobvl with info=-2', function t() {
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;

	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	r = base( 'none', 'bogus', 'no-vectors', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, -2, 'info' );
});

test( 'zggevx: base rejects invalid jobvr with info=-3', function t() {
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;

	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	r = base( 'none', 'no-vectors', 'bogus', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, -3, 'info' );
});

test( 'zggevx: base rejects invalid sense with info=-4', function t() {
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;

	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	r = base( 'none', 'no-vectors', 'no-vectors', 'bogus', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, -4, 'info' );
});

test( 'zggevx: scales tiny A/B (ilascl/ilbscl branches)', function t() {
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;

	A = mkMat( [ 1e-200, 0.0, 0.0, 0.0, 0.0, 0.0, 2e-200, 0.0 ] );
	B = mkMat( [ 3e-200, 0.0, 0.0, 0.0, 0.0, 0.0, 4e-200, 0.0 ] );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	r = zggevx.ndarray( 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
});

test( 'zggevx: scales huge A/B (ilascl/ilbscl high branches)', function t() {
	var LSCALE;
	var RSCALE;
	var RCONDE;
	var RCONDV;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;

	A = mkMat( [ 1e200, 0.0, 0.0, 0.0, 0.0, 0.0, 2e200, 0.0 ] );
	B = mkMat( [ 3e200, 0.0, 0.0, 0.0, 0.0, 0.0, 4e200, 0.0 ] );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	r = zggevx.ndarray( 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	assert.equal( r.info, 0 );
});

test( 'zggevx: rejects invalid sense', function t() {
	var RCONDE;
	var RCONDV;
	var LSCALE;
	var RSCALE;
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var r;
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	ALPHA = new Complex128Array( 2 );
	BETA = new Complex128Array( 2 );
	VL = new Complex128Array( 4 );
	VR = new Complex128Array( 4 );
	LSCALE = new Float64Array( 2 );
	RSCALE = new Float64Array( 2 );
	RCONDE = new Float64Array( 2 );
	RCONDV = new Float64Array( 2 );
	assert.throws( function bad() {
		r = zggevx.ndarray( 'none', 'no-vectors', 'no-vectors', 'bogus', 2, A, 1, 2, 0, B, 1, 2, 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, 2, 0, VR, 1, 2, 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
	assert.strictEqual( r, undefined );
});
