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
import dsaitr from './../lib/ndarray.js';


// FUNCTIONS //

function nrm2( x, n ) {
	var s = 0.0;
	var i;
	for ( i = 0; i < n; i++ ) {
		s += x[ i ] * x[ i ];
	}
	return Math.sqrt( s );
}


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsaitr.f90);
// regenerate with `./test/run_fortran.sh arpack dsaitr`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsaitr.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

function a1( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		a[ i + ( i * n ) ] = 2.0 + ( 0.5 * ( i + 1 ) );
	}
	const s = ( i, j, v ) => {
		a[ ( i - 1 ) + ( ( j - 1 ) * n ) ] = v;
		a[ ( j - 1 ) + ( ( i - 1 ) * n ) ] = v;
	};
	s( 1, 2, 0.3 ); s( 2, 3, -0.4 ); s( 3, 4, 0.2 ); s( 4, 5, -0.6 ); s( 1, 3, 0.1 ); s( 2, 4, 0.15 );
	return a;
}

function a2( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 1; i <= n; i++ ) {
		a[ ( i - 1 ) + ( ( i - 1 ) * n ) ] = 3.0 + i;
		for ( let j = i + 1; j <= n; j++ ) {
			const v = ( 0.2 * i ) - ( 0.1 * j );
			a[ ( i - 1 ) + ( ( j - 1 ) * n ) ] = v;
			a[ ( j - 1 ) + ( ( i - 1 ) * n ) ] = v;
		}
	}
	return a;
}

const INPUTS = {
	'std_np4_n5': { n: 5, np: 4, bmat: 'standard', A: a1( 5 ), resid: [ 1.0, 0.3, -0.7, 0.5, -0.2 ] },
	'std_np3_n5': { n: 5, np: 3, bmat: 'standard', A: a2( 5 ), resid: [ 0.8, -1.2, 0.4, 1.5, -0.6 ] },
	'gen_np3_n5': { n: 5, np: 3, bmat: 'generalized', A: a1( 5 ), resid: [ 1.0, 0.3, -0.7, 0.5, -0.2 ] }
};

const LDV = 8;
const LDH = 8;
const TOL = 1e-12;


// FUNCTIONS //

function run( inp ) {
	const n = inp.n;
	const np = inp.np;
	const A = inp.A;
	const resid = new Float64Array( inp.resid );
	const rnorm = new Float64Array( [ nrm2( resid, n ) ] );
	const V = new Float64Array( LDV * np );
	const H = new Float64Array( LDH * 2 );
	const workd = new Float64Array( 3 * n );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	for ( let i = 0; i < n; i++ ) {
		workd[ i ] = resid[ i ]; // loop invariant: workd(ipj) = B*resid (B=I)
	}
	const state = {};
	let info = 0;
	let guard = 0;
	while ( guard++ < 2000 ) {
		info = dsaitr( state, ido, inp.bmat, n, 0, np, 1, resid, 1, 0, rnorm, V, 1, LDV, 0, H, 1, LDH, 0, ipntr, 1, 0, workd, 1, 0 );
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
	return { V, H, resid, info, ido: ido[ 0 ] };
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsaitr: ' + tc.name, function t() {
		const inp = INPUTS[ tc.name ];
		const n = inp.n;
		const np = inp.np;
		const out = run( inp );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.ido, tc.ido, 'ido' );
		for ( let col = 0; col < np; col++ ) {
			for ( let row = 0; row < n; row++ ) {
				assert.ok( close( out.V[ row + ( col * LDV ) ], tc.v[ ( col * n ) + row ] ), 'V[' + row + ',' + col + ']' );
			}
		}
		for ( let j = 1; j <= np; j++ ) {
			assert.ok( close( out.H[ ( j - 1 ) + LDH ], tc.hdiag[ j - 1 ] ), 'hdiag[' + j + ']' );
		}
		for ( let j = 2; j <= np; j++ ) {
			assert.ok( close( out.H[ j - 1 ], tc.hsub[ j - 2 ] ), 'hsub[' + j + ']' );
		}
		for ( let i = 0; i < n; i++ ) {
			assert.ok( close( out.resid[ i ], tc.resid[ i ] ), 'resid[' + i + ']' );
		}
	});
}
