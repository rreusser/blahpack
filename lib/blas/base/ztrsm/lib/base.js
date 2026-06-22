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

/* eslint-disable max-depth, max-len, max-lines, max-lines-per-function, max-params, max-statements, no-continue */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

// Scratch buffer for complex reciprocal computation (1/z)

// scratch[0..1] = numerator (1,0), scratch[2..3] = denominator, scratch[4..5] = result
var scratch = new Float64Array( 6 );


// MAIN //

/**
* Solves one of the matrix equations:.
* op(A)_X = alpha_B,  or  X_op(A) = alpha_B
*
* where alpha is a complex scalar, X and B are M-by-N complex matrices,
* A is a unit or non-unit, upper or lower triangular complex matrix, and
* op(A) is one of:
* op(A) = A  or  op(A) = A**T  or  op(A) = A**H.
*
* The matrix X is overwritten on B.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'` (upper or lower triangular)
* @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {Complex128} alpha - complex scalar multiplier for B
* @param {Complex128Array} A - complex triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - input/output complex matrix (overwritten with X)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @returns {Complex128Array} `B`
*/
function ztrsm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	var noconj;
	var nounit;
	var alphaR;
	var alphaI;
	var lside;
	var upper;
	var tempR;
	var tempI;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var oA;
	var oB;
	var Av;
	var Bv;
	var ar;
	var ai;
	var br;
	var bi;
	var ia;
	var ib;
	var kb;
	var i;
	var j;
	var k;

	if ( M === 0 || N === 0 ) {
		return B;
	}

	lside = ( side === 'left' );
	upper = ( uplo === 'upper' );
	noconj = ( transa === 'transpose' );
	nounit = ( diag === 'non-unit' );

	alphaR = real( alpha );
	alphaI = imag( alpha );

	// Get Float64Array views and convert offsets/strides to Float64 units
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;

	// When alpha == 0, set B to zero
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				ib = oB + (i * sb1) + (j * sb2);
				Bv[ ib ] = 0.0;
				Bv[ ib + 1 ] = 0.0;
			}
		}
		return B;
	}

	if ( lside ) {
		if ( transa === 'no-transpose' ) {
			// Form B := alpha*inv(A)*B
			if ( upper ) {
				// Left, Upper, No-transpose
				for ( j = 0; j < N; j++ ) {
					// Scale column j of B by alpha if alpha != (1,0)
					if ( alphaR !== 1.0 || alphaI !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							ib = oB + (i * sb1) + (j * sb2);
							br = Bv[ ib ];
							bi = Bv[ ib + 1 ];

							// B[i,j] = alpha * B[i,j]
							Bv[ ib ] = (alphaR * br) - (alphaI * bi);
							Bv[ ib + 1 ] = (alphaR * bi) + (alphaI * br);
						}
					}
					for ( k = M - 1; k >= 0; k-- ) {
						kb = oB + (k * sb1) + (j * sb2);
						br = Bv[ kb ];
						bi = Bv[ kb + 1 ];
						if ( br !== 0.0 || bi !== 0.0 ) {
							if ( nounit ) {
								// B[k,j] = B[k,j] / A[k,k]
								ia = oA + (k * sa1) + (k * sa2);
								cmplx.divAt( Bv, kb, Bv, kb, Av, ia );
								br = Bv[ kb ];
								bi = Bv[ kb + 1 ];
							}
							for ( i = 0; i < k; i++ ) {
								ib = oB + (i * sb1) + (j * sb2);
								ia = oA + (i * sa1) + (k * sa2);
								ar = Av[ ia ];
								ai = Av[ ia + 1 ];

								// B[i,j] -= B[k,j] * A[i,k]
								Bv[ ib ] -= (br * ar) - (bi * ai);
								Bv[ ib + 1 ] -= (br * ai) + (bi * ar);
							}
						}
					}
				}
			} else {
				// Left, Lower, No-transpose
				for ( j = 0; j < N; j++ ) {
					// Scale column j of B by alpha if alpha != (1,0)
					if ( alphaR !== 1.0 || alphaI !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							ib = oB + (i * sb1) + (j * sb2);
							br = Bv[ ib ];
							bi = Bv[ ib + 1 ];

							// B[i,j] = alpha * B[i,j]
							Bv[ ib ] = (alphaR * br) - (alphaI * bi);
							Bv[ ib + 1 ] = (alphaR * bi) + (alphaI * br);
						}
					}
					for ( k = 0; k < M; k++ ) {
						kb = oB + (k * sb1) + (j * sb2);
						br = Bv[ kb ];
						bi = Bv[ kb + 1 ];
						if ( br !== 0.0 || bi !== 0.0 ) {
							if ( nounit ) {
								// B[k,j] = B[k,j] / A[k,k]
								ia = oA + (k * sa1) + (k * sa2);
								cmplx.divAt( Bv, kb, Bv, kb, Av, ia );
								br = Bv[ kb ];
								bi = Bv[ kb + 1 ];
							}
							for ( i = k + 1; i < M; i++ ) {
								ib = oB + (i * sb1) + (j * sb2);
								ia = oA + (i * sa1) + (k * sa2);
								ar = Av[ ia ];
								ai = Av[ ia + 1 ];

								// B[i,j] -= B[k,j] * A[i,k]
								Bv[ ib ] -= (br * ar) - (bi * ai);
								Bv[ ib + 1 ] -= (br * ai) + (bi * ar);
							}
						}
					}
				}
			}
		} else if ( upper ) {
			// Form B := alpha*inv(A**T)*B or B := alpha*inv(A**H)*B; Left, Upper, Transpose/Conj-transpose
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (j * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];

					// Temp = alpha * B[i,j]
					tempR = (alphaR * br) - (alphaI * bi);
					tempI = (alphaR * bi) + (alphaI * br);
					if ( noconj ) {
						// Transpose (no conjugate)
						for ( k = 0; k < i; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = Av[ ia + 1 ];
							br = Bv[ kb ];
							bi = Bv[ kb + 1 ];

							// Temp -= A[k,i] * B[k,j]
							tempR -= (ar * br) - (ai * bi);
							tempI -= (ar * bi) + (ai * br);
						}
						if ( nounit ) {
							// Temp = temp / A[i,i]
							ia = oA + (i * sa1) + (i * sa2);
							Bv[ ib ] = tempR;
							Bv[ ib + 1 ] = tempI;
							cmplx.divAt( Bv, ib, Bv, ib, Av, ia );
							continue;
						}
					} else {
						// Conjugate transpose
						for ( k = 0; k < i; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = -Av[ ia + 1 ]; // conjugate
							br = Bv[ kb ];
							bi = Bv[ kb + 1 ];

							// Temp -= conj(A[k,i]) * B[k,j]
							tempR -= (ar * br) - (ai * bi);
							tempI -= (ar * bi) + (ai * br);
						}
						if ( nounit ) {
							// Temp = temp / conj(A[i,i])
							ia = oA + (i * sa1) + (i * sa2);
							Bv[ ib ] = tempR;
							Bv[ ib + 1 ] = tempI;

							// Place conjugated diagonal into scratch for divAt
							scratch[ 0 ] = Av[ ia ];
							scratch[ 1 ] = -Av[ ia + 1 ];
							cmplx.divAt( Bv, ib, Bv, ib, scratch, 0 );
							continue;
						}
					}
					Bv[ ib ] = tempR;
					Bv[ ib + 1 ] = tempI;
				}
			}
		} else {
			// Left, Lower, Transpose/Conj-transpose
			for ( j = 0; j < N; j++ ) {
				for ( i = M - 1; i >= 0; i-- ) {
					ib = oB + (i * sb1) + (j * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];

					// Temp = alpha * B[i,j]
					tempR = (alphaR * br) - (alphaI * bi);
					tempI = (alphaR * bi) + (alphaI * br);
					if ( noconj ) {
						// Transpose (no conjugate)
						for ( k = i + 1; k < M; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = Av[ ia + 1 ];
							br = Bv[ kb ];
							bi = Bv[ kb + 1 ];

							// Temp -= A[k,i] * B[k,j]
							tempR -= (ar * br) - (ai * bi);
							tempI -= (ar * bi) + (ai * br);
						}
						if ( nounit ) {
							// Temp = temp / A[i,i]
							ia = oA + (i * sa1) + (i * sa2);
							Bv[ ib ] = tempR;
							Bv[ ib + 1 ] = tempI;
							cmplx.divAt( Bv, ib, Bv, ib, Av, ia );
							continue;
						}
					} else {
						// Conjugate transpose
						for ( k = i + 1; k < M; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = -Av[ ia + 1 ]; // conjugate
							br = Bv[ kb ];
							bi = Bv[ kb + 1 ];

							// Temp -= conj(A[k,i]) * B[k,j]
							tempR -= (ar * br) - (ai * bi);
							tempI -= (ar * bi) + (ai * br);
						}
						if ( nounit ) {
							// Temp = temp / conj(A[i,i])
							ia = oA + (i * sa1) + (i * sa2);
							Bv[ ib ] = tempR;
							Bv[ ib + 1 ] = tempI;
							scratch[ 0 ] = Av[ ia ];
							scratch[ 1 ] = -Av[ ia + 1 ];
							cmplx.divAt( Bv, ib, Bv, ib, scratch, 0 );
							continue;
						}
					}
					Bv[ ib ] = tempR;
					Bv[ ib + 1 ] = tempI;
				}
			}
		}
	} else if ( transa === 'no-transpose' ) {
		// Form B := alpha*B*inv(A)
		if ( upper ) {
			// Right, Upper, No-transpose
			for ( j = 0; j < N; j++ ) {
				// Scale column j of B by alpha if alpha != (1,0)
				if ( alphaR !== 1.0 || alphaI !== 0.0 ) {
					for ( i = 0; i < M; i++ ) {
						ib = oB + (i * sb1) + (j * sb2);
						br = Bv[ ib ];
						bi = Bv[ ib + 1 ];

						// B[i,j] = alpha * B[i,j]
						Bv[ ib ] = (alphaR * br) - (alphaI * bi);
						Bv[ ib + 1 ] = (alphaR * bi) + (alphaI * br);
					}
				}
				for ( k = 0; k < j; k++ ) {
					ia = oA + (k * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					if ( ar !== 0.0 || ai !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							ib = oB + (i * sb1) + (j * sb2);
							kb = oB + (i * sb1) + (k * sb2);
							br = Bv[ kb ];
							bi = Bv[ kb + 1 ];

							// B[i,j] -= A[k,j] * B[i,k]
							Bv[ ib ] -= (ar * br) - (ai * bi);
							Bv[ ib + 1 ] -= (ar * bi) + (ai * br);
						}
					}
				}
				if ( nounit ) {
					// Temp = (1,0) / A[j,j], then B[i,j] = temp * B[i,j]
					ia = oA + (j * sa1) + (j * sa2);
					scratch[ 0 ] = 1.0;
					scratch[ 1 ] = 0.0;
					cmplx.divAt( scratch, 2, scratch, 0, Av, ia );
					tempR = scratch[ 2 ];
					tempI = scratch[ 3 ];
					for ( i = 0; i < M; i++ ) {
						ib = oB + (i * sb1) + (j * sb2);
						br = Bv[ ib ];
						bi = Bv[ ib + 1 ];

						// B[i,j] = temp * B[i,j]
						Bv[ ib ] = (tempR * br) - (tempI * bi);
						Bv[ ib + 1 ] = (tempR * bi) + (tempI * br);
					}
				}
			}
		} else {
			// Right, Lower, No-transpose
			for ( j = N - 1; j >= 0; j-- ) {
				// Scale column j of B by alpha if alpha != (1,0)
				if ( alphaR !== 1.0 || alphaI !== 0.0 ) {
					for ( i = 0; i < M; i++ ) {
						ib = oB + (i * sb1) + (j * sb2);
						br = Bv[ ib ];
						bi = Bv[ ib + 1 ];

						// B[i,j] = alpha * B[i,j]
						Bv[ ib ] = (alphaR * br) - (alphaI * bi);
						Bv[ ib + 1 ] = (alphaR * bi) + (alphaI * br);
					}
				}
				for ( k = j + 1; k < N; k++ ) {
					ia = oA + (k * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					if ( ar !== 0.0 || ai !== 0.0 ) {
						for ( i = 0; i < M; i++ ) {
							ib = oB + (i * sb1) + (j * sb2);
							kb = oB + (i * sb1) + (k * sb2);
							br = Bv[ kb ];
							bi = Bv[ kb + 1 ];

							// B[i,j] -= A[k,j] * B[i,k]
							Bv[ ib ] -= (ar * br) - (ai * bi);
							Bv[ ib + 1 ] -= (ar * bi) + (ai * br);
						}
					}
				}
				if ( nounit ) {
					// Temp = (1,0) / A[j,j], then B[i,j] = temp * B[i,j]
					ia = oA + (j * sa1) + (j * sa2);
					scratch[ 0 ] = 1.0;
					scratch[ 1 ] = 0.0;
					cmplx.divAt( scratch, 2, scratch, 0, Av, ia );
					tempR = scratch[ 2 ];
					tempI = scratch[ 3 ];
					for ( i = 0; i < M; i++ ) {
						ib = oB + (i * sb1) + (j * sb2);
						br = Bv[ ib ];
						bi = Bv[ ib + 1 ];

						// B[i,j] = temp * B[i,j]
						Bv[ ib ] = (tempR * br) - (tempI * bi);
						Bv[ ib + 1 ] = (tempR * bi) + (tempI * br);
					}
				}
			}
		}
	} else if ( upper ) {
		// Form B := alpha*B*inv(A**T) or B := alpha*B*inv(A**H); Right, Upper, Transpose/Conj-transpose
		for ( k = N - 1; k >= 0; k-- ) {
			if ( nounit ) {
				// Temp = (1,0) / A[k,k] or (1,0) / conj(A[k,k])
				ia = oA + (k * sa1) + (k * sa2);
				scratch[ 0 ] = 1.0;
				scratch[ 1 ] = 0.0;
				if ( noconj ) {
					scratch[ 2 ] = Av[ ia ];
					scratch[ 3 ] = Av[ ia + 1 ];
				} else {
					scratch[ 2 ] = Av[ ia ];
					scratch[ 3 ] = -Av[ ia + 1 ];
				}
				cmplx.divAt( scratch, 4, scratch, 0, scratch, 2 );
				tempR = scratch[ 4 ];
				tempI = scratch[ 5 ];
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (k * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];

					// B[i,k] = temp * B[i,k]
					Bv[ ib ] = (tempR * br) - (tempI * bi);
					Bv[ ib + 1 ] = (tempR * bi) + (tempI * br);
				}
			}
			for ( j = 0; j < k; j++ ) {
				ia = oA + (j * sa1) + (k * sa2);
				ar = Av[ ia ];
				ai = Av[ ia + 1 ];
				if ( ar !== 0.0 || ai !== 0.0 ) {
					if ( noconj ) {
						tempR = ar;
						tempI = ai;
					} else {
						// conj(A[j,k])
						tempR = ar;
						tempI = -ai;
					}
					for ( i = 0; i < M; i++ ) {
						ib = oB + (i * sb1) + (j * sb2);
						kb = oB + (i * sb1) + (k * sb2);
						br = Bv[ kb ];
						bi = Bv[ kb + 1 ];

						// B[i,j] -= temp * B[i,k]
						Bv[ ib ] -= (tempR * br) - (tempI * bi);
						Bv[ ib + 1 ] -= (tempR * bi) + (tempI * br);
					}
				}
			}
			// Scale column k by alpha
			if ( alphaR !== 1.0 || alphaI !== 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (k * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];

					// B[i,k] = alpha * B[i,k]
					Bv[ ib ] = (alphaR * br) - (alphaI * bi);
					Bv[ ib + 1 ] = (alphaR * bi) + (alphaI * br);
				}
			}
		}
	} else {
		// Right, Lower, Transpose/Conj-transpose
		for ( k = 0; k < N; k++ ) {
			if ( nounit ) {
				// Temp = (1,0) / A[k,k] or (1,0) / conj(A[k,k])
				ia = oA + (k * sa1) + (k * sa2);
				scratch[ 0 ] = 1.0;
				scratch[ 1 ] = 0.0;
				if ( noconj ) {
					scratch[ 2 ] = Av[ ia ];
					scratch[ 3 ] = Av[ ia + 1 ];
				} else {
					scratch[ 2 ] = Av[ ia ];
					scratch[ 3 ] = -Av[ ia + 1 ];
				}
				cmplx.divAt( scratch, 4, scratch, 0, scratch, 2 );
				tempR = scratch[ 4 ];
				tempI = scratch[ 5 ];
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (k * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];

					// B[i,k] = temp * B[i,k]
					Bv[ ib ] = (tempR * br) - (tempI * bi);
					Bv[ ib + 1 ] = (tempR * bi) + (tempI * br);
				}
			}
			for ( j = k + 1; j < N; j++ ) {
				ia = oA + (j * sa1) + (k * sa2);
				ar = Av[ ia ];
				ai = Av[ ia + 1 ];
				if ( ar !== 0.0 || ai !== 0.0 ) {
					if ( noconj ) {
						tempR = ar;
						tempI = ai;
					} else {
						// conj(A[j,k])
						tempR = ar;
						tempI = -ai;
					}
					for ( i = 0; i < M; i++ ) {
						ib = oB + (i * sb1) + (j * sb2);
						kb = oB + (i * sb1) + (k * sb2);
						br = Bv[ kb ];
						bi = Bv[ kb + 1 ];

						// B[i,j] -= temp * B[i,k]
						Bv[ ib ] -= (tempR * br) - (tempI * bi);
						Bv[ ib + 1 ] -= (tempR * bi) + (tempI * br);
					}
				}
			}
			// Scale column k by alpha
			if ( alphaR !== 1.0 || alphaI !== 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (k * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];

					// B[i,k] = alpha * B[i,k]
					Bv[ ib ] = (alphaR * br) - (alphaI * bi);
					Bv[ ib + 1 ] = (alphaR * bi) + (alphaI * br);
				}
			}
		}
	}
	return B;
}


// EXPORTS //

export default ztrsm;
