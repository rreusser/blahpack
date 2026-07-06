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
var url = new URL( './../../../../../test/fixtures/dseupd.jsonl', import.meta.url );
var tc = JSON.parse( readFileSync( url, 'utf8' ).trim().split( '\n' )[ 0 ] );

var n = tc.n;
var nev = tc.nev;
var ncv = tc.ncv;

var v = Float64Array.from( tc.v );
var workl = Float64Array.from( tc.workl );
var workd = Float64Array.from( tc.workd );
var resid = Float64Array.from( tc.resid );
var iparam = tc.iparam.slice();
var ipntr = tc.ipntr.slice();
var select = new Array( ncv );
var d = new Float64Array( nev );
var z = new Float64Array( n * nev );

var howmny = 'all'; // ARPACK code: compute all Ritz vectors
var bmat = 'standard'; // ARPACK code: standard eigenproblem

// Extract the three largest eigenvalues and their Ritz vectors:
var info = dseupd( true, howmny, select, 1, d, 1, z, n, tc.sigma, bmat, n, 'LM', nev, tc.tol, resid, 1, ncv, v, n, iparam, 1, ipntr, 1, workd, 1, workl, 1, tc.lworkl );

console.log( info ); // eslint-disable-line no-console
// => 0

console.log( Array.prototype.slice.call( d ) ); // eslint-disable-line no-console
// => three largest eigenvalues of the 1-D Laplacian, ascending
