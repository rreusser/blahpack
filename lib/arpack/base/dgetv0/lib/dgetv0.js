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
* Generates the initial residual vector for the symmetric Lanczos/Arnoldi iteration, orthogonal to the current `V` basis, via reverse communication.
*
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} itry - restart attempt counter (>= 1)
* @param {boolean} initv - if `true`, `resid` already holds an initial vector; if `false`, it is randomized
* @param {NonNegativeInteger} N - order of the problem
* @param {NonNegativeInteger} j - index of the residual vector to be generated
* @param {Float64Array} V - Lanczos/Arnoldi basis (N-by-j, column-major)
* @param {integer} ldv - leading dimension of `V`
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {Float64Array} rnorm - B-norm of the generated residual (length-1; out)
* @param {Int32Array} ipntr - pointers into `workd` for the operator (length >= 2; 0-based; out)
* @param {Float64Array} workd - reverse-communication workspace (length >= 2*N)
* @throws {TypeError} third argument must be `standard` or `generalized`
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {integer} IERR - 0 on success, -1 if refinement failed
*/
function dgetv0( state, ido, bmat, itry, initv, N, j, V, ldv, resid, rnorm, ipntr, workd ) {
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 2 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 2 * N, ( workd ) ? workd.length : 0 ) );
	}
	return base( state, ido, bmat, itry, initv, N, j, V, 1, ldv, 0, resid, 1, 0, rnorm, ipntr, 1, 0, workd, 1, 0 );
}


// EXPORTS //

export default dgetv0;
