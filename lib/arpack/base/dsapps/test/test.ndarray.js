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
import dsapps from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsapps.f90);
// regenerate with `./test/run_fortran.sh arpack dsapps`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsapps.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

// Leading dimension used by the Fortran driver for v, h, and q.
const LD = 8;

// Diagonal / subdiagonal / shift inputs, keyed by fixture name (see test_dsapps.f90).
const INPUTS = {
	'basic_n6_k3_p2': { diag: [ 2.0, 1.0, 3.0, 0.5, 2.5 ], sub: [ 1.0, 0.5, 1.5, 0.75 ], shift: [ 1.5, 4.0 ] },
	'deflate_n6_k3_p2': { diag: [ 2.0, 1.0, 3.0, 0.5, 2.5 ], sub: [ 1.0, 0.0, 1.5, 0.75 ], shift: [ 1.5, 4.0 ] },
	'wide_n7_k2_p3': { diag: [ 1.5, 2.0, 0.5, 3.0, 1.0 ], sub: [ 0.5, 1.25, 0.75, 2.0 ], shift: [ 0.5, 2.5, -1.0 ] },
	'single_n5_k2_p1': { diag: [ 3.0, 1.0, 2.0 ], sub: [ 1.0, 0.5 ], shift: [ 1.75 ] }
};

const TOL = 1e-12;


// FUNCTIONS //

function buildV( n, kplusp ) {
	const v = new Float64Array( LD * 8 );
	for ( let j = 1; j <= kplusp; j++ ) {
		for ( let i = 1; i <= n; i++ ) {
			v[ ( ( j - 1 ) * LD ) + ( i - 1 ) ] = ( 0.25 * i ) - ( 0.125 * j ) + 0.5;
		}
	}
	return v;
}

function buildH( diag, sub ) {
	const h = new Float64Array( LD * 2 );
	for ( let i = 0; i < diag.length; i++ ) {
		h[ LD + i ] = diag[ i ]; // column 1: diagonal
	}
	for ( let i = 0; i < sub.length; i++ ) {
		h[ i + 1 ] = sub[ i ]; // column 0, rows 1..: subdiagonal
	}
	return h;
}

function buildResid( n ) {
	const r = new Float64Array( 8 );
	for ( let i = 1; i <= n; i++ ) {
		r[ i - 1 ] = ( 0.5 * i ) - 1.25;
	}
	return r;
}

// Flatten a column-major sub-block in the same order as the Fortran print_matrix helper.
function flatten( arr, ld, m, ncol ) {
	const out = [];
	for ( let j = 1; j <= ncol; j++ ) {
		for ( let i = 1; i <= m; i++ ) {
			out.push( arr[ ( ( j - 1 ) * ld ) + ( i - 1 ) ] );
		}
	}
	return out;
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
	test( 'dsapps: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const n = tc.n;
		const kev = tc.kev;
		const np = tc.np;
		const kplusp = kev + np;
		const v = buildV( n, kplusp );
		const h = buildH( inp.diag, inp.sub );
		const resid = buildResid( n );
		const q = new Float64Array( LD * 8 );
		const shift = new Float64Array( inp.shift );
		const workd = new Float64Array( 16 );

		dsapps( n, kev, np, shift, 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, workd, 1, 0 );

		assertClose( flatten( v, LD, n, kplusp ), tc.v, 'v' );
		assertClose( flatten( h, LD, kplusp, 2 ), tc.h, 'h' );
		assertClose( resid.subarray( 0, n ), tc.resid, 'resid' );
		assertClose( flatten( q, LD, kplusp, kplusp ), tc.q, 'q' );
	});
}

test( 'dsapps: throws RangeError for undersized workd', function t() {
	const v = buildV( 5, 3 );
	const h = buildH( [ 3.0, 1.0, 2.0 ], [ 1.0, 0.5 ] );
	const resid = buildResid( 5 );
	const q = new Float64Array( LD * 8 );
	assert.throws( function throws() {
		dsapps( 5, 2, 1, new Float64Array( [ 1.75 ] ), 1, 0, v, 1, LD, 0, h, 1, LD, 0, resid, 1, 0, q, 1, LD, 0, new Float64Array( 5 ), 1, 0 );
	}, RangeError );
});
