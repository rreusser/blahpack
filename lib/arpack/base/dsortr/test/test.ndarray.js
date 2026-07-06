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
import dsortr from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsortr.f90);
// regenerate with `./test/run_fortran.sh arpack dsortr`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsortr.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Original (pre-sort) inputs, keyed by fixture name; the Fortran driver uses
// the same inputs for each case (see test_dsortr.f90).
const INPUTS = {
	'LA_apply_n5': { which: 'LA', apply: true, x1: [ 3.0, -1.0, 4.0, -1.5, 2.0 ], x2: [ 10.0, 20.0, 30.0, 40.0, 50.0 ] },
	'SA_apply_n5': { which: 'SA', apply: true, x1: [ 3.0, -1.0, 4.0, -1.5, 2.0 ], x2: [ 10.0, 20.0, 30.0, 40.0, 50.0 ] },
	'LM_noapply_n5': { which: 'LM', apply: false, x1: [ 3.0, -1.0, 4.0, -1.5, 2.0 ], x2: [ 10.0, 20.0, 30.0, 40.0, 50.0 ] },
	'SM_apply_n6': { which: 'SM', apply: true, x1: [ -2.0, 2.0, 5.0, -0.5, 0.5, -5.0 ], x2: [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] }
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
	test( 'dsortr: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const N = tc.x1.length;
		const x1 = new Float64Array( inp.x1 );
		const x2 = new Float64Array( inp.x2 );
		dsortr( inp.which, inp.apply, N, x1, 1, 0, x2, 1, 0 );
		assertArrayEqual( x1, tc.x1, 'x1' );
		assertArrayEqual( x2, tc.x2, 'x2' );
	});
}

// Non-unit stride / offset: interleave inputs, sort with stride 2, offset 1.
for ( const tc of cases ) {
	test( 'dsortr (strided): ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const N = tc.x1.length;
		const x1 = new Float64Array( N * 2 );
		const x2 = new Float64Array( N * 2 );
		for ( let i = 0; i < N; i++ ) {
			x1[ ( i * 2 ) + 1 ] = inp.x1[ i ];
			x2[ ( i * 2 ) + 1 ] = inp.x2[ i ];
		}
		dsortr( inp.which, inp.apply, N, x1, 2, 1, x2, 2, 1 );
		for ( let i = 0; i < N; i++ ) {
			assert.strictEqual( x1[ ( i * 2 ) + 1 ], tc.x1[ i ], 'x1[' + i + ']' );
			assert.strictEqual( x2[ ( i * 2 ) + 1 ], tc.x2[ i ], 'x2[' + i + ']' );
		}
	});
}
