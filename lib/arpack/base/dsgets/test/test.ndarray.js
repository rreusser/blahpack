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
import dsgets from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsgets.f90);
// regenerate with `./test/run_fortran.sh arpack dsgets`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsgets.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Original inputs, keyed by fixture name (see test_dsgets.f90).
const INPUTS = {
	'LM_ishift1_kev3_np2': { ishift: 1, which: 'LM', kev: 3, np: 2, ritz: [ 3.0, -1.0, 4.0, -1.5, 2.0 ], bounds: [ 0.1, 0.5, 0.02, 0.3, 0.05 ] },
	'BE_ishift1_kev4_np2': { ishift: 1, which: 'BE', kev: 4, np: 2, ritz: [ 3.0, -1.0, 4.0, -1.5, 2.0, -5.0 ], bounds: [ 0.1, 0.5, 0.02, 0.3, 0.05, 0.4 ] },
	'SA_ishift0_kev3_np2': { ishift: 0, which: 'SA', kev: 3, np: 2, ritz: [ 3.0, -1.0, 4.0, -1.5, 2.0 ], bounds: [ 0.1, 0.5, 0.02, 0.3, 0.05 ] },
	'LA_ishift1_kev2_np3': { ishift: 1, which: 'LA', kev: 2, np: 3, ritz: [ -2.0, 5.0, 1.0, -3.0, 0.5 ], bounds: [ 0.2, 0.01, 0.3, 0.04, 0.15 ] }
};


// FUNCTIONS //

function assertArrayEqual( actual, expected, msg ) {
	assert.strictEqual( actual.length, expected.length, msg + ': length mismatch' );
	for ( let i = 0; i < expected.length; i++ ) {
		assert.strictEqual( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsgets: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const n = inp.kev + inp.np;
		const ritz = new Float64Array( inp.ritz );
		const bounds = new Float64Array( inp.bounds );
		const shifts = new Float64Array( inp.np );
		dsgets( inp.ishift, inp.which, inp.kev, inp.np, ritz, 1, 0, bounds, 1, 0, shifts, 1, 0 );
		assert.strictEqual( ritz.length, n, 'length' );
		assertArrayEqual( ritz, tc.ritz, 'ritz' );
		assertArrayEqual( bounds, tc.bounds, 'bounds' );
		assertArrayEqual( shifts, tc.shifts, 'shifts' );
	});
}

test( 'dsgets: throws TypeError for invalid which', function t() {
	assert.throws( function throws() {
		dsgets( 1, 'XX', 2, 1, new Float64Array( 3 ), 1, 0, new Float64Array( 3 ), 1, 0, new Float64Array( 1 ), 1, 0 );
	}, TypeError );
});
