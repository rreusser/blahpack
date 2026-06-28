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

/* eslint-disable max-len, max-lines-per-function, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Performs one of the Hermitian rank-k operations:.
* C := alpha_A_A^H + beta_C,  or  C := alpha_A^H_A + beta_C
* where alpha and beta are REAL scalars, C is an N-by-N Hermitian matrix
* (stored as Complex128Array), and A is an N-by-K matrix in the first case
* and a K-by-N matrix in the second case.
*
* Only the upper or lower triangular part of C is updated.
* The diagonal of C is always real after the update.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` for A*A^H, `'conjugate-transpose'` for A^H*A
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans = 'no-transpose') or rows (if trans = 'conjugate-transpose')
* @param {number} alpha - real scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {number} beta - real scalar multiplier
* @param {Complex128Array} C - input/output Hermitian matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zherk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
	var upper;
	var tempR;
	var tempI;
	var rtemp;
	var nota;
	var sa1;
	var sa2;
	var sc1;
	var sc2;
	var ajR;
	var ajI;
	var aiR;
	var aiI;
	var Av;
	var Cv;
	var oA;
	var oC;
	var ic;
	var ia;
	var i;
	var j;
	var l;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	// Get Float64Array views and convert offsets/strides to Float64 units
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Cv = reinterpret( C, 0 );
	oC = offsetC * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	// When alpha is zero, just scale C by beta
	if ( alpha === 0.0 ) {
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
		// C := alpha*A*A^H + beta*C
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
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 ) {
						// Temp = alpha * conj(A[j,l])
						tempR = alpha * ajR;
						tempI = alpha * ( -ajI ); // conjugate
						ic = oC + (j * sc2);
						ia = oA + (l * sa2);
						for ( i = 0; i < j; i++ ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];

							// C[i,j] += temp * A[i,l]
							Cv[ ic ] += (tempR * aiR) - (tempI * aiI);
							Cv[ ic + 1 ] += (tempR * aiI) + (tempI * aiR);
							ic += sc1;
							ia += sa1;
						}
						// Diagonal: C[j,j] += Re(temp * A[j,l]) = alpha*(ajR^2 + ajI^2)
						aiR = Av[ ia ];
						aiI = Av[ ia + 1 ];
						Cv[ ic ] += (tempR * aiR) - (tempI * aiI);

						// Imag stays zero (Hermitian diagonal is real)
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
					ajR = Av[ ia ];
					ajI = Av[ ia + 1 ];
					if ( ajR !== 0.0 || ajI !== 0.0 ) {
						// Temp = alpha * conj(A[j,l])
						tempR = alpha * ajR;
						tempI = alpha * ( -ajI ); // conjugate

						// Diagonal: C[j,j] += Re(temp * A[j,l])
						ic = oC + (j * sc1) + (j * sc2);
						Cv[ ic ] += (tempR * ajR) - (tempI * ajI);

						// Imag stays zero
						ic += sc1;
						ia = oA + (( j + 1 ) * sa1) + (l * sa2);
						for ( i = j + 1; i < N; i++ ) {
							aiR = Av[ ia ];
							aiI = Av[ ia + 1 ];

							// C[i,j] += temp * A[i,l]
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
		// C := alpha*A^H*A + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < j; i++ ) {
				tempR = 0.0;
				tempI = 0.0;
				for ( l = 0; l < K; l++ ) {
					// conj(A[l,i]) * A[l,j]
					aiR = Av[ oA + (l * sa1) + (i * sa2) ];
					aiI = -Av[ oA + (l * sa1) + (i * sa2) + 1 ]; // conjugate
					ajR = Av[ oA + (l * sa1) + (j * sa2) ];
					ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
					tempR += (aiR * ajR) - (aiI * ajI);
					tempI += (aiR * ajI) + (aiI * ajR);
				}
				ic = oC + (i * sc1) + (j * sc2);
				if ( beta === 0.0 ) {
					Cv[ ic ] = alpha * tempR;
					Cv[ ic + 1 ] = alpha * tempI;
				} else {
					Cv[ ic ] = (alpha * tempR) + (beta * Cv[ ic ]);
					Cv[ ic + 1 ] = (alpha * tempI) + (beta * Cv[ ic + 1 ]);
				}
			}
			// Diagonal: sum of |A[l,j]|^2
			rtemp = 0.0;
			for ( l = 0; l < K; l++ ) {
				ajR = Av[ oA + (l * sa1) + (j * sa2) ];
				ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
				rtemp += (ajR * ajR) + (ajI * ajI);
			}
			ic = oC + (j * sc1) + (j * sc2);
			if ( beta === 0.0 ) {
				Cv[ ic ] = alpha * rtemp;
			} else {
				Cv[ ic ] = (alpha * rtemp) + (beta * Cv[ ic ]);
			}
			Cv[ ic + 1 ] = 0.0;
		}
	} else {
		// Lower
		for ( j = 0; j < N; j++ ) {
			// Diagonal first
			rtemp = 0.0;
			for ( l = 0; l < K; l++ ) {
				ajR = Av[ oA + (l * sa1) + (j * sa2) ];
				ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
				rtemp += (ajR * ajR) + (ajI * ajI);
			}
			ic = oC + (j * sc1) + (j * sc2);
			if ( beta === 0.0 ) {
				Cv[ ic ] = alpha * rtemp;
			} else {
				Cv[ ic ] = (alpha * rtemp) + (beta * Cv[ ic ]);
			}
			Cv[ ic + 1 ] = 0.0;

			// Off-diagonal
			for ( i = j + 1; i < N; i++ ) {
				tempR = 0.0;
				tempI = 0.0;
				for ( l = 0; l < K; l++ ) {
					// conj(A[l,i]) * A[l,j]
					aiR = Av[ oA + (l * sa1) + (i * sa2) ];
					aiI = -Av[ oA + (l * sa1) + (i * sa2) + 1 ]; // conjugate
					ajR = Av[ oA + (l * sa1) + (j * sa2) ];
					ajI = Av[ oA + (l * sa1) + (j * sa2) + 1 ];
					tempR += (aiR * ajR) - (aiI * ajI);
					tempI += (aiR * ajI) + (aiI * ajR);
				}
				ic = oC + (i * sc1) + (j * sc2);
				if ( beta === 0.0 ) {
					Cv[ ic ] = alpha * tempR;
					Cv[ ic + 1 ] = alpha * tempI;
				} else {
					Cv[ ic ] = (alpha * tempR) + (beta * Cv[ ic ]);
					Cv[ ic + 1 ] = (alpha * tempI) + (beta * Cv[ ic + 1 ]);
				}
			}
		}
	}

	return C;
}


// EXPORTS //

export default zherk;
