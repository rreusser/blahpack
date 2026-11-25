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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reverse communication interface for the Implicitly Restarted Lanczos iteration.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {('standard'|'generalized')} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {('LM'|'SM'|'LA'|'SA'|'BE')} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} ncv - number of Lanczos vectors (columns of `V`)
* @param {Float64Array} V - Lanczos basis (N-by-ncv, column-major; out)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {integer} strideIparam - stride length for `iparam`
* @param {Int32Array} ipntr - workspace pointers (length 11; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {(Float64Array|null)} workd - reverse-communication workspace (length >= 3*N)
* @param {(Float64Array|null)} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {NonNegativeInteger} lworkl - length of `workl`
* @param {integer} infoIn - nonzero on the first call to signal a user-supplied initial residual
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fourth argument must be one of the following: "standard", "generalized"
* @throws {TypeError} sixth argument must be one of the following: "LM", "SM", "LA", "SA", "BE"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @throws {RangeError} workl array must have sufficient length
* @returns {integer} INFO
*
* @example
* import Int32Array from '@stdlib/array/int32/lib/index.js';
*
* // dsaupd is the reverse-communication driver; see the package README for a
* // full example that applies OP and calls dseupd afterward.
* var ido = new Int32Array( 1 );
* var state = {};
*/
function dsaupd( order, state, ido, bmat, N, which, nev, tol, resid, strideResid, ncv, V, LDV, iparam, strideIparam, ipntr, strideIpntr, workd, workl, lworkl, infoIn ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "standard", "generalized". Value: `%s`.', bmat ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Sixth argument must be one of the following: "LM", "SM", "LA", "SA", "BE". Value: `%s`.', which ) );
	}
	const oresid = stride2offset( N, strideResid );
	const oiparam = stride2offset( 11, strideIparam );
	const oipntr = stride2offset( 11, strideIpntr );
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	if ( !workl || workl.length < ( ( ncv * ncv ) + ( 8 * ncv ) ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', ( ncv * ncv ) + ( 8 * ncv ), ( workl ) ? workl.length : 0 ) );
	}
	// The routine initializes `state` on its first call (ido = 0).
	return base( /** @type {import( './base.js' ).DsaupdState} */ ( state ), ido, bmat, N, which, nev, tol, resid, strideResid, oresid, ncv, V, sv1, sv2, 0, iparam, strideIparam, oiparam, ipntr, strideIpntr, oipntr, workd, 1, 0, workl, 1, 0, lworkl, infoIn );
}


// EXPORTS //

export default dsaupd;
