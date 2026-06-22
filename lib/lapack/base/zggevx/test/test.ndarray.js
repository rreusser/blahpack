/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-statements, max-lines, max-lines-per-function */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggevx from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zggevx.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );

var A3 = [
	2.0, 1.0, 1.0, -1.0, 0.5, 0.5,
	1.0, 0.5, 3.0, 0.0, 0.5, -0.5,
	0.5, -0.5, 1.0, 1.0, 4.0, -1.0
];
var B3 = [
	3.0, 0.0, 0.5, -0.5, 0.0, 0.5,
	1.0, 0.5, 2.0, 1.0, 0.5, 0.0,
	0.5, 0.5, 1.0, 0.0, 1.0, 0.5
];


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function mkMat( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}

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

function toArr( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

function runCase( tc, balanc, jobvl, jobvr, sense, N, A, B ) {
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
	r = zggevx( balanc, jobvl, jobvr, sense, N, A, 1, Math.max( 1, N ), 0, B, 1, Math.max( 1, N ), 0, ALPHA, 1, 0, BETA, 1, 0, VL, 1, Math.max( 1, N ), 0, VR, 1, Math.max( 1, N ), 0, LSCALE, 1, 0, RSCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0 );
	return {
		'r': r,
		'VL': VL,
		'VR': VR,
		'ALPHA': ALPHA,
		'BETA': BETA,
		'LSCALE': LSCALE,
		'RSCALE': RSCALE,
		'RCONDE': RCONDE,
		'RCONDV': RCONDV
	};
}


// TESTS //

test( 'zggevx: main export is a function', function t() {
	assert.strictEqual( typeof zggevx, 'function', 'is a function' );
});

test( 'zggevx: n_eq_0', function t() {
	var tc = findCase( 'n_eq_0' );
	var A = new Complex128Array( 1 );
	var B = new Complex128Array( 1 );
	var out = runCase( tc, 'none', 'no-vectors', 'no-vectors', 'none', 0, A, B );
	assert.equal( out.r.info, tc.info, 'info' );
});

test( 'zggevx: n_eq_1 compute-vectors', function t() {
	var tol = 1e-9;
	var tc = findCase( 'n_eq_1' );
	var A = mkMat( [ 3.0, 1.0 ] );
	var B = mkMat( [ 2.0, 0.5 ] );
	var out = runCase( tc, 'none', 'compute-vectors', 'compute-vectors', 'none', 1, A, B );
	assert.equal( out.r.info, tc.info, 'info' );
	assert.equal( out.r.ilo, tc.ilo, 'ilo' );
	assert.equal( out.r.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
	assertArrayClose( toArr( reinterpret( out.VL, 0 ) ), tc.VL, tol, 'VL' );
	assertArrayClose( toArr( reinterpret( out.VR, 0 ) ), tc.VR, tol, 'VR' );
});

test( 'zggevx: balanc=none compute both 3x3', function t() {
	var tol = 1e-9;
	var tc = findCase( 'balN_both_3x3' );
	var out = runCase( tc, 'none', 'compute-vectors', 'compute-vectors', 'none', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	assert.equal( out.r.ilo, tc.ilo, 'ilo' );
	assert.equal( out.r.ihi, tc.ihi, 'ihi' );
	assertClose( out.r.abnrm, tc.abnrm, tol, 'abnrm' );
	assertClose( out.r.bbnrm, tc.bbnrm, tol, 'bbnrm' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
	assertArrayClose( extractCol( out.VL, 3, 0 ), tc.VL_col1, tol, 'VL_col1' );
	assertArrayClose( extractCol( out.VR, 3, 0 ), tc.VR_col1, tol, 'VR_col1' );
});

test( 'zggevx: balanc=permute eigvals only 3x3', function t() {
	var tol = 1e-9;
	var tc = findCase( 'balP_eigonly_3x3' );
	var out = runCase( tc, 'permute', 'no-vectors', 'no-vectors', 'none', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	assert.equal( out.r.ilo, tc.ilo, 'ilo' );
	assert.equal( out.r.ihi, tc.ihi, 'ihi' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
});

test( 'zggevx: balanc=both compute both 2x2 diag', function t() {
	var tol = 1e-9;
	var tc = findCase( 'balB_diag_2x2' );
	var A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	var B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	var out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'none', 2, A, B );
	assert.equal( out.r.info, tc.info, 'info' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( toArr( reinterpret( out.BETA, 0 ) ), tc.beta, tol, 'beta' );
	assertArrayClose( extractCol( out.VL, 2, 0 ), tc.VL_col1, tol, 'VL_col1' );
	assertArrayClose( extractCol( out.VR, 2, 1 ), tc.VR_col2, tol, 'VR_col2' );
});

test( 'zggevx: balanc=scale right-only 3x3', function t() {
	var tol = 1e-9;
	var tc = findCase( 'balS_right_3x3' );
	var out = runCase( tc, 'scale', 'no-vectors', 'compute-vectors', 'none', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	assertArrayClose( toArr( reinterpret( out.ALPHA, 0 ) ), tc.alpha, tol, 'alpha' );
	assertArrayClose( extractCol( out.VR, 3, 0 ), tc.VR_col1, tol, 'VR_col1' );
});

test( 'zggevx: sense=eigenvalues 3x3', function t() {
	var tol = 1e-8;
	var tc = findCase( 'sense_E_3x3' );
	var out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'eigenvalues', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	if ( tc.rconde ) {
		assertArrayClose( toArr( out.RCONDE ), tc.rconde, tol, 'rconde' );
	}
});

test( 'zggevx: sense=right-vectors 3x3', function t() {
	var tol = 1e-8;
	var tc = findCase( 'sense_V_3x3' );
	var out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'right-vectors', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	if ( tc.rcondv ) {
		assertArrayClose( toArr( out.RCONDV ), tc.rcondv, tol, 'rcondv' );
	}
});

test( 'zggevx: sense=both 3x3', function t() {
	var tol = 1e-8;
	var tc = findCase( 'sense_B_3x3' );
	var out = runCase( tc, 'both', 'compute-vectors', 'compute-vectors', 'both', 3, mkMat( A3 ), mkMat( B3 ) );
	assert.equal( out.r.info, tc.info, 'info' );
	if ( tc.rconde ) {
		assertArrayClose( toArr( out.RCONDE ), tc.rconde, tol, 'rconde' );
	}
	if ( tc.rcondv ) {
		assertArrayClose( toArr( out.RCONDV ), tc.rcondv, tol, 'rcondv' );
	}
});

test( 'zggevx: tiny inputs trigger ilascl/ilbscl scaling', function t() {
	var A = mkMat( [ 1e-200, 0.0, 0.0, 0.0, 0.0, 0.0, 2e-200, 0.0 ] );
	var B = mkMat( [ 3e-200, 0.0, 0.0, 0.0, 0.0, 0.0, 4e-200, 0.0 ] );
	var out = runCase( { 'info': 0 }, 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, B );
	assert.equal( out.r.info, 0, 'info' );
});

test( 'zggevx: huge inputs trigger ilascl/ilbscl scaling (high)', function t() {
	var A = mkMat( [ 1e200, 0.0, 0.0, 0.0, 0.0, 0.0, 2e200, 0.0 ] );
	var B = mkMat( [ 3e200, 0.0, 0.0, 0.0, 0.0, 0.0, 4e200, 0.0 ] );
	var out = runCase( { 'info': 0 }, 'none', 'compute-vectors', 'compute-vectors', 'none', 2, A, B );
	assert.equal( out.r.info, 0, 'info' );
});

test( 'zggevx: rejects invalid balanc with TypeError', function t() {
	assert.throws( function bad() {
		runCase( { 'info': 0 }, 'bogus', 'no-vectors', 'no-vectors', 'none', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: rejects invalid jobvl with TypeError', function t() {
	assert.throws( function bad() {
		runCase( { 'info': 0 }, 'none', 'bogus', 'no-vectors', 'none', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: rejects invalid jobvr with TypeError', function t() {
	assert.throws( function bad() {
		runCase( { 'info': 0 }, 'none', 'no-vectors', 'bogus', 'none', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});

test( 'zggevx: rejects invalid sense with TypeError', function t() {
	assert.throws( function bad() {
		runCase( { 'info': 0 }, 'none', 'no-vectors', 'no-vectors', 'bogus', 2, mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ), mkMat( [ 1, 0, 0, 0, 0, 0, 1, 0 ] ) );
	}, TypeError );
});
