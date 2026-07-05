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
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsaup2 from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsaup2.f90);
// regenerate with `./test/run_fortran.sh arpack dsaup2`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsaup2.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

function lap( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		a[ i + ( i * n ) ] = 2.0;
		if ( i < n - 1 ) {
			a[ i + ( ( i + 1 ) * n ) ] = -1.0;
			a[ ( i + 1 ) + ( i * n ) ] = -1.0;
		}
	}
	return a;
}

function dense( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 1; i <= n; i++ ) {
		a[ ( i - 1 ) + ( ( i - 1 ) * n ) ] = i;
		if ( i < n ) {
			a[ ( i - 1 ) + ( i * n ) ] = 0.5;
			a[ i + ( ( i - 1 ) * n ) ] = 0.5;
		}
	}
	return a;
}

const INPUTS = {
	'LM_n10_nev3_np3': { n: 10, which: 'LM', nev: 3, np: 3, A: lap( 10 ) },
	'SA_n10_nev4_np4': { n: 10, which: 'SA', nev: 4, np: 4, A: lap( 10 ) },
	'LA_n8_nev2_np4': { n: 8, which: 'LA', nev: 2, np: 4, A: dense( 8 ) }
};

const LD = 12;
const TOL = 1e-10;


// FUNCTIONS //

function run( inp ) {
	const n = inp.n;
	const A = inp.A;
	const kplusp = inp.nev + inp.np;
	const resid = new Float64Array( n );
	for ( let r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const V = new Float64Array( LD * kplusp );
	const H = new Float64Array( LD * 2 );
	const Q = new Float64Array( LD * kplusp );
	const ritz = new Float64Array( kplusp );
	const bounds = new Float64Array( kplusp );
	const workl = new Float64Array( 3 * kplusp );
	const workd = new Float64Array( 3 * n );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const nev = new Int32Array( [ inp.nev ] );
	const np = new Int32Array( [ inp.np ] );
	const mxiter = new Int32Array( [ 100 ] );
	const state = {};
	let info = 1;
	let guard = 0;
	while ( guard++ < 100000 ) {
		info = dsaup2( state, ido, 'standard', n, inp.which, nev, np, 0.0, resid, 1, 0, 1, 1, 1, mxiter, V, 1, LD, 0, H, 1, LD, 0, ritz, 1, 0, bounds, 1, 0, Q, 1, LD, 0, workl, 1, 0, ipntr, 1, 0, workd, 1, 0, info );
		if ( ido[ 0 ] === 99 ) {
			break;
		}
		const p = ipntr[ 0 ];
		const q = ipntr[ 1 ];
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ p + c ];
				}
				workd[ q + r ] = acc;
			}
		} else if ( ido[ 0 ] === 2 ) {
			for ( let r = 0; r < n; r++ ) {
				workd[ q + r ] = workd[ p + r ];
			}
		} else {
			break;
		}
	}
	return { ritz, bounds, nconv: nev[ 0 ], mxiter: mxiter[ 0 ], info };
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsaup2: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.nconv, tc.nconv, 'nconv' );
		assert.strictEqual( out.mxiter, tc.mxiter, 'mxiter' );
		for ( let i = 0; i < tc.ritz.length; i++ ) {
			assert.ok( close( out.ritz[ i ], tc.ritz[ i ] ), 'ritz[' + i + ']: expected ' + tc.ritz[ i ] + ', got ' + out.ritz[ i ] );
		}
		for ( let i = 0; i < tc.bounds.length; i++ ) {
			assert.ok( close( out.bounds[ i ], tc.bounds[ i ] ), 'bounds[' + i + ']' );
		}
	});
}
