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

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';


// MAIN //

/**
* Applies an elementary permutation to a complex symmetric matrix, swapping rows/columns `i1` and `i2` while preserving symmetry and the specified triangular storage.
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
function zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i1, i2 ) {
	var diag1;
	var diag2;
	var tmpR;
	var tmpI;
	var Av;
	var n1;
	var n2;
	var n3;

	// Number of "above" elements strictly before row/col i1 (was I1-1 in Fortran).
	n1 = i1;

	// Number of "middle" elements strictly between i1 and i2 (was I2-I1-1).
	n2 = i2 - i1 - 1;

	// Number of "trailing" elements strictly after i2 (was N-I2).
	n3 = ( N - 1 ) - i2;

	// Float64 view for scalar diagonal swap (note: A is complex symmetric — no conjugation):
	Av = reinterpret( A, 0 );

	if ( uplo === 'upper' ) {
		// Swap the leading block of columns i1 and i2 (rows 0..i1-1):
		// A(0:i1-1, i1) <-> A(0:i1-1, i2).
		zswap( n1, A, strideA1, offsetA + ( i1 * strideA2 ), A, strideA1, offsetA + ( i2 * strideA2 ) );

		// Swap diagonals A(i1,i1) and A(i2,i2):
		diag1 = ( offsetA + ( i1 * strideA1 ) + ( i1 * strideA2 ) ) * 2;
		diag2 = ( offsetA + ( i2 * strideA1 ) + ( i2 * strideA2 ) ) * 2;
		tmpR = Av[ diag1 ];
		tmpI = Av[ diag1 + 1 ];
		Av[ diag1 ] = Av[ diag2 ];
		Av[ diag1 + 1 ] = Av[ diag2 + 1 ];
		Av[ diag2 ] = tmpR;
		Av[ diag2 + 1 ] = tmpI;

		// Swap the "middle" block: row i1 cols (i1+1..i2-1) with column i2 rows (i1+1..i2-1).

		// Upper storage means A(i1, k) (k in (i1,i2)) is symmetric to A(k, i2).
		zswap( n2, A, strideA2, offsetA + ( i1 * strideA1 ) + ( ( i1 + 1 ) * strideA2 ), A, strideA1, offsetA + ( ( i1 + 1 ) * strideA1 ) + ( i2 * strideA2 ) );

		// Swap the trailing block: row i1 cols (i2+1..N-1) with row i2 cols (i2+1..N-1).
		if ( n3 > 0 ) {
			zswap( n3, A, strideA2, offsetA + ( i1 * strideA1 ) + ( ( i2 + 1 ) * strideA2 ), A, strideA2, offsetA + ( i2 * strideA1 ) + ( ( i2 + 1 ) * strideA2 ) );
		}
	} else {
		// Lower storage.
		// Swap the leading block of rows i1 and i2 (cols 0..i1-1):
		// A(i1, 0:i1-1) <-> A(i2, 0:i1-1).
		zswap( n1, A, strideA2, offsetA + ( i1 * strideA1 ), A, strideA2, offsetA + ( i2 * strideA1 ) );

		// Swap diagonals A(i1,i1) and A(i2,i2):
		diag1 = ( offsetA + ( i1 * strideA1 ) + ( i1 * strideA2 ) ) * 2;
		diag2 = ( offsetA + ( i2 * strideA1 ) + ( i2 * strideA2 ) ) * 2;
		tmpR = Av[ diag1 ];
		tmpI = Av[ diag1 + 1 ];
		Av[ diag1 ] = Av[ diag2 ];
		Av[ diag1 + 1 ] = Av[ diag2 + 1 ];
		Av[ diag2 ] = tmpR;
		Av[ diag2 + 1 ] = tmpI;

		// Swap the "middle" block: column i1 rows (i1+1..i2-1) with row i2 cols (i1+1..i2-1).
		zswap( n2, A, strideA1, offsetA + ( ( i1 + 1 ) * strideA1 ) + ( i1 * strideA2 ), A, strideA2, offsetA + ( i2 * strideA1 ) + ( ( i1 + 1 ) * strideA2 ) );

		// Swap the trailing block: column i1 rows (i2+1..N-1) with column i2 rows (i2+1..N-1).
		if ( n3 > 0 ) {
			zswap( n3, A, strideA1, offsetA + ( ( i2 + 1 ) * strideA1 ) + ( i1 * strideA2 ), A, strideA1, offsetA + ( ( i2 + 1 ) * strideA1 ) + ( i2 * strideA2 ) );
		}
	}
	return A;
}


// EXPORTS //

export default zsyswapr;
