/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs the symmetric rank-k operation `C := alpha*A*A**T + beta*C` or `C := alpha*A**T*A + beta*C`.
*
* where alpha and beta are complex scalars, C is an N-by-N symmetric matrix
* (stored as Complex128Array), and A is an N-by-K matrix in the first case
* and a K-by-N matrix in the second case.
*
* Only the upper or lower triangular part of C is updated.
*
* @private
* @param {string} uplo - `'upper'` for upper triangle, `'lower'` for lower triangle
* @param {string} trans - `'no-transpose'` for `A*A**T`, `'transpose'` for `A**T*A`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans is `'no-transpose'`) or rows (if trans is `'transpose'`)
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128} beta - complex scalar multiplier
* @param {Complex128Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zsyrk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
	let tempR, tempI, ajR, ajI, aiR, aiI, cR, cI, ic, ia, i, j, l;

	const upper = ( uplo === 'upper' );
	const nota = ( trans === 'no-transpose' );

	const alphaR = real( alpha );
	const alphaI = imag( alpha );
	const betaR = real( beta );
	const betaI = imag( beta );

	if ( N === 0 || ( ( ( alphaR === 0.0 && alphaI === 0.0 ) || K === 0 ) && betaR === 1.0 && betaI === 0.0 ) ) { // eslint-disable-line no-extra-parens
		return C;
	}

	// Get Float64Array views and convert offsets/strides to Float64 units
	const Av = reinterpret( A, 0 );
	const oA = offsetA * 2;
	const Cv = reinterpret( C, 0 );
	const oC = offsetC * 2;

	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const sc1 = strideC1 * 2;
	const sc2 = strideC2 * 2;

	// When alpha is zero, just scale C by beta
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		if ( upper ) {
			if ( betaR === 0.0 && betaI === 0.0 ) {
				for ( j = 0; j < N; j++ ) {
					ic = oC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					ic = oC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						// C[i,j] = beta * C[i,j] (complex multiplication)
						cR = Cv[ ic ];
						cI = Cv[ ic + 1 ];
						Cv[ ic ] = (betaR * cR) - (betaI * cI);
						Cv[ ic + 1 ] = (betaR * cI) + (betaI * cR);
						ic += sc1;
					}
				}
			}
		} else if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = oC + (j * sc1) + (j * sc2);
				for ( i = j; i < N; i++ ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = oC + (j * sc1) + (j * sc2);
				for ( i = j; i < N; i++ ) {
					// C[i,j] = beta * C[i,j] (complex multiplication)
					cR = Cv[ ic ];
					cI = Cv[ ic + 1 ];
					Cv[ ic ] = (betaR * cR) - (betaI * cI);
					Cv[ ic + 1 ] = (betaR * cI) + (betaI * cR);
					ic += sc1;
				}
			}
		}
		return C;
	}

	if ( nota ) {
		// C := alpha*A*A**T + beta*C
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ic = oC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ic = oC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						cR = Cv[ ic ];
						cI = Cv[ ic + 1 ];
						Cv[ ic ] = (betaR * cR) - (betaI * cI);
						Cv[ ic + 1 ] = (betaR * cI) + (betaI * cR);
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					ia = oA + (j * sa1) + (l * sa2);
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 ) {
						// Temp = alpha * A[j,l] (complex multiplication, NO conjugate)
						tempR = (alphaR * ajR) - (alphaI * ajI);
						tempI = (alphaR * ajI) + (alphaI * ajR);
						ic = oC + (j * sc2);
						ia = oA + (l * sa2);
						for ( i = 0; i <= j; i++ ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];

							// C[i,j] += temp * A[i,l] (complex multiplication)
							Cv[ ic ] += (tempR * aiR) - (tempI * aiI);
							Cv[ ic + 1 ] += (tempR * aiI) + (tempI * aiR);
							ic += sc1;
							ia += sa1;
						}
					}
				}
			}
		} else {
			// Lower
			for ( j = 0; j < N; j++ ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ic = oC + (j * sc1) + (j * sc2);
					for ( i = j; i < N; i++ ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ic = oC + (j * sc1) + (j * sc2);
					for ( i = j; i < N; i++ ) {
						cR = Cv[ ic ];
						cI = Cv[ ic + 1 ];
						Cv[ ic ] = (betaR * cR) - (betaI * cI);
						Cv[ ic + 1 ] = (betaR * cI) + (betaI * cR);
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					ia = oA + (j * sa1) + (l * sa2);
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 ) {
						// Temp = alpha * A[j,l] (complex multiplication, NO conjugate)
						tempR = (alphaR * ajR) - (alphaI * ajI);
						tempI = (alphaR * ajI) + (alphaI * ajR);
						ic = oC + (j * sc1) + (j * sc2);
						ia = oA + (j * sa1) + (l * sa2);
						for ( i = j; i < N; i++ ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];

							// C[i,j] += temp * A[i,l] (complex multiplication)
							Cv[ ic ] += (tempR * aiR) - (tempI * aiI);
							Cv[ ic + 1 ] += (tempR * aiI) + (tempI * aiR);
							ic += sc1;
							ia += sa1;
						}
					}
				}
			}
		}
	} else if ( upper ) {
		// C := alpha*A**T*A + beta*C (transpose, NOT conjugate-transpose)
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				tempR = 0.0;
				tempI = 0.0;
				for ( l = 0; l < K; l++ ) {
					// A[l,i] * A[l,j] (NO conjugation)
					aiR = Av[ oA + (l * sa1) + (i * sa2) ];
					aiI = Av[ oA + (l * sa1) + (i * sa2) + 1 ];
					ajR = Av[ oA + (l * sa1) + (j * sa2) ];
					ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
					tempR += (aiR * ajR) - (aiI * ajI);
					tempI += (aiR * ajI) + (aiI * ajR);
				}
				ic = oC + (i * sc1) + (j * sc2);
				if ( betaR === 0.0 && betaI === 0.0 ) {
					// C[i,j] = alpha * temp
					Cv[ ic ] = (alphaR * tempR) - (alphaI * tempI);
					Cv[ ic + 1 ] = (alphaR * tempI) + (alphaI * tempR);
				} else {
					// C[i,j] = alpha * temp + beta * C[i,j]
					cR = Cv[ ic ];
					cI = Cv[ ic + 1 ];
					Cv[ ic ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
					Cv[ ic + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
				}
			}
		}
	} else {
		// Lower: C := alpha*A**T*A + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				tempR = 0.0;
				tempI = 0.0;
				for ( l = 0; l < K; l++ ) {
					// A[l,i] * A[l,j] (NO conjugation)
					aiR = Av[ oA + (l * sa1) + (i * sa2) ];
					aiI = Av[ oA + (l * sa1) + (i * sa2) + 1 ];
					ajR = Av[ oA + (l * sa1) + (j * sa2) ];
					ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
					tempR += (aiR * ajR) - (aiI * ajI);
					tempI += (aiR * ajI) + (aiI * ajR);
				}
				ic = oC + (i * sc1) + (j * sc2);
				if ( betaR === 0.0 && betaI === 0.0 ) {
					// C[i,j] = alpha * temp
					Cv[ ic ] = (alphaR * tempR) - (alphaI * tempI);
					Cv[ ic + 1 ] = (alphaR * tempI) + (alphaI * tempR);
				} else {
					// C[i,j] = alpha * temp + beta * C[i,j]
					cR = Cv[ ic ];
					cI = Cv[ ic + 1 ];
					Cv[ ic ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
					Cv[ ic + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
				}
			}
		}
	}

	return C;
}


// EXPORTS //

export default zsyrk;
