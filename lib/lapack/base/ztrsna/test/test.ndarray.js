/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, node/no-sync, vars-on-top, stdlib/vars-order, require-jsdoc, stdlib/jsdoc-private-annotation */

// MODULES //

import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Uint8Array from '@stdlib/array/uint8/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import ztrsna from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = fs.readFileSync( path.join( fixtureDir, 'ztrsna.jsonl' ), 'utf8' ).trim().split( '\n' );
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

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function cArray( floats ) {
	var arr = new Complex128Array( floats.length / 2 );
	var view = new Float64Array( arr.buffer );
	var i;
	for ( i = 0; i < floats.length; i++ ) {
		view[ i ] = floats[ i ];
	}
	return arr;
}

function toArray( ta ) {
	var out = [];
	var i;
	for ( i = 0; i < ta.length; i++ ) {
		out.push( ta[ i ] );
	}
	return out;
}


// TESTS //

test( 'ztrsna: main export is a function', function t() {
	assert.strictEqual( typeof ztrsna, 'function', 'is a function' );
} );

test( 'ztrsna: job=both howmny=all (4x4)', function t() {
	var tc = findCase( 'job=B howmny=A' );
	var N = 4;
	var T = cArray( tc.T );
	var VL = cArray( tc.VL );
	var VR = cArray( tc.VR );
	var SELECT = new Uint8Array( N );
	var s = new Float64Array( N );
	var SEP = new Float64Array( N );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( N * ( N + 1 ) );
	var RWORK = new Float64Array( N );
	var info = ztrsna( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( s ), tc.S, 1e-12, 'S' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-12, 'SEP' );
} );

test( 'ztrsna: job=eigenvalues howmny=all (4x4)', function t() {
	var tc = findCase( 'job=E howmny=A' );
	var tcFull = findCase( 'job=B howmny=A' );
	var N = 4;
	var T = cArray( tcFull.T );
	var VL = cArray( tcFull.VL );
	var VR = cArray( tcFull.VR );
	var SELECT = new Uint8Array( N );
	var s = new Float64Array( N );
	var SEP = new Float64Array( N );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( N * ( N + 1 ) );
	var RWORK = new Float64Array( N );
	var info = ztrsna( 'eigenvalues', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( s ), tc.S, 1e-12, 'S' );
} );

test( 'ztrsna: job=eigenvectors howmny=all (4x4)', function t() {
	var tc = findCase( 'job=V howmny=A' );
	var tcFull = findCase( 'job=B howmny=A' );
	var N = 4;
	var T = cArray( tcFull.T );
	var VL = cArray( tcFull.VL );
	var VR = cArray( tcFull.VR );
	var SELECT = new Uint8Array( N );
	var s = new Float64Array( N );
	var SEP = new Float64Array( N );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( N * ( N + 1 ) );
	var RWORK = new Float64Array( N );
	var info = ztrsna( 'eigenvectors', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-12, 'SEP' );
} );

