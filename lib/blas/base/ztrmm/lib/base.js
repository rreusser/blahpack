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

/* eslint-disable max-depth, max-len, max-lines, max-lines-per-function, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform one of the matrix-matrix operations.
* B := alpha_op(A)_B,  or  B := alpha_B_op(A)
*
* where alpha is a complex scalar, B is an M-by-N matrix, A is a unit
* or non-unit, upper or lower triangular matrix, and op(A) is one of
* op(A) = A  or  op(A) = A^T  or  op(A) = A^H.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - complex triangular matrix
* @param {integer} strideA1 - stride of first dim of A (complex elements)
* @param {integer} strideA2 - stride of second dim of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - complex matrix, modified in-place
* @param {integer} strideB1 - stride of first dim of B (complex elements)
* @param {integer} strideB2 - stride of second dim of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @returns {Complex128Array} `B`
*/
function ztrmm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
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
	var ia;
	var ib;
	var jb;
	var kb;
	var oA;
	var oB;
	var Av;
	var Bv;
	var ar;
	var ai;
	var br;
	var bi;
	var tr;
	var ti;
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

	// Get Float64Array views and convert offsets
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;

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
			if ( upper ) {
				for ( j = 0; j < N; j++ ) {
					for ( k = 0; k < M; k++ ) {
						kb = oB + (k * sb1) + (j * sb2);
						br = Bv[ kb ];
						bi = Bv[ kb + 1 ];
						if ( br !== 0.0 || bi !== 0.0 ) {
							tempR = (alphaR * br) - (alphaI * bi);
							tempI = (alphaR * bi) + (alphaI * br);
							for ( i = 0; i < k; i++ ) {
								ib = oB + (i * sb1) + (j * sb2);
								ia = oA + (i * sa1) + (k * sa2);
								ar = Av[ ia ];
								ai = Av[ ia + 1 ];
								Bv[ ib ] += (tempR * ar) - (tempI * ai);
								Bv[ ib + 1 ] += (tempR * ai) + (tempI * ar);
							}
							if ( nounit ) {
								ia = oA + (k * sa1) + (k * sa2);
								ar = Av[ ia ];
								ai = Av[ ia + 1 ];
								Bv[ kb ] = (tempR * ar) - (tempI * ai);
								Bv[ kb + 1 ] = (tempR * ai) + (tempI * ar);
							} else {
								Bv[ kb ] = tempR;
								Bv[ kb + 1 ] = tempI;
							}
						}
					}
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					for ( k = M - 1; k >= 0; k-- ) {
						kb = oB + (k * sb1) + (j * sb2);
						br = Bv[ kb ];
						bi = Bv[ kb + 1 ];
						if ( br !== 0.0 || bi !== 0.0 ) {
							tempR = (alphaR * br) - (alphaI * bi);
							tempI = (alphaR * bi) + (alphaI * br);
							Bv[ kb ] = tempR;
							Bv[ kb + 1 ] = tempI;
							if ( nounit ) {
								ia = oA + (k * sa1) + (k * sa2);
								ar = Av[ ia ];
								ai = Av[ ia + 1 ];
								Bv[ kb ] = (tempR * ar) - (tempI * ai);
								Bv[ kb + 1 ] = (tempR * ai) + (tempI * ar);
							}
							for ( i = k + 1; i < M; i++ ) {
								ib = oB + (i * sb1) + (j * sb2);
								ia = oA + (i * sa1) + (k * sa2);
								ar = Av[ ia ];
								ai = Av[ ia + 1 ];
								Bv[ ib ] += (tempR * ar) - (tempI * ai);
								Bv[ ib + 1 ] += (tempR * ai) + (tempI * ar);
							}
						}
					}
				}
			}
		} else if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				for ( i = M - 1; i >= 0; i-- ) {
					ib = oB + (i * sb1) + (j * sb2);
					tempR = Bv[ ib ];
					tempI = Bv[ ib + 1 ];
					if ( noconj ) {
						if ( nounit ) {
							ia = oA + (i * sa1) + (i * sa2);
							ar = Av[ ia ];
							ai = Av[ ia + 1 ];
							tr = (tempR * ar) - (tempI * ai);
							ti = (tempR * ai) + (tempI * ar);
							tempR = tr;
							tempI = ti;
						}
						for ( k = 0; k < i; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = Av[ ia + 1 ];
							tempR += (ar * Bv[ kb ]) - (ai * Bv[ kb + 1 ]);
							tempI += (ar * Bv[ kb + 1 ]) + (ai * Bv[ kb ]);
						}
					} else {
						if ( nounit ) {
							ia = oA + (i * sa1) + (i * sa2);
							ar = Av[ ia ];
							ai = -Av[ ia + 1 ];
							tr = (tempR * ar) - (tempI * ai);
							ti = (tempR * ai) + (tempI * ar);
							tempR = tr;
							tempI = ti;
						}
						for ( k = 0; k < i; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = -Av[ ia + 1 ];
							tempR += (ar * Bv[ kb ]) - (ai * Bv[ kb + 1 ]);
							tempI += (ar * Bv[ kb + 1 ]) + (ai * Bv[ kb ]);
						}
					}
					Bv[ ib ] = (alphaR * tempR) - (alphaI * tempI);
					Bv[ ib + 1 ] = (alphaR * tempI) + (alphaI * tempR);
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (j * sb2);
					tempR = Bv[ ib ];
					tempI = Bv[ ib + 1 ];
					if ( noconj ) {
						if ( nounit ) {
							ia = oA + (i * sa1) + (i * sa2);
							ar = Av[ ia ];
							ai = Av[ ia + 1 ];
							tr = (tempR * ar) - (tempI * ai);
							ti = (tempR * ai) + (tempI * ar);
							tempR = tr;
							tempI = ti;
						}
						for ( k = i + 1; k < M; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = Av[ ia + 1 ];
							tempR += (ar * Bv[ kb ]) - (ai * Bv[ kb + 1 ]);
							tempI += (ar * Bv[ kb + 1 ]) + (ai * Bv[ kb ]);
						}
					} else {
						if ( nounit ) {
							ia = oA + (i * sa1) + (i * sa2);
							ar = Av[ ia ];
							ai = -Av[ ia + 1 ];
							tr = (tempR * ar) - (tempI * ai);
							ti = (tempR * ai) + (tempI * ar);
							tempR = tr;
							tempI = ti;
						}
						for ( k = i + 1; k < M; k++ ) {
							ia = oA + (k * sa1) + (i * sa2);
							kb = oB + (k * sb1) + (j * sb2);
							ar = Av[ ia ];
							ai = -Av[ ia + 1 ];
							tempR += (ar * Bv[ kb ]) - (ai * Bv[ kb + 1 ]);
							tempI += (ar * Bv[ kb + 1 ]) + (ai * Bv[ kb ]);
						}
					}
					Bv[ ib ] = (alphaR * tempR) - (alphaI * tempI);
					Bv[ ib + 1 ] = (alphaR * tempI) + (alphaI * tempR);
				}
			}
		}
	} else if ( transa === 'no-transpose' ) {
		if ( upper ) {
			for ( j = N - 1; j >= 0; j-- ) {
				tempR = alphaR;
				tempI = alphaI;
				if ( nounit ) {
					ia = oA + (j * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tr = (tempR * ar) - (tempI * ai);
					ti = (tempR * ai) + (tempI * ar);
					tempR = tr;
					tempI = ti;
				}
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (j * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];
					Bv[ ib ] = (tempR * br) - (tempI * bi);
					Bv[ ib + 1 ] = (tempR * bi) + (tempI * br);
				}
				for ( k = 0; k < j; k++ ) {
					ia = oA + (k * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					if ( ar !== 0.0 || ai !== 0.0 ) {
						tr = (alphaR * ar) - (alphaI * ai);
						ti = (alphaR * ai) + (alphaI * ar);
						for ( i = 0; i < M; i++ ) {
							ib = oB + (i * sb1) + (j * sb2);
							kb = oB + (i * sb1) + (k * sb2);
							Bv[ ib ] += (tr * Bv[ kb ]) - (ti * Bv[ kb + 1 ]);
							Bv[ ib + 1 ] += (tr * Bv[ kb + 1 ]) + (ti * Bv[ kb ]);
						}
					}
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				tempR = alphaR;
				tempI = alphaI;
				if ( nounit ) {
					ia = oA + (j * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tr = (tempR * ar) - (tempI * ai);
					ti = (tempR * ai) + (tempI * ar);
					tempR = tr;
					tempI = ti;
				}
				for ( i = 0; i < M; i++ ) {
					ib = oB + (i * sb1) + (j * sb2);
					br = Bv[ ib ];
					bi = Bv[ ib + 1 ];
					Bv[ ib ] = (tempR * br) - (tempI * bi);
					Bv[ ib + 1 ] = (tempR * bi) + (tempI * br);
				}
				for ( k = j + 1; k < N; k++ ) {
					ia = oA + (k * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					if ( ar !== 0.0 || ai !== 0.0 ) {
						tr = (alphaR * ar) - (alphaI * ai);
						ti = (alphaR * ai) + (alphaI * ar);
						for ( i = 0; i < M; i++ ) {
							ib = oB + (i * sb1) + (j * sb2);
							kb = oB + (i * sb1) + (k * sb2);
							Bv[ ib ] += (tr * Bv[ kb ]) - (ti * Bv[ kb + 1 ]);
							Bv[ ib + 1 ] += (tr * Bv[ kb + 1 ]) + (ti * Bv[ kb ]);
						}
					}
				}
			}
		}
	} else if ( upper ) {
		for ( k = 0; k < N; k++ ) {
			for ( j = 0; j < k; j++ ) {
				ia = oA + (j * sa1) + (k * sa2);
				ar = Av[ ia ];
				ai = Av[ ia + 1 ];
				if ( ar !== 0.0 || ai !== 0.0 ) {
					if ( !noconj ) {
						ai = -ai;
					}
					tr = (alphaR * ar) - (alphaI * ai);
					ti = (alphaR * ai) + (alphaI * ar);
					for ( i = 0; i < M; i++ ) {
						jb = oB + (i * sb1) + (j * sb2);
						kb = oB + (i * sb1) + (k * sb2);
						Bv[ jb ] += (tr * Bv[ kb ]) - (ti * Bv[ kb + 1 ]);
						Bv[ jb + 1 ] += (tr * Bv[ kb + 1 ]) + (ti * Bv[ kb ]);
					}
				}
			}
			tempR = alphaR;
			tempI = alphaI;
			if ( nounit ) {
				ia = oA + (k * sa1) + (k * sa2);
				ar = Av[ ia ];
				ai = Av[ ia + 1 ];
				if ( !noconj ) {
					ai = -ai;
				}
				tr = (tempR * ar) - (tempI * ai);
				ti = (tempR * ai) + (tempI * ar);
				tempR = tr;
				tempI = ti;
			}
			if ( tempR !== 1.0 || tempI !== 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					kb = oB + (i * sb1) + (k * sb2);
					br = Bv[ kb ];
					bi = Bv[ kb + 1 ];
					Bv[ kb ] = (tempR * br) - (tempI * bi);
					Bv[ kb + 1 ] = (tempR * bi) + (tempI * br);
				}
			}
		}
	} else {
		for ( k = N - 1; k >= 0; k-- ) {
			for ( j = k + 1; j < N; j++ ) {
				ia = oA + (j * sa1) + (k * sa2);
				ar = Av[ ia ];
				ai = Av[ ia + 1 ];
				if ( ar !== 0.0 || ai !== 0.0 ) {
					if ( !noconj ) {
						ai = -ai;
					}
					tr = (alphaR * ar) - (alphaI * ai);
					ti = (alphaR * ai) + (alphaI * ar);
					for ( i = 0; i < M; i++ ) {
						jb = oB + (i * sb1) + (j * sb2);
						kb = oB + (i * sb1) + (k * sb2);
						Bv[ jb ] += (tr * Bv[ kb ]) - (ti * Bv[ kb + 1 ]);
						Bv[ jb + 1 ] += (tr * Bv[ kb + 1 ]) + (ti * Bv[ kb ]);
					}
				}
			}
			tempR = alphaR;
			tempI = alphaI;
			if ( nounit ) {
				ia = oA + (k * sa1) + (k * sa2);
				ar = Av[ ia ];
				ai = Av[ ia + 1 ];
				if ( !noconj ) {
					ai = -ai;
				}
				tr = (tempR * ar) - (tempI * ai);
				ti = (tempR * ai) + (tempI * ar);
				tempR = tr;
				tempI = ti;
			}
			if ( tempR !== 1.0 || tempI !== 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					kb = oB + (i * sb1) + (k * sb2);
					br = Bv[ kb ];
					bi = Bv[ kb + 1 ];
					Bv[ kb ] = (tempR * br) - (tempI * bi);
					Bv[ kb + 1 ] = (tempR * bi) + (tempI * br);
				}
			}
		}
	}
	return B;
}


// EXPORTS //

export default ztrmm;
