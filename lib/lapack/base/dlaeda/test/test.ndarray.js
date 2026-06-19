/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

'use strict';

// MODULES //

var test = require( 'node:test' );
var assert = require( 'node:assert/strict' );
var readFileSync = require( 'fs' ).readFileSync;
var path = require( 'path' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlaeda = require( './../lib/ndarray.js' );


// FIXTURES //

var fixtureDir = path.join( __dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'dlaeda.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( relErr <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

test( 'dlaeda: basic_curlvl1_n4 (single-level, CURPBM=0)', function t() {
	var tc = findCase( 'basic_curlvl1_n4' );
	var QPTR = new Int32Array( [ 1, 5, 9 ] );
	var q = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8 ] );
	var z = new Float64Array( 4 );
	var ztemp = new Float64Array( 4 );
	var prmptr = new Int32Array( 4 );
	var perm = new Int32Array( 4 );
	var givptr = new Int32Array( 4 );
	var givcol = new Int32Array( 2 * 4 );
	var givnum = new Float64Array( 2 * 4 );
	var info = dlaeda( 4, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-14, 'Z' );
});

test( 'dlaeda: single_level_n6_padded (zeros at start/end)', function t() {
	var tc = findCase( 'single_level_n6_padded' );
	var QPTR = new Int32Array( [ 1, 5, 9 ] );
	var q = new Float64Array( [ 10, 20, 30, 40, 50, 60, 70, 80 ] );
	var z = new Float64Array( 6 );
	var ztemp = new Float64Array( 6 );
	var prmptr = new Int32Array( 4 );
	var perm = new Int32Array( 4 );
	var givptr = new Int32Array( 4 );
	var givcol = new Int32Array( 2 * 4 );
	var givnum = new Float64Array( 2 * 4 );
	var info = dlaeda( 6, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-14, 'Z' );
});

test( 'dlaeda: single_level_curpbm1_n8 (CURPBM=1, 3x3 blocks)', function t() {
	var tc = findCase( 'single_level_curpbm1_n8' );
	// QPTR(3..5) are the relevant entries (1-based, slot for CURR=3).
	var QPTR = new Int32Array( [ 0, 0, 1, 10, 19 ] );
	var q = new Float64Array( [
		1, 2, 3, 4, 5, 6, 7, 8, 9,
		11, 12, 13, 14, 15, 16, 17, 18, 19
	] );
	var z = new Float64Array( 8 );
	var ztemp = new Float64Array( 8 );
	var prmptr = new Int32Array( 8 );
	var perm = new Int32Array( 8 );
	var givptr = new Int32Array( 8 );
	var givcol = new Int32Array( 2 * 8 );
	var givnum = new Float64Array( 2 * 8 );
	var info = dlaeda( 8, 2, 1, 1, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-14, 'Z' );
});

test( 'dlaeda: two_level_n8_identity (CURLVL=2, identity perm, no Givens)', function t() {
	var tc = findCase( 'two_level_n8_identity' );
	var QPTR = new Int32Array( [ 0, 1, 17, 33, 33, 37, 41 ] );
	var q = new Float64Array( 40 );
	fillBlock( q, 0, 4, 4, 0.0 );
	fillBlock( q, 16, 4, 4, 100.0 );
	// Inner block 1 (2x2 identity).
	q[ 32 ] = 1.0; q[ 33 ] = 0.0; q[ 34 ] = 0.0; q[ 35 ] = 1.0;
	// Inner block 2 (2x2 rotation).
	q[ 36 ] = 0.6; q[ 37 ] = 0.8; q[ 38 ] = -0.8; q[ 39 ] = 0.6;
	var z = new Float64Array( 8 );
	var ztemp = new Float64Array( 8 );
	var prmptr = new Int32Array( [ 0, 0, 0, 0, 1, 5, 9 ] );
	var perm = new Int32Array( [ 1, 2, 3, 4, 1, 2, 3, 4 ] );
	var givptr = new Int32Array( [ 0, 0, 0, 0, 1, 1, 1 ] );
	var givcol = new Int32Array( 2 * 8 );
	var givnum = new Float64Array( 2 * 8 );
	var info = dlaeda( 8, 2, 2, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-13, 'Z' );
});

