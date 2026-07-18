/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import max from '@stdlib/math/base/special/max/lib/index.js';
import min from '@stdlib/math/base/special/min/lib/index.js';
import floor from '@stdlib/math/base/special/floor/lib/index.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zher from '../../../../blas/base/zher/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';


// MAIN //

/**
* Computes a split Cholesky factorization of a complex Hermitian positive.
* definite band matrix A.
*
* The factorization has the form `A = S**H * S` where S is a band matrix
* of the same bandwidth as A with structure `S = [U; M L]`, where U is
* upper triangular of order `m = floor((n+kd)/2)` and L is lower triangular
* of order `n-m`. This routine is designed to be used in conjunction with
* ZHBGST.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/sub-diagonals
* @param {Complex128Array} AB - input/output band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of AB (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of AB (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for AB (in complex elements)
* @returns {integer} info - 0 if successful, j>0 if the factorization could not be completed because the element a(j,j) is less than or equal to zero
*/
function zpbstf( uplo, N, kd, AB, strideAB1, strideAB2, offsetAB ) {
	let ajj, da, km, j;

	if ( N === 0 ) {
		return 0;
	}

	const Av = reinterpret( AB, 0 );
	const oA = offsetAB * 2;
	const sa1 = strideAB1 * 2;
	const sa2 = strideAB2 * 2;

	// KLD = MAX(1, LDAB-1) in Fortran.

	// In the general stride case, the flat stride is sa2 - sa1 (for column-major sa1=1*2, this is (LDAB-1)*2).

	// But kld is in complex-element strides for zdscal/zher/zlacgv calls.
	const kld = max( 1, strideAB2 - strideAB1 );

	// Set the splitting point m.
	const m = floor( ( N + kd ) / 2 );

	if ( uplo === 'upper' ) {
		// Factorize A(m+1:n,m+1:n) as L**H*L, and update A(1:m,1:m).
		// Loop backwards from N to m+1 (Fortran 1-based), i.e. j from N-1 down to m (0-based).
		for ( j = N - 1; j >= m; j-- ) {
			// Diagonal: AB(KD+1, J+1) in Fortran => oA + kd*sa1 + j*sa2 (Float64 index)
			da = oA + ( kd * sa1 ) + ( j * sa2 );
			ajj = Av[ da ];
			if ( ajj <= 0.0 ) {
				Av[ da ] = ajj;
				Av[ da + 1 ] = 0.0;
				return j + 1;
			}
			ajj = sqrt( ajj );
			Av[ da ] = ajj;
			Av[ da + 1 ] = 0.0;
			km = min( j, kd );

			// ZDSCAL( KM, 1/AJJ, AB(KD+1-KM, J), 1 )

			// AB(KD+1-KM, J) in complex-element: offsetAB + (kd-km)*strideAB1 + j*strideAB2

			// Stride = strideAB1 (stepping along rows within same column)
			zdscal( km, 1.0 / ajj, AB, strideAB1, offsetAB + ( ( kd - km ) * strideAB1 ) + ( j * strideAB2 ) );

			// ZHER('Upper', KM, -1, AB(KD+1-KM, J), 1, AB(KD+1, J-KM), KLD)

			// AB(KD+1, J-KM) in complex-element: offsetAB + kd*strideAB1 + (j-km)*strideAB2

			// X stride = strideAB1, A strides = (strideAB1, kld)
			zher( 'upper', km, -1.0, AB, strideAB1, offsetAB + ( ( kd - km ) * strideAB1 ) + ( j * strideAB2 ), AB, strideAB1, kld, offsetAB + ( kd * strideAB1 ) + ( ( j - km ) * strideAB2 ) );
		}

		// Factorize the updated submatrix A(1:m,1:m) as U**H*U.
		// Loop j from 1 to m (Fortran 1-based), i.e. 0 to m-1 (0-based).
		for ( j = 0; j < m; j++ ) {
			// Diagonal: AB(KD+1, J+1) in Fortran => oA + kd*sa1 + j*sa2
			da = oA + ( kd * sa1 ) + ( j * sa2 );
			ajj = Av[ da ];
			if ( ajj <= 0.0 ) {
				Av[ da ] = ajj;
				Av[ da + 1 ] = 0.0;
				return j + 1;
			}
			ajj = sqrt( ajj );
			Av[ da ] = ajj;
			Av[ da + 1 ] = 0.0;
			km = min( kd, m - j - 1 );

			if ( km > 0 ) {
				// ZDSCAL( KM, 1/AJJ, AB(KD, J+2), KLD )
				// AB(KD, J+2) in complex-element: offsetAB + (kd-1)*strideAB1 + (j+1)*strideAB2
				zdscal( km, 1.0 / ajj, AB, kld, offsetAB + ( ( kd - 1 ) * strideAB1 ) + ( ( j + 1 ) * strideAB2 ) );

				// ZLACGV( KM, AB(KD, J+2), KLD )
				zlacgv( km, AB, kld, offsetAB + ( ( kd - 1 ) * strideAB1 ) + ( ( j + 1 ) * strideAB2 ) );

				// ZHER('Upper', KM, -1, AB(KD, J+2), KLD, AB(KD+1, J+2), KLD)
				zher( 'upper', km, -1.0, AB, kld, offsetAB + ( ( kd - 1 ) * strideAB1 ) + ( ( j + 1 ) * strideAB2 ), AB, strideAB1, kld, offsetAB + ( kd * strideAB1 ) + ( ( j + 1 ) * strideAB2 ) );

				// ZLACGV( KM, AB(KD, J+2), KLD ) -- undo conjugation
				zlacgv( km, AB, kld, offsetAB + ( ( kd - 1 ) * strideAB1 ) + ( ( j + 1 ) * strideAB2 ) );
			}
		}
	} else {
		// Factorize A(m+1:n,m+1:n) as L**H*L, and update A(1:m,1:m).
		// Loop backwards from N to m+1 (Fortran 1-based).
		for ( j = N - 1; j >= m; j-- ) {
			// Diagonal: AB(1, J+1) in Fortran => oA + j*sa2
			da = oA + ( j * sa2 );
			ajj = Av[ da ];
			if ( ajj <= 0.0 ) {
				Av[ da ] = ajj;
				Av[ da + 1 ] = 0.0;
				return j + 1;
			}
			ajj = sqrt( ajj );
			Av[ da ] = ajj;
			Av[ da + 1 ] = 0.0;
			km = min( j, kd );

			// ZDSCAL( KM, 1/AJJ, AB(KM+1, J-KM+1), KLD )

			// AB(KM+1, J-KM+1) in complex-element: offsetAB + km*strideAB1 + (j-km)*strideAB2
			zdscal( km, 1.0 / ajj, AB, kld, offsetAB + ( km * strideAB1 ) + ( ( j - km ) * strideAB2 ) );

			// ZLACGV( KM, AB(KM+1, J-KM+1), KLD )
			zlacgv( km, AB, kld, offsetAB + ( km * strideAB1 ) + ( ( j - km ) * strideAB2 ) );

			// ZHER('Lower', KM, -1, AB(KM+1, J-KM+1), KLD, AB(1, J-KM+1), KLD)
			zher( 'lower', km, -1.0, AB, kld, offsetAB + ( km * strideAB1 ) + ( ( j - km ) * strideAB2 ), AB, strideAB1, kld, offsetAB + ( ( j - km ) * strideAB2 ) );

			// ZLACGV( KM, AB(KM+1, J-KM+1), KLD ) -- undo conjugation
			zlacgv( km, AB, kld, offsetAB + ( km * strideAB1 ) + ( ( j - km ) * strideAB2 ) );
		}

		// Factorize the updated submatrix A(1:m,1:m) as U**H*U.
		// Loop j from 1 to m (Fortran 1-based).
		for ( j = 0; j < m; j++ ) {
			// Diagonal: AB(1, J+1) in Fortran => oA + j*sa2
			da = oA + ( j * sa2 );
			ajj = Av[ da ];
			if ( ajj <= 0.0 ) {
				Av[ da ] = ajj;
				Av[ da + 1 ] = 0.0;
				return j + 1;
			}
			ajj = sqrt( ajj );
			Av[ da ] = ajj;
			Av[ da + 1 ] = 0.0;
			km = min( kd, m - j - 1 );

			if ( km > 0 ) {
				// ZDSCAL( KM, 1/AJJ, AB(2, J+1), 1 )
				// AB(2, J+1) in complex-element: offsetAB + strideAB1 + j*strideAB2
				zdscal( km, 1.0 / ajj, AB, strideAB1, offsetAB + strideAB1 + ( j * strideAB2 ) );

				// ZHER('Lower', KM, -1, AB(2, J+1), 1, AB(1, J+2), KLD)

				// AB(1, J+2) in complex-element: offsetAB + (j+1)*strideAB2
				zher( 'lower', km, -1.0, AB, strideAB1, offsetAB + strideAB1 + ( j * strideAB2 ), AB, strideAB1, kld, offsetAB + ( ( j + 1 ) * strideAB2 ) );
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zpbstf;
