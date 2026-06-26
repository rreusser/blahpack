/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaein from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlaein.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// CONSTANTS //

var UNFL = 2.2250738585072014e-308;
var ULP = 1.1102230246251565e-16;


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function dlanhsInf( n, H, sh1, sh2, oH ) {
	var s;
	var i;
	var j;
	var imax;
	var vmax = 0.0;
	for ( i = 0; i < n; i++ ) {
		s = 0.0;
		imax = i - 1;
		if ( imax < 0 ) {
			imax = 0;
		}
		for ( j = imax; j < n; j++ ) {
			s += Math.abs( H[ oH + ( i * sh1 ) + ( j * sh2 ) ] );
		}
		if ( s > vmax ) {
			vmax = s;
		}
	}
	return vmax;
}

function machineConsts( n, hnorm ) {
	var smlnum = UNFL * ( n / ULP );
	var bignum = ( 1.0 - ULP ) / smlnum;
	var eps3 = hnorm * ULP;
	if ( eps3 < smlnum ) {
		eps3 = smlnum;
	}
	return { 'eps3': eps3, 'smlnum': smlnum, 'bignum': bignum };
}

// Run with offsets: pack H into buffer starting at offsetH with given strides.
function run( rightv, noinit, n, Hdata, wr, wi, vrInit, viInit, useOffsets ) {
	var ldh = n;
	var ldb = n + 1;
	var oH;
	var oVR;
	var oVI;
	var oB;
	var oWK;
	var H;
	var VR;
	var VI;
	var B;
	var WORK;
	var sh1;
	var sh2;
	var sb1;
	var sb2;
	var sVR;
	var sVI;
	var sWK;
	var hnorm;
	var consts;
	var info;
	var i;
	var j;

	if ( useOffsets ) {
		// Offset storage with stride-2 vectors and column-major matrices.
		oH = 3;
		oVR = 2;
		oVI = 2;
		oB = 5;
		oWK = 1;
		sh1 = 1;
		sh2 = ldh;
		sb1 = 1;
		sb2 = ldb;
		sVR = 2;
		sVI = 2;
		sWK = 1;
		H = new Float64Array( oH + ( ldh * n ) );
		VR = new Float64Array( oVR + ( sVR * n ) );
		VI = new Float64Array( oVI + ( sVI * n ) );
		B = new Float64Array( oB + ( ldb * n ) );
		WORK = new Float64Array( oWK + ( sWK * n ) );
	} else {
		// Row-major layout via base strides.
		oH = 0;
		oVR = 0;
		oVI = 0;
		oB = 0;
		oWK = 0;
		sh1 = ldh;
		sh2 = 1;
		sb1 = ldb;
		sb2 = 1;
		sVR = 1;
		sVI = 1;
		sWK = 1;
		H = new Float64Array( ldh * n );
		VR = new Float64Array( n );
		VI = new Float64Array( n );
		B = new Float64Array( ldb * n );
		WORK = new Float64Array( n );
	}

	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			H[ oH + ( i * sh1 ) + ( j * sh2 ) ] = Hdata[ i ][ j ];
		}
	}

	if ( vrInit ) {
		for ( i = 0; i < n; i++ ) {
			VR[ oVR + ( i * sVR ) ] = vrInit[ i ];
		}
	}
	if ( viInit ) {
		for ( i = 0; i < n; i++ ) {
			VI[ oVI + ( i * sVI ) ] = viInit[ i ];
		}
	}

	hnorm = dlanhsInf( n, H, sh1, sh2, oH );
	consts = machineConsts( n, hnorm );

	info = dlaein(
		rightv, noinit, n,
		H, sh1, sh2, oH,
		wr, wi,
		VR, sVR, oVR,
		VI, sVI, oVI,
		B, sb1, sb2, oB,
		WORK, sWK, oWK,
		consts.eps3, consts.smlnum, consts.bignum
	);

	// Extract VR/VI at their strides/offsets.
	var vrOut = new Float64Array( n );
	var viOut = new Float64Array( n );
	for ( i = 0; i < n; i++ ) {
		vrOut[ i ] = VR[ oVR + ( i * sVR ) ];
		viOut[ i ] = VI[ oVI + ( i * sVI ) ];
	}
	return { 'info': info, 'vr': vrOut, 'vi': viOut };
}


// DATA //

var H4 = [
	[ 4.0, 3.0, 2.0, 1.0 ],
	[ 1.0, 4.0, 3.0, 2.0 ],
	[ 0.0, 1.0, 4.0, 3.0 ],
	[ 0.0, 0.0, 1.0, 4.0 ]
];
var Hone = [ [ 3.5 ] ];


// TESTS //

test( 'ndarray export is a function', function t() {
	assert.strictEqual( typeof dlaein, 'function' );
});

test( 'ndarray dlaein: right_real_noinit_4x4 (row-major, no offset)', function t() {
	var tc = findCase( 'right_real_noinit_4x4' );
	var r = run( true, true, 4, H4, 4.0, 0.0, null, null, false );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: right_real_noinit_4x4 (offset, stride 2)', function t() {
	var tc = findCase( 'right_real_noinit_4x4' );
	var r = run( true, true, 4, H4, 4.0, 0.0, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: left_real_noinit_4x4 (row-major)', function t() {
	var tc = findCase( 'left_real_noinit_4x4' );
	var r = run( false, true, 4, H4, 4.0, 0.0, null, null, false );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: left_real_noinit_4x4 (offset, stride 2)', function t() {
	var tc = findCase( 'left_real_noinit_4x4' );
	var r = run( false, true, 4, H4, 4.0, 0.0, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});

test( 'ndarray dlaein: n1', function t() {
	var tc = findCase( 'n1' );
	var r = run( true, true, 1, Hone, 3.5, 0.0, null, null, true );
	assert.equal( r.info, tc.info, 'info' );
	assertArrayClose( Array.from( r.vr ), tc.vr, 1e-12, 'vr' );
});
