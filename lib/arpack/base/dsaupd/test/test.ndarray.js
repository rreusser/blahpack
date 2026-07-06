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
import dsaupd from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsaupd.f90);
// regenerate with `./test/run_fortran.sh arpack dsaupd`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsaupd.jsonl', import.meta.url );
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
	'LM_n10_nev3_ncv6': { n: 10, which: 'LM', nev: 3, ncv: 6, A: lap( 10 ) },
	'SA_n10_nev4_ncv8': { n: 10, which: 'SA', nev: 4, ncv: 8, A: lap( 10 ) },
	'LA_n8_nev2_ncv6': { n: 8, which: 'LA', nev: 2, ncv: 6, A: dense( 8 ) }
};

const TOL = 1e-9;


// FUNCTIONS //

function run( inp ) {
	const n = inp.n;
	const A = inp.A;
	const ncv = inp.ncv;
	const ldv = n;
	const V = new Float64Array( ldv * ncv );
	const resid = new Float64Array( n );
	for ( let r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const workd = new Float64Array( 3 * n );
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const workl = new Float64Array( lworkl );
	const iparam = new Int32Array( 11 );
	iparam[ 0 ] = 1;
	iparam[ 2 ] = 100;
	iparam[ 6 ] = 1;
	const ipntr = new Int32Array( 11 );
	const ido = new Int32Array( 1 );
	const state = {};
	let info = 1;
	let guard = 0;
	while ( guard++ < 100000 ) {
		info = dsaupd( state, ido, 'standard', n, inp.which, inp.nev, 0.0, resid, 1, 0, ncv, V, 1, ldv, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, info );
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			const p = ipntr[ 0 ];
			const q = ipntr[ 1 ];
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ p + c ];
				}
				workd[ q + r ] = acc;
			}
		} else {
			break;
		}
	}

	// Ritz values / bounds live in workl at the 1-based pointers ipntr(6)/ipntr(7):
	const ritzOff = ipntr[ 5 ] - 1;
	const boundsOff = ipntr[ 6 ] - 1;
	const ritz = workl.slice( ritzOff, ritzOff + ncv );
	const bounds = workl.slice( boundsOff, boundsOff + ncv );
	return { ritz, bounds, resid, nconv: iparam[ 4 ], mxiter: iparam[ 2 ], info, ido: ido[ 0 ] };
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsaupd: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.ido, tc.ido, 'ido' );
		assert.strictEqual( out.nconv, tc.nconv, 'nconv' );
		assert.strictEqual( out.mxiter, tc.mxiter, 'mxiter' );
		for ( let i = 0; i < tc.ritz.length; i++ ) {
			assert.ok( close( out.ritz[ i ], tc.ritz[ i ] ), 'ritz[' + i + ']: expected ' + tc.ritz[ i ] + ', got ' + out.ritz[ i ] );
		}
		for ( let i = 0; i < tc.bounds.length; i++ ) {
			assert.ok( close( out.bounds[ i ], tc.bounds[ i ] ), 'bounds[' + i + ']' );
		}
		for ( let i = 0; i < tc.resid.length; i++ ) {
			assert.ok( close( out.resid[ i ], tc.resid[ i ] ), 'resid[' + i + ']' );
		}
	});
}
