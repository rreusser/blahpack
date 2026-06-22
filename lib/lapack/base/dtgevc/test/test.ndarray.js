/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import dtgevc from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dtgevc.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


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
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Extract the NxM submatrix from column-major storage.
*/
function submatrix( A, LDA, N, M ) {
	var out = [];
	var i;
	var j;
	for ( j = 0; j < M; j++ ) {
		for ( i = 0; i < N; i++ ) {
			out.push( A[ i + j * LDA ] );
		}
	}
	return out;
}


// TESTS //

test( 'dtgevc: right all 4x4', function t() {
	var tc = findCase( 'right all 4x4' );
	var N = 4;
	var S = new Float64Array( tc.S );
	var P = new Float64Array( tc.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	info = dtgevc( 'right', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
});

test( 'dtgevc: left all 4x4', function t() {
	var tc = findCase( 'left all 4x4' );
	var tcInput = findCase( 'right all 4x4' );
	var N = 4;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	info = dtgevc( 'left', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 4x4', function t() {
	var tc = findCase( 'both all 4x4' );
	var tcInput = findCase( 'right all 4x4' );
	var N = 4;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: right selected 4x4', function t() {
	var tc = findCase( 'right selected 4x4' );
	var tcInput = findCase( 'right all 4x4' );
	var N = 4;
	var M = tc.M;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	// Select eigenvalue 1 and eigenvalue 3 (complex pair)
	SELECT[ 0 ] = 1.0;
	SELECT[ 2 ] = 1.0;
	info = dtgevc( 'right', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, M ), tc.VR, 1e-10, 'VR' );
});

test( 'dtgevc: both all 3x3 real', function t() {
	var tc = findCase( 'both all 3x3 real' );
	var N = 3;
	var S = new Float64Array( tc.S );
	var P = new Float64Array( tc.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 2x2 complex', function t() {
	var tc = findCase( 'both all 2x2 complex' );
	var N = 2;
	var S = new Float64Array( tc.S );
	var P = new Float64Array( tc.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: left selected eig2 4x4', function t() {
	var tc = findCase( 'left selected eig2 4x4' );
	var tcInput = findCase( 'right all 4x4' );
	var N = 4;
	var M = tc.M;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	// Select only eigenvalue 2
	SELECT[ 1 ] = 1.0;
	info = dtgevc( 'left', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, M ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 1x1', function t() {
	var tc = findCase( 'both all 1x1' );
	var N = 1;
	var S = new Float64Array( [ 5.0 ] );
	var P = new Float64Array( [ 2.0 ] );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var WORK = new Float64Array( 6 );
	var SELECT = new Float64Array( 1 );
	var info;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, 1, 0, P, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( VR ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( Array.from( VL ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: right backtransform 4x4', function t() {
	var tc = findCase( 'right backtransform 4x4' );
	var tcInput = findCase( 'right all 4x4' );
	var N = 4;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;
	var i;

	// Set VR to identity
	for ( i = 0; i < N; i++ ) {
		VR[ i + i * N ] = 1.0;
	}
	info = dtgevc( 'right', 'backtransform', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
});

test( 'dtgevc: left backtransform 4x4', function t() {
	var tc = findCase( 'left backtransform 4x4' );
	var tcInput = findCase( 'right all 4x4' );
	var N = 4;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;
	var i;

	// Set VL to identity
	for ( i = 0; i < N; i++ ) {
		VL[ i + i * N ] = 1.0;
	}
	info = dtgevc( 'left', 'backtransform', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: N=0 returns immediately', function t() {
	var WORK = new Float64Array( 6 );
	var SELECT = new Float64Array( 1 );
	var S = new Float64Array( 1 );
	var P = new Float64Array( 1 );
	var VL = new Float64Array( 1 );
	var VR = new Float64Array( 1 );
	var info;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, 0, S, 1, 1, 0, P, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, 0, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'dtgevc: both all 4x4 cpx top', function t() {
	var tc = findCase( 'both all 4x4 cpx top' );
	var N = 4;
	var S = new Float64Array( tc.S );
	var P = new Float64Array( tc.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all 5x5 cpx mid', function t() {
	var tc = findCase( 'both all 5x5 cpx mid' );
	var tcCpxTop = findCase( 'both all 4x4 cpx top' );
	var N = 5;
	// Build 5x5 S and P manually from fixture
	var S = new Float64Array( N * N );
	var P = new Float64Array( N * N );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	// S matrix (column-major)
	S[ 0 + 0 * N ] = 1.0; S[ 0 + 1 * N ] = 0.5; S[ 0 + 2 * N ] = 0.2; S[ 0 + 3 * N ] = 0.1; S[ 0 + 4 * N ] = 0.05;
	S[ 1 + 1 * N ] = 3.0; S[ 1 + 2 * N ] = -1.5;
	S[ 2 + 1 * N ] = 2.0; S[ 2 + 2 * N ] = 3.0;
	S[ 1 + 3 * N ] = 0.3; S[ 1 + 4 * N ] = 0.15;
	S[ 2 + 3 * N ] = 0.2; S[ 2 + 4 * N ] = 0.1;
	S[ 3 + 3 * N ] = 6.0; S[ 3 + 4 * N ] = 0.4;
	S[ 4 + 4 * N ] = 8.0;
	// P matrix
	P[ 0 + 0 * N ] = 1.0; P[ 0 + 1 * N ] = 0.1; P[ 0 + 2 * N ] = 0.05; P[ 0 + 3 * N ] = 0.02; P[ 0 + 4 * N ] = 0.01;
	P[ 1 + 1 * N ] = 1.0; P[ 1 + 2 * N ] = 0.0; P[ 1 + 3 * N ] = 0.1; P[ 1 + 4 * N ] = 0.05;
	P[ 2 + 2 * N ] = 1.0; P[ 2 + 3 * N ] = 0.08; P[ 2 + 4 * N ] = 0.04;
	P[ 3 + 3 * N ] = 1.0; P[ 3 + 4 * N ] = 0.1;
	P[ 4 + 4 * N ] = 1.0;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: both all degenerate', function t() {
	var tc = findCase( 'both all degenerate' );
	var N = 3;
	var S = new Float64Array( N * N );
	var P = new Float64Array( N * N );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	// S: near-zero (1,1), rest normal
	S[ 0 + 0 * N ] = 1e-320; S[ 0 + 1 * N ] = 0.5; S[ 0 + 2 * N ] = 0.2;
	S[ 1 + 1 * N ] = 2.0; S[ 1 + 2 * N ] = 0.3;
	S[ 2 + 2 * N ] = 3.0;
	P[ 0 + 0 * N ] = 1e-320; P[ 0 + 1 * N ] = 0.1; P[ 0 + 2 * N ] = 0.05;
	P[ 1 + 1 * N ] = 1.0; P[ 1 + 2 * N ] = 0.1;
	P[ 2 + 2 * N ] = 1.0;

	info = dtgevc( 'both', 'all', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VR, N, N, N ), tc.VR, 1e-10, 'VR' );
	assertArrayClose( submatrix( VL, N, N, N ), tc.VL, 1e-10, 'VL' );
});

test( 'dtgevc: left sel cpx top 4x4', function t() {
	var tc = findCase( 'left sel cpx top 4x4' );
	var tcInput = findCase( 'both all 4x4 cpx top' );
	var N = 4;
	var M = tc.M;
	var S = new Float64Array( tcInput.S );
	var P = new Float64Array( tcInput.P );
	var VL = new Float64Array( N * N );
	var VR = new Float64Array( N * N );
	var WORK = new Float64Array( 6 * N );
	var SELECT = new Float64Array( N );
	var info;

	SELECT[ 0 ] = 1.0;
	info = dtgevc( 'left', 'selected', SELECT, 1, 0, N, S, 1, N, 0, P, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, N, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( submatrix( VL, N, N, M ), tc.VL, 1e-10, 'VL' );
});
