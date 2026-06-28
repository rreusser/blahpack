/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlartgp from './../lib/ndarray.js';


// VARIABLES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var fixtureRaw = readFileSync( path.join( fixtureDir, 'dlartgp.jsonl' ), 'utf8' );
var fixtureLines = fixtureRaw.replace( /\s+$/, '' ).split( '\n' );
var fixture = fixtureLines.map( parseLine );
var EPS = 2.220446049250313e-16;


// FUNCTIONS //

/**
* Parses a JSONL line.
*
* @private
* @param {string} line - JSONL line
* @returns {Object} parsed case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i += 1 ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that `actual` is approximately `expected` (relative tolerance).
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
* Asserts array closeness element-wise.
*
* @private
* @param {Float64Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verifies Givens rotation identities and non-negativity of `r`.
*
* @private
* @param {number} f - first component
* @param {number} g - second component
* @param {Float64Array} out - output: `[cs, sn, r]`
* @param {number} tol - tolerance
*/
function verifyRotation( f, g, out, tol ) {
	var computedR;
	var residual;
	var scale;
	var cs;
	var sn;
	var r;

	cs = out[ 0 ];
	sn = out[ 1 ];
	r = out[ 2 ];

	assert.ok( Math.abs( ( cs * cs ) + ( sn * sn ) - 1.0 ) < tol, 'cs^2 + sn^2 = 1' );
	assert.ok( r >= 0.0, 'r >= 0, got ' + r );

	computedR = ( cs * f ) + ( sn * g );
	if ( r !== 0.0 ) {
		assert.ok( Math.abs( computedR - r ) / r < tol, 'cs*f + sn*g = r' );
	}
	residual = ( -sn * f ) + ( cs * g );
	scale = Math.max( Math.abs( f ), Math.abs( g ) );
	if ( scale > 0.0 ) {
		assert.ok( Math.abs( residual ) / scale < tol, '-sn*f + cs*g = 0' );
	}
}


// TESTS //

test( 'dlartgp.ndarray: basic (3,4)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'basic' );
	dlartgp( 3.0, 4.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( 3.0, 4.0, out, 16.0 * EPS );
});

test( 'dlartgp.ndarray: g = 0', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'g_zero' );
	dlartgp( 2.5, 0.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	assert.strictEqual( out[ 0 ], 1.0 );
	assert.strictEqual( out[ 1 ], 0.0 );
	assert.strictEqual( out[ 2 ], 2.5 );
});

test( 'dlartgp.ndarray: g = 0, negative f', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'g_zero_neg_f' );
	dlartgp( -2.5, 0.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	assert.strictEqual( out[ 0 ], -1.0 );
	assert.strictEqual( out[ 1 ], 0.0 );
	assert.strictEqual( out[ 2 ], 2.5 );
});

test( 'dlartgp.ndarray: f = 0', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'f_zero' );
	dlartgp( 0.0, 7.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	assert.strictEqual( out[ 0 ], 0.0 );
	assert.strictEqual( out[ 1 ], 1.0 );
	assert.strictEqual( out[ 2 ], 7.0 );
});

test( 'dlartgp.ndarray: f = 0, negative g', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'f_zero_neg_g' );
	dlartgp( 0.0, -7.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	assert.strictEqual( out[ 0 ], 0.0 );
	assert.strictEqual( out[ 1 ], -1.0 );
	assert.strictEqual( out[ 2 ], 7.0 );
});

test( 'dlartgp.ndarray: both negative (r still >= 0)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'neg_f_neg_g' );
	dlartgp( -3.0, -4.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	assert.ok( out[ 2 ] >= 0.0 );
	verifyRotation( -3.0, -4.0, out, 16.0 * EPS );
});

test( 'dlartgp.ndarray: negative f, positive g', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'neg_f_pos_g' );
	dlartgp( -3.0, 4.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( -3.0, 4.0, out, 16.0 * EPS );
});

test( 'dlartgp.ndarray: large values (overflow-scale branch)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'large' );
	var f = 1.0e200;
	var g = 2.0e200;
	dlartgp( f, g, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( f, g, out, 64.0 * EPS );
});

test( 'dlartgp.ndarray: small values (underflow-scale branch)', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'small' );
	var f = 1.0e-200;
	var g = 2.0e-200;
	dlartgp( f, g, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( f, g, out, 64.0 * EPS );
});

test( 'dlartgp.ndarray: mixed magnitudes', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'mixed' );
	var f = 1.0e-150;
	var g = 1.0e150;
	dlartgp( f, g, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
});

test( 'dlartgp.ndarray: equal f and g', function t() {
	var out = new Float64Array( 3 );
	var tc = findCase( 'equal' );
	dlartgp( 1.0, 1.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( 1.0, 1.0, out, 16.0 * EPS );
});

test( 'dlartgp.ndarray: f very small, g in normal range', function t() {
	var out = new Float64Array( 3 );
	var f = 1.0e-250;
	var g = 1.0;
	dlartgp( f, g, out );
	verifyRotation( f, g, out, 64.0 * EPS );
	assert.ok( out[ 2 ] >= 0.0 );
});

test( 'dlartgp.ndarray: f very large, g in normal range', function t() {
	var out = new Float64Array( 3 );
	var f = 1.0e250;
	var g = 1.0;
	dlartgp( f, g, out );
	verifyRotation( f, g, out, 64.0 * EPS );
	assert.ok( out[ 2 ] >= 0.0 );
});

test( 'dlartgp.ndarray: f = 1, g = 0 (identity)', function t() {
	var out = new Float64Array( 3 );
	dlartgp( 1.0, 0.0, out );
	assert.strictEqual( out[ 0 ], 1.0 );
	assert.strictEqual( out[ 1 ], 0.0 );
	assert.strictEqual( out[ 2 ], 1.0 );
});

test( 'dlartgp.ndarray: f = 0, g = 1', function t() {
	var out = new Float64Array( 3 );
	dlartgp( 0.0, 1.0, out );
	assert.strictEqual( out[ 0 ], 0.0 );
	assert.strictEqual( out[ 1 ], 1.0 );
	assert.strictEqual( out[ 2 ], 1.0 );
});

test( 'dlartgp.ndarray: assorted (5, 12)', function t() {
	var out = new Float64Array( 3 );
	dlartgp( 5.0, 12.0, out );
	assert.ok( Math.abs( out[ 2 ] - 13.0 ) < EPS * 13.0 );
	assert.ok( Math.abs( out[ 0 ] - ( 5.0 / 13.0 ) ) < EPS );
	assert.ok( Math.abs( out[ 1 ] - ( 12.0 / 13.0 ) ) < EPS );
});

test( 'dlartgp.ndarray: negative f very small (scaled branch, sign flip)', function t() {
	var out = new Float64Array( 3 );
	var f = -3.0e-200;
	var g = 4.0e-200;
	dlartgp( f, g, out );
	assert.ok( out[ 2 ] >= 0.0 );
	verifyRotation( f, g, out, 64.0 * EPS );
});

test( 'dlartgp.ndarray: negative f very large (scaled branch, sign flip)', function t() {
	var out = new Float64Array( 3 );
	var f = -3.0e200;
	var g = 4.0e200;
	dlartgp( f, g, out );
	assert.ok( out[ 2 ] >= 0.0 );
	verifyRotation( f, g, out, 64.0 * EPS );
});
