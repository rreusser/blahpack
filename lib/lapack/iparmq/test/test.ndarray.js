/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import iparmq from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs from the LAPACK Fortran (test/fortran/test_iparmq.f90);
// regenerate with `./test/run_fortran.sh lapack iparmq`.
const fixtureURL = new URL( '../../../../test/fixtures/iparmq.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});


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

test( 'iparmq ndarray is a function', function t() {
	assert.strictEqual( typeof iparmq, 'function', 'is a function' );
});

test( 'iparmq: INWIN, ISHFTS and IACC22 match the reference for every NH from -2 to 700 and past each threshold (ILO = 1 and ILO = 7)', function t() {
	let count;
	let ihi;
	let nh;
	let tc;
	let i;
	let k;
	count = 0;
	for ( k = 0; k < 2; k++ ) {
		tc = findCase( ( k === 0 ) ? 'nh_sweep_ilo1' : 'nh_sweep_ilo7' );
		for ( i = 0; i < tc.nh.length; i++ ) {
			nh = tc.nh[ i ];
			ihi = tc.ilo + nh - 1;
			assert.strictEqual( iparmq( 13, 'DLAQR0', 'SV', nh, tc.ilo, ihi ), tc.inwin[ i ], 'INWIN, NH=' + nh + ', ILO=' + tc.ilo );
			assert.strictEqual( iparmq( 15, 'DLAQR0', 'SV', nh, tc.ilo, ihi ), tc.ishfts[ i ], 'ISHFTS, NH=' + nh + ', ILO=' + tc.ilo );
			assert.strictEqual( iparmq( 16, 'DLAQR0', 'SV', nh, tc.ilo, ihi ), tc.iacc22[ i ], 'IACC22, NH=' + nh + ', ILO=' + tc.ilo );
			count += 3;
		}
	}
	assert.strictEqual( count, 6 * findCase( 'nh_sweep_ilo1' ).nh.length, 'compared every row' );
});

test( 'iparmq: every query (ISPEC = 0..18) matches the reference for every caller name and the names reaching the other branches', function t() {
	const grid = findCase( 'nh_grid' ).nh;
	const n = grid.length;
	let names;
	let count;
	let tc;
	let i;
	let j;
	let k;
	names = cases.filter( function f( c ) {
		return /^name_/.test( c.name );
	});
	assert.ok( names.length >= 20, 'has the per-name cases' );
	count = 0;
	for ( k = 0; k < names.length; k++ ) {
		tc = names[ k ];
		for ( i = 0; i <= 18; i++ ) {
			for ( j = 0; j < n; j++ ) {
				assert.strictEqual( iparmq( i, tc.routine, tc.opts, grid[ j ], 1, grid[ j ] ), tc.result[ ( i * n ) + j ], 'ISPEC=' + i + ', NAME=' + tc.routine + ', NH=' + grid[ j ] );
				count += 1;
			}
		}
	}
	assert.strictEqual( count, names.length * 19 * n, 'compared every row' );
});

test( 'iparmq: IACC22 reads the case of NAME as the reference does (upper-cased only when the first character is lower-case)', function t() {
	// Both upper-case 'DLAQR0' and lower-case 'dlaqr0' are the LAQR family:
	assert.strictEqual( iparmq( 16, 'dlaqr0', 'SV', 300, 1, 300 ), iparmq( 16, 'DLAQR0', 'SV', 300, 1, 300 ), 'lower case' );

	// 'Dlaqr0' starts upper-case, so its lower-case tail is not converted and does not match 'LAQR':
	assert.strictEqual( iparmq( 16, 'Dlaqr0', 'SV', 300, 1, 300 ), 0, 'mixed case' );
});

test( 'iparmq: throws a TypeError for a name or opts that is not a string', function t() {
	assert.throws( function throws() {
		iparmq( 1, 5, ' ', 10, 10, 10, -1 );
	}, TypeError );
	assert.throws( function throws() {
		iparmq( 1, 'DGEQRF', null, 10, 10, 10, -1 );
	}, TypeError );
});
