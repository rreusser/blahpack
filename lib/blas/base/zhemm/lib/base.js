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

/* eslint-disable max-len, max-lines-per-function, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs one of the Hermitian matrix-matrix operations:.
* C := alpha_A_B + beta_C, or C := alpha_B_A + beta_C,
* where alpha and beta are complex scalars, A is a Hermitian matrix, and B and C
* are M-by-N matrices.
*
* @private
* @param {string} side - 'left' if A is on the left, 'right' if A is on the right
* @param {string} uplo - 'upper' or 'lower', specifies which triangle of A is stored
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128} alpha - complex scalar multiplier for A*B or B*A
* @param {Complex128Array} A - Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {Complex128} beta - complex scalar multiplier for C
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zhemm( side, uplo, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var alphaR;
	var alphaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var betaR;
	var betaI;
	var upper;
	var lside;
	var aiiR;
	var akiR;
	var akiI;
	var bkjR;
	var bkjI;
	var bijR;
	var bijI;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var Av;
	var Bv;
	var Cv;
	var oA;
	var oB;
	var oC;
	var ic;
	var ia;
	var ib;
	var cR;
	var cI;
	var tR;
	var tI;
	var i;
	var j;
	var k;

	lside = ( side === 'left' );
	upper = ( uplo === 'upper' );

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	if ( M === 0 || N === 0 || ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) ) {
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

	// When alpha is zero, just scale C by beta
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc2 );
				for ( i = 0; i < M; i++ ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc2 );
				for ( i = 0; i < M; i++ ) {
					// C[i,j] = beta * C[i,j]
					cR = Cv[ ic ];
					cI = Cv[ ic + 1 ];
					Cv[ ic ] = ( betaR * cR ) - ( betaI * cI );
					Cv[ ic + 1 ] = ( betaR * cI ) + ( betaI * cR );
					ic += sc1;
				}
			}
		}
		return C;
	}

	// Start the operations
	if ( lside ) {
		// C := alpha*A*B + beta*C
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					// temp1 = alpha * B[i,j]
					ib = oB + ( i * sb1 ) + ( j * sb2 );
					bijR = Bv[ ib ];
					bijI = Bv[ ib + 1 ];
					temp1R = ( alphaR * bijR ) - ( alphaI * bijI );
					temp1I = ( alphaR * bijI ) + ( alphaI * bijR );
					temp2R = 0.0;
					temp2I = 0.0;
					for ( k = 0; k < i; k++ ) {
						// C[k,j] += temp1 * A[k,i]
						ia = oA + ( k * sa1 ) + ( i * sa2 );
						akiR = Av[ ia ];
						akiI = Av[ ia + 1 ];
						ic = oC + ( k * sc1 ) + ( j * sc2 );
						Cv[ ic ] += ( temp1R * akiR ) - ( temp1I * akiI );
						Cv[ ic + 1 ] += ( temp1R * akiI ) + ( temp1I * akiR );

						// temp2 += B[k,j] * conj(A[k,i])
						ib = oB + ( k * sb1 ) + ( j * sb2 );
						bkjR = Bv[ ib ];
						bkjI = Bv[ ib + 1 ];
						temp2R += ( bkjR * akiR ) + ( bkjI * akiI );
						temp2I += ( bkjI * akiR ) - ( bkjR * akiI );
					}
					// Diagonal of A is real: DBLE(A(I,I))
					ia = oA + ( i * sa1 ) + ( i * sa2 );
					aiiR = Av[ ia ];
					ic = oC + ( i * sc1 ) + ( j * sc2 );

					// alpha * temp2
					tR = ( alphaR * temp2R ) - ( alphaI * temp2I );
					tI = ( alphaR * temp2I ) + ( alphaI * temp2R );
					if ( betaR === 0.0 && betaI === 0.0 ) {
						Cv[ ic ] = ( temp1R * aiiR ) + tR;
						Cv[ ic + 1 ] = ( temp1I * aiiR ) + tI;
					} else {
						cR = Cv[ ic ];
						cI = Cv[ ic + 1 ];
						Cv[ ic ] = ( betaR * cR ) - ( betaI * cI ) + ( temp1R * aiiR ) + tR;
						Cv[ ic + 1 ] = ( betaR * cI ) + ( betaI * cR ) + ( temp1I * aiiR ) + tI;
					}
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				for ( i = M - 1; i >= 0; i-- ) {
					// temp1 = alpha * B[i,j]
					ib = oB + ( i * sb1 ) + ( j * sb2 );
					bijR = Bv[ ib ];
					bijI = Bv[ ib + 1 ];
					temp1R = ( alphaR * bijR ) - ( alphaI * bijI );
					temp1I = ( alphaR * bijI ) + ( alphaI * bijR );
					temp2R = 0.0;
					temp2I = 0.0;
					for ( k = i + 1; k < M; k++ ) {
						// C[k,j] += temp1 * A[k,i]
						ia = oA + ( k * sa1 ) + ( i * sa2 );
						akiR = Av[ ia ];
						akiI = Av[ ia + 1 ];
						ic = oC + ( k * sc1 ) + ( j * sc2 );
						Cv[ ic ] += ( temp1R * akiR ) - ( temp1I * akiI );
						Cv[ ic + 1 ] += ( temp1R * akiI ) + ( temp1I * akiR );

						// temp2 += B[k,j] * conj(A[k,i])
						ib = oB + ( k * sb1 ) + ( j * sb2 );
						bkjR = Bv[ ib ];
						bkjI = Bv[ ib + 1 ];
						temp2R += ( bkjR * akiR ) + ( bkjI * akiI );
						temp2I += ( bkjI * akiR ) - ( bkjR * akiI );
					}
					// Diagonal of A is real
					ia = oA + ( i * sa1 ) + ( i * sa2 );
					aiiR = Av[ ia ];
					ic = oC + ( i * sc1 ) + ( j * sc2 );
					tR = ( alphaR * temp2R ) - ( alphaI * temp2I );
					tI = ( alphaR * temp2I ) + ( alphaI * temp2R );
					if ( betaR === 0.0 && betaI === 0.0 ) {
						Cv[ ic ] = ( temp1R * aiiR ) + tR;
						Cv[ ic + 1 ] = ( temp1I * aiiR ) + tI;
					} else {
						cR = Cv[ ic ];
						cI = Cv[ ic + 1 ];
						Cv[ ic ] = ( betaR * cR ) - ( betaI * cI ) + ( temp1R * aiiR ) + tR;
						Cv[ ic + 1 ] = ( betaR * cI ) + ( betaI * cR ) + ( temp1I * aiiR ) + tI;
					}
				}
			}
		}
	} else {
		// C := alpha*B*A + beta*C
		for ( j = 0; j < N; j++ ) {
			// Diagonal of A is real: temp1 = alpha * DBLE(A(J,J))
			ia = oA + ( j * sa1 ) + ( j * sa2 );
			aiiR = Av[ ia ];

			// temp1 = alpha * aiiR (real scalar times complex)
			temp1R = alphaR * aiiR;
			temp1I = alphaI * aiiR;
			if ( betaR === 0.0 && betaI === 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					ic = oC + ( i * sc1 ) + ( j * sc2 );
					ib = oB + ( i * sb1 ) + ( j * sb2 );
					bijR = Bv[ ib ];
					bijI = Bv[ ib + 1 ];

					// C[i,j] = temp1 * B[i,j]
					Cv[ ic ] = ( temp1R * bijR ) - ( temp1I * bijI );
					Cv[ ic + 1 ] = ( temp1R * bijI ) + ( temp1I * bijR );
				}
			} else {
				for ( i = 0; i < M; i++ ) {
					ic = oC + ( i * sc1 ) + ( j * sc2 );
					ib = oB + ( i * sb1 ) + ( j * sb2 );
					bijR = Bv[ ib ];
					bijI = Bv[ ib + 1 ];
					cR = Cv[ ic ];
					cI = Cv[ ic + 1 ];

					// C[i,j] = beta*C[i,j] + temp1*B[i,j]
					Cv[ ic ] = ( betaR * cR ) - ( betaI * cI ) + ( temp1R * bijR ) - ( temp1I * bijI );
					Cv[ ic + 1 ] = ( betaR * cI ) + ( betaI * cR ) + ( temp1R * bijI ) + ( temp1I * bijR );
				}
			}
			for ( k = 0; k < j; k++ ) {
				if ( upper ) {
					// temp1 = alpha * A[k,j]
					ia = oA + ( k * sa1 ) + ( j * sa2 );
					temp1R = ( alphaR * Av[ ia ] ) - ( alphaI * Av[ ia + 1 ] );
					temp1I = ( alphaR * Av[ ia + 1 ] ) + ( alphaI * Av[ ia ] );
				} else {
					// temp1 = alpha * conj(A[j,k])
					ia = oA + ( j * sa1 ) + ( k * sa2 );
					tR = Av[ ia ];
					tI = -Av[ ia + 1 ]; // conjugate
					temp1R = ( alphaR * tR ) - ( alphaI * tI );
					temp1I = ( alphaR * tI ) + ( alphaI * tR );
				}
				for ( i = 0; i < M; i++ ) {
					ic = oC + ( i * sc1 ) + ( j * sc2 );
					ib = oB + ( i * sb1 ) + ( k * sb2 );
					bkjR = Bv[ ib ];
					bkjI = Bv[ ib + 1 ];

					// C[i,j] += temp1 * B[i,k]
					Cv[ ic ] += ( temp1R * bkjR ) - ( temp1I * bkjI );
					Cv[ ic + 1 ] += ( temp1R * bkjI ) + ( temp1I * bkjR );
				}
			}
			for ( k = j + 1; k < N; k++ ) {
				if ( upper ) {
					// temp1 = alpha * conj(A[j,k])
					ia = oA + ( j * sa1 ) + ( k * sa2 );
					tR = Av[ ia ];
					tI = -Av[ ia + 1 ]; // conjugate
					temp1R = ( alphaR * tR ) - ( alphaI * tI );
					temp1I = ( alphaR * tI ) + ( alphaI * tR );
				} else {
					// temp1 = alpha * A[k,j]
					ia = oA + ( k * sa1 ) + ( j * sa2 );
					temp1R = ( alphaR * Av[ ia ] ) - ( alphaI * Av[ ia + 1 ] );
					temp1I = ( alphaR * Av[ ia + 1 ] ) + ( alphaI * Av[ ia ] );
				}
				for ( i = 0; i < M; i++ ) {
					ic = oC + ( i * sc1 ) + ( j * sc2 );
					ib = oB + ( i * sb1 ) + ( k * sb2 );
					bkjR = Bv[ ib ];
					bkjI = Bv[ ib + 1 ];

					// C[i,j] += temp1 * B[i,k]
					Cv[ ic ] += ( temp1R * bkjR ) - ( temp1I * bkjI );
					Cv[ ic + 1 ] += ( temp1R * bkjI ) + ( temp1I * bkjR );
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default zhemm;
