/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, no-var, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';
import zlaunhr_col_getrfnp2 from '../../zlaunhr_col_getrfnp2/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// VARIABLES //

const CONE = new Complex128( 1.0, 0.0 );
const CNEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Computes the modified LU factorization without pivoting of a complex general M-by-N matrix `A` (blocked driver).
*
* The factorization has the form `A - S = L*U`, where `S` is a diagonal sign
* matrix with diagonal entries `D(i) = -sign(Re(A(i,i)))` (value after `i-1`
* steps of Gaussian elimination), `L` is lower triangular with unit diagonal
* (lower trapezoidal if `M > N`), and `U` is upper triangular (upper
* trapezoidal if `M < N`). Because `|D(i,i)| = 1`, no pivoting is required
* for stability.
*
* This is the blocked right-looking driver. It calls the recursive kernel
* `zlaunhr_col_getrfnp2` on diagonal blocks and uses Level-3 BLAS (`ztrsm`,
* `zgemm`) to update the trailing submatrix.
*
* @private
* @param {NonNegativeInteger} M - number of rows of matrix `A`
* @param {NonNegativeInteger} N - number of columns of matrix `A`
* @param {Complex128Array} A - input/output complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} D - output diagonal sign array (length `min(M,N)`); entries are `(+/-1, 0)`
* @param {integer} strideD - stride length for `D` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `D` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zlaunhr_col_getrfnp( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	// Determine the block size for this environment. ILAENV sets 32 only for names starting `xLAORH`, so for this routine it returns 1 and, as in the reference, the unblocked kernel runs at every size:
	return factor( ilaenv( 1, 'ZLAUNHR_COL_GETRFNP', ' ', M, N, -1, -1 ), M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD );
}

/**
* The reference's factorization for a given block size `nb`.
*
* ILAENV gives `nb = 1` for this routine, so the reference's blocked loop below never runs through `zlaunhr_col_getrfnp`; it is kept as translated, and exported so a test can run it with `nb > 1` (ticket 0049).
*
* @private
* @param {PositiveInteger} nb - block size
* @param {PositiveInteger} M - number of rows of matrix `A`
* @param {PositiveInteger} N - number of columns of matrix `A`
* @param {Complex128Array} A - input/output complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} D - output diagonal sign array
* @param {integer} strideD - stride length for `D` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `D` (complex elements)
* @returns {integer} status code (0 = success)
*/
function factor( nb, M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD ) {
	let oAjbjb, oAjjb, oAjbj, oAjj, oDj, jb, j;

	const minMN = ( M < N ) ? M : N;

	// Unblocked path: defer to the recursive kernel directly.
	if ( nb <= 1 || nb >= minMN ) {
		return zlaunhr_col_getrfnp2( M, N, A, strideA1, strideA2, offsetA, D, strideD, offsetD );
	}

	// Blocked right-looking factorization. Loop over diagonal blocks of size up to `nb`.
	for ( j = 0; j < minMN; j += nb ) {
		jb = minMN - j;
		if ( jb > nb ) {
			jb = nb;
		}

		// Offsets (in complex elements) for the current block A(j,j) and related sub-blocks.
		oAjj = offsetA + ( j * strideA1 ) + ( j * strideA2 );             // A(j,j)
		oAjjb = offsetA + ( j * strideA1 ) + ( ( j + jb ) * strideA2 );   // A(j, j+jb)
		oAjbj = offsetA + ( ( j + jb ) * strideA1 ) + ( j * strideA2 );   // A(j+jb, j)
		oAjbjb = offsetA + ( ( j + jb ) * strideA1 ) + ( ( j + jb ) * strideA2 ); // A(j+jb, j+jb)
		oDj = offsetD + ( j * strideD );

		// Factor the diagonal and subdiagonal portion: A(j:M-1, j:j+jb-1).
		zlaunhr_col_getrfnp2( M - j, jb, A, strideA1, strideA2, oAjj, D, strideD, oDj );

		if ( j + jb < N ) {
			// Compute the block row of U:
			//   A(j:j+jb-1, j+jb:N-1) := L11^{-1} * A(j:j+jb-1, j+jb:N-1)
			ztrsm( 'left', 'lower', 'no-transpose', 'unit', jb, N - j - jb, CONE, A, strideA1, strideA2, oAjj, A, strideA1, strideA2, oAjjb );

			if ( j + jb < M ) {
				// Update the trailing submatrix:
				//   A(j+jb:M-1, j+jb:N-1) -= A(j+jb:M-1, j:j+jb-1) * A(j:j+jb-1, j+jb:N-1)
				zgemm( 'no-transpose', 'no-transpose', M - j - jb, N - j - jb, jb, CNEGONE, A, strideA1, strideA2, oAjbj, A, strideA1, strideA2, oAjjb, CONE, A, strideA1, strideA2, oAjbjb );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zlaunhr_col_getrfnp;
export { factor };
