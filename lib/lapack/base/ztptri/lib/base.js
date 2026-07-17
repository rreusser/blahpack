/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztpmv from '../../../../blas/base/ztpmv/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

// Scratch buffer for complex division: [0..1]=numerator(1,0), [2..3]=denominator, [4..5]=result
var scratch = new Float64Array( 6 );

scratch[ 0 ] = 1.0;
scratch[ 1 ] = 0.0;


// MAIN //

/**
* Computes the inverse of a complex upper or lower triangular matrix in packed storage.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} diag - specifies whether the matrix is unit triangular (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed triangular matrix (complex-element strides)
* @param {integer} stride - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offset - starting index for `AP` (in complex elements)
* @returns {integer} info - 0 if successful, k if `AP[k-1,k-1]` is zero (1-based)
*/
function ztptri( uplo, diag, N, AP, stride, offset ) {
	var jclast;
	var nounit;
	var upper;
	var ajjR;
	var ajjI;
	var APv;
	var jj;
	var jc;
	var e;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );
	nounit = ( diag === 'non-unit' );
	APv = reinterpret( AP, 0 );

	// `jc`/`jj`/`jclast` are PURE 0-based packed linear indices; every physical
	// access scales by stride: element index = `offset + idx*stride` (NOT
	// `offset + idx` — see the zpptri/ztptri packed-stride LEARNINGS entry).

	// Check for singularity...
	if ( nounit ) {
		if ( upper ) {
			// Upper packed diag positions (pure packed): 0, 2, 5, 9, ...
			// Fortran: JJ=0; DO j=1,N: JJ=JJ+j; check AP(JJ)
			jj = -1;
			for ( j = 1; j <= N; j++ ) {
				jj += j;
				e = ( offset + ( jj * stride ) ) * 2;
				if ( APv[ e ] === 0.0 && APv[ e + 1 ] === 0.0 ) {
					return j; // 1-based index
				}
			}
		} else {
			// Lower packed diag positions (pure packed): 0, N, 2*N-1, ...
			// Fortran: JJ=1; DO j=1,N: check AP(JJ); JJ=JJ+N-j+1
			jj = 0;
			for ( j = 1; j <= N; j++ ) {
				e = ( offset + ( jj * stride ) ) * 2;
				if ( APv[ e ] === 0.0 && APv[ e + 1 ] === 0.0 ) {
					return j; // 1-based index
				}
				jj += ( N - j + 1 );
			}
		}
	}

	if ( upper ) {
		// Compute inverse of upper triangular matrix in packed storage
		jc = 0; // pure packed start of column j
		for ( j = 0; j < N; j++ ) {
			e = offset + ( ( jc + j ) * stride ); // diagonal element index
			jj = e * 2;
			if ( nounit ) {
				// AP(jc+j) = ONE / AP(jc+j) — use cmplx.divAt for numerical safety
				scratch[ 2 ] = APv[ jj ];
				scratch[ 3 ] = APv[ jj + 1 ];
				cmplx.divAt( APv, jj, scratch, 0, scratch, 2 );

				// Ajj = -AP(jc+j)
				ajjR = -APv[ jj ];
				ajjI = -APv[ jj + 1 ];
			} else {
				ajjR = -1.0;
				ajjI = 0.0;
			}

			// Compute elements 0:j-1 of j-th column:
			// AP(jc:jc+j-1) = A(0:j-1, 0:j-1) * AP(jc:jc+j-1)
			ztpmv( 'upper', 'no-transpose', diag, j, AP, stride, offset, AP, stride, offset + ( jc * stride ) );

			// Scale by ajj: AP(jc:jc+j-1) *= ajj
			zscal( j, new Complex128( ajjR, ajjI ), AP, stride, offset + ( jc * stride ) );

			jc += j + 1;
		}
	} else {
		// Compute inverse of lower triangular matrix in packed storage
		// jc = pure packed index of the diagonal element of column j.
		// Last column diagonal (pure packed) is at N*(N+1)/2 - 1.
		jc = ( ( N * ( N + 1 ) ) / 2 ) - 1;
		for ( j = N - 1; j >= 0; j-- ) {
			e = offset + ( jc * stride );
			jj = e * 2;
			if ( nounit ) {
				// AP(jc) = ONE / AP(jc) — use cmplx.divAt for numerical safety
				scratch[ 2 ] = APv[ jj ];
				scratch[ 3 ] = APv[ jj + 1 ];
				cmplx.divAt( APv, jj, scratch, 0, scratch, 2 );

				// Ajj = -AP(jc)
				ajjR = -APv[ jj ];
				ajjI = -APv[ jj + 1 ];
			} else {
				ajjR = -1.0;
				ajjI = 0.0;
			}
			if ( j < N - 1 ) {
				// Compute elements j+1:N-1 of j-th column:
				// AP(jc+1:jc+N-j-1) = A(j+1:N-1, j+1:N-1) * AP(jc+1:jc+N-j-1)
				ztpmv( 'lower', 'no-transpose', diag, N - j - 1, AP, stride, offset + ( jclast * stride ), AP, stride, offset + ( ( jc + 1 ) * stride ) );

				// Scale by ajj: AP(jc+1:jc+N-j-1) *= ajj
				zscal( N - j - 1, new Complex128( ajjR, ajjI ), AP, stride, offset + ( ( jc + 1 ) * stride ) );
			}
			jclast = jc;

			// Diagonal of column j-1 is (N - j + 1) positions before current jc,
			// because column j-1 has (N - (j-1)) = (N - j + 1) elements.
			jc -= ( N - j + 1 );
		}
	}
	return 0;
}


// EXPORTS //

export default ztptri;
