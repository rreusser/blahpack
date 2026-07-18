/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements, require-jsdoc, stdlib/jsdoc-private-annotation, stdlib/require-file-extensions, id-length, no-unused-vars, node/no-sync */


// MODULES //

import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import ztrsna from './../lib/base.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
const lines = fs.readFileSync( path.join( fixtureDir, 'ztrsna.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
const fixture = lines.map( parseJson );

/**
* parseJson.
*
* @private
* @param {*} line - line
* @returns {*} result
*/
function parseJson( line ) {
		return JSON.parse( line );
	}

/**
* matchesName.
*
* @private
* @param {*} target - target
*/
function matchesName( target ) {
		return function find( t ) {
		return t.name === target;
	};
}

/**
* Returns a test case from the fixture data.
*
* @private
* @param {string} name - test case name
* @returns {*} result
*/
function findCase( name ) {
		return fixture.find( matchesName( name ) );
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
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* cArray.
*
* @private
* @param {*} floats - floats
* @returns {*} result
*/
function cArray( floats ) {
	let i;
	const arr = new Complex128Array( floats.length / 2 );
	const view = new Float64Array( arr.buffer );
	for ( i = 0; i < floats.length; i++ ) {
		view[ i ] = floats[ i ];
	}
	return arr;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {*} ta - ta
* @returns {*} result
*/
function toArray( ta ) {
	const out = [];
	let i;
	for ( i = 0; i < ta.length; i++ ) {
		out.push( ta[ i ] );
	}
	return out;
}


// TESTS //

test( 'ztrsna: job=B howmny=A', function t() {
	const tc = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tc.T );
	const VL = cArray( tc.VL );
	const VR = cArray( tc.VR );
	const SELECT = new Uint8Array( N );
	const S = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, S, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( S ), tc.S, 1e-12, 'S' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-12, 'SEP' );
});

test( 'ztrsna: job=E howmny=A', function t() {
	const tc = findCase( 'job=E howmny=A' );
	const tcFull = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tcFull.T );
	const VL = cArray( tcFull.VL );
	const VR = cArray( tcFull.VR );
	const SELECT = new Uint8Array( N );
	const S = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'eigenvalues', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, S, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( S ), tc.S, 1e-12, 'S' );
});

test( 'ztrsna: job=V howmny=A', function t() {
	const tc = findCase( 'job=V howmny=A' );
	const tcFull = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tcFull.T );
	const VL = cArray( tcFull.VL );
	const VR = cArray( tcFull.VR );
	const SELECT = new Uint8Array( N );
	const S = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'eigenvectors', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, S, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-12, 'SEP' );
});

test( 'ztrsna: job=B howmny=S sel 1,3', function t() {
	let i;
	const tc = findCase( 'job=B howmny=S sel 1,3' );
	const tcFull = findCase( 'job=B howmny=A' );
	const N = 4;
	const T = cArray( tcFull.T );
	const VLfull = new Float64Array( tcFull.VL );
	const VRfull = new Float64Array( tcFull.VR );
	const VLpacked = new Float64Array( 2 * N * N );
	const VRpacked = new Float64Array( 2 * N * N );
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
	const S = new Float64Array( N );
	const SEP = new Float64Array( N );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( N * ( N + 1 ) );
	const RWORK = new Float64Array( N );
	const info = ztrsna( 'both', 'selected', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, S, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( [ S[ 0 ], S[ 1 ] ], tc.S, 1e-12, 'S' );
	assertArrayClose( [ SEP[ 0 ], SEP[ 1 ] ], tc.SEP, 1e-12, 'SEP' );
});

test( 'ztrsna: N=1 job=B', function t() {
	const tc = findCase( 'N=1 job=B' );
	const N = 1;
	const T = new Complex128Array( [ 3.5, -1.25 ] );
	const VL = new Complex128Array( [ 1.0, 0.0 ] );
	const VR = new Complex128Array( [ 1.0, 0.0 ] );
	const SELECT = new Uint8Array( [ 1 ] );
	const S = new Float64Array( 1 );
	const SEP = new Float64Array( 1 );
	const M = new Int32Array( 1 );
	const WORK = new Complex128Array( 2 );
	const RWORK = new Float64Array( 1 );
	const info = ztrsna( 'both', 'all', SELECT, 1, 0, N, T, 1, N, 0, VL, 1, N, 0, VR, 1, N, 0, S, 1, 0, SEP, 1, 0, N, M, WORK, 1, N, 0, RWORK, 1, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assert.equal( M[ 0 ], tc.M, 'M' );
	assertArrayClose( toArray( S ), tc.S, 1e-14, 'S' );
	assertArrayClose( toArray( SEP ), tc.SEP, 1e-14, 'SEP' );
});
