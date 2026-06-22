/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlaLinBerr from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var lines = readFileSync( path.join( fixtureDir, 'zla_lin_berr.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Asserts two scalars are close within relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts element-wise closeness of two arrays.
*
* @private
* @param {Collection} actual - actual values
* @param {Collection} expected - expected values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Builds a `Complex128Array` from an interleaved real/imaginary array.
*
* @private
* @param {Array} reim - interleaved real/imaginary values
* @returns {Complex128Array} complex array
*/
function toComplex( reim ) {
	return new Complex128Array( new Float64Array( reim ) );
}


// TESTS //

test( 'zlaLinBerr: basic_complex (n=4, nrhs=2)', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	tc = findCase( 'basic_complex' );
	res = toComplex([
		1.0e-10,
		2.0e-10,
		-3.0e-10,
		4.0e-10,
		5.0e-10,
		-6.0e-10,
		7.0e-10,
		8.0e-10,
		9.0e-10,
		-1.0e-10,
		-2.0e-10,
		3.0e-10,
		4.0e-10,
		5.0e-10,
		6.0e-10,
		-7.0e-10
	]);
	ayb = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		10.0,
		20.0,
		30.0,
		40.0
	]);
	berr = new Float64Array( 2 );
	zlaLinBerr( 4, 4, 2, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'zlaLinBerr: real_only residual (n=3, nrhs=2)', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	tc = findCase( 'real_only' );
	res = toComplex([
		1.0e-8,
		0.0,
		2.0e-8,
		0.0,
		3.0e-8,
		0.0,
		4.0e-8,
		0.0,
		5.0e-8,
		0.0,
		6.0e-8,
		0.0
	]);
	ayb = new Float64Array([
		1.0,
		2.0,
		3.0,
		4.0,
		5.0,
		6.0
	]);
	berr = new Float64Array( 2 );
	zlaLinBerr( 3, 3, 2, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'zlaLinBerr: n_one (n=1, nrhs=1)', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	tc = findCase( 'n_one' );
	res = toComplex([ 1.0e-6, -2.0e-6 ]);
	ayb = new Float64Array([ 2.0 ]);
	berr = new Float64Array( 1 );
	zlaLinBerr( 1, 1, 1, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'zlaLinBerr: zero_ayb (skipped rows in max)', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	tc = findCase( 'zero_ayb' );
	res = toComplex([
		1.0e-8,
		2.0e-8,
		3.0e-8,
		4.0e-8,
		5.0e-8,
		6.0e-8,
		7.0e-8,
		8.0e-8,
		9.0e-8,
		1.0e-8,
		2.0e-8,
		3.0e-8
	]);
	ayb = new Float64Array([
		0.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0
	]);
	berr = new Float64Array( 2 );
	zlaLinBerr( 3, 3, 2, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'zlaLinBerr: nrhs_zero (quick return, berr untouched)', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	tc = findCase( 'nrhs_zero' );
	res = toComplex([ 0.0, 0.0 ]);
	ayb = new Float64Array([ 0.0 ]);
	berr = new Float64Array([ 99.0 ]);
	zlaLinBerr( 3, 3, 0, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'zlaLinBerr: non-unit stride and offset on berr', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	tc = findCase( 'n_one' );
	res = toComplex([ 1.0e-6, -2.0e-6 ]);
	ayb = new Float64Array([ 2.0 ]);
	berr = new Float64Array([ 0.0, 0.0, 0.0, 0.0 ]);
	zlaLinBerr( 1, 1, 1, res, 1, 0, ayb, 1, 0, berr, 2, 1 );
	assertClose( berr[ 1 ], tc.berr[ 0 ], 1e-12, 'berr[1]' );
	assert.equal( berr[ 0 ], 0.0 );
	assert.equal( berr[ 2 ], 0.0 );
	assert.equal( berr[ 3 ], 0.0 );
});

test( 'zlaLinBerr: non-unit stride on res and ayb', function t() {
	var berr;
	var ayb;
	var res;
	var tc;

	// Place the valid complex element at complex index 2 (Float64 offset 4); rest are unused:
	tc = findCase( 'n_one' );
	res = toComplex([
		0.0,
		0.0,
		0.0,
		0.0,
		1.0e-6,
		-2.0e-6,
		0.0,
		0.0
	]);
	ayb = new Float64Array([
		0.0,
		0.0,
		2.0,
		0.0
	]);
	berr = new Float64Array( 1 );
	zlaLinBerr( 1, 1, 1, res, 1, 2, ayb, 1, 2, berr, 1, 0 );
	assertArrayClose( berr, tc.berr, 1e-12, 'berr' );
});

test( 'zlaLinBerr: negative imag in CABS1 (|re|+|im|, not hypot)', function t() {
	var berr;
	var ayb;
	var res;

	// Verify CABS1 semantics explicitly: |3-4i| CABS1 = 7, not 5:
	res = toComplex([ 3.0, -4.0 ]);
	ayb = new Float64Array([ 1.0 ]);
	berr = new Float64Array( 1 );
	zlaLinBerr( 1, 0, 1, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
	assertClose( berr[ 0 ], 7.0, 1e-12, 'cabs1' );
});
