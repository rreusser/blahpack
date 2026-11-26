/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import dtrti2 from '../../dtrti2/lib/base.js';
import dtrmm from '../../../../blas/base/dtrmm/lib/base.js';
import dtrsm from '../../../../blas/base/dtrsm/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real upper or lower triangular matrix.
*
* Uses a blocked algorithm (Level 3 BLAS) for large matrices and
* falls back to the unblocked algorithm (dtrti2) for small matrices.
*
* @private
* @param {MatrixTriangle} uplo - `'upper'` or `'lower'`
* @param {DiagonalType} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input/output triangular matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} info - 0 if successful, k>0 if A(k,k) is zero
*/
function dtrtri( uplo, diag, N, A, strideA1, strideA2, offsetA ) {
	let nb, nn, jb, j;

	if ( N === 0 ) {
		return 0;
	}

	const upper = ( uplo === 'upper' );
	const nounit = ( diag === 'non-unit' );
	const sa1 = strideA1;
	const sa2 = strideA2;

	// Check for singularity if non-unit diagonal
	if ( nounit ) {
		for ( j = 0; j < N; j++ ) {
			if ( A[ offsetA + (j * sa1) + (j * sa2) ] === 0.0 ) {
				return j + 1;
			}
		}
	}

	// OPTS is the reference's `UPLO // DIAG` (`'upper'`/`'lower'` -> U/L, `'non-unit'`/`'unit'` -> N/U):
	nb = ilaenv( 1, 'DTRTRI', uplo.charAt( 0 ).toUpperCase() + diag.charAt( 0 ).toUpperCase(), N, -1, -1, -1 );

	// Use unblocked code for small matrices or when nb >= N
	if ( nb <= 1 || nb >= N ) {
		return dtrti2( uplo, diag, N, A, sa1, sa2, offsetA );
	}

	// Blocked algorithm
	if ( upper ) {
		// Compute inverse of upper triangular matrix
		for ( j = 0; j < N; j += nb ) {
			jb = Math.min( nb, N - j );

			// Compute rows 0:j-1 of current block column
			dtrmm( 'left', 'upper', 'no-transpose', diag, j, jb, 1.0, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA + (j * sa2) );
			dtrsm( 'right', 'upper', 'no-transpose', diag, j, jb, -1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (j * sa2) );

			// Compute inverse of current diagonal block
			dtrti2( 'upper', diag, jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
		}
	} else {
		// Compute inverse of lower triangular matrix
		nn = Math.floor( ( N - 1 ) / nb ) * nb;
		for ( j = nn; j >= 0; j -= nb ) {
			jb = Math.min( nb, N - j );
			if ( j + jb < N ) {
				// Compute rows j+jb:N-1 of current block column
				dtrmm( 'left', 'lower', 'no-transpose', diag, N - j - jb, jb, 1.0, A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (( j + jb ) * sa2), A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2) );
				dtrsm( 'right', 'lower', 'no-transpose', diag, N - j - jb, jb, -1.0, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2), A, sa1, sa2, offsetA + (( j + jb ) * sa1) + (j * sa2) );
			}

			// Compute inverse of current diagonal block
			dtrti2( 'lower', diag, jb, A, sa1, sa2, offsetA + (j * sa1) + (j * sa2) );
		}
	}
	return 0;
}


// EXPORTS //

export default dtrtri;
