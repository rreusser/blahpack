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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetd2 from '../../zhetd2/lib/base.js';
import zlatrd from '../../zlatrd/lib/base.js';
import zher2k from '../../../../blas/base/zher2k/lib/base.js';


// VARIABLES //

var NB = 32; // block size (replaces ILAENV)
var CNONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
* by a unitary similarity transformation: `Q__H*A*Q = T`.
*
* Uses the blocked algorithm: reduces NB columns at a time using zlatrd
* (panel factorization) and zher2k (trailing matrix update), then finishes
* the remaining block with zhetd2 (unblocked).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output Hermitian matrix (complex-element strides)
* @param {integer} strideA1 - stride of first dimension of A (complex elements)
* @param {integer} strideA2 - stride of second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Float64Array} d - output diagonal elements of T (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - output off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Complex128Array} TAU - output scalar factors of reflectors (length N-1)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @returns {integer} info (0 = success)
*/
function zhetrd( uplo, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	var ldwork;
	var work;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var nb;
	var nx;
	var kk;
	var ai;
	var i;
	var j;

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1;
	sa2 = strideA2;

	// If N <= NB, use unblocked code (zhetd2) directly:
	if ( N <= NB ) {
		return zhetd2( uplo, N, A, sa1, sa2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU );
	}

	// Blocked algorithm: N > NB
	nb = NB;
	nx = nb; // crossover point
	ldwork = N;

	// Allocate workspace for W matrix (N-by-NB), used by zlatrd
	work = new Complex128Array( ldwork * nb );
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;

	if ( uplo === 'upper' ) {
		// Reduce the upper triangle of A.
		kk = N - ( Math.floor( ( N - nx + nb - 1 ) / nb ) * nb );

		// Fortran: DO I = N-NB+1, KK+1, -NB (1-based)

		// 0-based: i from N-nb down to kk, stepping by -nb
		for ( i = N - nb; i >= kk; i -= nb ) {
			// Reduce columns i:i+nb-1 to tridiagonal form
			zlatrd(
				uplo, i + nb, nb,
				A, sa1, sa2, offsetA,
				e, strideE, offsetE,
				TAU, strideTAU, offsetTAU,
				work, 1, ldwork, 0
			);

			// Update the unreduced submatrix A(0:i-1, 0:i-1)
			zher2k(
				uplo, 'no-transpose', i, nb, CNONE,
				A, sa1, sa2, offsetA + (i * sa2),
				work, 1, ldwork, 0,
				1.0,
				A, sa1, sa2, offsetA
			);

			// Copy superdiagonal elements back into A, and diagonal to D
			for ( j = i; j < i + nb; j++ ) {
				// A(j-1, j) = e[j-1]
				ai = oA + (( j - 1 ) * (sa1 * 2)) + ((j * sa2) * 2);
				Av[ ai ] = e[ offsetE + (( j - 1 ) * strideE) ];
				Av[ ai + 1 ] = 0.0;

				// d[j] = real(A(j, j))
				ai = oA + ((j * sa1) * 2) + ((j * sa2) * 2);
				d[ offsetD + (j * strideD) ] = Av[ ai ];
			}
		}

		// Use unblocked code for remaining columns
		zhetd2( uplo, kk, A, sa1, sa2, offsetA, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU );
	} else {
		// Reduce the lower triangle of A.
		i = 0;
		while ( i <= N - nx - 1 ) {
			// Reduce columns i:i+nb-1
			zlatrd(
				uplo, N - i, nb,
				A, sa1, sa2, offsetA + (i * sa1) + (i * sa2),
				e, strideE, offsetE + (i * strideE),
				TAU, strideTAU, offsetTAU + (i * strideTAU),
				work, 1, ldwork, 0
			);

			// Update the unreduced submatrix
			zher2k(
				uplo, 'no-transpose', N - i - nb, nb, CNONE,
				A, sa1, sa2, offsetA + (( i + nb ) * sa1) + (i * sa2),
				work, 1, ldwork, nb,
				1.0,
				A, sa1, sa2, offsetA + (( i + nb ) * sa1) + (( i + nb ) * sa2)
			);

			// Copy subdiagonal elements and diagonal
			for ( j = i; j < i + nb; j++ ) {
				// A(j+1, j) = e[j]
				ai = oA + (( j + 1 ) * (sa1 * 2)) + ((j * sa2) * 2);
				Av[ ai ] = e[ offsetE + (j * strideE) ];
				Av[ ai + 1 ] = 0.0;

				// d[j] = real(A(j, j))
				ai = oA + ((j * sa1) * 2) + ((j * sa2) * 2);
				d[ offsetD + (j * strideD) ] = Av[ ai ];
			}

			i += nb;
		}

		// Use unblocked code for remaining
		zhetd2(
			uplo, N - i,
			A, sa1, sa2, offsetA + (i * sa1) + (i * sa2),
			d, strideD, offsetD + (i * strideD),
			e, strideE, offsetE + (i * strideE),
			TAU, strideTAU, offsetTAU + (i * strideTAU)
		);
	}

	return 0;
}


// EXPORTS //

export default zhetrd;
