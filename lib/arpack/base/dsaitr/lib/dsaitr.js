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
* Extends a symmetric Lanczos factorization from length `k` to length `k+np`, via reverse communication.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {('standard'|'generalized')} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {NonNegativeInteger} k - current order of the factorization
* @param {NonNegativeInteger} np - number of additional steps
* @param {integer} mode - problem mode (`2` is the `B*OP = A` shortcut)
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {Float64Array} rnorm - B-norm of the residual (length-1; in/out)
* @param {Float64Array} V - Lanczos basis (N-by-(k+np), column-major)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} H - tridiagonal matrix in 2-column column-major layout
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Int32Array} ipntr - operator pointers into `workd` (0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {(Float64Array|null)} workd - reverse-communication workspace (length >= 3*N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fourth argument must be `standard` or `generalized`
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {integer} INFO - 0 on success, or the converged subspace size on restart failure
*
* @example
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
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
function dsaitr( order, state, ido, bmat, N, k, np, mode, resid, strideResid, rnorm, V, LDV, H, LDH, ipntr, strideIpntr, workd ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oresid = stride2offset( N, strideResid );
	const oipntr = stride2offset( 3, strideIpntr );
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	// The routine initializes `state` on its first call (ido = 0).
	return base( /** @type {import( './base.js' ).DsaitrState} */ ( state ), ido, bmat, N, k, np, mode, resid, strideResid, oresid, rnorm, V, sv1, sv2, 0, H, sh1, sh2, 0, ipntr, strideIpntr, oipntr, workd, 1, 0 );
}


// EXPORTS //

export default dsaitr;
