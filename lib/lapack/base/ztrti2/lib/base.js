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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrmv from '../../../../blas/base/ztrmv/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

// Scratch buffer for complex division: [0..1]=numerator(1,0), [2..3]=denominator, [4..5]=result
const scratch = new Float64Array( 6 );

scratch[ 0 ] = 1.0;
scratch[ 1 ] = 0.0;


// MAIN //

/**
* Computes the inverse of a complex upper or lower triangular matrix.
* using the unblocked (Level 2 BLAS) algorithm.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input/output triangular matrix (overwritten with inverse)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @returns {integer} info - 0 if successful
*/
function ztrti2( uplo, diag, N, A, strideA1, strideA2, offsetA ) {
	let ajjR, ajjI, ia, j;

	if ( N === 0 ) {
		return 0;
	}

	const upper = ( uplo === 'upper' );
	const nounit = ( diag === 'non-unit' );
	const sa1 = strideA1;
	const sa2 = strideA2;
	const Av = reinterpret( A, 0 );

	if ( upper ) {
		// Compute inverse of upper triangular matrix
		for ( j = 0; j < N; j++ ) {
			ia = ( offsetA + (j * sa1) + (j * sa2) ) * 2;
			if ( nounit ) {
				// A(j,j) = ONE / A(j,j) — use cmplx.divAt for numerical safety
				scratch[ 2 ] = Av[ ia ];
				scratch[ 3 ] = Av[ ia + 1 ];
				cmplx.divAt( Av, ia, scratch, 0, scratch, 2 );

				// Ajj = -A(j,j)
				ajjR = -Av[ ia ];
				ajjI = -Av[ ia + 1 ];
			} else {
				ajjR = -1.0;
				ajjI = 0.0;
			}

			// Compute elements 0:j-1 of j-th column:
			// A(0:j-1, j) = A(0:j-1, 0:j-1) * A(0:j-1, j) [triangular matrix-vector multiply]
			ztrmv( 'upper', 'no-transpose', diag, j, A, sa1, sa2, offsetA,
				A, sa1, offsetA + (j * sa2) );

			// Scale column by ajj: A(0:j-1, j) = ajj * A(0:j-1, j)
			zscal( j, new Complex128( ajjR, ajjI ), A, sa1, offsetA + (j * sa2) );
		}
	} else {
		// Compute inverse of lower triangular matrix
		for ( j = N - 1; j >= 0; j-- ) {
			ia = ( offsetA + (j * sa1) + (j * sa2) ) * 2;
			if ( nounit ) {
				// A(j,j) = ONE / A(j,j) — use cmplx.divAt for numerical safety
				scratch[ 2 ] = Av[ ia ];
				scratch[ 3 ] = Av[ ia + 1 ];
				cmplx.divAt( Av, ia, scratch, 0, scratch, 2 );

				// Ajj = -A(j,j)
				ajjR = -Av[ ia ];
				ajjI = -Av[ ia + 1 ];
			} else {
				ajjR = -1.0;
				ajjI = 0.0;
			}
			if ( j < N - 1 ) {
				// Compute elements j+1:N-1 of j-th column:
				// A(j+1:N-1, j) = A(j+1:N-1, j+1:N-1) * A(j+1:N-1, j)
				ztrmv( 'lower', 'no-transpose', diag, N - j - 1,
					A, sa1, sa2, offsetA + (( j + 1 ) * sa1) + (( j + 1 ) * sa2),
					A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2) );

				// Scale column by ajj: A(j+1:N-1, j) = ajj * A(j+1:N-1, j)
				zscal( N - j - 1, new Complex128( ajjR, ajjI ),
					A, sa1, offsetA + (( j + 1 ) * sa1) + (j * sa2) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default ztrti2;
