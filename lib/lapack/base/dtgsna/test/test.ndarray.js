/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import dtgsna from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dtgsna.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var FIXTURES = rawLines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, format( '%s: expected %s, got %s', msg, expected, actual ) );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, format( '%s[%d]', msg, i ) );
	}
}

function findCase( name ) {
	var i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	throw new Error( format( 'fixture not found: %s', name ) );
}

/**
* Builds an N x N column-major Float64Array from a list of (i,j,value) triplets (1-based).
*/
function buildMat( N, ld, triplets ) {
	var a = new Float64Array( ld * N );
	var i;
	var t;
	for ( i = 0; i < triplets.length; i++ ) {
		t = triplets[ i ];

		// 1-based i,j
		a[ ( t[ 1 ] - 1 ) * ld + ( t[ 0 ] - 1 ) ] = t[ 2 ];
	}
	return a;
}

function runCase( name, job, howmny, N, A, B, VL, VR, SELECT ) {
	var ld = Math.max( N, 1 );
	var s = new Float64Array( Math.max( N, 1 ) );
	var DIF = new Float64Array( Math.max( N, 1 ) );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( Math.max( 500, 1 ) );
	var IWORK = new Int32Array( Math.max( 500, 1 ) );
	var sel = SELECT || new Uint8Array( Math.max( N, 1 ) );
	var info;
	var tc;

	info = dtgsna( job, howmny, sel, 1, 0, N,
		A, 1, ld, 0,
		B, 1, ld, 0,
		VL, 1, ld, 0,
		VR, 1, ld, 0,
		s, 1, 0,
		DIF, 1, 0,
		N, M, WORK, 1, 0, 500, IWORK, 1, 0 );

	tc = findCase( name );
	assert.equal( info, tc.info, name + ':info' );
	assert.equal( M[ 0 ], tc.M, name + ':M' );
	if ( tc.S ) {
		assertArrayClose( s.slice( 0, tc.S.length ), tc.S, 1e-10, name + ':S' );
	}
	if ( tc.DIF ) {
		assertArrayClose( DIF.slice( 0, tc.DIF.length ), tc.DIF, 1e-10, name + ':DIF' );
	}
}


// TESTS //

test( 'dtgsna: main export is a function', function t() {
	assert.strictEqual( typeof dtgsna, 'function', 'is a function' );
});

test( 'dtgsna: n1_both_all (N=1, both, all)', function t() {
	var A = buildMat( 1, 1, [ [ 1, 1, 3.0 ] ] );
	var B = buildMat( 1, 1, [ [ 1, 1, 2.0 ] ] );
	var VL = buildMat( 1, 1, [ [ 1, 1, 1.0 ] ] );
	var VR = buildMat( 1, 1, [ [ 1, 1, 1.0 ] ] );
	runCase( 'n1_both_all', 'both', 'all', 1, A, B, VL, VR, null );
});

test( 'dtgsna: n3_eig_all (N=3, eigenvalues, all)', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	runCase( 'n3_eig_all', 'eigenvalues', 'all', 3, A, B, VL, VR, null );
});

test( 'dtgsna: n3_vec_all (N=3, eigenvectors, all)', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	runCase( 'n3_vec_all', 'eigenvectors', 'all', 3, A, B, VL, VR, null );
});

test( 'dtgsna: n3_both_all', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	runCase( 'n3_both_all', 'both', 'all', 3, A, B, VL, VR, null );
});

test( 'dtgsna: n3_both_selected (selected=1,3)', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var SEL = new Uint8Array( 3 );
	SEL[ 0 ] = 1;
	SEL[ 2 ] = 1;
	runCase( 'n3_both_selected', 'both', 'selected', 3, A, B, VL, VR, SEL );
});

test( 'dtgsna: n0 (N=0 quick return)', function t() {
	var A = new Float64Array( 1 );
	var B = new Float64Array( 1 );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	runCase( 'n0', 'both', 'all', 0, A, B, VL, VR, null );
});

test( 'dtgsna: n2_diag_both (N=2, both, all)', function t() {
	var A = buildMat( 2, 2, [ [ 1, 1, 2 ], [ 2, 2, 5 ] ] );
	var B = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var VL = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var VR = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	runCase( 'n2_diag_both', 'both', 'all', 2, A, B, VL, VR, null );
});

