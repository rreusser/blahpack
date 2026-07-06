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
import dgetv0 from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dgetv0.f90);
// regenerate with `./test/run_fortran.sh arpack dgetv0`.
const fixtureURL = new URL( './../../../../../test/fixtures/dgetv0.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

function buildA( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		a[ i + ( i * n ) ] = 2.0 + ( 0.5 * ( i + 1 ) );
		if ( i < n - 1 ) {
			a[ i + ( ( i + 1 ) * n ) ] = -1.0;
			a[ ( i + 1 ) + ( i * n ) ] = -1.0;
		}
	}
	return a;
}

function buildA3( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		a[ i + ( i * n ) ] = ( i + 1 ) + 1.0;
		for ( let k = 0; k < n; k++ ) {
			if ( i !== k ) {
				a[ i + ( k * n ) ] = 0.25 * ( ( i + 1 ) + ( k + 1 ) );
			}
		}
	}
	return a;
}

// Inputs matching test_dgetv0.f90, keyed by fixture name.
const INPUTS = {
	'I_rand_j1_n5': { n: 5, j: 1, bmat: 'standard', initv: false, A: buildA( 5 ), V: null, resid0: null },
	'I_orth_j3_n5': { n: 5, j: 3, bmat: 'standard', initv: true, A: buildA( 5 ), V: 'e12', resid0: [ 0.6, -1.1, 2.3, 0.4, -1.7 ] },
	'G_orth_j3_n5': { n: 5, j: 3, bmat: 'generalized', initv: true, A: buildA( 5 ), V: 'e12', resid0: [ 0.6, -1.1, 2.3, 0.4, -1.7 ] },
	'I_orth_j2_n4': { n: 4, j: 2, bmat: 'standard', initv: true, A: buildA3( 4 ), V: 'e1', resid0: [ 1.0, 0.5, -0.5, 2.0 ] }
};

const LDV = 8;


// FUNCTIONS //

// Drive the dgetv0 reverse-communication loop: OP = A, and (bmat='generalized') B = I.
function run( inp ) {
	const n = inp.n;
	const V = new Float64Array( LDV * Math.max( inp.j, 1 ) );
	if ( inp.V === 'e12' ) {
		V[ 0 ] = 1.0;
		V[ 1 + LDV ] = 1.0;
	} else if ( inp.V === 'e1' ) {
		V[ 0 ] = 1.0;
	}
	const resid = new Float64Array( n );
	if ( inp.resid0 ) {
		for ( let i = 0; i < n; i++ ) {
			resid[ i ] = inp.resid0[ i ];
		}
	}
	const workd = new Float64Array( 2 * n );
	const rnorm = new Float64Array( 1 );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const state = {};
	let ierr = 0;
	let guard = 0;
	while ( guard++ < 500 ) {
		ierr = dgetv0( state, ido, inp.bmat, 1, inp.initv, n, inp.j, V, 1, LDV, 0, resid, 1, 0, rnorm, ipntr, 1, 0, workd, 1, 0 );
		if ( ido[ 0 ] === 99 ) {
			break;
		}
		const p = ipntr[ 0 ];
		const q = ipntr[ 1 ];
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += inp.A[ r + ( c * n ) ] * workd[ p + c ];
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
	return { resid, rnorm: rnorm[ 0 ], ierr, ido: ido[ 0 ] };
}


// TESTS //

for ( const tc of cases ) {
	test( 'dgetv0: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.ierr, tc.ierr, 'ierr' );
		assert.strictEqual( out.ido, tc.ido, 'ido' );
		assert.ok( Math.abs( out.rnorm - tc.rnorm ) <= 1e-12 * Math.max( Math.abs( tc.rnorm ), 1.0 ), 'rnorm' );
		for ( let i = 0; i < tc.resid.length; i++ ) {
			assert.ok( Math.abs( out.resid[ i ] - tc.resid[ i ] ) <= 1e-12 * Math.max( Math.abs( tc.resid[ i ] ), 1.0 ), 'resid[' + i + ']' );
		}
	});
}
