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
* Extends a symmetric Lanczos factorization from length `k` to length `k+np`, via reverse communication.
*
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {NonNegativeInteger} k - current order of the factorization
* @param {NonNegativeInteger} np - number of additional steps
* @param {integer} mode - problem mode (`2` is the `B*OP = A` shortcut)
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {Float64Array} rnorm - B-norm of the residual (length-1; in/out)
* @param {Float64Array} V - Lanczos basis (N-by-(k+np), column-major)
* @param {integer} ldv - leading dimension of `V`
* @param {Float64Array} H - tridiagonal matrix in 2-column column-major layout
* @param {integer} ldh - leading dimension of `H`
* @param {Int32Array} ipntr - operator pointers into `workd` (0-based; out)
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @throws {TypeError} third argument must be `standard` or `generalized`
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {integer} INFO - 0 on success, or the converged subspace size on restart failure
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
* var Float64Array = require( '@stdlib/array/float64' );
*
* var N = 4;
* var resid = new Float64Array( [ 1.0, 0.5, -0.5, 0.2 ] );
* var rnorm = new Float64Array( 1 );
* var V = new Float64Array( N * 3 );
* var H = new Float64Array( 3 * 2 );
* var workd = new Float64Array( 3 * N );
* var ipntr = new Int32Array( 3 );
* var ido = new Int32Array( 1 );
* var state = {};
* // Drive the loop applying OP (ido[0]===1) and B (ido[0]===2) until ido[0]===99.
*/
function dsaitr( state, ido, bmat, N, k, np, mode, resid, rnorm, V, ldv, H, ldh, ipntr, workd ) {
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	return base( state, ido, bmat, N, k, np, mode, resid, 1, 0, rnorm, V, 1, ldv, 0, H, 1, ldh, 0, ipntr, 1, 0, workd, 1, 0 );
}


// EXPORTS //

export default dsaitr;
