/* eslint-disable max-len, max-lines-per-function, max-statements, max-params, no-lonely-if */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zherk from '../../../../blas/base/zherk/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';


// MAIN //

/**
* Performs a Hermitian rank-k operation for a matrix in Rectangular Full Packed format.
*
* C := alpha\*A\*A^H + beta\*C, or C := alpha\*A^H\*A + beta\*C,
* where alpha and beta are real scalars, C is an N-by-N Hermitian matrix
* stored in RFP format, and A is an N-by-K or K-by-N complex matrix.
*
* @private
* @param {string} transr - `'no-transpose'` or `'conjugate-transpose'` (RFP storage)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of Hermitian matrix C
* @param {NonNegativeInteger} K - number of columns of A (trans='no-transpose') or rows of A (trans='conjugate-transpose')
* @param {number} alpha - real scalar
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {number} beta - real scalar
* @param {Complex128Array} C - RFP array of length N*(N+1)/2
* @param {integer} strideC - stride for `C` (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for `C` (in complex elements)
* @returns {Complex128Array} `C`
*/
function zhfrk( transr, uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC, offsetC ) {
	var normalTransr;
	var notrans;
	var calpha;
	var nisodd;
	var lower;
	var cbeta;
	var view;
	var nt;
	var sa;
	var n1;
	var n2;
	var nk;
	var j;

	normalTransr = ( transr === 'no-transpose' );
	lower = ( uplo === 'lower' );
	notrans = ( trans === 'no-transpose' );

	sa = strideC;

	// Quick return if N=0, or (alpha=0 or K=0) and beta=1:
	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	// If alpha=0 and beta=0, zero out C:
	if ( alpha === 0.0 && beta === 0.0 ) {
		nt = ( N * ( N + 1 ) ) / 2;
		view = reinterpret( C, 0 );
		for ( j = 0; j < nt; j++ ) {
			view[ ( ( offsetC + ( j * sa ) ) * 2 ) ] = 0.0;
			view[ ( ( offsetC + ( j * sa ) ) * 2 ) + 1 ] = 0.0;
		}
		return C;
	}

	calpha = new Complex128( alpha, 0.0 );
	cbeta = new Complex128( beta, 0.0 );

	// Determine N1, N2, NK based on parity of N:
	if ( N % 2 === 0 ) {
		nisodd = false;
		nk = N / 2;
	} else {
		nisodd = true;
		if ( lower ) {
			n2 = Math.floor( N / 2 );
			n1 = N - n2;
		} else {
			n1 = Math.floor( N / 2 );
			n2 = N - n1;
		}
	}

	if ( nisodd ) {
		// N is odd
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP with LDA = N
			if ( lower ) {
				if ( notrans ) {
					// ZHERK('L','N', N1, K, alpha, A(1,1), LDA, beta, C(1), N)
					zherk( 'lower', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * N, offsetC );

					// ZHERK('U','N', N2, K, alpha, A(N1+1,1), LDA, beta, C(N+1), N)
					zherk( 'upper', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sa, sa * N, offsetC + ( sa * N ) );

					// ZGEMM('N','C', N2, N1, K, calpha, A(N1+1,1), LDA, A(1,1), LDA, cbeta, C(N1+1), N)
					zgemm( 'no-transpose', 'conjugate-transpose', n2, n1, K, calpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * N, offsetC + ( sa * n1 ) );
				} else {
					// ZHERK('L','C', N1, K, alpha, A(1,1), LDA, beta, C(1), N)
					zherk( 'lower', 'conjugate-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * N, offsetC );

					// ZHERK('U','C', N2, K, alpha, A(1,N1+1), LDA, beta, C(N+1), N)
					zherk( 'upper', 'conjugate-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sa, sa * N, offsetC + ( sa * N ) );

					// ZGEMM('C','N', N2, N1, K, calpha, A(1,N1+1), LDA, A(1,1), LDA, cbeta, C(N1+1), N)
					zgemm( 'conjugate-transpose', 'no-transpose', n2, n1, K, calpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * N, offsetC + ( sa * n1 ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// ZHERK('L','N', N1, K, alpha, A(1,1), LDA, beta, C(N2+1), N)
					zherk( 'lower', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * N, offsetC + ( sa * n2 ) );

					// ZHERK('U','N', N2, K, alpha, A(N2,1), LDA, beta, C(N1+1), N)

					// Note: Fortran A(N2,1) is 1-based, so offset is (N2-1)*strideA1
					zherk( 'upper', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * ( n2 - 1 ) ), beta, C, sa, sa * N, offsetC + ( sa * n1 ) );

					// ZGEMM('N','C', N1, N2, K, calpha, A(1,1), LDA, A(N2,1), LDA, cbeta, C(1), N)
					zgemm( 'no-transpose', 'conjugate-transpose', n1, n2, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * ( n2 - 1 ) ), cbeta, C, sa, sa * N, offsetC );
				} else {
					// ZHERK('L','C', N1, K, alpha, A(1,1), LDA, beta, C(N2+1), N)
					zherk( 'lower', 'conjugate-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * N, offsetC + ( sa * n2 ) );

					// ZHERK('U','C', N2, K, alpha, A(1,N2), LDA, beta, C(N1+1), N)

					// Note: Fortran A(1,N2) is 1-based column, offset is (N2-1)*strideA2
					zherk( 'upper', 'conjugate-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * ( n2 - 1 ) ), beta, C, sa, sa * N, offsetC + ( sa * n1 ) );

					// ZGEMM('C','N', N1, N2, K, calpha, A(1,1), LDA, A(1,N2), LDA, cbeta, C(1), N)
					zgemm( 'conjugate-transpose', 'no-transpose', n1, n2, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * ( n2 - 1 ) ), cbeta, C, sa, sa * N, offsetC );
				}
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = N1
			if ( lower ) {
				if ( notrans ) {
					// ZHERK('U','N', N1, K, alpha, A(1,1), LDA, beta, C(1), N1)
					zherk( 'upper', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * n1, offsetC );

					// ZHERK('L','N', N2, K, alpha, A(N1+1,1), LDA, beta, C(2), N1)
					zherk( 'lower', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sa, sa * n1, offsetC + sa );

					// ZGEMM('N','C', N1, N2, K, calpha, A(1,1), LDA, A(N1+1,1), LDA, cbeta, C(N1*N1+1), N1)
					zgemm( 'no-transpose', 'conjugate-transpose', n1, n2, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), cbeta, C, sa, sa * n1, offsetC + ( sa * n1 * n1 ) );
				} else {
					// ZHERK('U','C', N1, K, alpha, A(1,1), LDA, beta, C(1), N1)
					zherk( 'upper', 'conjugate-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * n1, offsetC );

					// ZHERK('L','C', N2, K, alpha, A(1,N1+1), LDA, beta, C(2), N1)
					zherk( 'lower', 'conjugate-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sa, sa * n1, offsetC + sa );

					// ZGEMM('C','N', N1, N2, K, calpha, A(1,1), LDA, A(1,N1+1), LDA, cbeta, C(N1*N1+1), N1)
					zgemm( 'conjugate-transpose', 'no-transpose', n1, n2, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), cbeta, C, sa, sa * n1, offsetC + ( sa * n1 * n1 ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// ZHERK('U','N', N1, K, alpha, A(1,1), LDA, beta, C(N2*N2+1), N2)
					zherk( 'upper', 'no-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * n2, offsetC + ( sa * n2 * n2 ) );

					// ZHERK('L','N', N2, K, alpha, A(N1+1,1), LDA, beta, C(N1*N2+1), N2)
					zherk( 'lower', 'no-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), beta, C, sa, sa * n2, offsetC + ( sa * n1 * n2 ) );

					// ZGEMM('N','C', N2, N1, K, calpha, A(N1+1,1), LDA, A(1,1), LDA, cbeta, C(1), N2)
					zgemm( 'no-transpose', 'conjugate-transpose', n2, n1, K, calpha, A, strideA1, strideA2, offsetA + ( strideA1 * n1 ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * n2, offsetC );
				} else {
					// ZHERK('U','C', N1, K, alpha, A(1,1), LDA, beta, C(N2*N2+1), N2)
					zherk( 'upper', 'conjugate-transpose', n1, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * n2, offsetC + ( sa * n2 * n2 ) );

					// ZHERK('L','C', N2, K, alpha, A(1,N1+1), LDA, beta, C(N1*N2+1), N2)
					zherk( 'lower', 'conjugate-transpose', n2, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), beta, C, sa, sa * n2, offsetC + ( sa * n1 * n2 ) );

					// ZGEMM('C','N', N2, N1, K, calpha, A(1,N1+1), LDA, A(1,1), LDA, cbeta, C(1), N2)
					zgemm( 'conjugate-transpose', 'no-transpose', n2, n1, K, calpha, A, strideA1, strideA2, offsetA + ( strideA2 * n1 ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * n2, offsetC );
				}
			}
		}
	} else {
		// N is even
		if ( normalTransr ) {
			// TRANSR = 'N', column-major RFP, LDA = N+1
			if ( lower ) {
				if ( notrans ) {
					// ZHERK('L','N', NK, K, alpha, A(1,1), LDA, beta, C(2), N+1)
					zherk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * ( N + 1 ), offsetC + sa );

					// ZHERK('U','N', NK, K, alpha, A(NK+1,1), LDA, beta, C(1), N+1)
					zherk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sa, sa * ( N + 1 ), offsetC );

					// ZGEMM('N','C', NK, NK, K, calpha, A(NK+1,1), LDA, A(1,1), LDA, cbeta, C(NK+2), N+1)
					zgemm( 'no-transpose', 'conjugate-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * ( N + 1 ), offsetC + ( sa * ( nk + 1 ) ) );
				} else {
					// ZHERK('L','C', NK, K, alpha, A(1,1), LDA, beta, C(2), N+1)
					zherk( 'lower', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * ( N + 1 ), offsetC + sa );

					// ZHERK('U','C', NK, K, alpha, A(1,NK+1), LDA, beta, C(1), N+1)
					zherk( 'upper', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sa, sa * ( N + 1 ), offsetC );

					// ZGEMM('C','N', NK, NK, K, calpha, A(1,NK+1), LDA, A(1,1), LDA, cbeta, C(NK+2), N+1)
					zgemm( 'conjugate-transpose', 'no-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * ( N + 1 ), offsetC + ( sa * ( nk + 1 ) ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// ZHERK('L','N', NK, K, alpha, A(1,1), LDA, beta, C(NK+2), N+1)
					zherk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * ( N + 1 ), offsetC + ( sa * ( nk + 1 ) ) );

					// ZHERK('U','N', NK, K, alpha, A(NK+1,1), LDA, beta, C(NK+1), N+1)
					zherk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sa, sa * ( N + 1 ), offsetC + ( sa * nk ) );

					// ZGEMM('N','C', NK, NK, K, calpha, A(1,1), LDA, A(NK+1,1), LDA, cbeta, C(1), N+1)
					zgemm( 'no-transpose', 'conjugate-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), cbeta, C, sa, sa * ( N + 1 ), offsetC );
				} else {
					// ZHERK('L','C', NK, K, alpha, A(1,1), LDA, beta, C(NK+2), N+1)
					zherk( 'lower', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * ( N + 1 ), offsetC + ( sa * ( nk + 1 ) ) );

					// ZHERK('U','C', NK, K, alpha, A(1,NK+1), LDA, beta, C(NK+1), N+1)
					zherk( 'upper', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sa, sa * ( N + 1 ), offsetC + ( sa * nk ) );

					// ZGEMM('C','N', NK, NK, K, calpha, A(1,1), LDA, A(1,NK+1), LDA, cbeta, C(1), N+1)
					zgemm( 'conjugate-transpose', 'no-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), cbeta, C, sa, sa * ( N + 1 ), offsetC );
				}
			}
		} else {
			// TRANSR = 'C', conjugate-transpose RFP, LDA = NK = N/2
			if ( lower ) {
				if ( notrans ) {
					// ZHERK('U','N', NK, K, alpha, A(1,1), LDA, beta, C(NK+1), NK)
					zherk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * nk, offsetC + ( sa * nk ) );

					// ZHERK('L','N', NK, K, alpha, A(NK+1,1), LDA, beta, C(1), NK)
					zherk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sa, sa * nk, offsetC );

					// ZGEMM('N','C', NK, NK, K, calpha, A(1,1), LDA, A(NK+1,1), LDA, cbeta, C((NK+1)*NK+1), NK)
					zgemm( 'no-transpose', 'conjugate-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), cbeta, C, sa, sa * nk, offsetC + ( sa * ( nk + 1 ) * nk ) );
				} else {
					// ZHERK('U','C', NK, K, alpha, A(1,1), LDA, beta, C(NK+1), NK)
					zherk( 'upper', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * nk, offsetC + ( sa * nk ) );

					// ZHERK('L','C', NK, K, alpha, A(1,NK+1), LDA, beta, C(1), NK)
					zherk( 'lower', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sa, sa * nk, offsetC );

					// ZGEMM('C','N', NK, NK, K, calpha, A(1,1), LDA, A(1,NK+1), LDA, cbeta, C((NK+1)*NK+1), NK)
					zgemm( 'conjugate-transpose', 'no-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), cbeta, C, sa, sa * nk, offsetC + ( sa * ( nk + 1 ) * nk ) );
				}
			} else {
				// UPLO = 'U'
				if ( notrans ) {
					// ZHERK('U','N', NK, K, alpha, A(1,1), LDA, beta, C(NK*(NK+1)+1), NK)
					zherk( 'upper', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * nk, offsetC + ( sa * nk * ( nk + 1 ) ) );

					// ZHERK('L','N', NK, K, alpha, A(NK+1,1), LDA, beta, C(NK*NK+1), NK)
					zherk( 'lower', 'no-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), beta, C, sa, sa * nk, offsetC + ( sa * nk * nk ) );

					// ZGEMM('N','C', NK, NK, K, calpha, A(NK+1,1), LDA, A(1,1), LDA, cbeta, C(1), NK)
					zgemm( 'no-transpose', 'conjugate-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA + ( strideA1 * nk ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * nk, offsetC );
				} else {
					// ZHERK('U','C', NK, K, alpha, A(1,1), LDA, beta, C(NK*(NK+1)+1), NK)
					zherk( 'upper', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA, beta, C, sa, sa * nk, offsetC + ( sa * nk * ( nk + 1 ) ) );

					// ZHERK('L','C', NK, K, alpha, A(1,NK+1), LDA, beta, C(NK*NK+1), NK)
					zherk( 'lower', 'conjugate-transpose', nk, K, alpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), beta, C, sa, sa * nk, offsetC + ( sa * nk * nk ) );

					// ZGEMM('C','N', NK, NK, K, calpha, A(1,NK+1), LDA, A(1,1), LDA, cbeta, C(1), NK)
					zgemm( 'conjugate-transpose', 'no-transpose', nk, nk, K, calpha, A, strideA1, strideA2, offsetA + ( strideA2 * nk ), A, strideA1, strideA2, offsetA, cbeta, C, sa, sa * nk, offsetC );
				}
			}
		}
	}

	return C;
}


// EXPORTS //

export default zhfrk;
