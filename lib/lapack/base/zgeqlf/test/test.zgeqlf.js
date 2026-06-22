/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-statements-per-line, node/no-sync */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqlf from './../lib/zgeqlf.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zgeqlf.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = lines.map( function parse( line ) { return JSON.parse( line ); } );


// FUNCTIONS //

/**
* Returns the fixture case with the provided name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) { return t.name === name; } );
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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zgeqlf is a function', function t() {
	assert.strictEqual( typeof zgeqlf, 'function', 'is a function' );
});

test( 'zgeqlf has expected arity', function t() {
	assert.strictEqual( zgeqlf.length, 10, 'has expected arity' );
});

test( 'zgeqlf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeqlf( 'invalid', 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'zgeqlf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeqlf( 'row-major', -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'zgeqlf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeqlf( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'zgeqlf column-major: computes QL factorization (basic 4x3)', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'basic_4x3' );
	a = new Complex128Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6 ] );
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 200 );
	info = zgeqlf( 'column-major', 4, 3, a, 4, tau, 1, work, 1, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});

test( 'zgeqlf column-major: computes QL factorization (square 3x3)', function t() {
	var work;
	var info;
	var tau;
	var tc;
	var a;

	tc = findCase( 'square_3x3' );
	a = new Complex128Array( [ 1, 1, 0, 1, 1, 0, 2, 0.5, 1, 1, 0.5, 0.5, 0, 1, 1, 0, 2, 2 ] );
	tau = new Complex128Array( 3 );
	work = new Complex128Array( 200 );
	info = zgeqlf( 'column-major', 3, 3, a, 3, tau, 1, work, 1, -1 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( reinterpret( a, 0 ), tc.a, 1e-10, 'a' );
	assertArrayClose( reinterpret( tau, 0 ), tc.tau, 1e-10, 'tau' );
});