test( 'dlaeda: two_level_n8_perm (non-trivial permutation)', function t() {
	var tc = findCase( 'two_level_n8_perm' );
	var QPTR = new Int32Array( [ 0, 1, 17, 33, 33, 37, 41 ] );
	var q = new Float64Array( 40 );
	fillBlock( q, 0, 4, 4, 0.0 );
	fillBlock( q, 16, 4, 4, 100.0 );
	q[ 32 ] = 1.0; q[ 33 ] = 0.0; q[ 34 ] = 0.0; q[ 35 ] = 1.0;
	q[ 36 ] = 0.6; q[ 37 ] = 0.8; q[ 38 ] = -0.8; q[ 39 ] = 0.6;
	var z = new Float64Array( 8 );
	var ztemp = new Float64Array( 8 );
	var prmptr = new Int32Array( [ 0, 0, 0, 0, 1, 5, 9 ] );
	var perm = new Int32Array( [ 4, 3, 2, 1, 4, 3, 2, 1 ] );
	var givptr = new Int32Array( [ 0, 0, 0, 0, 1, 1, 1 ] );
	var givcol = new Int32Array( 2 * 8 );
	var givnum = new Float64Array( 2 * 8 );
	var info = dlaeda( 8, 2, 2, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-13, 'Z' );
});

test( 'dlaeda: two_level_n8_givens (Givens applied on both halves)', function t() {
	var tc = findCase( 'two_level_n8_givens' );
	var QPTR = new Int32Array( [ 0, 1, 17, 33, 33, 37, 41 ] );
	var q = new Float64Array( 40 );
	fillBlock( q, 0, 4, 4, 0.0 );
	fillBlock( q, 16, 4, 4, 100.0 );
	q[ 32 ] = 1.0; q[ 33 ] = 0.0; q[ 34 ] = 0.0; q[ 35 ] = 1.0;
	q[ 36 ] = 0.6; q[ 37 ] = 0.8; q[ 38 ] = -0.8; q[ 39 ] = 0.6;
	var z = new Float64Array( 8 );
	var ztemp = new Float64Array( 8 );
	var prmptr = new Int32Array( [ 0, 0, 0, 0, 1, 5, 9 ] );
	var perm = new Int32Array( [ 1, 2, 3, 4, 1, 2, 3, 4 ] );
	var givptr = new Int32Array( [ 0, 0, 0, 0, 1, 2, 3 ] );
	// One rotation per half; GIVCOL is 2-by-* column-major.
	var givcol = new Int32Array( [
		1, 2,
		1, 2,
		0, 0
	] );
	var givnum = new Float64Array( [
		0.6, 0.8,
		0.6, 0.8,
		0.0, 0.0
	] );
	var info = dlaeda( 8, 2, 2, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, tc.INFO, 'INFO' );
	assertArrayClose( z, tc.Z, 1e-12, 'Z' );
});

test( 'dlaeda: N=0 quick return', function t() {
	var z = new Float64Array( 1 );
	var ztemp = new Float64Array( 1 );
	var info = dlaeda( 0, 1, 1, 0, new Int32Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Int32Array( 2 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, 0, 'INFO=0 for N=0' );
});

test( 'dlaeda: invalid N=-1 returns INFO=-1', function t() {
	var z = new Float64Array( 1 );
	var ztemp = new Float64Array( 1 );
	var info = dlaeda( -1, 1, 1, 0, new Int32Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Int32Array( 2 ), 1, 2, 0, new Float64Array( 2 ), 1, 2, 0, new Float64Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, z, 1, 0, ztemp, 1, 0 );
	assert.equal( info, -1, 'INFO=-1 for N<0' );
});


// FUNCTIONS //

/**
* Fill an m-by-n column-major block starting at q[start] with 10*(i+1)+(j+1)+off.
*
* @private
* @param {Float64Array} q - destination
* @param {NonNegativeInteger} start - starting index (0-based)
* @param {NonNegativeInteger} m - row count
* @param {NonNegativeInteger} n - column count
* @param {number} off - additive offset
*/
function fillBlock( q, start, m, n, off ) {
	var i;
	var j;
	var k;
	k = 0;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			q[ start + k ] = ( 10 * ( i + 1 ) ) + ( j + 1 ) + off;
			k += 1;
		}
	}
}
