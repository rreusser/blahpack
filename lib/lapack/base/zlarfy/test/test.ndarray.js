/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import zlarfy from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zlarfy.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync
var fixture = lines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @throws {Error} if the named fixture case is not found
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	throw new Error( format( 'fixture case not found: %s', name ) );
}

/**
* Asserts that a Complex128Array matches an interleaved reference to within a tolerance.
*
* @private
* @param {Complex128Array} C - actual matrix
* @param {Array} expected - reference interleaved real/imag values
* @param {number} tol - tolerance
* @param {string} msg - message prefix
* @throws {Error} if any element exceeds the tolerance
*/
function assertClose( C, expected, tol, msg ) {
	var relErr;
	var view;
	var a;
	var b;
	var i;
	view = reinterpret( C, 0 );
	if ( view.length !== expected.length ) {
		throw new Error( format( '%s: length mismatch (%d vs %d)', msg, view.length, expected.length ) );
	}
	for ( i = 0; i < expected.length; i++ ) {
		a = view[ i ];
		b = expected[ i ];
		relErr = Math.abs( a - b ) / Math.max( Math.abs( b ), 1.0 );
		if ( relErr > tol ) {
			throw new Error( format( '%s[%d]: expected %s, got %s', msg, i, b, a ) );
		}
	}
}


// TESTS //

test( 'zlarfy: upper_3_real_tau', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'upper_3_real_tau' );
	C = new Complex128Array([
		4.0,
		0.0,
		1.0,
		-2.0,
		2.0,
		1.0,
		1.0,
		2.0,
		5.0,
		0.0,
		3.0,
		-1.0,
		2.0,
		-1.0,
		3.0,
		1.0,
		6.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		0.5,
		0.25,
		0.25,
		-0.5
	]);
	tau = new Complex128( 1.0, 0.0 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'upper', 3, v, 1, 0, tau, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: lower_3_real_tau', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'lower_3_real_tau' );
	C = new Complex128Array([
		4.0,
		0.0,
		1.0,
		-2.0,
		2.0,
		1.0,
		1.0,
		2.0,
		5.0,
		0.0,
		3.0,
		-1.0,
		2.0,
		-1.0,
		3.0,
		1.0,
		6.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		0.5,
		0.25,
		0.25,
		-0.5
	]);
	tau = new Complex128( 1.0, 0.0 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'lower', 3, v, 1, 0, tau, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: tau_zero quick return', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'tau_zero' );
	C = new Complex128Array([
		4.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		2.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		2.0,
		3.0
	]);
	tau = new Complex128( 0.0, 0.0 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'upper', 2, v, 1, 0, tau, C, 1, 2, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: upper_2_complex_tau', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'upper_2_complex_tau' );
	C = new Complex128Array([
		2.0,
		0.0,
		0.0,
		0.0,
		1.0,
		1.0,
		3.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		0.5,
		0.5
	]);
	tau = new Complex128( 0.7, 0.3 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'upper', 2, v, 1, 0, tau, C, 1, 2, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: lower_2_complex_tau', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'lower_2_complex_tau' );
	C = new Complex128Array([
		2.0,
		0.0,
		1.0,
		-1.0,
		0.0,
		0.0,
		3.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		0.5,
		0.5
	]);
	tau = new Complex128( 0.7, 0.3 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'lower', 2, v, 1, 0, tau, C, 1, 2, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: upper_5_complex_tau', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'upper_5_complex_tau' );
	C = new Complex128Array([
		10.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		1.0,
		11.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		-1.0,
		5.0,
		2.0,
		12.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		3.0,
		0.5,
		6.0,
		-1.0,
		8.0,
		1.5,
		13.0,
		0.0,
		0.0,
		0.0,
		4.0,
		1.0,
		7.0,
		0.5,
		9.0,
		-0.5,
		1.5,
		2.0,
		14.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		0.4,
		0.1,
		0.3,
		-0.2,
		0.2,
		0.3,
		0.1,
		-0.1
	]);
	tau = new Complex128( 0.6, 0.2 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'upper', 5, v, 1, 0, tau, C, 1, 5, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: lower_5_complex_tau', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'lower_5_complex_tau' );
	C = new Complex128Array([
		10.0,
		0.0,
		1.0,
		-1.0,
		2.0,
		1.0,
		3.0,
		-0.5,
		4.0,
		-1.0,
		0.0,
		0.0,
		11.0,
		0.0,
		5.0,
		-2.0,
		6.0,
		1.0,
		7.0,
		-0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		12.0,
		0.0,
		8.0,
		-1.5,
		9.0,
		0.5,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		13.0,
		0.0,
		1.5,
		-2.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		14.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		0.4,
		0.1,
		0.3,
		-0.2,
		0.2,
		0.3,
		0.1,
		-0.1
	]);
	tau = new Complex128( 0.6, 0.2 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'lower', 5, v, 1, 0, tau, C, 1, 5, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: n_one', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'n_one' );
	C = new Complex128Array([
		5.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0
	]);
	tau = new Complex128( 1.0, 0.0 );
	WORK = new Complex128Array( 5 );
	zlarfy( 'upper', 1, v, 1, 0, tau, C, 1, 1, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});

test( 'zlarfy: non-unit stride v (incv=2)', function t() {
	var WORK;
	var tau;
	var tc;
	var C;
	var v;
	tc = findCase( 'upper_3_real_tau' );
	C = new Complex128Array([
		4.0,
		0.0,
		1.0,
		-2.0,
		2.0,
		1.0,
		1.0,
		2.0,
		5.0,
		0.0,
		3.0,
		-1.0,
		2.0,
		-1.0,
		3.0,
		1.0,
		6.0,
		0.0
	]);
	v = new Complex128Array([
		1.0,
		0.0,
		99.0,
		99.0,
		0.5,
		0.25,
		99.0,
		99.0,
		0.25,
		-0.5
	]);
	tau = new Complex128( 1.0, 0.0 );
	WORK = new Complex128Array( 10 );
	zlarfy( 'upper', 3, v, 2, 0, tau, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( C, tc.C, 1e-12, 'C' );
});