test( 'dtgsna: throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		dtgsna( 'bogus', 'all', new Uint8Array( 1 ), 1, 0, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 0,
			new Float64Array( 1 ), 1, 0,
			0, new Int32Array( 1 ), new Float64Array( 1 ), 1, 0, 1,
			new Int32Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dtgsna: throws TypeError for invalid howmny', function t() {
	assert.throws( function throws() {
		dtgsna( 'both', 'bogus', new Uint8Array( 1 ), 1, 0, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 0,
			new Float64Array( 1 ), 1, 0,
			0, new Int32Array( 1 ), new Float64Array( 1 ), 1, 0, 1,
			new Int32Array( 1 ), 1, 0 );
	}, TypeError );
});

test( 'dtgsna: lwork=-1 query mode returns 0 and lwmin', function t() {
	var A = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var B = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var VL = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var VR = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var s = new Float64Array( 2 );
	var DIF = new Float64Array( 2 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 50 );
	var IWORK = new Int32Array( 10 );
	var sel = new Uint8Array( 2 );
	var info = dtgsna( 'both', 'all', sel, 1, 0, 2,
		A, 1, 2, 0, B, 1, 2, 0, VL, 1, 2, 0, VR, 1, 2, 0,
		s, 1, 0, DIF, 1, 0, 2, M, WORK, 1, 0, -1, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.ok( WORK[ 0 ] > 0, 'lwmin written to WORK[0]' );
});

test( 'dtgsna: insufficient lwork returns -18', function t() {
	var A = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var B = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var VL = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var VR = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var s = new Float64Array( 2 );
	var DIF = new Float64Array( 2 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 50 );
	var IWORK = new Int32Array( 10 );
	var sel = new Uint8Array( 2 );

	// Lwmin for N=2,both = 2*2*4+16 = 32; pass 1
	var info = dtgsna( 'both', 'all', sel, 1, 0, 2,
		A, 1, 2, 0, B, 1, 2, 0, VL, 1, 2, 0, VR, 1, 2, 0,
		s, 1, 0, DIF, 1, 0, 2, M, WORK, 1, 0, 1, IWORK, 1, 0 );
	assert.equal( info, -18, 'info' );
});

test( 'dtgsna: insufficient mm returns -15 (selected, mm<m)', function t() {
	var A = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var B = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 2 ] ] );
	var VL = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var VR = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var s = new Float64Array( 2 );
	var DIF = new Float64Array( 2 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 100 );
	var IWORK = new Int32Array( 10 );
	var sel = new Uint8Array( [ 1, 1 ] );

	// mm=1 < m=2 selected
	var info = dtgsna( 'both', 'selected', sel, 1, 0, 2,
		A, 1, 2, 0, B, 1, 2, 0, VL, 1, 2, 0, VR, 1, 2, 0,
		s, 1, 0, DIF, 1, 0, 1, M, WORK, 1, 0, 100, IWORK, 1, 0 );
	assert.equal( info, -15, 'info' );
});

test( 'dtgsna: complex eigenvalue pair (2x2 block), eigenvalues path', function t() {
	// A is a 2x2 real-Schur block with complex eigenvalues; B identity-like
	// Eigenvalues of (A,B) with complex pair: A[0,1]=1, A[1,0]=-1 produces ±i
	var A = buildMat( 2, 2, [ [ 1, 1, 0 ], [ 1, 2, 1 ], [ 2, 1, -1 ], [ 2, 2, 0 ] ] );
	var B = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var VL = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var VR = buildMat( 2, 2, [ [ 1, 1, 1 ], [ 2, 2, 1 ] ] );
	var s = new Float64Array( 2 );
	var DIF = new Float64Array( 2 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 200 );
	var IWORK = new Int32Array( 30 );
	var sel = new Uint8Array( 2 );
	var info = dtgsna( 'eigenvalues', 'all', sel, 1, 0, 2,
		A, 1, 2, 0, B, 1, 2, 0, VL, 1, 2, 0, VR, 1, 2, 0,
		s, 1, 0, DIF, 1, 0, 2, M, WORK, 1, 0, 200, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 2, 'M' );

	// s[0] and s[1] should be equal for the complex pair, finite, positive
	assert.ok( isFinite( s[ 0 ] ) && s[ 0 ] > 0, 's[0] valid' );
	assert.equal( s[ 0 ], s[ 1 ], 's[0] == s[1] for complex pair' );
});

