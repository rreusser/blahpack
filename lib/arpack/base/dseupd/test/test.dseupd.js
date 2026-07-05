/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dseupd from './../lib/dseupd.js';


// FIXTURES //

const fixtureURL = new URL( './../../../../../test/fixtures/dseupd.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});
const LM = cases[ 0 ]; // 'lm_rvec_n10_nev3_ncv6'


// TESTS //

test( 'dseupd is a function', function t() {
	assert.strictEqual( typeof dseupd, 'function', 'is a function' );
});

test( 'dseupd has expected arity', function t() {
	assert.strictEqual( dseupd.length, 28, 'has expected arity' );
});

test( 'dseupd throws a TypeError for an invalid howmny', function t() {
	assert.throws( function throws() {
		dseupd( true, 'X', new Array( 6 ), 1, new Float64Array( 3 ), 1, new Float64Array( 30 ), 10, 0.0, 'standard', 10, 'LM', 3, 0.0, new Float64Array( 10 ), 1, 6, new Float64Array( 60 ), 10, [ 0, 0, 0, 0, 3, 0, 1 ], 1, [ 0, 0, 0, 0, 1, 13, 19, 0, 0, 0, 61 ], 1, new Float64Array( 20 ), 1, new Float64Array( 84 ), 1, 84 );
	}, TypeError );
});

test( 'dseupd throws a TypeError for an invalid bmat', function t() {
	assert.throws( function throws() {
		dseupd( true, 'all', new Array( 6 ), 1, new Float64Array( 3 ), 1, new Float64Array( 30 ), 10, 0.0, 'X', 10, 'LM', 3, 0.0, new Float64Array( 10 ), 1, 6, new Float64Array( 60 ), 10, [ 0, 0, 0, 0, 3, 0, 1 ], 1, [ 0, 0, 0, 0, 1, 13, 19, 0, 0, 0, 61 ], 1, new Float64Array( 20 ), 1, new Float64Array( 84 ), 1, 84 );
	}, TypeError );
});

test( 'dseupd throws a TypeError for an invalid which', function t() {
	assert.throws( function throws() {
		dseupd( true, 'all', new Array( 6 ), 1, new Float64Array( 3 ), 1, new Float64Array( 30 ), 10, 0.0, 'standard', 10, 'ZZ', 3, 0.0, new Float64Array( 10 ), 1, 6, new Float64Array( 60 ), 10, [ 0, 0, 0, 0, 3, 0, 1 ], 1, [ 0, 0, 0, 0, 1, 13, 19, 0, 0, 0, 61 ], 1, new Float64Array( 20 ), 1, new Float64Array( 84 ), 1, 84 );
	}, TypeError );
});

test( 'dseupd throws a RangeError for an undersized workl when rvec=true', function t() {
	assert.throws( function throws() {
		dseupd( true, 'all', new Array( 6 ), 1, new Float64Array( 3 ), 1, new Float64Array( 30 ), 10, 0.0, 'standard', 10, 'LM', 3, 0.0, new Float64Array( 10 ), 1, 6, new Float64Array( 60 ), 10, [ 0, 0, 0, 0, 3, 0, 1 ], 1, [ 0, 0, 0, 0, 1, 13, 19, 0, 0, 0, 61 ], 1, new Float64Array( 20 ), 1, new Float64Array( 10 ), 1, 10 );
	}, RangeError );
});

test( 'dseupd main API reproduces the Fortran reference (LM, rvec)', function t() {
	const n = LM.n;
	const nev = LM.nev;
	const ncv = LM.ncv;
	const lworkl = LM.lworkl;
	const nconv = LM.nconv;

	const v = Float64Array.from( LM.v );
	const workl = Float64Array.from( LM.workl );
	const workd = Float64Array.from( LM.workd );
	const resid = Float64Array.from( LM.resid );
	const iparam = LM.iparam.slice();
	const ipntr = LM.ipntr.slice();
	const select = new Array( ncv ).fill( false );
	const d = new Float64Array( nev );
	const z = new Float64Array( n * nev );

	const info = dseupd( true, 'all', select, 1, d, 1, z, n, LM.sigma, 'standard', n, 'LM', nev, LM.tol, resid, 1, ncv, v, n, iparam, 1, ipntr, 1, workd, 1, workl, 1, lworkl );

	assert.strictEqual( info, 0, 'info is 0' );
	for ( let i = 0; i < nconv; i++ ) {
		assert.ok( Math.abs( d[ i ] - LM.d[ i ] ) <= 1e-10, 'd[' + i + '] matches' );
	}
	// Spot check the first Ritz vector up to a global sign.
	let dPlus = 0;
	let dMinus = 0;
	for ( let r = 0; r < n; r++ ) {
		dPlus = Math.max( dPlus, Math.abs( z[ r ] - LM.z[ r ] ) );
		dMinus = Math.max( dMinus, Math.abs( z[ r ] + LM.z[ r ] ) );
	}
	assert.ok( Math.min( dPlus, dMinus ) <= 1e-10, 'first Ritz vector matches up to sign' );
});
