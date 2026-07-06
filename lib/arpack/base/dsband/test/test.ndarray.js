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
import dsband from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsband.f90);
// regenerate with `./test/run_fortran.sh arpack dsband`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsband.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

const LDA = 4; // 2*kl + ku + 1 for kl = ku = 1
const KL = 1;
const KU = 1;
const IDIAG = KL + KU + 1;
const ISUP = KL + KU;
const ISUB = KL + KU + 2;
const TOL = 1e-9;

const INPUTS = {
	'gen_shiftinv_n20': { n: 20, nev: 4, ncv: 10, mode: 3, bmat: 'generalized', which: 'LM', sigma: 0.0 },
	'std_regular_n16': { n: 16, nev: 3, ncv: 8, mode: 1, bmat: 'standard', which: 'SA', sigma: 0.0 },
	'std_shiftinv_n16': { n: 16, nev: 3, ncv: 8, mode: 3, bmat: 'standard', which: 'LM', sigma: 1.0 }
};


// FUNCTIONS //

function buildBands( n ) {
	const AB = new Float64Array( LDA * n );
	const MB = new Float64Array( LDA * n );
	const h = 1.0 / ( n + 1 );
	const r1 = 4.0 / 6.0;
	const r2 = 1.0 / 6.0;
	let j;
	for ( j = 1; j <= n; j++ ) {
		AB[ ( IDIAG - 1 ) + ( ( j - 1 ) * LDA ) ] = 2.0 / h;
		MB[ ( IDIAG - 1 ) + ( ( j - 1 ) * LDA ) ] = r1 * h;
	}
	for ( j = 1; j <= n - 1; j++ ) {
		AB[ ( ISUP - 1 ) + ( j * LDA ) ] = -1.0 / h;
		AB[ ( ISUB - 1 ) + ( ( j - 1 ) * LDA ) ] = -1.0 / h;
		MB[ ( ISUP - 1 ) + ( j * LDA ) ] = r2 * h;
		MB[ ( ISUB - 1 ) + ( ( j - 1 ) * LDA ) ] = r2 * h;
	}
	return { AB, MB };
}

function run( inp ) {
	const n = inp.n;
	const ncv = inp.ncv;
	const bands = buildBands( n );
	const RFAC = new Float64Array( LDA * n );
	const ldv = n;
	const V = new Float64Array( ldv * ncv );
	const d = new Float64Array( ncv );
	const resid = new Float64Array( n );
	let r;
	for ( r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const workd = new Float64Array( 3 * n );
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const workl = new Float64Array( lworkl );
	const iparam = new Int32Array( 11 );
	iparam[ 2 ] = 300;
	iparam[ 6 ] = inp.mode;
	const iwork = new Int32Array( n );
	const select = new Int32Array( ncv );

	// Z aliases V (as in the ARPACK band driver); base takes them as separate parameters.
	const info = dsband( true, 'all', select, 1, 0, d, 1, 0, V, 1, ldv, 0, inp.sigma, n, bands.AB, 1, LDA, 0, bands.MB, 1, LDA, 0, RFAC, 1, LDA, 0, KL, KU, inp.which, inp.bmat, inp.nev, 0.0, resid, 1, 0, ncv, V, 1, ldv, 0, iparam, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, iwork, 1, 0, 1 );

	const nconv = iparam[ 4 ];
	return { info, nconv, mxiter: iparam[ 2 ], d: d.slice( 0, inp.nev ), z: V.slice( 0, n * nconv ), n };
}

// Compares Ritz vector columns, allowing a global sign flip per column.
function columnDiff( got, exp, n, ncol ) {
	let maxd = 0;
	let c;
	let r;
	for ( c = 0; c < ncol; c++ ) {
		let mi = 0;
		let mv = 0;
		for ( r = 0; r < n; r++ ) {
			if ( Math.abs( exp[ ( c * n ) + r ] ) > mv ) {
				mv = Math.abs( exp[ ( c * n ) + r ] );
				mi = r;
			}
		}
		const s = ( Math.sign( got[ ( c * n ) + mi ] ) === Math.sign( exp[ ( c * n ) + mi ] ) ) ? 1 : -1;
		for ( r = 0; r < n; r++ ) {
			maxd = Math.max( maxd, Math.abs( ( s * got[ ( c * n ) + r ] ) - exp[ ( c * n ) + r ] ) );
		}
	}
	return maxd;
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsband: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.nconv, tc.nconv, 'nconv' );
		assert.strictEqual( out.mxiter, tc.mxiter, 'mxiter' );
		for ( let i = 0; i < tc.d.length; i++ ) {
			assert.ok( close( out.d[ i ], tc.d[ i ] ), 'd[' + i + ']: expected ' + tc.d[ i ] + ', got ' + out.d[ i ] );
		}
		const zd = columnDiff( out.z, tc.z, tc.n, tc.nconv );
		assert.ok( zd < 1e-8, 'Ritz vectors match (max diff ' + zd + ')' );
	});
}