test( 'ztrsna: job=both howmny=selected (sel=[1,0,1,0])', function t() {
	var tc = findCase( 'job=B howmny=S sel 1,3' );
	var tcFull = findCase( 'job=B howmny=A' );
	var N = 4;
	var T = cArray( tcFull.T );
	var VLfull = new Float64Array( tcFull.VL );
	var VRfull = new Float64Array( tcFull.VR );
	var VLpacked = new Float64Array( 2 * N * N );
	var VRpacked = new Float64Array( 2 * N * N );
	var i;
	for ( i = 0; i < 2 * N; i++ ) {
		VLpacked[ i ] = VLfull[ i ];
		VRpacked[ i ] = VRfull[ i ];
	}
	for ( i = 0; i < 2 * N; i++ ) {
		VLpacked[ ( 2 * N ) + i ] = VLfull[ ( 4 * N ) + i ];
		VRpacked[ ( 2 * N ) + i ] = VRfull[ ( 4 * N ) + i ];
	}
	var VL = new Complex128Array( VLpacked.buffer );
	var VR = new Complex128Array( VRpacked.buffer );
	var SELECT = new Uint8Array( [ 1, 0, 1, 0 ] );
	var s = new Float64Array( N );
	var SEP = new Float64Array( N );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( N * ( N + 1 ) );
	var RWORK = new Float64Array( N );
	var info = ztrsna( 'both', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( [ s[ 0 ], s[ 1 ] ], tc.S, 1e-12, 'S' );
	assertArrayClose( [ SEP[ 0 ], SEP[ 1 ] ], tc.SEP, 1e-12, 'SEP' );
} );

test( 'ztrsna: N=1 job=both', function t() {
	var tc = findCase( 'N=1 job=B' );
	var N = 1;
	var T = new Complex128Array( [ 3.5, -1.25 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 1 );
	var SEP = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = ztrsna( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( s ), tc.S, 1e-14, 'S' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-14, 'SEP' );
} );

test( 'ztrsna: N=1 howmny=selected with SELECT[0]=0 (early exit)', function t() {
	var N = 1;
	var T = new Complex128Array( [ 3.5, -1.25 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 0 ] );
	var s = new Float64Array( 1 );
	var SEP = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = ztrsna( 'both', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 0, 'm=0' );
} );

test( 'ztrsna: N=1 job=eigenvalues only (skip wantsp branch)', function t() {
	var N = 1;
	var T = new Complex128Array( [ 3.5, -1.25 ] );
	var VL = new Complex128Array( [ 1.0, 0.0 ] );
	var VR = new Complex128Array( [ 1.0, 0.0 ] );
	var SELECT = new Uint8Array( [ 1 ] );
	var s = new Float64Array( 1 );
	var SEP = new Float64Array( 1 );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( 2 );
	var RWORK = new Float64Array( 1 );
	var info = ztrsna( 'eigenvalues', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
	assertClose( s[ 0 ], 1.0, 1e-14, 'S' );
} );

test( 'ztrsna: N=0 quick return', function t() {
	var T = new Complex128Array( 0 );
	var VL = new Complex128Array( 0 );
	var VR = new Complex128Array( 0 );
	var SELECT = new Uint8Array( 0 );
	var s = new Float64Array( 0 );
	var SEP = new Float64Array( 0 );
	var M = new Int32Array( 1 );
	var WORK = new Complex128Array( 0 );
	var RWORK = new Float64Array( 0 );
	var info = ztrsna( 'both', 'all', SELECT, 1, 0, 0, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 0, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 0, 'm' );
} );

test( 'ztrsna: throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		var T = new Complex128Array( 1 );
		var VL = new Complex128Array( 1 );
		var VR = new Complex128Array( 1 );
		var SELECT = new Uint8Array( 1 );
		var s = new Float64Array( 1 );
		var SEP = new Float64Array( 1 );
		var M = new Int32Array( 1 );
		var WORK = new Complex128Array( 2 );
		var RWORK = new Float64Array( 1 );
		ztrsna( 'invalid', 'all', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztrsna: throws TypeError for invalid howmny', function t() {
	assert.throws( function throws() {
		var T = new Complex128Array( 1 );
		var VL = new Complex128Array( 1 );
		var VR = new Complex128Array( 1 );
		var SELECT = new Uint8Array( 1 );
		var s = new Float64Array( 1 );
		var SEP = new Float64Array( 1 );
		var M = new Int32Array( 1 );
		var WORK = new Complex128Array( 2 );
		var RWORK = new Float64Array( 1 );
		ztrsna( 'both', 'invalid', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztrsna: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		var T = new Complex128Array( 1 );
		var VL = new Complex128Array( 1 );
		var VR = new Complex128Array( 1 );
		var SELECT = new Uint8Array( 1 );
		var s = new Float64Array( 1 );
		var SEP = new Float64Array( 1 );
		var M = new Int32Array( 1 );
		var WORK = new Complex128Array( 2 );
		var RWORK = new Float64Array( 1 );
		ztrsna( 'both', 'all', SELECT, 1, 0, -1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	}, RangeError );
} );
