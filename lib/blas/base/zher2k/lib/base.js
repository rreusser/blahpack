/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-lines, max-lines-per-function, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs one of the Hermitian rank-2k operations:.
* C := alpha_A_B^H + conj(alpha)_B_A^H + beta_C,  or
* C := alpha_A^H_B + conj(alpha)_B^H_A + beta_C
* where alpha is a complex scalar, beta is a REAL scalar, C is an N-by-N
* Hermitian matrix (stored as Complex128Array), and A and B are N-by-K
* matrices in the first case and K-by-N matrices in the second case.
*
* Only the upper or lower triangular part of C is updated.
* The diagonal of C is always real after the update.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A,B (if trans = 'no-transpose') or rows (if trans = 'conjugate-transpose')
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - complex input matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {number} beta - REAL scalar multiplier for C
* @param {Complex128Array} C - input/output Hermitian matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zher2k( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var alphaR;
	var alphaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
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
	var cR;
	var i;
	var j;
	var l;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	alphaR = real( alpha );
	alphaI = imag( alpha );

	if ( N === 0 || ( ( (alphaR === 0.0 && alphaI === 0.0) || K === 0 ) && beta === 1.0 ) ) {
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
		if ( upper ) {
			if ( beta === 0.0 ) {
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
					for ( i = 0; i < j; i++ ) {
						// C[i,j] = beta * C[i,j] (off-diagonal: scale both parts)
						Cv[ ic ] *= beta;
						Cv[ ic + 1 ] *= beta;
						ic += sc1;
					}
					// Diagonal: C[j,j] = beta * Re(C[j,j]), Im = 0
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] = 0.0;
				}
			}
		} else if ( beta === 0.0 ) {
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
				// Diagonal: C[j,j] = beta * Re(C[j,j]), Im = 0
				ic = oC + (j * sc1) + (j * sc2);
				Cv[ ic ] *= beta;
				Cv[ ic + 1 ] = 0.0;
				ic += sc1;
				for ( i = j + 1; i < N; i++ ) {
					// Off-diagonal
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] *= beta;
					ic += sc1;
				}
			}
		}
		return C;
	}

	if ( nota ) {
		// C := alpha*A*B^H + conj(alpha)*B*A^H + beta*C
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				if ( beta === 0.0 ) {
					ic = oC + (j * sc2);
					for ( i = 0; i <= j; i++ ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else if ( beta === 1.0 ) {
					// beta === 1.0: just force diagonal imag to zero
					ic = oC + (j * sc1) + (j * sc2);
					Cv[ ic + 1 ] = 0.0;
				} else {
					ic = oC + (j * sc2);
					for ( i = 0; i < j; i++ ) {
						Cv[ ic ] *= beta;
						Cv[ ic + 1 ] *= beta;
						ic += sc1;
					}
					// Diagonal: scale real part only
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] = 0.0;
				}
				for ( l = 0; l < K; l++ ) {
					ia = oA + (j * sa1) + (l * sa2);
					ib = oB + (j * sb1) + (l * sb2);
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					bjR = Bv[ ib ];
					bjI = Bv[ ib + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 || bjR !== 0.0 || bjI !== 0.0 ) {
						// temp1 = alpha * conj(B[j,l])
						temp1R = (alphaR * bjR) + (alphaI * bjI); // alpha * conj(b): (aR+ (aI * i))*(bR- (bI * i))
						temp1I = (alphaI * bjR) - (alphaR * bjI);

						// temp2 = conj(alpha * A[j,l]) = conj(alpha) * conj(A[j,l])

						// alpha*A[j,l] = (aR+aI*i)*(ajR+ajI*i) = (aR*ajR - aI*ajI) + (aR*ajI + aI*ajR)*i

						// Conj of that = (aR*ajR - aI*ajI) - (aR*ajI + aI*ajR)*i
						temp2R = (alphaR * ajR) - (alphaI * ajI);
						temp2I = -( (alphaR * ajI) + (alphaI * ajR) );
						ic = oC + (j * sc2);
						ia = oA + (l * sa2);
						ib = oB + (l * sb2);
						for ( i = 0; i < j; i++ ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];
							biR = Bv[ ib ];
							biI = Bv[ ib + 1 ];

							// C[i,j] += A[i,l]*temp1 + B[i,l]*temp2
							Cv[ ic ] += (aiR * temp1R) - (aiI * temp1I) + (biR * temp2R) - (biI * temp2I);
							Cv[ ic + 1 ] += (aiR * temp1I) + (aiI * temp1R) + (biR * temp2I) + (biI * temp2R);
							ic += sc1;
							ia += sa1;
							ib += sb1;
						}
						// Diagonal: C[j,j] += Re(A[j,l]*temp1 + B[j,l]*temp2)
						aiR = Av[ ia ];
						aiI = Av[ ia + 1 ];
						biR = Bv[ ib ];
						biI = Bv[ ib + 1 ];
						Cv[ ic ] += (aiR * temp1R) - (aiI * temp1I) + (biR * temp2R) - (biI * temp2I);

						// Imaginary part stays zero (Hermitian diagonal is real)
					}
				}
			}
		} else {
			// Lower
			for ( j = 0; j < N; j++ ) {
				if ( beta === 0.0 ) {
					ic = oC + (j * sc1) + (j * sc2);
					for ( i = j; i < N; i++ ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else if ( beta === 1.0 ) {
					// beta === 1.0: just force diagonal imag to zero
					ic = oC + (j * sc1) + (j * sc2);
					Cv[ ic + 1 ] = 0.0;
				} else {
					ic = oC + (j * sc1) + (j * sc2);

					// Diagonal: scale real part only
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
					for ( i = j + 1; i < N; i++ ) {
						Cv[ ic ] *= beta;
						Cv[ ic + 1 ] *= beta;
						ic += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					ia = oA + (j * sa1) + (l * sa2);
					ib = oB + (j * sb1) + (l * sb2);
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					bjR = Bv[ ib ];
					bjI = Bv[ ib + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 || bjR !== 0.0 || bjI !== 0.0 ) {
						// temp1 = alpha * conj(B[j,l])
						temp1R = (alphaR * bjR) + (alphaI * bjI);
						temp1I = (alphaI * bjR) - (alphaR * bjI);

						// temp2 = conj(alpha * A[j,l])
						temp2R = (alphaR * ajR) - (alphaI * ajI);
						temp2I = -( (alphaR * ajI) + (alphaI * ajR) );

						// Diagonal: C[j,j] += Re(A[j,l]*temp1 + B[j,l]*temp2)
						ic = oC + (j * sc1) + (j * sc2);
						Cv[ ic ] += (ajR * temp1R) - (ajI * temp1I) + (bjR * temp2R) - (bjI * temp2I);

						// Imaginary stays zero
						ic += sc1;
						ia = oA + (( j + 1 ) * sa1) + (l * sa2);
						ib = oB + (( j + 1 ) * sb1) + (l * sb2);
						for ( i = j + 1; i < N; i++ ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];
							biR = Bv[ ib ];
							biI = Bv[ ib + 1 ];

							// C[i,j] += A[i,l]*temp1 + B[i,l]*temp2
							Cv[ ic ] += (aiR * temp1R) - (aiI * temp1I) + (biR * temp2R) - (biI * temp2I);
							Cv[ ic + 1 ] += (aiR * temp1I) + (aiI * temp1R) + (biR * temp2I) + (biI * temp2R);
							ic += sc1;
							ia += sa1;
							ib += sb1;
						}
					}
				}
			}
		}
	} else if ( upper ) {
		// C := alpha*A^H*B + conj(alpha)*B^H*A + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i <= j; i++ ) {
				// temp1 = sum_l conj(A[l,i]) * B[l,j]
				// temp2 = sum_l conj(B[l,i]) * A[l,j]
				temp1R = 0.0;
				temp1I = 0.0;
				temp2R = 0.0;
				temp2I = 0.0;
				for ( l = 0; l < K; l++ ) {
					// conj(A[l,i]) * B[l,j]
					aiR = Av[ oA + (l * sa1) + (i * sa2) ];
					aiI = -Av[ oA + (l * sa1) + (i * sa2) + 1 ]; // conjugate
					bjR = Bv[ oB + (l * sb1) + (j * sb2) ];
					bjI = Bv[ oB + (l * sb1) + (j * sb2) + 1 ];
					temp1R += (aiR * bjR) - (aiI * bjI);
					temp1I += (aiR * bjI) + (aiI * bjR);

					// conj(B[l,i]) * A[l,j]
					biR = Bv[ oB + (l * sb1) + (i * sb2) ];
					biI = -Bv[ oB + (l * sb1) + (i * sb2) + 1 ]; // conjugate
					ajR = Av[ oA + (l * sa1) + (j * sa2) ];
					ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
					temp2R += (biR * ajR) - (biI * ajI);
					temp2I += (biR * ajI) + (biI * ajR);
				}
				ic = oC + (i * sc1) + (j * sc2);
				if ( i === j ) {
					// Diagonal: result must be real
					// Re(alpha*temp1 + conj(alpha)*temp2)
					cR = (alphaR * temp1R) - (alphaI * temp1I) + (alphaR * temp2R) + (alphaI * temp2I);
					if ( beta === 0.0 ) {
						Cv[ ic ] = cR;
					} else {
						Cv[ ic ] = (beta * Cv[ ic ]) + cR;
					}
					Cv[ ic + 1 ] = 0.0;
				} else {
					// Off-diagonal: alpha*temp1 + conj(alpha)*temp2
					// alpha*temp1 = (aR*t1R - aI*t1I) + (aR*t1I + aI*t1R)*i
					// conj(alpha)*temp2 = (aR*t2R + aI*t2I) + (aR*t2I - aI*t2R)*i  [conj(alpha) = aR - aI*i]
					cR = (alphaR * temp1R) - (alphaI * temp1I) + (alphaR * temp2R) + (alphaI * temp2I);
					if ( beta === 0.0 ) {
						Cv[ ic ] = cR;
						Cv[ ic + 1 ] = (alphaR * temp1I) + (alphaI * temp1R) + (alphaR * temp2I) - (alphaI * temp2R);
					} else {
						Cv[ ic ] = (beta * Cv[ ic ]) + cR;
						Cv[ ic + 1 ] = (beta * Cv[ ic + 1 ]) + (alphaR * temp1I) + (alphaI * temp1R) + (alphaR * temp2I) - (alphaI * temp2R);
					}
				}
			}
		}
	} else {
		// Lower
		for ( j = 0; j < N; j++ ) {
			for ( i = j; i < N; i++ ) {
				// temp1 = sum_l conj(A[l,i]) * B[l,j]
				// temp2 = sum_l conj(B[l,i]) * A[l,j]
				temp1R = 0.0;
				temp1I = 0.0;
				temp2R = 0.0;
				temp2I = 0.0;
				for ( l = 0; l < K; l++ ) {
					// conj(A[l,i]) * B[l,j]
					aiR = Av[ oA + (l * sa1) + (i * sa2) ];
					aiI = -Av[ oA + (l * sa1) + (i * sa2) + 1 ]; // conjugate
					bjR = Bv[ oB + (l * sb1) + (j * sb2) ];
					bjI = Bv[ oB + (l * sb1) + (j * sb2) + 1 ];
					temp1R += (aiR * bjR) - (aiI * bjI);
					temp1I += (aiR * bjI) + (aiI * bjR);

					// conj(B[l,i]) * A[l,j]
					biR = Bv[ oB + (l * sb1) + (i * sb2) ];
					biI = -Bv[ oB + (l * sb1) + (i * sb2) + 1 ]; // conjugate
					ajR = Av[ oA + (l * sa1) + (j * sa2) ];
					ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
					temp2R += (biR * ajR) - (biI * ajI);
					temp2I += (biR * ajI) + (biI * ajR);
				}
				ic = oC + (i * sc1) + (j * sc2);
				if ( i === j ) {
					// Diagonal: result must be real
					cR = (alphaR * temp1R) - (alphaI * temp1I) + (alphaR * temp2R) + (alphaI * temp2I);
					if ( beta === 0.0 ) {
						Cv[ ic ] = cR;
					} else {
						Cv[ ic ] = (beta * Cv[ ic ]) + cR;
					}
					Cv[ ic + 1 ] = 0.0;
				} else {
					// Off-diagonal: alpha*temp1 + conj(alpha)*temp2
					cR = (alphaR * temp1R) - (alphaI * temp1I) + (alphaR * temp2R) + (alphaI * temp2I);
					if ( beta === 0.0 ) {
						Cv[ ic ] = cR;
						Cv[ ic + 1 ] = (alphaR * temp1I) + (alphaI * temp1R) + (alphaR * temp2I) - (alphaI * temp2R);
					} else {
						Cv[ ic ] = (beta * Cv[ ic ]) + cR;
						Cv[ ic + 1 ] = (beta * Cv[ ic + 1 ]) + (alphaR * temp1I) + (alphaI * temp1R) + (alphaR * temp2I) - (alphaI * temp2R);
					}
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default zher2k;
