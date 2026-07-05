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
import dsconv from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsconv.f90);
// regenerate with `./test/run_fortran.sh arpack dsconv`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsconv.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});


// TESTS //

for ( const tc of cases ) {
	test( 'dsconv: ' + tc.name, function t() {
		const ritz = new Float64Array( tc.ritz );
		const bounds = new Float64Array( tc.bounds );
		const nconv = dsconv( tc.n, ritz, 1, 0, bounds, 1, 0, tc.tol );
		assert.strictEqual( nconv, tc.nconv, 'nconv matches ARPACK reference' );
	});
}

// Exercise non-unit strides / offsets against the same references by
// interleaving the inputs and reading them back with stride 2, offset 1.
for ( const tc of cases ) {
	test( 'dsconv (strided): ' + tc.name, function t() {
		const ritz = new Float64Array( tc.n * 2 );
		const bounds = new Float64Array( tc.n * 2 );
		for ( let i = 0; i < tc.n; i++ ) {
			ritz[ ( i * 2 ) + 1 ] = tc.ritz[ i ];
			bounds[ ( i * 2 ) + 1 ] = tc.bounds[ i ];
		}
		const nconv = dsconv( tc.n, ritz, 2, 1, bounds, 2, 1, tc.tol );
		assert.strictEqual( nconv, tc.nconv, 'nconv matches with stride 2, offset 1' );
	});
}
