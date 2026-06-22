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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs one of the symmetric rank-2k operations `C := alpha*A*B**T + alpha*B*A**T + beta*C` or `C := alpha*A**T*B + alpha*B**T*A + beta*C` where alpha and beta are complex scalars, C is an N-by-N symmetric matrix, and A and B are N-by-K or K-by-N matrices.
*
* @private
* @param {string} uplo - `'upper'` for upper triangle, `'lower'` for lower triangle
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A,B (if trans = `'no-transpose'`) or rows (if trans = `'transpose'`)
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - complex input matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {Complex128} beta - complex scalar multiplier for C
* @param {Complex128Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zsyr2k( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var alphaR;
	var alphaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var betaR;
	var betaI;
	var upper;
	var nota;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var ajR;
	var ajI;
	var bjR;
	var bjI;
	var aiR;
	var aiI;
	var biR;
	var biI;
	var Av;
	var Bv;
	var Cv;
	var oA;
	var oB;
	var oC;
	var ic;
	var ia;
	var ib;
	var tR;
	var tI;
	var i;
	var j;
	var l;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	// Quick return if possible
	if ( N === 0 || ( ( ( alphaR === 0.0 && alphaI === 0.0 ) || K === 0 ) && betaR === 1.0 && betaI === 0.0 ) ) {
		return C;
	}

	// Get Float64Array views and convert offsets/strides to Float64 units
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;
	Cv = reinterpret( C, 0 );
	oC = offsetC * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	// When alpha is zero, just scale C by complex beta
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		if ( upper ) {
			if ( betaR === 0.0 && betaI === 0.0 ) {
				for ( j = 0; j < N; j += 1 ) {
					ic = oC + ( j * sc2 );
					for ( i = 0; i <= j; i += 1 ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				}
			} else {
				for ( j = 0; j < N; j += 1 ) {
					ic = oC + ( j * sc2 );
					for ( i = 0; i <= j; i += 1 ) {
						// C[i,j] = beta * C[i,j] (complex multiply)
						tR = Cv[ ic ];
						tI = Cv[ ic + 1 ];
						Cv[ ic ] = ( betaR * tR ) - ( betaI * tI );
						Cv[ ic + 1 ] = ( betaR * tI ) + ( betaI * tR );
						ic += sc1;
					}
				}
			}
		} else if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( j = 0; j < N; j += 1 ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				for ( i = j; i < N; i += 1 ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j += 1 ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				for ( i = j; i < N; i += 1 ) {
					// C[i,j] = beta * C[i,j] (complex multiply)
					tR = Cv[ ic ];
					tI = Cv[ ic + 1 ];
					Cv[ ic ] = ( betaR * tR ) - ( betaI * tI );
					Cv[ ic + 1 ] = ( betaR * tI ) + ( betaI * tR );
					ic += sc1;
				}
			}
		}
		return C;
	}

	if ( nota ) {
		// C := alpha*A*B^T + alpha*B*A^T + beta*C
		if ( upper ) {
			for ( j = 0; j < N; j += 1 ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ic = oC + ( j * sc2 );
					for ( i = 0; i <= j; i += 1 ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ic = oC + ( j * sc2 );
					for ( i = 0; i <= j; i += 1 ) {
						tR = Cv[ ic ];
						tI = Cv[ ic + 1 ];
						Cv[ ic ] = ( betaR * tR ) - ( betaI * tI );
						Cv[ ic + 1 ] = ( betaR * tI ) + ( betaI * tR );
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l += 1 ) {
					ia = oA + ( j * sa1 ) + ( l * sa2 );
					ib = oB + ( j * sb1 ) + ( l * sb2 );
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					bjR = Bv[ ib ];
					bjI = Bv[ ib + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 || bjR !== 0.0 || bjI !== 0.0 ) {
						// temp1 = alpha * B[j,l] (no conjugation)
						temp1R = ( alphaR * bjR ) - ( alphaI * bjI );
						temp1I = ( alphaR * bjI ) + ( alphaI * bjR );

						// temp2 = alpha * A[j,l] (no conjugation)
						temp2R = ( alphaR * ajR ) - ( alphaI * ajI );
						temp2I = ( alphaR * ajI ) + ( alphaI * ajR );

						ic = oC + ( j * sc2 );
						ia = oA + ( l * sa2 );
						ib = oB + ( l * sb2 );
						for ( i = 0; i <= j; i += 1 ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];
							biR = Bv[ ib ];
							biI = Bv[ ib + 1 ];

							// C[i,j] += A[i,l]*temp1 + B[i,l]*temp2
							Cv[ ic ] += ( aiR * temp1R ) - ( aiI * temp1I ) + ( biR * temp2R ) - ( biI * temp2I );
							Cv[ ic + 1 ] += ( aiR * temp1I ) + ( aiI * temp1R ) + ( biR * temp2I ) + ( biI * temp2R );
							ic += sc1;
							ia += sa1;
							ib += sb1;
						}
					}
				}
			}
		} else {
			// Lower
			for ( j = 0; j < N; j += 1 ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ic = oC + ( j * sc1 ) + ( j * sc2 );
					for ( i = j; i < N; i += 1 ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ic = oC + ( j * sc1 ) + ( j * sc2 );
					for ( i = j; i < N; i += 1 ) {
						tR = Cv[ ic ];
						tI = Cv[ ic + 1 ];
						Cv[ ic ] = ( betaR * tR ) - ( betaI * tI );
						Cv[ ic + 1 ] = ( betaR * tI ) + ( betaI * tR );
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l += 1 ) {
					ia = oA + ( j * sa1 ) + ( l * sa2 );
					ib = oB + ( j * sb1 ) + ( l * sb2 );
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					bjR = Bv[ ib ];
					bjI = Bv[ ib + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 || bjR !== 0.0 || bjI !== 0.0 ) {
						// temp1 = alpha * B[j,l] (no conjugation)
						temp1R = ( alphaR * bjR ) - ( alphaI * bjI );
						temp1I = ( alphaR * bjI ) + ( alphaI * bjR );

						// temp2 = alpha * A[j,l] (no conjugation)
						temp2R = ( alphaR * ajR ) - ( alphaI * ajI );
						temp2I = ( alphaR * ajI ) + ( alphaI * ajR );

						ic = oC + ( j * sc1 ) + ( j * sc2 );
						ia = oA + ( j * sa1 ) + ( l * sa2 );
						ib = oB + ( j * sb1 ) + ( l * sb2 );
						for ( i = j; i < N; i += 1 ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];
							biR = Bv[ ib ];
							biI = Bv[ ib + 1 ];

							// C[i,j] += A[i,l]*temp1 + B[i,l]*temp2
							Cv[ ic ] += ( aiR * temp1R ) - ( aiI * temp1I ) + ( biR * temp2R ) - ( biI * temp2I );
							Cv[ ic + 1 ] += ( aiR * temp1I ) + ( aiI * temp1R ) + ( biR * temp2I ) + ( biI * temp2R );
							ic += sc1;
							ia += sa1;
							ib += sb1;
						}
					}
				}
			}
		}
	} else if ( upper ) {
		// C := alpha*A^T*B + alpha*B^T*A + beta*C
		for ( j = 0; j < N; j += 1 ) {
			for ( i = 0; i <= j; i += 1 ) {
				// temp1 = sum_l A[l,i] * B[l,j] (no conjugation)
				// temp2 = sum_l B[l,i] * A[l,j] (no conjugation)
				temp1R = 0.0;
				temp1I = 0.0;
				temp2R = 0.0;
				temp2I = 0.0;
				for ( l = 0; l < K; l += 1 ) {
					// A[l,i] * B[l,j]
					aiR = Av[ oA + ( l * sa1 ) + ( i * sa2 ) ];
					aiI = Av[ oA + ( l * sa1 ) + ( i * sa2 ) + 1 ];
					bjR = Bv[ oB + ( l * sb1 ) + ( j * sb2 ) ];
					bjI = Bv[ oB + ( l * sb1 ) + ( j * sb2 ) + 1 ];
					temp1R += ( aiR * bjR ) - ( aiI * bjI );
					temp1I += ( aiR * bjI ) + ( aiI * bjR );

					// B[l,i] * A[l,j]
					biR = Bv[ oB + ( l * sb1 ) + ( i * sb2 ) ];
					biI = Bv[ oB + ( l * sb1 ) + ( i * sb2 ) + 1 ];
					ajR = Av[ oA + ( l * sa1 ) + ( j * sa2 ) ];
					ajI = Av[ oA + ( l * sa1 ) + ( j * sa2 ) + 1 ];
					temp2R += ( biR * ajR ) - ( biI * ajI );
					temp2I += ( biR * ajI ) + ( biI * ajR );
				}
				ic = oC + ( i * sc1 ) + ( j * sc2 );

				// C[i,j] = beta*C[i,j] + alpha*temp1 + alpha*temp2
				tR = ( alphaR * temp1R ) - ( alphaI * temp1I ) + ( alphaR * temp2R ) - ( alphaI * temp2I );
				tI = ( alphaR * temp1I ) + ( alphaI * temp1R ) + ( alphaR * temp2I ) + ( alphaI * temp2R );
				if ( betaR === 0.0 && betaI === 0.0 ) {
					Cv[ ic ] = tR;
					Cv[ ic + 1 ] = tI;
				} else {
					// Save originals to avoid aliasing
					aiR = Cv[ ic ];
					aiI = Cv[ ic + 1 ];
					Cv[ ic ] = ( betaR * aiR ) - ( betaI * aiI ) + tR;
					Cv[ ic + 1 ] = ( betaR * aiI ) + ( betaI * aiR ) + tI;
				}
			}
		}
	} else {
		// Lower
		for ( j = 0; j < N; j += 1 ) {
			for ( i = j; i < N; i += 1 ) {
				// temp1 = sum_l A[l,i] * B[l,j] (no conjugation)
				// temp2 = sum_l B[l,i] * A[l,j] (no conjugation)
				temp1R = 0.0;
				temp1I = 0.0;
				temp2R = 0.0;
				temp2I = 0.0;
				for ( l = 0; l < K; l += 1 ) {
					// A[l,i] * B[l,j]
					aiR = Av[ oA + ( l * sa1 ) + ( i * sa2 ) ];
					aiI = Av[ oA + ( l * sa1 ) + ( i * sa2 ) + 1 ];
					bjR = Bv[ oB + ( l * sb1 ) + ( j * sb2 ) ];
					bjI = Bv[ oB + ( l * sb1 ) + ( j * sb2 ) + 1 ];
					temp1R += ( aiR * bjR ) - ( aiI * bjI );
					temp1I += ( aiR * bjI ) + ( aiI * bjR );

					// B[l,i] * A[l,j]
					biR = Bv[ oB + ( l * sb1 ) + ( i * sb2 ) ];
					biI = Bv[ oB + ( l * sb1 ) + ( i * sb2 ) + 1 ];
					ajR = Av[ oA + ( l * sa1 ) + ( j * sa2 ) ];
					ajI = Av[ oA + ( l * sa1 ) + ( j * sa2 ) + 1 ];
					temp2R += ( biR * ajR ) - ( biI * ajI );
					temp2I += ( biR * ajI ) + ( biI * ajR );
				}
				ic = oC + ( i * sc1 ) + ( j * sc2 );

				// C[i,j] = beta*C[i,j] + alpha*temp1 + alpha*temp2
				tR = ( alphaR * temp1R ) - ( alphaI * temp1I ) + ( alphaR * temp2R ) - ( alphaI * temp2I );
				tI = ( alphaR * temp1I ) + ( alphaI * temp1R ) + ( alphaR * temp2I ) + ( alphaI * temp2R );
				if ( betaR === 0.0 && betaI === 0.0 ) {
					Cv[ ic ] = tR;
					Cv[ ic + 1 ] = tI;
				} else {
					// Save originals to avoid aliasing
					aiR = Cv[ ic ];
					aiI = Cv[ ic + 1 ];
					Cv[ ic ] = ( betaR * aiR ) - ( betaI * aiI ) + tR;
					Cv[ ic + 1 ] = ( betaR * aiI ) + ( betaI * aiR ) + tI;
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default zsyr2k;
