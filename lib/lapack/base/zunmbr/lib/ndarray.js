/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
 * If VECT = 'Q', overwrite the matrix C with one of:.
 *
 * ```text
 * SIDE = 'L'     SIDE = 'R'
 * TRANS = 'N':  Q*C          C*Q
 * TRANS = 'C':  Q^H*C        C*Q^H
 * ```
 *
 * If VECT = 'P', overwrite the matrix C with one of:
 *
 * ```text
 * SIDE = 'L'     SIDE = 'R'
 * TRANS = 'N':  P*C          C*P
 * TRANS = 'C':  P^H*C        C*P^H
 * ```
 *
 * Here Q and P^H are the unitary matrices determined by ZGEBRD when
 * reducing a complex matrix A to bidiagonal form: `A = Q*B*P^H`.
 * Q is defined as a product of elementary reflectors H(i) = I - tauq(i)_v(i)_v(i)^H.
 * P is defined as a product of elementary reflectors G(i) = I - taup(i)_u(i)_u(i)^H.
 *
 *
 * @param {string} vect - `'apply-Q'` or `'apply-P'`
 * @param {string} side - `'left'` or `'right'`
 * @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
 * @param {NonNegativeInteger} M - number of rows of C
 * @param {NonNegativeInteger} N - number of columns of C
 * @param {NonNegativeInteger} K - number of columns/rows in original matrix for ZGEBRD
 * @param {Complex128Array} A - matrix containing reflectors from ZGEBRD
 * @param {integer} strideA1 - stride of the first dimension of A (complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
 * @param {Complex128Array} TAU - scalar factors of reflectors (TAUQ or TAUP)
 * @param {integer} strideTAU - stride for TAU (complex elements)
 * @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
 * @param {Complex128Array} C - input/output matrix
 * @param {integer} strideC1 - stride of the first dimension of C (complex elements)
 * @param {integer} strideC2 - stride of the second dimension of C (complex elements)
 * @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
 * @param {Complex128Array} WORK - workspace
 * @param {integer} strideWork - stride for WORK (complex elements)
 * @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
 * @throws {TypeError} Second argument must be a valid operation side
 * @throws {TypeError} Third argument must be a valid transpose operation
 * @returns {integer} info - 0 if successful
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* If VECT = 'Q', overwrite the matrix C with one of:.
*
* @param {string} vect - `'apply-Q'` or `'apply-P'`
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of columns/rows in original matrix for ZGEBRD
* @param {Complex128Array} A - matrix containing reflectors from ZGEBRD
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (TAUQ or TAUP)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @throws {TypeError} first argument must be a valid vector type
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info - 0 if successful
*/
function zunmbr( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var need;
	if ( vect !== 'apply-Q' && vect !== 'apply-P' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid vector type. Value: `%s`.', vect ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
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
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	// Caller owns the workspace; assert it is sufficiently large so an under-sized
	// (or non-array) buffer is a loud RangeError, not a silent NaN. zunmbr delegates
	// to the BLOCKED zunmqr/zunmlq (NB=32), which — when the reflector count reaching
	// them exceeds NB — store the block reflector T in a SEPARATE trailing segment,
	// needing nw*NB + (NB+1)*NB (nw = N for side='left', M for side='right'); off the
	// blocked path the unblocked zunm2r/zunm2l need only nw. keff is the reflector
	// count actually passed on (K on the primary path, nq-1 on the secondary nq<K /
	// nq<=K branch), matching base.js.
	var NB = 32;
	var nq = ( side === 'left' ) ? M : N;
	var nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	var keff;
	if ( vect === 'apply-Q' ) {
		keff = ( nq >= K ) ? K : ( ( nq > 1 ) ? ( nq - 1 ) : 0 );
	} else {
		keff = ( nq > K ) ? K : ( ( nq > 1 ) ? ( nq - 1 ) : 0 );
	}
	need = ( keff > NB ) ? ( ( nw * NB ) + ( ( NB + 1 ) * NB ) ) : nw;
	if ( !WORK || ( WORK.length - offsetWork ) < need ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zunmbr;
