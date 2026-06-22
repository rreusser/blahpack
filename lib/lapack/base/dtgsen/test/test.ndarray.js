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
import dtgsen from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dtgsen.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
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

function buildMat( N, ld, triplets ) {
	var a = new Float64Array( ld * N );
	var i;
	var t;
	for ( i = 0; i < triplets.length; i++ ) {
		t = triplets[ i ];
		a[ ( t[ 1 ] - 1 ) * ld + ( t[ 0 ] - 1 ) ] = t[ 2 ];
	}
	return a;
}

function identity( N ) {
	var a = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		a[ ( i * N ) + i ] = 1.0;
	}
	return a;
}

function makeSel( N, idxs ) {
	var s = new Uint8Array( N );
	var i;
	for ( i = 0; i < idxs.length; i++ ) {
		s[ idxs[ i ] - 1 ] = 1;
	}
	return s;
}

function runCase( name, ijob, N, A, B, Q, Z, SELECT ) {
	var ld = Math.max( N, 1 );
	var ALPHAR = new Float64Array( Math.max( N, 1 ) );
	var ALPHAI = new Float64Array( Math.max( N, 1 ) );
	var BETA = new Float64Array( Math.max( N, 1 ) );
	var M = new Int32Array( 1 );
	var pl = [ 0 ];
	var pr = [ 0 ];
	var DIF = new Float64Array( 2 );
	var WORK = new Float64Array( 500 );
	var IWORK = new Int32Array( 500 );
	var info;
	var tc;

	info = dtgsen( ijob, true, true, SELECT, 1, 0, N,
		A, 1, ld, 0,
		B, 1, ld, 0,
		ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0,
		Q, 1, ld, 0,
		Z, 1, ld, 0,
		M, pl, pr, DIF, 1, 0,
		WORK, 1, 0, 500, IWORK, 1, 0, 500 );

	tc = findCase( name );
	assert.equal( info, tc.info, name + ':info' );
	assert.equal( M[ 0 ], tc.M, name + ':M' );
	if ( tc.PL !== undefined ) {
		assertClose( pl[ 0 ], tc.PL, 1e-9, name + ':PL' );
	}
	if ( tc.PR !== undefined ) {
		assertClose( pr[ 0 ], tc.PR, 1e-9, name + ':PR' );
	}
	if ( tc.DIF ) {
		assertArrayClose( DIF, tc.DIF, 1e-9, name + ':DIF' );
	}
	if ( tc.ALPHAR ) {
		assertArrayClose( ALPHAR.slice( 0, tc.ALPHAR.length ), tc.ALPHAR, 1e-9, name + ':ALPHAR' );
	}
	if ( tc.ALPHAI ) {
		assertArrayClose( ALPHAI.slice( 0, tc.ALPHAI.length ), tc.ALPHAI, 1e-9, name + ':ALPHAI' );
	}
	if ( tc.BETA ) {
		assertArrayClose( BETA.slice( 0, tc.BETA.length ), tc.BETA, 1e-9, name + ':BETA' );
	}
}

function mkA4() {
	return buildMat( 4, 4, [
		[ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 1, 4, 0.2 ],
		[ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 2, 4, 0.1 ],
		[ 3, 3, 3 ], [ 3, 4, 0.6 ],
		[ 4, 4, 4 ]
	]);
}

function mkB4() {
	return buildMat( 4, 4, [
		[ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 1, 4, 0.05 ],
		[ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 2, 4, 0.15 ],
		[ 3, 3, 2 ], [ 3, 4, 0.4 ],
		[ 4, 4, 2.5 ]
	]);
}


// TESTS //

test( 'dtgsen: main export is a function', function t() {
	assert.strictEqual( typeof dtgsen, 'function', 'is a function' );
});

test( 'dtgsen: ijob0_select13', function t() {
	runCase( 'ijob0_select13', 0, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 3 ] ) );
});

test( 'dtgsen: ijob0_complex_pair (2x2 block)', function t() {
	var A = buildMat( 4, 4, [
		[ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 1, 4, 0.2 ],
		[ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 2, 4, 0.1 ],
		[ 3, 3, 4 ], [ 3, 4, 1.5 ],
		[ 4, 3, -1.5 ], [ 4, 4, 4 ]
	]);
	runCase( 'ijob0_complex_pair', 0, 4, A, mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 3, 4 ] ) );
});

