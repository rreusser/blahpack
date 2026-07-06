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
import dstqrb from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dstqrb.f90);
// regenerate with `./test/run_fortran.sh arpack dstqrb`.
const fixtureURL = new URL( './../../../../../test/fixtures/dstqrb.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Original tridiagonal inputs, keyed by fixture name (see test_dstqrb.f90).
const INPUTS = {
	'tri2m1_n4': { d: [ 2.0, 2.0, 2.0, 2.0 ], e: [ -1.0, -1.0, -1.0 ] },
	'graded_n5': { d: [ 1.0, 2.0, 3.0, 4.0, 5.0 ], e: [ 1.0, 1.0, 1.0, 1.0 ] },
	'single_n1': { d: [ 3.0 ], e: [] },
	'split_n4': { d: [ 4.0, 1.0, 3.0, 2.0 ], e: [ 0.7, 0.0, -0.9 ] },
	'mixed_n6': { d: [ -2.0, 3.0, -1.0, 5.0, 0.5, -4.0 ], e: [ 1.5, -0.5, 2.0, 0.3, -1.2 ] }
};

const TOL = 1e-12;


// FUNCTIONS //

function assertArrayClose( actual, expected, tol, msg ) {
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( let i = 0; i < expected.length; i++ ) {
		const rel = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		assert.ok( rel <= tol, msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
	}
}


// TESTS //

for ( const tc of cases ) {
	test( 'dstqrb: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const N = inp.d.length;
		const d = new Float64Array( inp.d );
		const e = new Float64Array( Math.max( N - 1, 1 ) );
		for ( let i = 0; i < N - 1; i++ ) {
			e[ i ] = inp.e[ i ];
		}
		const Z = new Float64Array( N );
		const WORK = new Float64Array( Math.max( ( 2 * N ) - 2, 1 ) );
		const info = dstqrb( N, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
		assert.strictEqual( info, tc.info, 'info' );
		assertArrayClose( d, tc.d, TOL, 'eigenvalues' );
		assertArrayClose( Z, tc.z, TOL, 'last eigenvector row' );
	});
}

// Non-unit stride / offset for the larger case.
test( 'dstqrb (strided): mixed_n6', function t() {
	const tc = cases.find( ( c ) => c.name === 'mixed_n6' );
	const inp = INPUTS.mixed_n6;
	const N = inp.d.length;
	const d = new Float64Array( ( N * 2 ) + 1 );
	const e = new Float64Array( ( ( N - 1 ) * 2 ) + 1 );
	const Z = new Float64Array( ( N * 2 ) + 1 );
	for ( let i = 0; i < N; i++ ) {
		d[ ( i * 2 ) + 1 ] = inp.d[ i ];
	}
	for ( let i = 0; i < N - 1; i++ ) {
		e[ ( i * 2 ) + 1 ] = inp.e[ i ];
	}
	const WORK = new Float64Array( Math.max( ( 2 * N ) - 2, 1 ) );
	const info = dstqrb( N, d, 2, 1, e, 2, 1, Z, 2, 1, WORK, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	for ( let i = 0; i < N; i++ ) {
		const rd = Math.abs( d[ ( i * 2 ) + 1 ] - tc.d[ i ] ) / Math.max( Math.abs( tc.d[ i ] ), 1.0 );
		const rz = Math.abs( Z[ ( i * 2 ) + 1 ] - tc.z[ i ] ) / Math.max( Math.abs( tc.z[ i ] ), 1.0 );
		assert.ok( rd <= TOL, 'eigenvalue[' + i + ']' );
		assert.ok( rz <= TOL, 'z[' + i + ']' );
	}
});
