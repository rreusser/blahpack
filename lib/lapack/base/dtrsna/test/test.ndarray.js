/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, vars-on-top, stdlib/vars-order, stdlib/empty-line-before-comment, stdlib/line-closing-bracket-spacing, stdlib/capitalized-comments, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrsna from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dtrsna.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( tc ) {
		return tc.name === name;
	} );
}

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function packCM( N, rows ) {
	var out = new Float64Array( N * N );
	var i;
	var j;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			out[ ( j * N ) + i ] = rows[ i ][ j ];
		}
	}
	return out;
}

function selFromBools( arr ) {
	var s = new Uint8Array( arr.length );
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		s[ i ] = ( arr[ i ] ) ? 1 : 0;
	}
	return s;
}

function runCM( job, howmny, N, T, VL, VR, SELECT, mm, s, SEP ) {
	var ld = Math.max( N, 1 );
	var lw = Math.max( N, 1 );
	var WORK = new Float64Array( lw * Math.max( N + 6, 1 ) );
	var IWORK = new Int32Array( Math.max( 2 * N, 1 ) );
	return dtrsna( job, howmny, SELECT, 1, 0, N, T, 1, ld, 0, VL, 1, ld, 0, VR, 1, ld, 0, s, 1, 0, SEP, 1, 0, mm, WORK, 1, lw, 0, IWORK, 1, 0 );
}

var EYE3 = [ [ 1.0, 0.0, 0.0 ], [ 0.0, 1.0, 0.0 ], [ 0.0, 0.0, 1.0 ] ];
var DIAG3 = [ [ 1.0, 0.0, 0.0 ], [ 0.0, 2.0, 0.0 ], [ 0.0, 0.0, 4.0 ] ];


// TESTS //

test( 'dtrsna: main export is a function', function t() {
	assert.strictEqual( typeof dtrsna, 'function', 'is a function' );
} );

