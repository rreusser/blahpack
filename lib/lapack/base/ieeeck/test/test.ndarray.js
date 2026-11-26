/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ieeeck from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs from the LAPACK Fortran (test/fortran/test_ieeeck.f90);
// regenerate with `./test/run_fortran.sh lapack ieeeck`.
const fixtureURL = new URL( './../../../../../test/fixtures/ieeeck.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// The grid values of test_ieeeck.f90, in its code order (JSON has no Inf/NaN):
const VALUES = [ 0.0, -0.0, 1.0, -1.0, 2.0, -2.0, 0.5, -4.0, Infinity, -Infinity, NaN, 1.0e-30, 3.0 ];


// FUNCTIONS //

/**
* Returns the fixture case with a given name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return cases.find( function find( c ) {
		return c.name === name;
	});
}


// TESTS //

test( 'ieeeck ndarray is a function', function t() {
	assert.strictEqual( typeof ieeeck, 'function', 'is a function' );
});

test( 'ieeeck: IEEE arithmetic is safe for the canonical call ILAENV makes', function t() {
	const tc = findCase( 'canonical' );
	assert.strictEqual( ieeeck( 0, 0.0, 1.0 ), tc.ispec0, 'ispec 0' );
	assert.strictEqual( ieeeck( 1, 0.0, 1.0 ), tc.ispec1, 'ispec 1' );
	assert.strictEqual( tc.ispec0, 1, 'reference returns 1' );
});

test( 'ieeeck: matches the reference over a grid of (zero, one), including signed zeros, infinities and NaN', function t() {
	const n = VALUES.length;
	let count;
	let tc;
	let i;
	let j;
	let k;
	count = 0;
	for ( k = 0; k < 3; k++ ) {
		tc = findCase( 'grid_ispec' + k );
		assert.strictEqual( tc.result.length, n * n, 'grid size' );
		for ( i = 0; i < n; i++ ) {
			for ( j = 0; j < n; j++ ) {
				assert.strictEqual( ieeeck( tc.ispec, VALUES[ i ], VALUES[ j ] ), tc.result[ ( i * n ) + j ], 'ispec=' + tc.ispec + ', zero=' + VALUES[ i ] + ', one=' + VALUES[ j ] );
				count += 1;
			}
		}
	}
	assert.strictEqual( count, 3 * n * n, 'compared every row' );
});

test( 'ieeeck: rounds its arguments to single precision, as the reference does with REAL ZERO and ONE', function t() {
	// 1e-50 is zero in single precision, so the check runs on ( 0, 1 ) and passes; in double precision 1/(-1e50+1) is a nonzero -1e-50, which would fail the negative-zero check:
	assert.strictEqual( ieeeck( 1, 1.0e-50, 1.0 ), 1, 'tiny zero rounds to 0' );
});
