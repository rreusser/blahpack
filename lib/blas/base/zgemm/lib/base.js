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

/* eslint-disable max-len, max-lines, max-lines-per-function, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform one of the complex matrix-matrix operations:.
* C := alpha_op(A)_op(B) + beta*C
* where op(X) is one of X, X**T, or X**H.
*
* @private
* @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} transb - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - rows of op(A) and C
* @param {NonNegativeInteger} N - columns of op(B) and C
* @param {NonNegativeInteger} K - columns of op(A) / rows of op(B)
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - complex input matrix
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128} beta - complex scalar
* @param {Complex128Array} C - complex input/output matrix
* @param {integer} strideC1 - first dimension stride of C
* @param {integer} strideC2 - second dimension stride of C
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @returns {Complex128Array} C
*/
function zgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var tempR;
	var tempI;
	var conja;
	var conjb;
	var nota;
	var notb;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var cR;
	var cI;
	var ci;
	var ai;
	var bi;
	var oA;
	var oB;
	var oC;
	var Av;
	var Bv;
	var Cv;
	var aR;
	var aI;
	var bR;
	var bI;
	var i;
	var j;
	var l;

	if ( M === 0 || N === 0 ) {
		return C;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	nota = ( transa === 'no-transpose' );
	notb = ( transb === 'no-transpose' );
	conja = ( transa === 'conjugate-transpose' );
	conjb = ( transb === 'conjugate-transpose' );

	// Quick return if alpha=0 and beta=1
	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return C;
	}

	// Get Float64Array views and convert offsets
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;
	Cv = reinterpret( C, 0 );
	oC = offsetC * 2;

	// Matrix strides in complex elements, multiply by 2
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	// When alpha=0
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ci = oC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					Cv[ ci ] = 0.0;
					Cv[ ci + 1 ] = 0.0;
					ci += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ci = oC + (j * sc2);
				for ( i = 0; i < M; i++ ) {
					tempR = (betaR * Cv[ ci ]) - (betaI * Cv[ ci + 1 ]);
					tempI = (betaR * Cv[ ci + 1 ]) + (betaI * Cv[ ci ]);
					Cv[ ci ] = tempR;
					Cv[ ci + 1 ] = tempI;
					ci += sc1;
				}
			}
		}
		return C;
	}

	// Start the operations
	if ( notb ) {
		if ( nota ) {
			// C := alpha*A*B + beta*C
			for ( j = 0; j < N; j++ ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						Cv[ ci ] = 0.0;
						Cv[ ci + 1 ] = 0.0;
						ci += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						tempR = (betaR * Cv[ ci ]) - (betaI * Cv[ ci + 1 ]);
						tempI = (betaR * Cv[ ci + 1 ]) + (betaI * Cv[ ci ]);
						Cv[ ci ] = tempR;
						Cv[ ci + 1 ] = tempI;
						ci += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					bi = oB + (l * sb1) + (j * sb2);
					bR = Bv[ bi ];
					bI = Bv[ bi + 1 ];

					// Temp = alpha * B(l,j)
					tempR = (alphaR * bR) - (alphaI * bI);
					tempI = (alphaR * bI) + (alphaI * bR);
					ai = oA + (l * sa2);
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						aR = Av[ ai ];
						aI = Av[ ai + 1 ];

						// C(i,j) += temp * A(i,l)
						Cv[ ci ] += (tempR * aR) - (tempI * aI);
						Cv[ ci + 1 ] += (tempR * aI) + (tempI * aR);
						ai += sa1;
						ci += sc1;
					}
				}
			}
		} else if ( conja ) {
			// C := alpha*A^H*B + beta*C
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					tempR = 0.0;
					tempI = 0.0;
					ai = oA + (i * sa2);
					bi = oB + (j * sb2);
					for ( l = 0; l < K; l++ ) {
						aR = Av[ ai ];
						aI = -Av[ ai + 1 ]; // conjugate
						bR = Bv[ bi ];
						bI = Bv[ bi + 1 ];
						tempR += (aR * bR) - (aI * bI);
						tempI += (aR * bI) + (aI * bR);
						ai += sa1;
						bi += sb1;
					}
					ci = oC + (i * sc1) + (j * sc2);
					if ( betaR === 0.0 && betaI === 0.0 ) {
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR);
					} else {
						cR = Cv[ ci ];
						cI = Cv[ ci + 1 ];
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
					}
				}
			}
		} else {
			// C := alpha*A^T*B + beta*C
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					tempR = 0.0;
					tempI = 0.0;
					ai = oA + (i * sa2);
					bi = oB + (j * sb2);
					for ( l = 0; l < K; l++ ) {
						aR = Av[ ai ];
						aI = Av[ ai + 1 ];
						bR = Bv[ bi ];
						bI = Bv[ bi + 1 ];
						tempR += (aR * bR) - (aI * bI);
						tempI += (aR * bI) + (aI * bR);
						ai += sa1;
						bi += sb1;
					}
					ci = oC + (i * sc1) + (j * sc2);
					if ( betaR === 0.0 && betaI === 0.0 ) {
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR);
					} else {
						cR = Cv[ ci ];
						cI = Cv[ ci + 1 ];
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
					}
				}
			}
		}
	} else if ( nota ) {
		if ( conjb ) {
			// C := alpha*A*B^H + beta*C
			for ( j = 0; j < N; j++ ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						Cv[ ci ] = 0.0;
						Cv[ ci + 1 ] = 0.0;
						ci += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						tempR = (betaR * Cv[ ci ]) - (betaI * Cv[ ci + 1 ]);
						tempI = (betaR * Cv[ ci + 1 ]) + (betaI * Cv[ ci ]);
						Cv[ ci ] = tempR;
						Cv[ ci + 1 ] = tempI;
						ci += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					bi = oB + (j * sb1) + (l * sb2);
					bR = Bv[ bi ];
					bI = -Bv[ bi + 1 ]; // conjugate

					// Temp = alpha * conj(B(j,l))
					tempR = (alphaR * bR) - (alphaI * bI);
					tempI = (alphaR * bI) + (alphaI * bR);
					ai = oA + (l * sa2);
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						aR = Av[ ai ];
						aI = Av[ ai + 1 ];
						Cv[ ci ] += (tempR * aR) - (tempI * aI);
						Cv[ ci + 1 ] += (tempR * aI) + (tempI * aR);
						ai += sa1;
						ci += sc1;
					}
				}
			}
		} else {
			// C := alpha*A*B^T + beta*C
			for ( j = 0; j < N; j++ ) {
				if ( betaR === 0.0 && betaI === 0.0 ) {
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						Cv[ ci ] = 0.0;
						Cv[ ci + 1 ] = 0.0;
						ci += sc1;
					}
				} else if ( betaR !== 1.0 || betaI !== 0.0 ) {
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						tempR = (betaR * Cv[ ci ]) - (betaI * Cv[ ci + 1 ]);
						tempI = (betaR * Cv[ ci + 1 ]) + (betaI * Cv[ ci ]);
						Cv[ ci ] = tempR;
						Cv[ ci + 1 ] = tempI;
						ci += sc1;
					}
				}
				for ( l = 0; l < K; l++ ) {
					bi = oB + (j * sb1) + (l * sb2);
					bR = Bv[ bi ];
					bI = Bv[ bi + 1 ];

					// Temp = alpha * B(j,l)
					tempR = (alphaR * bR) - (alphaI * bI);
					tempI = (alphaR * bI) + (alphaI * bR);
					ai = oA + (l * sa2);
					ci = oC + (j * sc2);
					for ( i = 0; i < M; i++ ) {
						aR = Av[ ai ];
						aI = Av[ ai + 1 ];
						Cv[ ci ] += (tempR * aR) - (tempI * aI);
						Cv[ ci + 1 ] += (tempR * aI) + (tempI * aR);
						ai += sa1;
						ci += sc1;
					}
				}
			}
		}
	} else if ( conja ) {
		if ( conjb ) {
			// C := alpha*A^H*B^H + beta*C
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					tempR = 0.0;
					tempI = 0.0;
					ai = oA + (i * sa2);
					bi = oB + (j * sb1);
					for ( l = 0; l < K; l++ ) {
						aR = Av[ ai ];
						aI = -Av[ ai + 1 ]; // conj(A)
						bR = Bv[ bi ];
						bI = -Bv[ bi + 1 ]; // conj(B)
						tempR += (aR * bR) - (aI * bI);
						tempI += (aR * bI) + (aI * bR);
						ai += sa1;
						bi += sb2;
					}
					ci = oC + (i * sc1) + (j * sc2);
					if ( betaR === 0.0 && betaI === 0.0 ) {
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR);
					} else {
						cR = Cv[ ci ];
						cI = Cv[ ci + 1 ];
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
					}
				}
			}
		} else {
			// C := alpha*A^H*B^T + beta*C
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					tempR = 0.0;
					tempI = 0.0;
					ai = oA + (i * sa2);
					bi = oB + (j * sb1);
					for ( l = 0; l < K; l++ ) {
						aR = Av[ ai ];
						aI = -Av[ ai + 1 ]; // conj(A)
						bR = Bv[ bi ];
						bI = Bv[ bi + 1 ];
						tempR += (aR * bR) - (aI * bI);
						tempI += (aR * bI) + (aI * bR);
						ai += sa1;
						bi += sb2;
					}
					ci = oC + (i * sc1) + (j * sc2);
					if ( betaR === 0.0 && betaI === 0.0 ) {
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR);
					} else {
						cR = Cv[ ci ];
						cI = Cv[ ci + 1 ];
						Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
						Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
					}
				}
			}
		}
	} else if ( conjb ) {
		// C := alpha*A^T*B^H + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				tempR = 0.0;
				tempI = 0.0;
				ai = oA + (i * sa2);
				bi = oB + (j * sb1);
				for ( l = 0; l < K; l++ ) {
					aR = Av[ ai ];
					aI = Av[ ai + 1 ];
					bR = Bv[ bi ];
					bI = -Bv[ bi + 1 ]; // conj(B)
					tempR += (aR * bR) - (aI * bI);
					tempI += (aR * bI) + (aI * bR);
					ai += sa1;
					bi += sb2;
				}
				ci = oC + (i * sc1) + (j * sc2);
				if ( betaR === 0.0 && betaI === 0.0 ) {
					Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI);
					Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR);
				} else {
					cR = Cv[ ci ];
					cI = Cv[ ci + 1 ];
					Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
					Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
				}
			}
		}
	} else {
		// C := alpha*A^T*B^T + beta*C
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				tempR = 0.0;
				tempI = 0.0;
				ai = oA + (i * sa2);
				bi = oB + (j * sb1);
				for ( l = 0; l < K; l++ ) {
					aR = Av[ ai ];
					aI = Av[ ai + 1 ];
					bR = Bv[ bi ];
					bI = Bv[ bi + 1 ];
					tempR += (aR * bR) - (aI * bI);
					tempI += (aR * bI) + (aI * bR);
					ai += sa1;
					bi += sb2;
				}
				ci = oC + (i * sc1) + (j * sc2);
				if ( betaR === 0.0 && betaI === 0.0 ) {
					Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI);
					Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR);
				} else {
					cR = Cv[ ci ];
					cI = Cv[ ci + 1 ];
					Cv[ ci ] = (alphaR * tempR) - (alphaI * tempI) + (betaR * cR) - (betaI * cI);
					Cv[ ci + 1 ] = (alphaR * tempI) + (alphaI * tempR) + (betaR * cI) + (betaI * cR);
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default zgemm;
