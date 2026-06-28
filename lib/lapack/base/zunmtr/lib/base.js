/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import zunmql from '../../zunmql/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';


// MAIN //

/**
* Overwrites the M-by-N matrix C with Q_C, Q^H_C, C_Q, or C_Q^H,.
* where Q is a complex unitary matrix defined from the output of ZHETRD.
*
* If UPLO='upper', Q is defined as Q = H(NQ-1)_..._H(2)_H(1) (QL factorization).
_ If UPLO='lower', Q is defined as Q = H(1)_H(2)_..._H(NQ-1) (QR factorization).
*
* NQ = M if SIDE='left', NQ = N if SIDE='right'.
*
* @private
* @param {string} side - 'left' or 'right'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} A - output of zhetrd (reflector storage)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors from zhetrd
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (complex elements)
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {integer} lwork - length of WORK
* @returns {integer} info - 0 if successful
*/
function zunmtr( side, uplo, trans, M, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork, lwork ) {
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
		// Fortran: CALL ZUNMQL( SIDE, TRANS, MI, NI, NQ-1, A(1,2), LDA, TAU, C, ... )
		zunmql( side, trans, mi, ni, nq - 1,
			A, strideA1, strideA2, offsetA + strideA2,
			TAU, strideTAU, offsetTAU,
			C, strideC1, strideC2, offsetC,
			WORK, strideWork, offsetWork
		);
	} else {
		// Lower: reflectors in columns 0..NQ-2 of A (below diagonal)
		// Q = H(1)*H(2)*...*H(NQ-1) stored as QR reflectors in A(1:NQ-1, 0:NQ-2)
		// Fortran: CALL ZUNMQR( SIDE, TRANS, MI, NI, NQ-1, A(2,1), LDA, TAU, C(I1,I2), ... )
		if ( left ) {
			i1 = 1;
			i2 = 0;
		} else {
			i1 = 0;
			i2 = 1;
		}
		zunmqr( side, trans, mi, ni, nq - 1,
			A, strideA1, strideA2, offsetA + strideA1,
			TAU, strideTAU, offsetTAU,
			C, strideC1, strideC2, offsetC + ( i1 * strideC1 ) + ( i2 * strideC2 ),
			WORK, strideWork, offsetWork
		);
	}

	return 0;
}


// EXPORTS //

export default zunmtr;