test( 'dtgsen: ijob1_pl_pr', function t() {
	runCase( 'ijob1_pl_pr', 1, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: ijob4_dif_frobenius', function t() {
	runCase( 'ijob4_dif_frobenius', 4, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: ijob5_dif_onenorm', function t() {
	runCase( 'ijob5_dif_onenorm', 5, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: all_selected (M=N quick return, ijob=4)', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	runCase( 'all_selected', 4, 3, A, B, identity( 3 ), identity( 3 ), makeSel( 3, [ 1, 2, 3 ] ) );
});

test( 'dtgsen: none_selected (M=0 quick return, ijob=1)', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 2 ], [ 2, 3, 0.4 ], [ 3, 3, 3 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, 1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, 2 ] ] );
	runCase( 'none_selected', 1, 3, A, B, identity( 3 ), identity( 3 ), makeSel( 3, [] ) );
});

test( 'dtgsen: n1_trivial', function t() {
	var A = buildMat( 1, 1, [ [ 1, 1, 5 ] ] );
	var B = buildMat( 1, 1, [ [ 1, 1, 2 ] ] );
	runCase( 'n1_trivial', 0, 1, A, B, identity( 1 ), identity( 1 ), makeSel( 1, [ 1 ] ) );
});

test( 'dtgsen: ijob2_dif_frobenius', function t() {
	runCase( 'ijob2_dif_frobenius', 2, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1 ] ) );
});

test( 'dtgsen: ijob3_onenorm_plpr', function t() {
	runCase( 'ijob3_onenorm_plpr', 3, 4, mkA4(), mkB4(), identity( 4 ), identity( 4 ), makeSel( 4, [ 1, 2 ] ) );
});

test( 'dtgsen: negative_b_diag (sign-flip path)', function t() {
	var A = buildMat( 3, 3, [ [ 1, 1, 2 ], [ 1, 2, 0.5 ], [ 1, 3, 0.3 ], [ 2, 2, 3 ], [ 2, 3, 0.4 ], [ 3, 3, 1 ] ] );
	var B = buildMat( 3, 3, [ [ 1, 1, -1 ], [ 1, 2, 0.2 ], [ 1, 3, 0.1 ], [ 2, 2, 1.5 ], [ 2, 3, 0.3 ], [ 3, 3, -2 ] ] );
	runCase( 'negative_b_diag', 0, 3, A, B, identity( 3 ), identity( 3 ), makeSel( 3, [ 1 ] ) );
});

test( 'dtgsen: returns -1 for invalid ijob', function t() {
	var A = identity( 1 );
	var B = identity( 1 );
	var sel = new Uint8Array( 1 );
	var ALPHAR = new Float64Array( 1 );
	var ALPHAI = new Float64Array( 1 );
	var BETA = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var DIF = new Float64Array( 2 );
	var WORK = new Float64Array( 500 );
	var IWORK = new Int32Array( 500 );
	var rv = dtgsen( -1, true, true, sel, 1, 0, 1, A, 1, 1, 0, B, 1, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, identity( 1 ), 1, 1, 0, identity( 1 ), 1, 1, 0, M, [ 0 ], [ 0 ], DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 );
	assert.equal( rv, -1, 'returns -1' );
});

test( 'dtgsen: returns -5 for negative N', function t() {
	var A = identity( 1 );
	var B = identity( 1 );
	var sel = new Uint8Array( 1 );
	var ALPHAR = new Float64Array( 1 );
	var ALPHAI = new Float64Array( 1 );
	var BETA = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var DIF = new Float64Array( 2 );
	var WORK = new Float64Array( 500 );
	var IWORK = new Int32Array( 500 );
	var rv = dtgsen( 0, true, true, sel, 1, 0, -1, A, 1, 1, 0, B, 1, 1, 0, ALPHAR, 1, 0, ALPHAI, 1, 0, BETA, 1, 0, identity( 1 ), 1, 1, 0, identity( 1 ), 1, 1, 0, M, [ 0 ], [ 0 ], DIF, 1, 0, WORK, 1, 0, 500, IWORK, 1, 0, 500 );
	assert.equal( rv, -5, 'returns -5' );
});
