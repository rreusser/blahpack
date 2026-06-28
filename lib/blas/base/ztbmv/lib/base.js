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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Performs one of the matrix-vector operations `x := A*x`, `x := A**T*x`, or `x := A**H*x`.
*
* `x` is an N element complex vector and A is an N by N unit or non-unit,
* upper or lower triangular band matrix, with (K+1) diagonals.
*
* Band storage: for upper triangular, the j-th column of A is stored in the
* j-th column of the band array, with diagonal at row K (0-based).
* For lower triangular, diagonal at row 0.
*
* Upper band: `A_band[K-s + s*sa1 + j*sa2] = A(j-s, j)` for s = 0..min(K,j)
* Lower band: `A_band[s*sa1 + j*sa2] = A(j+s, j)` for s = 0..min(K, N-1-j)
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} x - input/output vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @returns {Complex128Array} `x`
*/
function ztbmv( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	var noconj;
	var nounit;
	var kplus1;
	var tempR;
	var tempI;
	var sa1;
	var sa2;
	var sx;
	var ix;
	var jx;
	var kx;
	var ia;
	var Av;
	var xv;
	var oA;
	var oX;
	var ar;
	var ai;
	var xr;
	var xi;
	var tr;
	var ti;
	var i;
	var j;
	var l;

	if ( N <= 0 ) {
		return x;
	}

	nounit = ( diag === 'non-unit' );
	noconj = ( trans === 'transpose' );

	// Get Float64Array views
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;

	// Convert strides from complex-element units to double units
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;

	kx = oX;

	if ( trans === 'no-transpose' ) {
		// Form x := A*x
		if ( uplo === 'upper' ) {
			// Upper triangular, no transpose: forward through columns
			kplus1 = K;
			jx = kx;
			for ( j = 0; j < N; j += 1 ) {
				xr = xv[ jx ];
				xi = xv[ jx + 1 ];
				if ( xr !== 0.0 || xi !== 0.0 ) {
					l = kplus1 - j;
					ix = kx;
					for ( i = Math.max( 0, j - K ); i < j; i += 1 ) {
						ia = oA + (( l + i ) * sa1) + (j * sa2);
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];

						// x(i) += temp * A(l+i, j)
						xv[ ix ] += (xr * ar) - (xi * ai);
						xv[ ix + 1 ] += (xr * ai) + (xi * ar);
						ix += sx;
					}
					if ( nounit ) {
						ia = oA + (kplus1 * sa1) + (j * sa2);
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];
						tr = (xr * ar) - (xi * ai);
						ti = (xr * ai) + (xi * ar);
						xv[ jx ] = tr;
						xv[ jx + 1 ] = ti;
					}
				}
				jx += sx;
				if ( j >= K ) {
					kx += sx;
				}
			}
		} else {
			// Lower triangular, no transpose: backward through columns
			jx = kx + (( N - 1 ) * sx);
			kx = jx;
			for ( j = N - 1; j >= 0; j -= 1 ) {
				xr = xv[ jx ];
				xi = xv[ jx + 1 ];
				if ( xr !== 0.0 || xi !== 0.0 ) {
					l = -j;
					ix = kx;
					for ( i = Math.min( N - 1, j + K ); i > j; i -= 1 ) {
						ia = oA + (( l + i ) * sa1) + (j * sa2);
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];

						// x(i) += temp * A(l+i, j)
						xv[ ix ] += (xr * ar) - (xi * ai);
						xv[ ix + 1 ] += (xr * ai) + (xi * ar);
						ix -= sx;
					}
					if ( nounit ) {
						ia = oA + (j * sa2);
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];
						tr = (xr * ar) - (xi * ai);
						ti = (xr * ai) + (xi * ar);
						xv[ jx ] = tr;
						xv[ jx + 1 ] = ti;
					}
				}
				jx -= sx;
				if ( N - 1 - j >= K ) {
					kx -= sx;
				}
			}
		}
	} else if ( uplo === 'upper' ) {
		// Form x := A**T*x or x := A**H*x, upper triangular
		kplus1 = K;
		jx = kx + (( N - 1 ) * sx);
		kx = jx;
		for ( j = N - 1; j >= 0; j -= 1 ) {
			tempR = xv[ jx ];
			tempI = xv[ jx + 1 ];
			kx -= sx;
			ix = kx;
			l = kplus1 - j;
			if ( noconj ) {
				// Transpose (no conjugation)
				if ( nounit ) {
					ia = oA + (kplus1 * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tr = (tempR * ar) - (tempI * ai);
					ti = (tempR * ai) + (tempI * ar);
					tempR = tr;
					tempI = ti;
				}
				for ( i = j - 1; i >= Math.max( 0, j - K ); i -= 1 ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tempR += (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI += (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix -= sx;
				}
			} else {
				// Conjugate transpose
				if ( nounit ) {
					ia = oA + (kplus1 * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					tr = (tempR * ar) - (tempI * ai);
					ti = (tempR * ai) + (tempI * ar);
					tempR = tr;
					tempI = ti;
				}
				for ( i = j - 1; i >= Math.max( 0, j - K ); i -= 1 ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					tempR += (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI += (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix -= sx;
				}
			}
			xv[ jx ] = tempR;
			xv[ jx + 1 ] = tempI;
			jx -= sx;
		}
	} else {
		// Lower triangular, transpose/conjugate-transpose: forward through columns
		jx = kx;
		for ( j = 0; j < N; j += 1 ) {
			tempR = xv[ jx ];
			tempI = xv[ jx + 1 ];
			kx += sx;
			ix = kx;
			l = -j;
			if ( noconj ) {
				// Transpose (no conjugation)
				if ( nounit ) {
					ia = oA + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tr = (tempR * ar) - (tempI * ai);
					ti = (tempR * ai) + (tempI * ar);
					tempR = tr;
					tempI = ti;
				}
				for ( i = j + 1; i <= Math.min( N - 1, j + K ); i += 1 ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tempR += (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI += (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix += sx;
				}
			} else {
				// Conjugate transpose
				if ( nounit ) {
					ia = oA + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					tr = (tempR * ar) - (tempI * ai);
					ti = (tempR * ai) + (tempI * ar);
					tempR = tr;
					tempI = ti;
				}
				for ( i = j + 1; i <= Math.min( N - 1, j + K ); i += 1 ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					tempR += (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI += (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix += sx;
				}
			}
			xv[ jx ] = tempR;
			xv[ jx + 1 ] = tempI;
			jx += sx;
		}
	}
	return x;
}


// EXPORTS //

export default ztbmv;
