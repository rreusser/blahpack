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
* @param {Float64Array} V - Lanczos/Arnoldi basis (N-by-j)
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {Float64Array} rnorm - B-norm of the generated residual (length-1; out)
* @param {Int32Array} ipntr - pointers into `workd` for the operator (length >= 2; 0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {NonNegativeInteger} offsetIpntr - starting index for `ipntr`
* @param {Float64Array} workd - reverse-communication workspace (length >= 2*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {Int32Array} ierr - output (length-1 array): `ierr`
* @throws {TypeError} third argument must be `standard` or `generalized`
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {Int32Array} `ipntr`
*
* @example
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgetv0 from '@rreusser/blahpack/arpack/base/dgetv0';
*
* var N = 4;
* var V = new Float64Array( N );
* var resid = new Float64Array( N );
* var workd = new Float64Array( 2*N );
* var rnorm = new Float64Array( 1 );
* var ipntr = new Int32Array( 3 );
* var ido = new Int32Array( 1 );
* var state = {};
*
* var ierr = dgetv0.ndarray( state, ido, 'standard', 1, false, N, 1, V, 1, N, 0, resid, 1, 0, rnorm, ipntr, 1, 0, workd, 1, 0 );
* // ido[ 0 ] === -1 requests Y = OP*X; drive the loop until ido[ 0 ] === 99.
*/
function dgetv0( state, ido, bmat, itry, initv, N, j, V, strideV1, strideV2, offsetV, resid, strideResid, offsetResid, rnorm, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, ierr ) {
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || ( workd.length - offsetWorkd ) < ( 2 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements from offset %d. Provided length: %d.', 2 * N, offsetWorkd, ( workd ) ? workd.length : 0 ) );
	}
	// The routine initializes `state` on its first call (ido = 0).
	return base( /** @type {import( './base.js' ).Dgetv0State} */ ( state ), ido, bmat, itry, initv, N, j, V, strideV1, strideV2, offsetV, resid, strideResid, offsetResid, rnorm, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, ierr );
}


// EXPORTS //

export default dgetv0;
