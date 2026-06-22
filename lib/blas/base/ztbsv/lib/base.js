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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Solves one of the systems of equations:.
* A_x = b,  or  A__T_x = b,  or  A*_H_x = b
* where b and x are N element complex vectors and A is an N by N unit or
* non-unit, upper or lower triangular band matrix, with (K+1) diagonals.
*
* Band storage: for upper triangular, the j-th column of A is stored in the
* j-th column of the band array, with diagonal at row K (0-based).
* For lower triangular, diagonal at row 0.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} K - number of super/sub-diagonals
* @param {Complex128Array} A - band matrix in band storage
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} x - input/output vector (b on entry, x on exit)
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @returns {Complex128Array} `x`
*/
function ztbsv( uplo, trans, diag, N, K, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
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
		// Solve A*x = b (no transpose)
		if ( uplo === 'upper' ) {
			// Upper triangular: back-substitution from bottom
			kplus1 = K;
			jx = kx + (( N - 1 ) * sx);
			for ( j = N - 1; j >= 0; j-- ) {
				if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
					l = kplus1 - j;
					if ( nounit ) {
						// x(j) = x(j) / A(kplus1, j) — use cmplx.divAt (NEVER inline complex division)
						ia = oA + (kplus1 * sa1) + (j * sa2);
						cmplx.divAt( xv, jx, xv, jx, Av, ia );
					}
					tempR = xv[ jx ];
					tempI = xv[ jx + 1 ];
					ix = jx - sx;
					for ( i = j - 1; i >= Math.max( 0, j - K ); i-- ) {
						ia = oA + (( l + i ) * sa1) + (j * sa2);

						// x(i) = x(i) - temp * A(l+i, j)

						// (tempR + tempI*i)(ar + ai*i) = (tempR*ar - tempI*ai) + (tempR*ai + tempI*ar)*i
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];
						xv[ ix ] -= (tempR * ar) - (tempI * ai);
						xv[ ix + 1 ] -= (tempR * ai) + (tempI * ar);
						ix -= sx;
					}
				}
				jx -= sx;
			}
		} else {
			// Lower triangular: forward-substitution from top
			jx = kx;
			for ( j = 0; j < N; j++ ) {
				if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
					l = -j;
					if ( nounit ) {
						// x(j) = x(j) / A(0, j)
						ia = oA + (j * sa2);
						cmplx.divAt( xv, jx, xv, jx, Av, ia );
					}
					tempR = xv[ jx ];
					tempI = xv[ jx + 1 ];
					ix = jx + sx;
					for ( i = j + 1; i < Math.min( N, j + K + 1 ); i++ ) {
						ia = oA + (( l + i ) * sa1) + (j * sa2);

						// x(i) = x(i) - temp * A(l+i, j)
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];
						xv[ ix ] -= (tempR * ar) - (tempI * ai);
						xv[ ix + 1 ] -= (tempR * ai) + (tempI * ar);
						ix += sx;
					}
				}
				jx += sx;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Solve A**T*x = b or A**H*x = b, upper triangular: forward-substitution
		kplus1 = K;
		jx = kx;
		for ( j = 0; j < N; j++ ) {
			tempR = xv[ jx ];
			tempI = xv[ jx + 1 ];
			l = kplus1 - j;
			ix = kx;
			if ( noconj ) {
				// Transpose (no conjugation)
				for ( i = Math.max( 0, j - K ); i < j; i++ ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);

					// Temp = temp - A(l+i,j) * x(i)
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tempR -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix += sx;
				}
				xv[ jx ] = tempR;
				xv[ jx + 1 ] = tempI;
				if ( nounit ) {
					ia = oA + (kplus1 * sa1) + (j * sa2);
					cmplx.divAt( xv, jx, xv, jx, Av, ia );
				}
			} else {
				// Conjugate transpose
				for ( i = Math.max( 0, j - K ); i < j; i++ ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);

					// Temp = temp - conj(A(l+i,j)) * x(i)
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					tempR -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix += sx;
				}
				xv[ jx ] = tempR;
				xv[ jx + 1 ] = tempI;
				if ( nounit ) {
					// Divide by conj(A(kplus1, j))
					ia = oA + (kplus1 * sa1) + (j * sa2);
					ai = Av[ ia + 1 ];
					Av[ ia + 1 ] = -ai;
					cmplx.divAt( xv, jx, xv, jx, Av, ia );
					Av[ ia + 1 ] = ai; // restore
				}
			}
			jx += sx;
			if ( j >= K ) {
				kx += sx;
			}
		}
	} else {
		// Lower triangular, transpose/conj-transpose: back-substitution
		jx = kx + (( N - 1 ) * sx);
		for ( j = N - 1; j >= 0; j-- ) {
			tempR = xv[ jx ];
			tempI = xv[ jx + 1 ];
			l = -j;
			ix = kx + (( N - 1 ) * sx);
			if ( noconj ) {
				// Transpose (no conjugation)
				for ( i = Math.min( N - 1, j + K ); i > j; i-- ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];
					tempR -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix -= sx;
				}
				xv[ jx ] = tempR;
				xv[ jx + 1 ] = tempI;
				if ( nounit ) {
					ia = oA + (j * sa2);
					cmplx.divAt( xv, jx, xv, jx, Av, ia );
				}
			} else {
				// Conjugate transpose
				for ( i = Math.min( N - 1, j + K ); i > j; i-- ) {
					ia = oA + (( l + i ) * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					tempR -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					tempI -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix -= sx;
				}
				xv[ jx ] = tempR;
				xv[ jx + 1 ] = tempI;
				if ( nounit ) {
					// Divide by conj(A(0, j))
					ia = oA + (j * sa2);
					ai = Av[ ia + 1 ];
					Av[ ia + 1 ] = -ai;
					cmplx.divAt( xv, jx, xv, jx, Av, ia );
					Av[ ia + 1 ] = ai; // restore
				}
			}
			jx -= sx;
			if ( N - 1 - j >= K ) {
				kx -= sx;
			}
		}
	}
	return x;
}


// EXPORTS //

export default ztbsv;