test( 'dtrsna: n1_both job=both howmny=all', function t() {
	var tc = findCase( 'n1_both' );
	var T = new Float64Array( [ 5.0 ] );
	var VL = new Float64Array( [ 1.0 ] );
	var VR = new Float64Array( [ 1.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'all', 1, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO, 'info' );
	assert.equal( res.m, tc.M, 'm' );
	assertClose( s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( SEP[ 0 ], tc.SEP1, 1e-13, 'SEP1' );
} );

test( 'dtrsna: n1 job=eigenvalues howmny=all (skip wantsp branch)', function t() {
	var T = new Float64Array( [ 5.0 ] );
	var VL = new Float64Array( [ 1.0 ] );
	var VR = new Float64Array( [ 1.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'eigenvalues', 'all', 1, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, 0, 'info' );
	assertClose( s[ 0 ], 1.0, 1e-13, 'S' );
} );

test( 'dtrsna: n1 job=eigenvectors howmny=all (skip wants branch)', function t() {
	var T = new Float64Array( [ 5.0 ] );
	var VL = new Float64Array( [ 1.0 ] );
	var VR = new Float64Array( [ 1.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'eigenvectors', 'all', 1, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, 0, 'info' );
	assertClose( SEP[ 0 ], 5.0, 1e-13, 'SEP' );
} );

test( 'dtrsna: n1 howmny=selected, SELECT[0]=0 (early exit)', function t() {
	var T = new Float64Array( [ 5.0 ] );
	var VL = new Float64Array( [ 1.0 ] );
	var VR = new Float64Array( [ 1.0 ] );
	var SELECT = new Uint8Array( [ 0 ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'selected', 1, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm=0' );
} );

test( 'dtrsna: n0 quick return', function t() {
	var T = new Float64Array( 0 );
	var VL = new Float64Array( 0 );
	var VR = new Float64Array( 0 );
	var SELECT = new Uint8Array( 0 );
	var s = new Float64Array( 1 );
	var SEP = new Float64Array( 1 );
	var WORK = new Float64Array( 0 );
	var IWORK = new Int32Array( 0 );
	var res = dtrsna( 'both', 'all', SELECT, 1, 0, 0, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, WORK, 1, 1, 0, IWORK, 1, 0 );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 0, 'm' );
} );

test( 'dtrsna: n3_diag_job_E_all', function t() {
	var tc = findCase( 'n3_diag_job_E_all' );
	var T = packCM( 3, DIAG3 );
	var VL = packCM( 3, EYE3 );
	var VR = packCM( 3, EYE3 );
	var SELECT = selFromBools( [ true, true, true ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'eigenvalues', 'all', 3, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO );
	assert.equal( res.m, tc.M );
	assertClose( s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( s[ 1 ], tc.S2, 1e-13, 'S2' );
	assertClose( s[ 2 ], tc.S3, 1e-13, 'S3' );
} );

test( 'dtrsna: n3_diag_job_V_all', function t() {
	var tc = findCase( 'n3_diag_job_V_all' );
	var T = packCM( 3, DIAG3 );
	var VL = packCM( 3, EYE3 );
	var VR = packCM( 3, EYE3 );
	var SELECT = selFromBools( [ true, true, true ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'eigenvectors', 'all', 3, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO );
	assertClose( SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
	assertClose( SEP[ 2 ], tc.SEP3, 1e-12, 'SEP3' );
} );

test( 'dtrsna: n3_diag_job_B_all', function t() {
	var tc = findCase( 'n3_diag_job_B_all' );
	var T = packCM( 3, DIAG3 );
	var VL = packCM( 3, EYE3 );
	var VR = packCM( 3, EYE3 );
	var SELECT = selFromBools( [ true, true, true ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'all', 3, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO );
	assert.equal( res.m, tc.M );
	assertClose( s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( s[ 1 ], tc.S2, 1e-13, 'S2' );
	assertClose( s[ 2 ], tc.S3, 1e-13, 'S3' );
	assertClose( SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
	assertClose( SEP[ 2 ], tc.SEP3, 1e-12, 'SEP3' );
} );

test( 'dtrsna: n3_triangular_job_B (column-major)', function t() {
	var tc = findCase( 'n3_triangular_job_B' );
	var T = packCM( 3, [
		[ 1.0, 0.5, 0.25 ],
		[ 0.0, 2.0, 0.5 ],
		[ 0.0, 0.0, 4.0 ]
	] );
	var VL = packCM( 3, [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 0.9701425001453319, 0.0 ],
		[ 0.0, -0.24253562503633297, 1.0 ]
	] );
	var VR = packCM( 3, [
		[ 1.0, 0.4472135954999579, 0.12038585308576454 ],
		[ 0.0, 0.8944271909999159, 0.24077170617152908 ],
		[ 0.0, 0.0, 0.9630868246861164 ]
	] );
	var SELECT = selFromBools( [ true, true, true ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'all', 3, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO );
	assertClose( s[ 0 ], tc.S1, 1e-12, 'S1' );
	assertClose( s[ 1 ], tc.S2, 1e-12, 'S2' );
	assertClose( s[ 2 ], tc.S3, 1e-12, 'S3' );
	assertClose( SEP[ 0 ], tc.SEP1, 1e-10, 'SEP1' );
	assertClose( SEP[ 1 ], tc.SEP2, 1e-10, 'SEP2' );
	assertClose( SEP[ 2 ], tc.SEP3, 1e-10, 'SEP3' );
} );

test( 'dtrsna: n3_diag_selected_k2 howmny=selected', function t() {
	var tc = findCase( 'n3_diag_selected_k2' );
	var T = packCM( 3, DIAG3 );
	var VL = packCM( 3, [
		[ 0.0, 0.0, 0.0 ],
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0 ]
	] );
	var VR = packCM( 3, [
		[ 0.0, 0.0, 0.0 ],
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0 ]
	] );
	var SELECT = selFromBools( [ false, true, false ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'selected', 3, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO );
	assert.equal( res.m, tc.M );
	assertClose( s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
} );

test( 'dtrsna: n2_complex_pair (job=both, all)', function t() {
	var tc = findCase( 'n2_complex_pair' );
	var T = packCM( 2, [
		[ 0.0, -1.0 ],
		[ 1.0, 0.0 ]
	] );
	var VL = packCM( 2, [
		[ 1.0, 0.0 ],
		[ 0.0, 1.0 ]
	] );
	var VR = packCM( 2, [
		[ 1.0, 0.0 ],
		[ 0.0, 1.0 ]
	] );
	var SELECT = selFromBools( [ true, true ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'all', 2, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, tc.INFO );
	assert.equal( res.m, tc.M );
	assertClose( s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( s[ 1 ], tc.S2, 1e-13, 'S2' );
	assertClose( SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
} );

test( 'dtrsna: complex pair howmny=selected with both endpoints', function t() {
	var T = packCM( 2, [
		[ 0.0, -1.0 ],
		[ 1.0, 0.0 ]
	] );
	var VL = packCM( 2, [
		[ 1.0, 0.0 ],
		[ 0.0, 1.0 ]
	] );
	var VR = packCM( 2, [
		[ 1.0, 0.0 ],
		[ 0.0, 1.0 ]
	] );
	var SELECT = selFromBools( [ true, false ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'selected', 2, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 2, 'pair counted as 2' );
} );

test( 'dtrsna: complex pair howmny=selected, neither endpoint selected', function t() {
	// 3x3 matrix with a 2x2 complex pair in the trailing block; no selection
	// of those columns means the pair-skip branch in the main loop runs.
	var T = packCM( 3, [
		[ 1.0, 0.5, 0.25 ],
		[ 0.0, 0.0, -1.0 ],
		[ 0.0, 1.0, 0.0 ]
	] );
	var VL = packCM( 3, EYE3 );
	var VR = packCM( 3, EYE3 );
	var SELECT = selFromBools( [ true, false, false ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var res = runCM( 'both', 'selected', 3, T, VL, VR, SELECT, 5, s, SEP );
	assert.equal( res.info, 0, 'info' );
	assert.equal( res.m, 1, 'm=1 (only the leading 1x1 selected)' );
} );

test( 'dtrsna: invalid mm < 0 returns info=-13', function t() {
	var T = packCM( 3, DIAG3 );
	var VL = packCM( 3, EYE3 );
	var VR = packCM( 3, EYE3 );
	var SELECT = selFromBools( [ true, true, true ] );
	var s = new Float64Array( 5 );
	var SEP = new Float64Array( 5 );
	var WORK = new Float64Array( 3 * 9 );
	var IWORK = new Int32Array( 6 );
	var res = dtrsna( 'eigenvalues', 'all', SELECT, 1, 0, 3, T, 1, 3, 0, VL, 1, 3, 0, VR, 1, 3, 0, s, 1, 0, SEP, 1, 0, -1, WORK, 1, 3, 0, IWORK, 1, 0 );
	assert.equal( res.info, -13, 'returns -13 for invalid mm' );
} );
