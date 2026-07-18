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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-statements-per-line */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import main from './../lib/index.js';
import dlartgs from './../lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'dlartgs.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
const fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// VARIABLES //

const EPS = 2.220446049250313e-16;


// FUNCTIONS //

/**
* Locates a fixture case by name.
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
* Asserts that `actual` is approximately `expected`.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual ); // eslint-disable-line max-len
}

/**
* Asserts element-wise array closeness.
*
* @private
* @param {Float64Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Verifies that the computed plane rotation satisfies the dlartgs defining identity `[cs sn;-sn cs]*[x^2-sigma^2;x*y]=[r;0]`.
*
* @private
* @param {number} x - input x
* @param {number} y - input y
* @param {number} sigma - input sigma
* @param {Float64Array} out - output [cs, sn]
* @param {number} tol - tolerance
*/
function verifyRotation( x, y, sigma, out, tol ) {

	const cs = out[ 0 ];
	const sn = out[ 1 ];
	const a = ( x * x ) - ( sigma * sigma );
	const b = x * y;

	assert.ok( Math.abs( ( cs * cs ) + ( sn * sn ) - 1.0 ) < tol, 'cs^2 + sn^2 = 1' );

	const z = ( -sn * a ) + ( cs * b );
	const scale = Math.max( Math.abs( a ), Math.abs( b ) );
	if ( scale > 0.0 ) {
		assert.ok( Math.abs( z ) / scale < tol, '-sn*(x^2-sigma^2) + cs*(x*y) = 0' );
	}
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof main, 'function' );
	assert.strictEqual( typeof main.ndarray, 'function' );
});

test( 'dlartgs.ndarray: nominal case', function t() {
	const tc = findCase( 'nominal' );
	const out = new Float64Array( 2 );
	dlartgs( 3.0, 4.0, 1.5, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( 3.0, 4.0, 1.5, out, 64.0 * EPS );
});

test( 'dlartgs.ndarray: sigma = 0, positive x', function t() {
	const tc = findCase( 'sigma_zero_pos' );
	const out = new Float64Array( 2 );
	dlartgs( 2.0, 3.0, 0.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( 2.0, 3.0, 0.0, out, 64.0 * EPS );
});

test( 'dlartgs.ndarray: sigma = 0, negative x', function t() {
	const tc = findCase( 'sigma_zero_neg' );
	const out = new Float64Array( 2 );
	dlartgs( -2.0, 3.0, 0.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( -2.0, 3.0, 0.0, out, 64.0 * EPS );
});

test( 'dlartgs.ndarray: |x| < thresh branch', function t() {
	const tc = findCase( 'x_tiny' );
	const out = new Float64Array( 2 );
	dlartgs( 1.0e-20, 2.0, 1.5, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
});

test( 'dlartgs.ndarray: sigma = 0 and |x| < thresh (both zero branch)', function t() {
	const tc = findCase( 'sigma_zero_x_tiny' );
	const out = new Float64Array( 2 );
	dlartgs( 1.0e-20, 3.0, 0.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
});

test( 'dlartgs.ndarray: |x| == sigma and y == 0 (rotation by PI/2)', function t() {
	const tc = findCase( 'x_eq_sigma_y_zero' );
	const out = new Float64Array( 2 );
	dlartgs( 2.5, 0.0, 2.5, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	assert.strictEqual( out[ 0 ], 0.0 );
	assert.strictEqual( out[ 1 ], 1.0 );
});

test( 'dlartgs.ndarray: negative x with nonzero sigma (s = -1 branch)', function t() {
	const tc = findCase( 'neg_x_sigma' );
	const out = new Float64Array( 2 );
	dlartgs( -3.0, 2.0, 1.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( -3.0, 2.0, 1.0, out, 64.0 * EPS );
});

test( 'dlartgs.ndarray: positive x with nonzero sigma (s = 1 branch)', function t() {
	const tc = findCase( 'pos_x_sigma' );
	const out = new Float64Array( 2 );
	dlartgs( 5.0, 1.0, 2.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( 5.0, 1.0, 2.0, out, 64.0 * EPS );
});

test( 'dlartgs.ndarray: sigma = 0 with negative x and y', function t() {
	const tc = findCase( 'sigma_zero_negxy' );
	const out = new Float64Array( 2 );
	dlartgs( -4.0, -3.0, 0.0, out );
	assertArrayClose( out, tc.out, 1e-14, 'out' );
	verifyRotation( -4.0, -3.0, 0.0, out, 64.0 * EPS );
});

test( 'dlartgs.ndarray: returns the out array (identity)', function t() {
	const out = new Float64Array( 2 );
	const ret = dlartgs( 3.0, 4.0, 1.5, out );
	assert.strictEqual( ret, out );
});

test( 'dlartgs.ndarray: |x| == sigma exact equality, negative x', function t() {
	const out = new Float64Array( 2 );
	dlartgs( -3.0, 0.0, 3.0, out );
	assert.strictEqual( out[ 0 ], 0.0 );
	assert.strictEqual( out[ 1 ], 1.0 );
});

test( 'dlartgs (main): returns object with cs and sn', function t() {
	const r = main( 3.0, 4.0, 1.5 );
	assert.ok( typeof r.cs === 'number' );
	assert.ok( typeof r.sn === 'number' );
	assert.ok( Math.abs( ( r.cs * r.cs ) + ( r.sn * r.sn ) - 1.0 ) < 64.0 * EPS ); // eslint-disable-line max-len
});

test( 'dlartgs (main): matches ndarray output', function t() {
	const out = new Float64Array( 2 );
	const r = main( 5.0, 1.0, 2.0 );
	dlartgs( 5.0, 1.0, 2.0, out );
	assertClose( r.cs, out[ 0 ], 1e-14, 'cs' );
	assertClose( r.sn, out[ 1 ], 1e-14, 'sn' );
});

test( 'dlartgs.ndarray: moderate sigma, wide range of x/y', function t() {
	const out = new Float64Array( 2 );
	dlartgs( 10.0, 0.1, 5.0, out );
	verifyRotation( 10.0, 0.1, 5.0, out, 64.0 * EPS );
});
