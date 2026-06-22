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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dormql from '../../dormql/lib/base.js';
import dormqr from '../../dormqr/lib/base.js';


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
* where Q is a real orthogonal matrix defined from the output of DSYTRD.
*
* If UPLO='upper', Q is defined as Q = H(NQ-1)_..._H(2)_H(1) (QL factorization).
_ If UPLO='lower', Q is defined as Q = H(1)_H(2)_..._H(NQ-1) (QR factorization).
*
* NQ = M if SIDE='left', NQ = N if SIDE='right'.
*
* @private
* @param {string} side - 'left' or 'right'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'transpose'
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Float64Array} A - output of dsytrd (reflector storage)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} TAU - scalar factors from dsytrd
* @param {integer} strideTAU - stride for TAU
* @param {NonNegativeInteger} offsetTAU - starting index for TAU
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK
* @returns {integer} info - 0 if successful
*/
function dormtr( side, uplo, trans, M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK, lwork ) {
	var upper;
	var left;
	var nq;
	var mi;
	var ni;
	var i1;
	var i2;

	left = ( side === 'left' );
	upper = ( uplo === 'upper' );

	if ( left ) {
		nq = M;
	} else {
		nq = N;
	}

	// Quick return
	if ( M === 0 || N === 0 || nq === 1 ) {
		return 0;
	}

	if ( left ) {
		mi = M - 1;
		ni = N;
	} else {
		mi = M;
		ni = N - 1;
	}

	if ( upper ) {
		// Upper: reflectors in columns 1..NQ-1 of A (0-based: columns 1..NQ-1)
		// Q = H(NQ-1)*...*H(1) stored as QL reflectors in A(0:NQ-2, 1:NQ-1)
		// Fortran: CALL DORMQL( SIDE, TRANS, MI, NI, NQ-1, A(1,2), LDA, TAU, C, ... )
		dormql( side, trans, mi, ni, nq - 1, A, strideA1, strideA2, offsetA + strideA2, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK);
	} else {
		// Lower: reflectors in columns 0..NQ-2 of A (below diagonal)
		// Q = H(1)*H(2)*...*H(NQ-1) stored as QR reflectors in A(1:NQ-1, 0:NQ-2)
		// Fortran: CALL DORMQR( SIDE, TRANS, MI, NI, NQ-1, A(2,1), LDA, TAU, C(I1,I2), ... )
		if ( left ) {
			i1 = 1;
			i2 = 0;
		} else {
			i1 = 0;
			i2 = 1;
		}
		dormqr( side, trans, mi, ni, nq - 1, A, strideA1, strideA2, offsetA + strideA1, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC + ( i1 * strideC1 ) + ( i2 * strideC2 ), WORK, strideWORK, offsetWORK);
	}

	return 0;
}


// EXPORTS //

export default dormtr;
