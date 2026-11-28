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
import ilaenv from './../lib/strided.js';


// FIXTURES //

// Reference outputs from the LAPACK Fortran (test/fortran/test_ilaenv.f90);
// regenerate with `./test/run_fortran.sh lapack ilaenv`. The 'name_NNN'
// cases cover every (NAME, OPTS) of an ILAENV call in LAPACK 3.12's
// [dz]*.f sources, plus names that reach the branches no caller reaches.
const fixtureURL = new URL( '../../../../test/fixtures/ilaenv.jsonl', import.meta.url );
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

/**
* Returns the per-name fixture cases.
*
* @private
* @returns {Array<Object>} fixture cases
*/
function nameCases() {
	return cases.filter( function f( c ) {
		return /^name_/.test( c.name );
	});
}


// TESTS //

test( 'ilaenv strided is a function', function t() {
	assert.strictEqual( typeof ilaenv, 'function', 'is a function' );
});

test( 'ilaenv: every ISPEC (0..18) matches the reference for every NAME and OPTS and every dimension tuple', function t() {
	const tup = findCase( 'tuples' );
	const names = nameCases();
	const n = tup.n1.length;
	let count;
	let tc;
	let i;
	let j;
	let k;
	assert.ok( names.length > 150, 'has the per-name cases' );
	count = 0;
	for ( k = 0; k < names.length; k++ ) {
		tc = names[ k ];
		for ( i = 0; i <= 18; i++ ) {
			for ( j = 0; j < n; j++ ) {
				assert.strictEqual( ilaenv( i, tc.routine, tc.opts, tup.n1[ j ], tup.n2[ j ], tup.n3[ j ], tup.n4[ j ] ), tc.result[ ( i * n ) + j ], 'ISPEC=' + i + ', NAME=\'' + tc.routine + '\', N=(' + tup.n1[ j ] + ',' + tup.n2[ j ] + ',' + tup.n3[ j ] + ',' + tup.n4[ j ] + ')' );
				count += 1;
			}
		}
	}
	assert.strictEqual( count, names.length * 19 * n, 'compared every row' );
});

test( 'ilaenv: covers every routine name LAPACK 3.12 passes, and the S/C precisions', function t() {
	const routines = nameCases().map( function m( c ) {
		return c.routine;
	});
	const expected = [ 'DGEQRF', 'ZGEQRF', 'DORMQR', 'ZUNMQR', 'DSYTRF', 'ZHETRF', 'DLAQR0', 'ZLAQR4', 'DGGHD3', 'DTRSYL', 'ZTRSYL', 'DLAORHR_COL_GETRFNP', 'DSYTRF_AA_2STAGE', 'DGEQR ', 'DGELQ ', 'SGEQRF', 'CUNMQR', 'dgeqrf', 'Dgeqrf' ];
	expected.forEach( function each( r ) {
		assert.ok( routines.indexOf( r ) >= 0, 'has ' + r );
	});
});

test( 'ilaenv: ISPEC = 6 (INT( REAL( MIN( N1, N2 ) ) * 1.6 ), in single precision) matches the reference', function t() {
	const tc = findCase( 'ispec6_sweep' );
	let i;
	for ( i = 0; i < tc.n.length; i++ ) {
		assert.strictEqual( ilaenv( 6, 'DGESVD', 'AA', tc.n[ i ], tc.n[ i ] + 1, 0, 0 ), tc.result[ i ], 'N=' + tc.n[ i ] );
	}
	assert.ok( tc.n.length > 3000, 'compared every row' );
});

test( 'ilaenv: the xTRSYL block size reads MIN( N1, N2 ) in either order', function t() {
	const tc = findCase( 'trsyl_order' );
	assert.strictEqual( ilaenv( 1, 'DTRSYL', 'NN', 400, 2000, 0, 0 ), tc.d_small_first, 'D, N1 < N2' );
	assert.strictEqual( ilaenv( 1, 'DTRSYL', 'NN', 2000, 400, 0, 0 ), tc.d_large_first, 'D, N1 > N2' );
	assert.strictEqual( ilaenv( 1, 'ZTRSYL', 'NN', 400, 2000, 0, 0 ), tc.z_small_first, 'Z, N1 < N2' );
	assert.strictEqual( ilaenv( 1, 'ZTRSYL', 'NN', 2000, 400, 0, 0 ), tc.z_large_first, 'Z, N1 > N2' );
});

test( 'ilaenv: NAME of any case decodes as the reference upper-cases it', function t() {
	assert.strictEqual( ilaenv( 1, 'dgetrf', ' ', 100, 100, -1, -1 ), 64, 'lower case' );
	assert.strictEqual( ilaenv( 1, 'dGeTrF', ' ', 100, 100, -1, -1 ), 64, 'first character lower case' );

	// The reference upper-cases only when the first character is lower-case:
	assert.strictEqual( ilaenv( 1, 'Dgetrf', ' ', 100, 100, -1, -1 ), 1, 'first character upper case' );
});

test( 'ilaenv: throws a TypeError for a name or opts that is not a string', function t() {
	assert.throws( function throws() {
		ilaenv( 1, 5, ' ', 10, 10, 10, -1 );
	}, TypeError );
	assert.throws( function throws() {
		ilaenv( 1, 'DGEQRF', null, 10, 10, 10, -1 );
	}, TypeError );
});
