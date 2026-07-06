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

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem from an ARPACK Lanczos factorization.
*
* @param {boolean} rvec - if `true`, compute Ritz vectors; if `false`, compute Ritz values only
* @param {string} howmny - `'all'`, `'partial'`, or `'select'` (only `'all'` is implemented)
* @param {(Array|Uint8Array)} select - logical work array of length `ncv`
* @param {integer} strideSelect - stride length for `select`
* @param {Float64Array} d - output array for the Ritz values (length `nev`)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} z - output matrix of Ritz vectors (N-by-nev when howmny is `'all'`)
* @param {integer} ldz - leading dimension of `z`
* @param {number} sigma - shift used when the mode is 3, 4, or 5
* @param {string} bmat - `'standard'` for a standard problem, `'generalized'` for a generalized problem
* @param {NonNegativeInteger} N - dimension of the eigenproblem
* @param {string} which - eigenvalue selection: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
* @param {NonNegativeInteger} nev - number of eigenvalues requested
* @param {number} tol - relative accuracy tolerance used by `dsaupd`
* @param {Float64Array} resid - final residual vector (length N)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} ncv - number of Lanczos basis vectors
* @param {Float64Array} v - Lanczos basis matrix (N-by-ncv); overwritten on exit
* @param {integer} ldv - leading dimension of `v`
* @param {(Array|Int32Array)} iparam - ARPACK parameter array (`iparam[4]`=nconv, `iparam[6]`=mode)
* @param {integer} strideIparam - stride length for `iparam`
* @param {(Array|Int32Array)} ipntr - ARPACK pointer array into `workl`
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {Float64Array} workd - work array of length `2*N`
* @param {integer} strideWorkd - stride length for `workd`
* @param {Float64Array} workl - private work array set by `dsaupd` (length `lworkl`); modified on exit
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} lworkl - length of `workl`
* @throws {TypeError} `howmny` must be one of `all`, `partial`, or `select`
* @throws {TypeError} `bmat` must be one of `standard` or `generalized`
* @throws {TypeError} `which` must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @throws {RangeError} `workl` array must have sufficient length
* @returns {integer} info - 0 on success; a negative error code otherwise
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var ncv = 4;
* var lworkl = ( ncv * ncv ) + ( 8 * ncv );
* var workl = new Float64Array( lworkl );
* var v = new Float64Array( 2 * ncv );
* var z = new Float64Array( 2 * ncv );
* var d = new Float64Array( 2 );
* var resid = new Float64Array( 2 );
* var workd = new Float64Array( 4 );
* var select = new Array( ncv );
* var iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
* var ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
*
* var info = dseupd( true, 'all', select, 1, d, 1, z, 2, 0.0, 'standard', 2, 'LM', 2, 0.0, resid, 1, ncv, v, 2, iparam, 1, ipntr, 1, workd, 1, workl, 1, lworkl );
* // returns 0
*/
function dseupd( rvec, howmny, select, strideSelect, d, strideD, z, ldz, sigma, bmat, N, which, nev, tol, resid, strideResid, ncv, v, ldv, iparam, strideIparam, ipntr, strideIpntr, workd, strideWorkd, workl, strideWorkl, lworkl ) {
	if ( howmny !== 'all' && howmny !== 'partial' && howmny !== 'select' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of `all`, `partial`, or `select`. Value: `%s`.', howmny ) );
	}
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. `bmat` must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. `which` must be one of `LM`, `SM`, `LA`, `SA`, or `BE`. Value: `%s`.', which ) );
	}
	if ( rvec && ( !workl || workl.length < ( ncv * ncv ) + ( 8 * ncv ) ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', ( ncv * ncv ) + ( 8 * ncv ), ( workl ) ? workl.length : 0 ) );
	}
	return base( rvec, howmny, select, strideSelect, stride2offset( ncv, strideSelect ), d, strideD, stride2offset( nev, strideD ), z, 1, ldz, 0, sigma, bmat, N, which, nev, tol, resid, strideResid, stride2offset( N, strideResid ), ncv, v, 1, ldv, 0, iparam, strideIparam, stride2offset( 11, strideIparam ), ipntr, strideIpntr, stride2offset( 11, strideIpntr ), workd, strideWorkd, stride2offset( 2 * N, strideWorkd ), workl, strideWorkl, stride2offset( lworkl, strideWorkl ), lworkl );
}


// EXPORTS //

export default dseupd;
