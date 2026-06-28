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

import dormqr from '../../dormqr/lib/base.js';
import dormlq from '../../dormlq/lib/base.js';


// MAIN //

/**
* If VECT = 'Q', overwrite the matrix C with one of:.
*
* ```text
* SIDE = 'L'     SIDE = 'R'
* TRANS = 'N':  Q*C          C*Q
* TRANS = 'T':  Q^T*C        C*Q^T
* ```
*
* If VECT = 'P', overwrite the matrix C with one of:
*
* ```text
* SIDE = 'L'     SIDE = 'R'
* TRANS = 'N':  P*C          C*P
* TRANS = 'T':  P^T*C        C*P^T
* ```
*
* Here Q and P^T are the orthogonal matrices determined by DGEBRD when
* reducing a real matrix A to bidiagonal form: `A = Q*B*P^T`.
* Q is defined as a product of elementary reflectors H(i) = I - tauq(i)_v(i)_v(i)^T.
* P is defined as a product of elementary reflectors G(i) = I - taup(i)_u(i)_u(i)^T.
*
* @private
* @param {string} vect - `'apply-Q'` or `'apply-P'`
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
* @returns {integer} info - 0 if successful
*/
function dormbr( vect, side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
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
		// Apply Q or Q^T (reflectors stored columnwise)

		if ( nq >= K ) {
			// Q was determined by a call to DGEBRD with NQ >= K
			// Apply the full set of reflectors
			dormqr(side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
		} else if ( nq > 1 ) {
			// Q was determined by a call to DGEBRD with NQ < K
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
			dormqr(side, trans, mi, ni, nq - 1, A, strideA1, strideA2, offsetA + strideA1, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC + (i1 * strideC1) + (i2 * strideC2), WORK, strideWork, offsetWork );
		}
	} else {
		// Apply P or P^T (reflectors stored rowwise)
		// Fortran swaps TRANS for the P case: if NOTRAN, use 'T' and vice versa
		if ( notran ) {
			transt = 'transpose';
		} else {
			transt = 'no-transpose';
		}

		if ( nq > K ) {
			// P^T was determined by a call to DGEBRD with NQ > K
			dormlq(side, transt, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
		} else if ( nq > 1 ) {
			// P^T was determined by a call to DGEBRD with NQ <= K
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
			dormlq(side, transt, mi, ni, nq - 1, A, strideA1, strideA2, offsetA + strideA2, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC + (i1 * strideC1) + (i2 * strideC2), WORK, strideWork, offsetWork );
		}
	}

	return 0;
}


// EXPORTS //

export default dormbr;
