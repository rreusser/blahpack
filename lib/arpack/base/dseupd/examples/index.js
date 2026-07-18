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

import { readFileSync } from 'node:fs';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dseupd from './../lib/index.js';

// `dseupd` post-processes a converged ARPACK Lanczos factorization produced by
// `dsaupd`. Because it consumes internal state (`v`, `workl`, `iparam`,
// `ipntr`), we load a genuine post-convergence snapshot recorded from the
// reference Fortran driver run on the 10x10 1-D Laplacian (which = 'LM').
const url = new URL( './../../../../../test/fixtures/dseupd.jsonl', import.meta.url );
const tc = JSON.parse( readFileSync( url, 'utf8' ).trim().split( '\n' )[ 0 ] );

const n = tc.n;
const nev = tc.nev;
const ncv = tc.ncv;

const v = Float64Array.from( tc.v );
const workl = Float64Array.from( tc.workl );
const workd = Float64Array.from( tc.workd );
const resid = Float64Array.from( tc.resid );
const iparam = tc.iparam.slice();
const ipntr = tc.ipntr.slice();
const select = new Array( ncv );
const d = new Float64Array( nev );
const z = new Float64Array( n * nev );

const howmny = 'all'; // ARPACK code: compute all Ritz vectors
const bmat = 'standard'; // ARPACK code: standard eigenproblem

// Extract the three largest eigenvalues and their Ritz vectors:
const info = dseupd( true, howmny, select, 1, d, 1, z, n, tc.sigma, bmat, n, 'LM', nev, tc.tol, resid, 1, ncv, v, n, iparam, 1, ipntr, 1, workd, 1, workl, 1, tc.lworkl );

console.log( info ); // eslint-disable-line no-console
// => 0

console.log( Array.prototype.slice.call( d ) ); // eslint-disable-line no-console
// => three largest eigenvalues of the 1-D Laplacian, ascending
