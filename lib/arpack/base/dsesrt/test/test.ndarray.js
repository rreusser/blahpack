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
import dsesrt from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsesrt.f90);
// regenerate with `./test/run_fortran.sh arpack dsesrt`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsesrt.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Original (pre-sort) inputs, keyed by fixture name (see test_dsesrt.f90).
// A is 3x4 column-major: column j = [ 10*(j+1)+1, 10*(j+1)+2, 10*(j+1)+3 ].
const LDA = 3;
const N = 4;
const A0 = [ 11.0, 12.0, 13.0, 21.0, 22.0, 23.0, 31.0, 32.0, 33.0, 41.0, 42.0, 43.0 ];
const INPUTS = {
	'LA_apply_n4_na3': { which: 'LA', apply: true, na: 3, x: [ 3.0, 1.0, 4.0, 2.0 ] },
	'SM_apply_n4_na2': { which: 'SM', apply: true, na: 2, x: [ -3.0, 1.0, -4.0, 2.0 ] },
	'SA_noapply_n4': { which: 'SA', apply: false, na: 3, x: [ 3.0, 1.0, 4.0, 2.0 ] }
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
	test( 'dsesrt: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const x = new Float64Array( inp.x );
		const A = new Float64Array( A0 );
		dsesrt( inp.which, inp.apply, N, x, 1, 0, inp.na, A, 1, LDA, 0 );
		assertArrayEqual( x, tc.x, 'x' );
		assertArrayEqual( A, tc.a, 'a' );
	});
}
