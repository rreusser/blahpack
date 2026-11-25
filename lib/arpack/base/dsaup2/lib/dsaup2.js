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
* Intermediate driver for the Implicitly Restarted Lanczos iteration, via reverse communication.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {Int32Array} nev - number of eigenvalues to compute (length-1; in/out)
* @param {Int32Array} np - number of implicit shifts (length-1; in/out)
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {integer} mode - problem mode
* @param {integer} iupd - restart strategy flag
* @param {integer} ishift - `0` user shifts (reverse communication), `1` exact shifts
* @param {Int32Array} mxiter - max (in) / actual (out) iterations (length-1; in/out)
* @param {Float64Array} V - Lanczos basis (N-by-(nev+np), column-major)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} H - tridiagonal matrix in 2-column column-major layout
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} ritz - Ritz values (out)
* @param {integer} strideRitz - stride length for `ritz`
* @param {Float64Array} bounds - Ritz estimates (out)
* @param {integer} strideBounds - stride length for `bounds`
* @param {Float64Array} Q - rotation accumulation matrix ((nev+np)-by-(nev+np), column-major)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {(Float64Array|null)} workl - workspace array (length >= 3*(nev+np))
* @param {Int32Array} ipntr - operator pointers into `workd` (0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {(Float64Array|null)} workd - reverse-communication workspace (length >= 3*N)
* @param {integer} infoIn - nonzero on the first call to signal a user-supplied initial residual
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} fourth argument must be `standard` or `generalized`
* @throws {TypeError} sixth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} workd array must have sufficient length
* @returns {integer} INFO
*
* @example
* import Int32Array from '@stdlib/array/int32/lib/index.js';
*
* // dsaup2 is an internal driver of dsaupd; see the package README for a full
* // reverse-communication example.
* var ido = new Int32Array( 1 );
* var state = {};
*/
function dsaup2( order, state, ido, bmat, N, which, nev, np, tol, resid, strideResid, mode, iupd, ishift, mxiter, V, LDV, H, LDH, ritz, strideRitz, bounds, strideBounds, Q, LDQ, workl, ipntr, strideIpntr, workd, infoIn ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oresid = stride2offset( N, strideResid );
	const oritz = stride2offset( nev[ 0 ] + np[ 0 ], strideRitz );
	const obounds = stride2offset( nev[ 0 ] + np[ 0 ], strideBounds );
	const oipntr = stride2offset( 3, strideIpntr );
	const sv1 = ( order === 'column-major' ) ? 1 : LDV;
	const sv2 = ( order === 'column-major' ) ? LDV : 1;
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of `standard` or `generalized`. Value: `%s`.', bmat ) );
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		throw new TypeError( format( 'invalid argument. Sixth argument must be one of `LM`, `SM`, `LA`, `SA`, or `BE`. Value: `%s`.', which ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workd || workd.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workd array must have at least %d elements. Provided length: %d.', 3 * N, ( workd ) ? workd.length : 0 ) );
	}
	return base( state, ido, bmat, N, which, nev, np, tol, resid, strideResid, oresid, mode, iupd, ishift, mxiter, V, sv1, sv2, 0, H, sh1, sh2, 0, ritz, strideRitz, oritz, bounds, strideBounds, obounds, Q, sq1, sq2, 0, workl, 1, 0, ipntr, strideIpntr, oipntr, workd, 1, 0, infoIn );
}


// EXPORTS //

export default dsaup2;