test( 'dtgsna: complex eigenvalue pair, eigenvectors path with dtgsyl', function t() {
	// A 3x3 with a 2x2 complex block at top, 1x1 real at bottom
	var A = buildMat( 3, 3, [
		[ 1, 1, 0 ], [ 1, 2, 1 ], [ 1, 3, 0.1 ],
		[ 2, 1, -1 ], [ 2, 2, 0 ], [ 2, 3, 0.2 ],
		[ 3, 3, 2 ]
	]);
	var B = buildMat( 3, 3, [
		[ 1, 1, 1 ], [ 1, 3, 0.05 ],
		[ 2, 2, 1 ], [ 2, 3, 0.1 ],
		[ 3, 3, 1.5 ]
	]);
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var s = new Float64Array( 3 );
	var DIF = new Float64Array( 3 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 500 );
	var IWORK = new Int32Array( 60 );
	var sel = new Uint8Array( 3 );
	var info = dtgsna( 'eigenvectors', 'all', sel, 1, 0, 3,
		A, 1, 3, 0, B, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0,
		s, 1, 0, DIF, 1, 0, 3, M, WORK, 1, 0, 500, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 3, 'M' );

	// All DIF values should be finite, non-negative
	assert.ok( isFinite( DIF[ 0 ] ) && DIF[ 0 ] >= 0, 'DIF[0] valid' );
	assert.equal( DIF[ 0 ], DIF[ 1 ], 'DIF[0]==DIF[1] for complex pair' );
	assert.ok( isFinite( DIF[ 2 ] ) && DIF[ 2 ] >= 0, 'DIF[2] valid' );
});

test( 'dtgsna: complex pair selected (somcon + pair both selected)', function t() {
	// Tests SELECT[k] || SELECT[k+1] branch in complex pair path
	var A = buildMat( 3, 3, [
		[ 1, 1, 0 ], [ 1, 2, 1 ], [ 1, 3, 0.1 ],
		[ 2, 1, -1 ], [ 2, 2, 0 ], [ 2, 3, 0.2 ],
		[ 3, 3, 2 ]
	]);
	var B = buildMat( 3, 3, [
		[ 1, 1, 1 ], [ 1, 3, 0.05 ],
		[ 2, 2, 1 ], [ 2, 3, 0.1 ],
		[ 3, 3, 1.5 ]
	]);
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var s = new Float64Array( 3 );
	var DIF = new Float64Array( 3 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 500 );
	var IWORK = new Int32Array( 60 );
	var sel = new Uint8Array( [ 1, 0, 0 ] ); // first of pair selected
	var info = dtgsna( 'both', 'selected', sel, 1, 0, 3,
		A, 1, 3, 0, B, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0,
		s, 1, 0, DIF, 1, 0, 3, M, WORK, 1, 0, 500, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 2, 'pair counts as 2' );
});

test( 'dtgsna: complex pair NOT selected (skip path, somcon + pair)', function t() {
	// Tests "if (!SELECT[k] && !SELECT[k+1]) continue" in pair path
	var A = buildMat( 3, 3, [
		[ 1, 1, 0 ], [ 1, 2, 1 ], [ 1, 3, 0.1 ],
		[ 2, 1, -1 ], [ 2, 2, 0 ], [ 2, 3, 0.2 ],
		[ 3, 3, 2 ]
	]);
	var B = buildMat( 3, 3, [
		[ 1, 1, 1 ], [ 1, 3, 0.05 ],
		[ 2, 2, 1 ], [ 2, 3, 0.1 ],
		[ 3, 3, 1.5 ]
	]);
	var VL = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var VR = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 2, 2, 1 ], [ 3, 3, 1 ] ] );
	var s = new Float64Array( 3 );
	var DIF = new Float64Array( 3 );
	var M = new Int32Array( 1 );
	var WORK = new Float64Array( 500 );
	var IWORK = new Int32Array( 60 );
	var sel = new Uint8Array( [ 0, 0, 1 ] ); // skip pair, only third
	var info = dtgsna( 'both', 'selected', sel, 1, 0, 3,
		A, 1, 3, 0, B, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0,
		s, 1, 0, DIF, 1, 0, 3, M, WORK, 1, 0, 500, IWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 1, 'only the real eigenvalue is counted' );
});

test( 'dtgsna: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgsna( 'both', 'all', new Uint8Array( 1 ), 1, 0, -1,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 1, 0,
			new Float64Array( 1 ), 1, 0,
			new Float64Array( 1 ), 1, 0,
			0, new Int32Array( 1 ), new Float64Array( 1 ), 1, 0, 1,
			new Int32Array( 1 ), 1, 0 );
	}, RangeError );
});
