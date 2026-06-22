/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import zunmqr from '../../zunmqr/lib/base.js';
import zunmlq from '../../zunmlq/lib/base.js';


// MAIN //

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
* @private
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
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @returns {integer} info - 0 if successful
*/
function zunmbr( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var applyq;
	var notran;
	var transt;
	var left;
	var nq;
	var mi;
	var ni;
	var i1;
	var i2;

	// Quick return
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	applyq = ( vect === 'apply-Q' );
	left = ( side === 'left' );
	notran = ( trans === 'no-transpose' );

	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}

	if ( applyq ) {
		// Apply Q or Q^H (reflectors stored columnwise)

		if ( nq >= K ) {
			// Q was determined by a call to ZGEBRD with NQ >= K
			// Apply the full set of reflectors
			zunmqr(side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
		} else if ( nq > 1 ) {
			// Q was determined by a call to ZGEBRD with NQ < K
			// The reflectors are in columns 0..NQ-2 of A, starting from row 1
			if ( left ) {
				mi = M - 1;
				ni = N;
				i1 = 1; // row offset into C
				i2 = 0; // col offset into C
			} else {
				mi = M;
				ni = N - 1;
				i1 = 0;
				i2 = 1;
			}
			zunmqr(side, trans, mi, ni, nq - 1, A, strideA1, strideA2, offsetA + strideA1, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC + (i1 * strideC1) + (i2 * strideC2), WORK, strideWORK, offsetWORK );
		}
	} else {
		// Apply P or P^H (reflectors stored rowwise)
		// Fortran swaps TRANS for the P case: if NOTRAN, use 'C' and vice versa
		if ( notran ) {
			transt = 'conjugate-transpose';
		} else {
			transt = 'no-transpose';
		}

		if ( nq > K ) {
			// P^H was determined by a call to ZGEBRD with NQ > K
			zunmlq(side, transt, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK );
		} else if ( nq > 1 ) {
			// P^H was determined by a call to ZGEBRD with NQ <= K
			// The reflectors are in rows 0..NQ-2 of A, starting from column 1
			if ( left ) {
				mi = M - 1;
				ni = N;
				i1 = 1;
				i2 = 0;
			} else {
				mi = M;
				ni = N - 1;
				i1 = 0;
				i2 = 1;
			}
			zunmlq(side, transt, mi, ni, nq - 1, A, strideA1, strideA2, offsetA + strideA2, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC + (i1 * strideC1) + (i2 * strideC2), WORK, strideWORK, offsetWORK );
		}
	}

	return 0;
}


// EXPORTS //

export default zunmbr;
