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
import base from './base.js';


// MAIN //

/**
* Intermediate driver for the Implicitly Restarted Lanczos iteration, via reverse communication.
*
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {Int32Array} nev - number of eigenvalues to compute (length-1; in/out)
* @param {Int32Array} np - number of implicit shifts (length-1; in/out)
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} mode - problem mode
* @param {integer} iupd - restart strategy flag
* @param {integer} ishift - `0` user shifts (reverse communication), `1` exact shifts
* @param {Int32Array} mxiter - max (in) / actual (out) iterations (length-1; in/out)
* @param {Float64Array} V - Lanczos basis (N-by-(nev+np), column-major)
* @param {integer} ldv - leading dimension of `V`
* @param {Float64Array} H - tridiagonal matrix in 2-column column-major layout
* @param {integer} ldh - leading dimension of `H`
* @param {Float64Array} ritz - Ritz values (out)
* @param {Float64Array} bounds - Ritz estimates (out)
* @param {Float64Array} Q - rotation accumulation matrix ((nev+np)-by-(nev+np), column-major)
* @param {integer} ldq - leading dimension of `Q`
* @param {Float64Array} workl - workspace array (length >= 3*(nev+np))
* @param {Int32Array} ipntr - operator pointers into `workd` (0-based; out)
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @param {integer} infoIn - nonzero on the first call to signal a user-supplied initial residual
* @throws {TypeError} third argument must be `standard` or `generalized`
* @throws {TypeError} fifth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {integer} INFO
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
*
* // dsaup2 is an internal driver of dsaupd; see the package README for a full
* // reverse-communication example.
* var ido = new Int32Array( 1 );
* var state = {};
*/
function dsaup2( state, ido, bmat, N, which, nev, np, tol, resid, mode, iupd, ishift, mxiter, V, ldv, H, ldh, ritz, bounds, Q, ldq, workl, ipntr, workd, infoIn ) {
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	return base( state, ido, bmat, N, which, nev, np, tol, resid, 1, 0, mode, iupd, ishift, mxiter, V, 1, ldv, 0, H, 1, ldh, 0, ritz, 1, 0, bounds, 1, 0, Q, 1, ldq, 0, workl, 1, 0, ipntr, 1, 0, workd, 1, 0, infoIn );
}


// EXPORTS //

export default dsaup2;
