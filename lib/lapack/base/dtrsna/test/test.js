/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-var */


// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrsna from './../lib/base.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dtrsna.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
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
		return fixture.find( function find( tc ) { return tc.name === name;
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
* buildMat.
*
* @private
* @param {*} rows - rows
* @param {*} ld - ld
* @param {*} N - N
* @returns {*} result
*/
function buildMat( rows, ld, N ) {
	var out = new Float64Array( ld * N );
	var i;
	var j;
	for ( i = 0; i < rows.length; i++ ) {
		for ( j = 0; j < rows[ i ].length; j++ ) {
			out[ i + ( j * ld ) ] = rows[ i ][ j ];
		}
	}
	return out;
}

/**
* run.
*
* @private
* @param {*} job - job
* @param {*} howmny - howmny
* @param {*} N - N
* @param {*} Trows - Trows
* @param {*} VLrows - VLrows
* @param {*} VRrows - VRrows
* @param {*} select - select
* @param {*} mm - mm
* @param {*} ldwork - ldwork
* @returns {*} result
*/
function run( job, howmny, N, Trows, VLrows, VRrows, select, mm, ldwork ) {
	var ld = Math.max( N, 1 );
	var lw = Math.max( ldwork, 1 );
	var T = buildMat( Trows, ld, N );
	var VL = buildMat( VLrows, ld, N );
	var VR = buildMat( VRrows, ld, N );
	var SELECT = new Uint8Array( Math.max( N, 1 ) );
	var s = new Float64Array( mm );
	var SEP = new Float64Array( mm );
	var WORK = new Float64Array( lw * Math.max( N + 6, 1 ) );
	var IWORK = new Int32Array( Math.max( 2 * N, 1 ) );
	var i;
	for ( i = 0; i < select.length; i++ ) {
		SELECT[ i ] = ( select[ i ] ) ? 1 : 0;
	}
	var res = dtrsna( job, howmny, SELECT, 1, 0, N, T, 1, ld, 0, VL, 1, ld, 0, VR, 1, ld, 0, s, 1, 0, SEP, 1, 0, mm, WORK, 1, lw, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
	return { 'res': res, 's': s, 'SEP': SEP };
}


// TESTS //

test( 'dtrsna: n1_both', function t() {
	var tc = findCase( 'n1_both' );
	var r = run( 'both', 'all', 1, [ [ 5.0 ] ], [ [ 1.0 ] ], [ [ 1.0 ] ], [ true ], 5, 5 ); // eslint-disable-line max-len
	assert.equal( r.res.info, tc.INFO );
	assert.equal( r.res.m, tc.M );
	assertClose( r.s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( r.SEP[ 0 ], tc.SEP1, 1e-13, 'SEP1' );
});

test( 'dtrsna: n3_diag_job_E_all', function t() {
	var tc = findCase( 'n3_diag_job_E_all' );
	var r = run( 'eigenvalues', 'all', 3, [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 2.0, 0.0 ],
		[ 0.0, 0.0, 4.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	], [ true, true, true ], 5, 5 );
	assert.equal( r.res.info, tc.INFO );
	assert.equal( r.res.m, tc.M );
	assertClose( r.s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( r.s[ 1 ], tc.S2, 1e-13, 'S2' );
	assertClose( r.s[ 2 ], tc.S3, 1e-13, 'S3' );
});

test( 'dtrsna: n3_diag_job_V_all', function t() {
	var tc = findCase( 'n3_diag_job_V_all' );
	var r = run( 'eigenvectors', 'all', 3, [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 2.0, 0.0 ],
		[ 0.0, 0.0, 4.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	], [ true, true, true ], 5, 5 );
	assert.equal( r.res.info, tc.INFO );
	assertClose( r.SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( r.SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
	assertClose( r.SEP[ 2 ], tc.SEP3, 1e-12, 'SEP3' );
});

test( 'dtrsna: n3_diag_job_B_all', function t() {
	var tc = findCase( 'n3_diag_job_B_all' );
	var r = run( 'both', 'all', 3, [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 2.0, 0.0 ],
		[ 0.0, 0.0, 4.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 1.0, 0.0 ],
		[ 0.0, 0.0, 1.0 ]
	], [ true, true, true ], 5, 5 );
	assert.equal( r.res.info, tc.INFO );
	assertClose( r.s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( r.s[ 1 ], tc.S2, 1e-13, 'S2' );
	assertClose( r.s[ 2 ], tc.S3, 1e-13, 'S3' );
	assertClose( r.SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( r.SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
	assertClose( r.SEP[ 2 ], tc.SEP3, 1e-12, 'SEP3' );
});

test( 'dtrsna: n3_triangular_job_B', function t() {
	var tc = findCase( 'n3_triangular_job_B' );
	var r = run( 'both', 'all', 3, [
		[ 1.0, 0.5, 0.25 ],
		[ 0.0, 2.0, 0.5 ],
		[ 0.0, 0.0, 4.0 ]
	], [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 0.9701425001453319, 0.0 ],
		[ 0.0, -0.24253562503633297, 1.0 ]
	], [
		[ 1.0, 0.4472135954999579, 0.12038585308576454 ],
		[ 0.0, 0.8944271909999159, 0.24077170617152908 ],
		[ 0.0, 0.0, 0.9630868246861164 ]
	], [ true, true, true ], 5, 5 );
	assert.equal( r.res.info, tc.INFO );
	assertClose( r.s[ 0 ], tc.S1, 1e-12, 'S1' );
	assertClose( r.s[ 1 ], tc.S2, 1e-12, 'S2' );
	assertClose( r.s[ 2 ], tc.S3, 1e-12, 'S3' );
	assertClose( r.SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( r.SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
	assertClose( r.SEP[ 2 ], tc.SEP3, 1e-12, 'SEP3' );
});

test( 'dtrsna: n3_diag_selected_k2', function t() {
	var tc = findCase( 'n3_diag_selected_k2' );
	var r = run( 'both', 'selected', 3, [
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 2.0, 0.0 ],
		[ 0.0, 0.0, 4.0 ]
	], [
		[ 0.0, 0.0, 0.0 ],
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0 ]
	], [
		[ 0.0, 0.0, 0.0 ],
		[ 1.0, 0.0, 0.0 ],
		[ 0.0, 0.0, 0.0 ]
	], [ false, true, false ], 5, 5 );
	assert.equal( r.res.info, tc.INFO );
	assert.equal( r.res.m, tc.M );
	assertClose( r.s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( r.SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
});

test( 'dtrsna: n2_complex_pair', function t() {
	var tc = findCase( 'n2_complex_pair' );
	var r = run( 'both', 'all', 2, [
		[ 0.0, -1.0 ],
		[ 1.0, 0.0 ]
	], [
		[ 1.0, 0.0 ],
		[ 0.0, 1.0 ]
	], [
		[ 1.0, 0.0 ],
		[ 0.0, 1.0 ]
	], [ true, true ], 5, 5 );
	assert.equal( r.res.info, tc.INFO );
	assert.equal( r.res.m, tc.M );
	assertClose( r.s[ 0 ], tc.S1, 1e-13, 'S1' );
	assertClose( r.s[ 1 ], tc.S2, 1e-13, 'S2' );
	assertClose( r.SEP[ 0 ], tc.SEP1, 1e-12, 'SEP1' );
	assertClose( r.SEP[ 1 ], tc.SEP2, 1e-12, 'SEP2' );
});
