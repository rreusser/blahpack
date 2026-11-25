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
* Generates the initial residual vector for the symmetric Lanczos/Arnoldi iteration, orthogonal to the current `V` basis, via reverse communication.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {('standard'|'generalized')} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} itry - restart attempt counter (>= 1)
* @param {boolean} initv - if `true`, `resid` already holds an initial vector; if `false`, it is randomized
* @param {NonNegativeInteger} N - order of the problem
* @param {NonNegativeInteger} j - index of the residual vector to be generated
* @param {Float64Array} V - Lanczos/Arnoldi basis (N-by-j, column-major)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {Float64Array} rnorm - B-norm of the generated residual (length-1; out)
* @param {Int32Array} ipntr - pointers into `workd` for the operator (length >= 2; 0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {(Float64Array|null)} workd - reverse-communication workspace (length >= 2*N)
* @param {Int32Array} ierr - output (length-1 array): `ierr`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fourth argument must be one of the following: "standard", "generalized"
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {Int32Array} `ipntr`
*/
function dgetv0( order, state, ido, bmat, itry, initv, N, j, V, LDV, resid, strideResid, rnorm, ipntr, strideIpntr, workd, ierr ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "standard", "generalized". Value: `%s`.', bmat ) );
	}
	const oresid = stride2offset( N, strideResid );
	const oipntr = stride2offset( 3, strideIpntr );
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 2 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 2 * N, ( workd ) ? workd.length : 0 ) );
	}
	// The routine initializes `state` on its first call (ido = 0).
	return base( /** @type {import( './base.js' ).Dgetv0State} */ ( state ), ido, bmat, itry, initv, N, j, V, sv1, sv2, 0, resid, strideResid, oresid, rnorm, ipntr, strideIpntr, oipntr, workd, 1, 0, ierr );
}


// EXPORTS //

export default dgetv0;
