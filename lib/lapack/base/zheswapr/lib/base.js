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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// MAIN //

/**
* Applies an elementary permutation to a complex Hermitian matrix, swapping rows/columns `i1` and `i2` while preserving Hermitian structure and the specified triangular storage.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle of `A` is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {NonNegativeInteger} i1 - zero-based index of the first row/column to swap
* @param {NonNegativeInteger} i2 - zero-based index of the second row/column to swap (must be `>= i1`)
* @returns {Complex128Array} `A`
*/
function zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i1, i2 ) {
	var diag1;
	var diag2;
	var view;
	var tmpR;
	var tmpI;
	var idx1;
	var idx2;
	var sa1;
	var sa2;
	var oa;
	var n1;
	var n2;
	var n3;
	var i;

	if ( i1 === i2 ) {
		return A;
	}

	// Float64 view for element-level access.
	view = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oa = offsetA * 2;

	// Number of "above" elements strictly before row/col i1 (was I1-1 in Fortran).
	n1 = i1;

	// Number of "middle" elements strictly between i1 and i2 (was I2-I1-1).
	n2 = i2 - i1 - 1;

	// Number of "trailing" elements strictly after i2 (was N-I2).
	n3 = ( N - 1 ) - i2;

	// Diagonal Float64 indices for A(i1,i1) and A(i2,i2) (both real for Hermitian).
	diag1 = oa + ( i1 * sa1 ) + ( i1 * sa2 );
	diag2 = oa + ( i2 * sa1 ) + ( i2 * sa2 );

	if ( uplo === 'upper' ) {
		// First swap: columns i1 and i2, rows 0..i1-1 (no conjugation; same triangle).
		// A(0:i1-1, i1) <-> A(0:i1-1, i2)
		zswap( n1, A, strideA1, offsetA + ( i1 * strideA2 ), A, strideA1, offsetA + ( i2 * strideA2 ) );

		// Swap diagonals A(i1,i1) and A(i2,i2) (diagonal elements are real for Hermitian).
		tmpR = view[ diag1 ];
		tmpI = view[ diag1 + 1 ];
		view[ diag1 ] = view[ diag2 ];
		view[ diag1 + 1 ] = view[ diag2 + 1 ];
		view[ diag2 ] = tmpR;
		view[ diag2 + 1 ] = tmpI;

		// Middle block: swap A(i1, i1+1..i2-1) with A(i1+1..i2-1, i2), with conjugation applied to both sides (Hermitian transpose across diagonal). Fortran: DO I=1,I2-I1-1; TMP=A(I1,I1+I); A(I1,I1+I)=DCONJG(A(I1+I,I2)); A(I1+I,I2)=DCONJG(TMP); END DO.
		for ( i = 1; i <= n2; i++ ) {
			idx1 = oa + ( i1 * sa1 ) + ( ( i1 + i ) * sa2 ); // A(i1, i1+i)
			idx2 = oa + ( ( i1 + i ) * sa1 ) + ( i2 * sa2 ); // A(i1+i, i2)
			tmpR = view[ idx1 ];
			tmpI = view[ idx1 + 1 ];

			// A(i1, i1+i) = conj( A(i1+i, i2) )
			view[ idx1 ] = view[ idx2 ];
			view[ idx1 + 1 ] = -view[ idx2 + 1 ];

			// A(i1+i, i2) = conj( tmp )
			view[ idx2 ] = tmpR;
			view[ idx2 + 1 ] = -tmpI;
		}

		// Post-loop fixup: conjugate A(i1, i2). This element is the "corner" of the swap — it is never touched by the middle loop (which runs for i in 1..n2, skipping the index-offset = 0 case), so we conjugate it explicitly to maintain Hermitian structure after the row/col swap. Fortran: A(I1,I2) = DCONJG( A(I1,I2) ).
		idx1 = oa + ( i1 * sa1 ) + ( i2 * sa2 );
		view[ idx1 + 1 ] = -view[ idx1 + 1 ];

		// Third swap: row i1 and row i2, cols i2+1..N-1 (no conjugation; same triangle, symmetric elements within upper storage). Fortran: DO I=I2+1,N : swap A(I1,I), A(I2,I)
		if ( n3 > 0 ) {
			zswap( n3, A, strideA2, offsetA + ( i1 * strideA1 ) + ( ( i2 + 1 ) * strideA2 ), A, strideA2, offsetA + ( i2 * strideA1 ) + ( ( i2 + 1 ) * strideA2 ) );
		}
	} else {
		// Lower storage.
		// First swap: rows i1 and i2, cols 0..i1-1.
		// A(i1, 0:i1-1) <-> A(i2, 0:i1-1)
		zswap( n1, A, strideA2, offsetA + ( i1 * strideA1 ), A, strideA2, offsetA + ( i2 * strideA1 ) );

		// Swap diagonals A(i1,i1) and A(i2,i2).
		tmpR = view[ diag1 ];
		tmpI = view[ diag1 + 1 ];
		view[ diag1 ] = view[ diag2 ];
		view[ diag1 + 1 ] = view[ diag2 + 1 ];
		view[ diag2 ] = tmpR;
		view[ diag2 + 1 ] = tmpI;

		// Middle block: swap A(i1+1..i2-1, i1) with A(i2, i1+1..i2-1), with conjugation on both sides. Fortran: DO I=1,I2-I1-1; TMP=A(I1+I,I1); A(I1+I,I1)=DCONJG(A(I2,I1+I)); A(I2,I1+I)=DCONJG(TMP); END DO.
		for ( i = 1; i <= n2; i++ ) {
			idx1 = oa + ( ( i1 + i ) * sa1 ) + ( i1 * sa2 ); // A(i1+i, i1)
			idx2 = oa + ( i2 * sa1 ) + ( ( i1 + i ) * sa2 ); // A(i2, i1+i)
			tmpR = view[ idx1 ];
			tmpI = view[ idx1 + 1 ];
			view[ idx1 ] = view[ idx2 ];
			view[ idx1 + 1 ] = -view[ idx2 + 1 ];
			view[ idx2 ] = tmpR;
			view[ idx2 + 1 ] = -tmpI;
		}

		// Post-loop fixup: A(i2, i1) = conj( A(i2, i1) ).
		idx1 = oa + ( i2 * sa1 ) + ( i1 * sa2 );
		view[ idx1 + 1 ] = -view[ idx1 + 1 ];

		// Third swap: column i1 and i2, rows i2+1..N-1.
		if ( n3 > 0 ) {
			zswap( n3, A, strideA1, offsetA + ( ( i2 + 1 ) * strideA1 ) + ( i1 * strideA2 ), A, strideA1, offsetA + ( ( i2 + 1 ) * strideA1 ) + ( i2 * strideA2 ) );
		}
	}
	return A;
}


// EXPORTS //

export default zheswapr;
