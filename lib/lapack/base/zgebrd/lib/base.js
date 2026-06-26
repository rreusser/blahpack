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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebd2 from '../../zgebd2/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import zlabrd from '../../zlabrd/lib/base.js';


// VARIABLES //

var DEFAULT_NB = 32;
var ONE = new Complex128( 1.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B.
* by a unitary transformation: `Q^H*A*P = B`.
*
* This is the blocked version that processes NB columns at a time using
* zlabrd for the panel factorization, zgemm for the trailing matrix update,
* and zgebd2 for the final unblocked piece.
*
* If M >= N, B is upper bidiagonal; if M < N, B is lower bidiagonal.
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} d - output array of real diagonal elements of B
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output array of real off-diagonal elements of B
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAUQ - output array of scalar factors for Q
* @param {integer} strideTAUQ - stride for TAUQ (in complex elements)
* @param {NonNegativeInteger} offsetTAUQ - starting index for TAUQ (in complex elements)
* @param {Complex128Array} TAUP - output array of scalar factors for P
* @param {integer} strideTAUP - stride for TAUP (in complex elements)
* @param {NonNegativeInteger} offsetTAUP - starting index for TAUP (in complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (in complex elements)
* @param {integer} lwork - length of WORK array (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zgebrd( M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAUQ, strideTAUQ, offsetTAUQ, TAUP, strideTAUP, offsetTAUP, WORK, strideWORK, offsetWORK, lwork ) {
	var ldwrkx;
	var ldwrky;
	var minmn;
	var nbmin;
	var sa1;
	var sa2;
	var aii;
	var aij;
	var oA;
	var Av;
	var nb;
	var nx;
	var ws;
	var i;
	var j;

	/* @complex-arrays A, TAUQ, TAUP, WORK */

	// Get Float64 view for element access
	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	minmn = Math.min( M, N );

	// Quick return if possible
	if ( minmn === 0 ) {
		return 0;
	}

	// Determine the block size
	nb = DEFAULT_NB;
	ldwrkx = M;
	ldwrky = N;
	ws = Math.max( M, N );
	nx = minmn;

	if ( nb > 1 && nb < minmn ) {
		// Determine crossover point NX (below which unblocked is faster)
		nx = Math.max( nb, 0 );

		if ( nx < minmn ) {
			ws = ( M + N ) * nb;
			if ( lwork < ws ) {
				// Not enough workspace for optimal NB; determine minimum NB
				nbmin = 2;
				if ( lwork >= ( M + N ) * nbmin ) {
					nb = Math.floor( lwork / ( M + N ) );
				} else {
					nb = 1;
					nx = minmn;
				}
			}
		}
	}

	// Blocked loop: reduce NB columns/rows at a time
	i = 0;
	if ( nb >= 2 && nb < minmn && nx < minmn ) {
		while ( i < minmn - nx ) {
			// Reduce rows and columns i:i+nb-1 to bidiagonal form and return
			// The matrices X and Y which are needed to update the unreduced
			// Part of the matrix.

			// zlabrd( M, N, nb, A, sa1, sa2, oA, d, sD, oD, e, sE, oE,
			//         TAUQ, sTQ, oTQ, TAUP, sTP, oTP, X, sX1, sX2, oX, Y, sY1, sY2, oY )

			// X starts at offsetWORK, Y starts at offsetWORK + ldwrkx * nb
			zlabrd(M - i, N - i, nb, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), d, strideD, offsetD + (i * strideD), e, strideE, offsetE + (i * strideE), TAUQ, strideTAUQ, offsetTAUQ + (i * strideTAUQ), TAUP, strideTAUP, offsetTAUP + (i * strideTAUP), WORK, 1, ldwrkx, offsetWORK, WORK, 1, ldwrky, offsetWORK + (ldwrkx * nb));

			// Update the trailing submatrix A(i+nb:M-1, i+nb:N-1)
			if ( M - i - nb > 0 && N - i - nb > 0 ) {
				// C := -1 * A(i+nb:,i:i+nb-1) * Y(nb:,:)^H + 1 * A(i+nb:,i+nb:)
				zgemm('no-transpose', 'conjugate-transpose', M - i - nb, N - i - nb, nb, NEGONE, A, strideA1, strideA2, offsetA + (( i + nb ) * strideA1) + (i * strideA2), WORK, 1, ldwrky, offsetWORK + (ldwrkx * nb) + nb, ONE, A, strideA1, strideA2, offsetA + (( i + nb ) * strideA1) + (( i + nb ) * strideA2));

				// C := -1 * X(nb:,:) * A(i:i+nb-1,i+nb:) + 1 * A(i+nb:,i+nb:)
				zgemm('no-transpose', 'no-transpose', M - i - nb, N - i - nb, nb, NEGONE, WORK, 1, ldwrkx, offsetWORK + nb, A, strideA1, strideA2, offsetA + (i * strideA1) + (( i + nb ) * strideA2), ONE, A, strideA1, strideA2, offsetA + (( i + nb ) * strideA1) + (( i + nb ) * strideA2));
			}

			// Copy diagonal and off-diagonal elements of B back into A
			if ( M >= N ) {
				// Upper bidiagonal: D(j) -> A(j,j), E(j) -> A(j,j+1)
				for ( j = i; j < i + nb; j++ ) {
					aii = oA + (j * sa1) + (j * sa2);
					Av[ aii ] = d[ offsetD + (j * strideD) ];
					Av[ aii + 1 ] = 0.0;
					aij = oA + (j * sa1) + (( j + 1 ) * sa2);
					Av[ aij ] = e[ offsetE + (j * strideE) ];
					Av[ aij + 1 ] = 0.0;
				}
			} else {
				// Lower bidiagonal: D(j) -> A(j,j), E(j) -> A(j+1,j)
				for ( j = i; j < i + nb; j++ ) {
					aii = oA + (j * sa1) + (j * sa2);
					Av[ aii ] = d[ offsetD + (j * strideD) ];
					Av[ aii + 1 ] = 0.0;
					aij = oA + (( j + 1 ) * sa1) + (j * sa2);
					Av[ aij ] = e[ offsetE + (j * strideE) ];
					Av[ aij + 1 ] = 0.0;
				}
			}

			i += nb;
		}
	}

	// Use unblocked code to factor the last or only block
	zgebd2(M - i, N - i, A, strideA1, strideA2, offsetA + (i * strideA1) + (i * strideA2), d, strideD, offsetD + (i * strideD), e, strideE, offsetE + (i * strideE), TAUQ, strideTAUQ, offsetTAUQ + (i * strideTAUQ), TAUP, strideTAUP, offsetTAUP + (i * strideTAUP), WORK, strideWORK, offsetWORK);

	return 0;
}


// EXPORTS //

export default zgebrd;
