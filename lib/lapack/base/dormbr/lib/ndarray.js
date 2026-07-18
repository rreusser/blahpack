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

import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies the matrix C by Q or P^T (or their transposes), where Q and P^T are the orthogonal matrices determined by DGEBRD.
*
* @param {string} vect - `'apply-Q'` to apply Q, `'apply-P'` to apply P^T
* @param {string} side - `'left'` or `'right'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
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
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be a valid vector type
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @returns {integer} info status code (0 if successful)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( 4 );
* var TAU = new Float64Array( 2 );
* var C = new Float64Array( 4 );
* var WORK = new Float64Array( 1 );
*
* var info = dormbr( 'apply-Q', 'left', 'no-transpose', 2, 2, 2, A, 1, 2, 0, TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
* // returns 0
*/
function dormbr( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
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
	// Caller owns the workspace. dormbr delegates to the BLOCKED dormqr/dormlq
	// (NB=32), which — when the reflector count reaching them exceeds NB — store the
	// block reflector T in a SEPARATE trailing segment, needing nw*NB + (NB+1)*NB
	// (nw = N for side='left', M for side='right'); off the blocked path the
	// unblocked dorm2r/dorm2l need only nw. Advertising a bare max(1,N) (side-
	// independent, no blocked branch) accepts a buffer the blocked path over-reads
	// → silent NaN. keff is the reflector count actually passed on (K on the primary
	// path, nq-1 on the secondary nq<K / nq<=K branch), matching base.js.
	const NB = 32;
	const nq = ( side === 'left' ) ? M : N;
	const nw = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	let keff;
	if ( vect === 'apply-Q' ) {
		keff = ( nq >= K ) ? K : ( ( nq > 1 ) ? ( nq - 1 ) : 0 );
	} else {
		keff = ( nq > K ) ? K : ( ( nq > 1 ) ? ( nq - 1 ) : 0 );
	}
	const minWork = ( keff > NB ) ? ( ( nw * NB ) + ( ( NB + 1 ) * NB ) ) : nw;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dormbr;
