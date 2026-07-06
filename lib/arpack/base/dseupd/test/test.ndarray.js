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
import dseupd from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dseupd.f90);
// the driver runs the full dsaupd + dseupd pipeline on the 1-D Laplacian and
// records both the exact post-convergence inputs consumed by dseupd and its
// outputs. Regenerate with `./test/run_fortran.sh arpack dseupd`.
const fixtureURL = new URL( './../../../../../test/fixtures/dseupd.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

const TOL = 1e-10;


// TESTS //

for ( const tc of cases ) {
	test( 'dseupd: ' + tc.name, function t() {
		const n = tc.n;
		const nev = tc.nev;
		const ncv = tc.ncv;
		const lworkl = tc.lworkl;
		const nconv = tc.nconv;
		const rvec = tc.name.indexOf( '_rvec' ) !== -1;
		const which = tc.name.slice( 0, 2 ).toUpperCase();
		const ldv = n;
		const ldz = n;

		const v = Float64Array.from( tc.v );
		const workl = Float64Array.from( tc.workl );
		const workd = Float64Array.from( tc.workd );
		const resid = Float64Array.from( tc.resid );
		const iparam = tc.iparam.slice();
		const ipntr = tc.ipntr.slice();
		const select = new Array( ncv ).fill( false );
		const d = new Float64Array( nev );
		const z = new Float64Array( n * nev );

		const info = dseupd( rvec, 'all', select, 1, 0, d, 1, 0, z, 1, ldz, 0, tc.sigma, 'standard', n, which, nev, tc.tol, resid, 1, 0, ncv, v, 1, ldv, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl );

		assert.strictEqual( info, tc.info, 'info matches' );

		// Ritz values: expect bit-for-bit (or within 1e-10) agreement.
		for ( let i = 0; i < nconv; i++ ) {
			assert.ok( Math.abs( d[ i ] - tc.d[ i ] ) <= TOL * Math.max( Math.abs( tc.d[ i ] ), 1.0 ), 'd[' + i + '] matches (got ' + d[ i ] + ', expected ' + tc.d[ i ] + ')' );
		}

		// Ritz vectors: match sign-for-sign, allowing a per-column global sign
		// flip (a legitimate eigenvector freedom).
		if ( rvec && tc.z ) {
			for ( let c = 0; c < nconv; c++ ) {
				let dPlus = 0;
				let dMinus = 0;
				for ( let r = 0; r < n; r++ ) {
					const got = z[ ( c * ldz ) + r ];
					const exp = tc.z[ ( c * n ) + r ];
					dPlus = Math.max( dPlus, Math.abs( got - exp ) );
					dMinus = Math.max( dMinus, Math.abs( got + exp ) );
				}
				assert.ok( Math.min( dPlus, dMinus ) <= TOL, 'z column ' + c + ' matches up to sign (min diff ' + Math.min( dPlus, dMinus ) + ')' );
			}
		}
	});
}
