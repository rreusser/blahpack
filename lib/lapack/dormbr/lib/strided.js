/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies the matrix C by Q or P^T (or their transposes), where Q and P^T are the orthogonal matrices determined by DGEBRD.
*
* @param {('apply-Q'|'apply-P')} vect - `'apply-Q'` to apply Q, `'apply-P'` to apply P^T
* @param {OperationSide} side - `'left'` or `'right'`
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of columns/rows in original matrix for DGEBRD
* @param {Float64Array} A - matrix containing reflectors from DGEBRD
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors of reflectors (TAUQ or TAUP)
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace of length at least `max(1,N)` if `side = 'left'` and `max(1,M)` if `side = 'right'` (`nw`); the reference's optimum is `nw*NB`, and `nw*NB + TSIZE` elements (`NB = 32`, `TSIZE = 65*64 = 4160`, the dormqr/dormlq optimum) enable the full blocked path
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be one of the following: "apply-P", "apply-Q"
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info status code (0 if successful)
*
* @example
* import dgebrd from '@rreusser/blahpack/lapack/dgebrd';
* import dormbr from '@rreusser/blahpack/lapack/dormbr';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
*
* // Reduce A = [ [ 3, 0 ], [ 4, 5 ] ] (column-major) to bidiagonal form A = Q*B*P^T:
* var A = new Float64Array( [ 3.0, 4.0, 0.0, 5.0 ] );
* var d = new Float64Array( 2 );
* var e = new Float64Array( 1 );
* var TAUQ = new Float64Array( 2 );
* var TAUP = new Float64Array( 2 );
* var WORK = new Float64Array( 2 );
* dgebrd.strided( 2, 2, A, 1, 2, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0 );
*
* // Apply Q from the left to the identity, giving Q:
* var C = new Float64Array( [ 1.0, 0.0, 0.0, 1.0 ] );
* var info = dormbr.strided( 'apply-Q', 'left', 'no-transpose', 2, 2, 2, A, 1, 2, 0, TAUQ, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
* // returns 0
*
* // C => <Float64Array>[ ~-0.6, -0.8, -0.8, 0.6 ]
*/
function dormbr( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	if ( vect !== 'apply-P' && vect !== 'apply-Q' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "apply-P", "apply-Q". Value: `%s`.', vect ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// The reference's minimum (LWORK >= NW); dormqr/dormlq shrink NB, or fall back to unblocked code, to fit a shorter workspace than their optimum:
	const minWork = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dormbr;
