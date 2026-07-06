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
import dseigt from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dseigt.f90);
// regenerate with `./test/run_fortran.sh arpack dseigt`.
const fixtureURL = new URL( './../../../../../test/fixtures/dseigt.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Original inputs, keyed by fixture name (see test_dseigt.f90).
const INPUTS = {
	'tri2m1_n4_rn0p5': { rnorm: 0.5, diag: [ 2.0, 2.0, 2.0, 2.0 ], sub: [ -1.0, -1.0, -1.0 ] },
	'graded_n5_rn1p25': { rnorm: 1.25, diag: [ 1.0, 2.0, 3.0, 4.0, 5.0 ], sub: [ 1.0, 1.0, 1.0, 1.0 ] },
	'mixed_n6_rn2': { rnorm: 2.0, diag: [ -2.0, 3.0, -1.0, 5.0, 0.5, -4.0 ], sub: [ 1.5, -0.5, 2.0, 0.3, -1.2 ] },
	'single_n1_rn3': { rnorm: 3.0, diag: [ 7.0 ], sub: [] }
};

const TOL = 1e-12;


// FUNCTIONS //

function buildH( diag, sub, ldh ) {
	const N = diag.length;
	const H = new Float64Array( ldh * 2 );
	for ( let i = 0; i < N; i++ ) {
		H[ i + ldh ] = diag[ i ]; // column 1: diagonal
	}
	for ( let i = 0; i < N - 1; i++ ) {
		H[ ( i + 1 ) ] = sub[ i ]; // column 0, rows 1..N-1: subdiagonal
	}
	return H;
}

function assertClose( actual, expected, msg ) {
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( let i = 0; i < expected.length; i++ ) {
		const rel = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( rel <= TOL, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

for ( const tc of cases ) {
	test( 'dseigt: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const N = inp.diag.length;
		const H = buildH( inp.diag, inp.sub, N );
		const eig = new Float64Array( N );
		const bounds = new Float64Array( N );
		const workl = new Float64Array( 3 * N );
		const ierr = dseigt( inp.rnorm, N, H, 1, N, 0, eig, 1, 0, bounds, 1, 0, workl, 1, 0 );
		assert.strictEqual( ierr, tc.ierr, 'ierr' );
		assertClose( eig, tc.eig, 'eig' );
		assertClose( bounds, tc.bounds, 'bounds' );
	});
}

test( 'dseigt: throws RangeError for undersized workl', function t() {
	const N = 4;
	const H = buildH( [ 2.0, 2.0, 2.0, 2.0 ], [ -1.0, -1.0, -1.0 ], N );
	assert.throws( function throws() {
		dseigt( 0.5, N, H, 1, N, 0, new Float64Array( N ), 1, 0, new Float64Array( N ), 1, 0, new Float64Array( 5 ), 1, 0 );
	}, RangeError );
});
