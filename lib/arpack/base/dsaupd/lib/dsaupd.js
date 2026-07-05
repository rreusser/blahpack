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
* Reverse communication interface for the Implicitly Restarted Lanczos iteration.
*
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} ncv - number of Lanczos vectors (columns of `V`)
* @param {Float64Array} V - Lanczos basis (N-by-ncv, column-major; out)
* @param {integer} ldv - leading dimension of `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {Int32Array} ipntr - workspace pointers (length 11; out)
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @param {Float64Array} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {integer} lworkl - length of `workl`
* @param {integer} infoIn - nonzero on the first call to signal a user-supplied initial residual
* @throws {TypeError} third argument must be `standard` or `generalized`
* @throws {TypeError} fifth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @throws {RangeError} workl array must have sufficient length
* @returns {integer} INFO
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
*
* // dsaupd is the reverse-communication driver; see the package README for a
* // full example that applies OP and calls dseupd afterward.
* var ido = new Int32Array( 1 );
* var state = {};
*/
function dsaupd( state, ido, bmat, N, which, nev, tol, resid, ncv, V, ldv, iparam, ipntr, workd, workl, lworkl, infoIn ) {
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
	if ( !workl || workl.length < ( ( ncv * ncv ) + ( 8 * ncv ) ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', ( ncv * ncv ) + ( 8 * ncv ), ( workl ) ? workl.length : 0 ) );
	}
	return base( state, ido, bmat, N, which, nev, tol, resid, 1, 0, ncv, V, 1, ldv, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, infoIn );
}


// EXPORTS //

export default dsaupd;
