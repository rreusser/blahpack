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

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = fs.readFileSync( path.join( fixtureDir, 'ztrsna.jsonl' ), 'utf8' ).trim().split( '\n' );
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
} );


// FUNCTIONS //

function findCase( name ) {
	return fixture.find( function find( tc ) {
		return tc.name === name;
	} );
}

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function cArray( floats ) {
	const arr = new Complex128Array( floats.length / 2 );
	const view = new Float64Array( arr.buffer );
	let i;
	for ( i = 0; i < floats.length; i++ ) {
		view[ i ] = floats[ i ];
	}
	return arr;
}

function toArray( ta ) {
	const out = [];
	let i;
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
	const tc = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tc.T );
	const VL = cArray( tc.VL );
	const VR = cArray( tc.VR );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( s ), tc.S, 1e-12, 'S' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-12, 'SEP' );
} );

test( 'ztrsna: job=eigenvalues howmny=all (4x4)', function t() {
	const tc = findCase( 'job=E howmny=A' );
	const tcFull = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tcFull.T );
	const VL = cArray( tcFull.VL );
	const VR = cArray( tcFull.VR );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'eigenvalues', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( s ), tc.S, 1e-12, 'S' );
} );

test( 'ztrsna: job=eigenvectors howmny=all (4x4)', function t() {
	const tc = findCase( 'job=V howmny=A' );
	const tcFull = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tcFull.T );
	const VL = cArray( tcFull.VL );
	const VR = cArray( tcFull.VR );
	const SELECT = new Uint8Array( N );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'eigenvectors', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-12, 'SEP' );
} );

test( 'ztrsna: job=both howmny=selected (sel=[1,0,1,0])', function t() {
	const tc = findCase( 'job=B howmny=S sel 1,3' );
	const tcFull = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tcFull.T );
	const VLfull = new Float64Array( tcFull.VL );
	const VRfull = new Float64Array( tcFull.VR );
	const VLpacked = new Float64Array( 2 * N * N );
	const VRpacked = new Float64Array( 2 * N * N );
	let i;
	for ( i = 0; i < 2 * N; i++ ) {
		VLpacked[ i ] = VLfull[ i ];
		VRpacked[ i ] = VRfull[ i ];
	}
	for ( i = 0; i < 2 * N; i++ ) {
		VLpacked[ ( 2 * N ) + i ] = VLfull[ ( 4 * N ) + i ];
		VRpacked[ ( 2 * N ) + i ] = VRfull[ ( 4 * N ) + i ];
	}
	const VL = new Complex128Array( VLpacked.buffer );
	const VR = new Complex128Array( VRpacked.buffer );
	const SELECT = new Uint8Array( [ 1, 0, 1, 0 ] );
	const s = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'both', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( [ s[ 0 ], s[ 1 ] ], tc.S, 1e-12, 'S' );
	assertArrayClose( [ SEP[ 0 ], SEP[ 1 ] ], tc.SEP, 1e-12, 'SEP' );
} );

test( 'ztrsna: N=1 job=both', function t() {
	const tc = findCase( 'N=1 job=B' );
	const N = 1;
	const T = new Complex128Array( [ 3.5, -1.25 ] );
	const VL = new Complex128Array( [ 1.0, 0.0 ] );
	const VR = new Complex128Array( [ 1.0, 0.0 ] );
	const SELECT = new Uint8Array( [ 1 ] );
	const s = new Float64Array( 1 );
	const SEP = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = ztrsna( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( s ), tc.S, 1e-14, 'S' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-14, 'SEP' );
} );

test( 'ztrsna: N=1 howmny=selected with SELECT[0]=0 (early exit)', function t() {
	const N = 1;
	const T = new Complex128Array( [ 3.5, -1.25 ] );
	const VL = new Complex128Array( [ 1.0, 0.0 ] );
	const VR = new Complex128Array( [ 1.0, 0.0 ] );
	const SELECT = new Uint8Array( [ 0 ] );
	const s = new Float64Array( 1 );
	const SEP = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = ztrsna( 'both', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 0, 'm=0' );
} );

test( 'ztrsna: N=1 job=eigenvalues only (skip wantsp branch)', function t() {
	const N = 1;
	const T = new Complex128Array( [ 3.5, -1.25 ] );
	const VL = new Complex128Array( [ 1.0, 0.0 ] );
	const VR = new Complex128Array( [ 1.0, 0.0 ] );
	const SELECT = new Uint8Array( [ 1 ] );
	const s = new Float64Array( 1 );
	const SEP = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = ztrsna( 'eigenvalues', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, s, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 );
	assert.equal( info, 0 );
	assertClose( s[ 0 ], 1.0, 1e-14, 'S' );
} );

test( 'ztrsna: N=0 quick return', function t() {
	const T = new Complex128Array( 0 );
	const VL = new Complex128Array( 0 );
	const VR = new Complex128Array( 0 );
	const SELECT = new Uint8Array( 0 );
	const s = new Float64Array( 0 );
	const SEP = new Float64Array( 0 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 0 );
	const RWORK = new Float64Array( 0 );
	const info = ztrsna( 'both', 'all', SELECT, 1, 0, 0, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 0, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( M[ 0 ], 0, 'm' );
} );

test( 'ztrsna: throws TypeError for invalid job', function t() {
	assert.throws( function throws() {
		const T = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const SEP = new Float64Array( 1 );
		const M = new Int32Array( 1 );
		const WORK = new Complex128Array( 2 );
		const RWORK = new Float64Array( 1 );
		ztrsna( 'invalid', 'all', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztrsna: throws TypeError for invalid howmny', function t() {
	assert.throws( function throws() {
		const T = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const SEP = new Float64Array( 1 );
		const M = new Int32Array( 1 );
		const WORK = new Complex128Array( 2 );
		const RWORK = new Float64Array( 1 );
		ztrsna( 'both', 'invalid', SELECT, 1, 0, 1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	}, TypeError );
} );

test( 'ztrsna: throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const T = new Complex128Array( 1 );
		const VL = new Complex128Array( 1 );
		const VR = new Complex128Array( 1 );
		const SELECT = new Uint8Array( 1 );
		const s = new Float64Array( 1 );
		const SEP = new Float64Array( 1 );
		const M = new Int32Array( 1 );
		const WORK = new Complex128Array( 2 );
		const RWORK = new Float64Array( 1 );
		ztrsna( 'both', 'all', SELECT, 1, 0, -1, T, 1, 1, 0, VL, 1, 1, 0, VR, 1, 1, 0, s, 1, 0, SEP, 1, 0, 1, M, WORK, 1, 1, 0, RWORK, 1, 0 );
	}, RangeError );
} );
