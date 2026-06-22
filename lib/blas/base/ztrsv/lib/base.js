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
import cmplx from './../../../../cmplx.js';


// MAIN //

/**
* Solve one of the systems of equations.
* A_x = b,  or  A__T_x = b,  or  A*_H_x = b,
* where b and x are N element complex vectors and A is an N by N unit, or
* non-unit, upper or lower triangular complex matrix.
*
* No test for singularity or near-singularity is included in this routine.
* Such tests must be performed before calling this routine.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - complex triangular matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} x - complex vector
* @param {integer} strideX - stride for `x` (complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @returns {Complex128Array} `x`
*/
function ztrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	var noconj;
	var nounit;
	var upper;
	var sa1;
	var sa2;
	var sx;
	var ix;
	var jx;
	var ia;
	var oA;
	var oX;
	var Av;
	var xv;
	var tr;
	var ti;
	var ar;
	var ai;
	var xr;
	var xi;
	var i;
	var j;

	if ( N <= 0 ) {
		return x;
	}

	upper = ( uplo === 'upper' );
	noconj = ( trans === 'transpose' );
	nounit = ( diag === 'non-unit' );

	// Get Float64Array views and convert offsets from complex-element to double units
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;

	// Convert strides from complex-element units to double units
	sx = strideX * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	if ( trans === 'no-transpose' ) {
		// Solve A*x = b
		if ( upper ) {
			// Back-substitution: j = N-1 down to 0
			jx = oX + (( N - 1 ) * sx);
			for ( j = N - 1; j >= 0; j-- ) {
				xr = xv[ jx ];
				xi = xv[ jx + 1 ];
				if ( xr !== 0.0 || xi !== 0.0 ) {
					if ( nounit ) {
						// x(j) = x(j) / A(j,j) — use cmplx.divAt (NEVER inline complex division)
						ia = oA + (j * sa1) + (j * sa2);
						cmplx.divAt( xv, jx, xv, jx, Av, ia );
						xr = xv[ jx ];
						xi = xv[ jx + 1 ];
					}
					ix = jx;
					for ( i = j - 1; i >= 0; i-- ) {
						ix -= sx;
						ia = oA + (i * sa1) + (j * sa2);
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];

						// x(i) -= x(j) * A(i,j)  — inline complex multiply-subtract
						xv[ ix ] -= (xr * ar) - (xi * ai);
						xv[ ix + 1 ] -= (xr * ai) + (xi * ar);
					}
				}
				jx -= sx;
			}
		} else {
			// Forward substitution (lower triangular)
			jx = oX;
			for ( j = 0; j < N; j++ ) {
				xr = xv[ jx ];
				xi = xv[ jx + 1 ];
				if ( xr !== 0.0 || xi !== 0.0 ) {
					if ( nounit ) {
						// x(j) = x(j) / A(j,j)
						ia = oA + (j * sa1) + (j * sa2);
						cmplx.divAt( xv, jx, xv, jx, Av, ia );
						xr = xv[ jx ];
						xi = xv[ jx + 1 ];
					}
					ix = jx;
					for ( i = j + 1; i < N; i++ ) {
						ix += sx;
						ia = oA + (i * sa1) + (j * sa2);
						ar = Av[ ia ];
						ai = Av[ ia + 1 ];

						// x(i) -= x(j) * A(i,j)
						xv[ ix ] -= (xr * ar) - (xi * ai);
						xv[ ix + 1 ] -= (xr * ai) + (xi * ar);
					}
				}
				jx += sx;
			}
		}
	} else if ( upper ) {
		// Solve A**T*x = b or A**H*x = b — forward substitution on transposed upper
		jx = oX;
		for ( j = 0; j < N; j++ ) {
			tr = xv[ jx ];
			ti = xv[ jx + 1 ];
			if ( noconj ) {
				// Transpose (no conjugate)
				ix = oX;
				for ( i = 0; i < j; i++ ) {
					ia = oA + (i * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];

					// Temp -= A(i,j) * x(i)  — inline complex multiply-subtract
					tr -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					ti -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix += sx;
				}
				if ( nounit ) {
					// Temp = temp / A(j,j) — store temp, divide, read back
					ia = oA + (j * sa1) + (j * sa2);
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
					cmplx.divAt( xv, jx, xv, jx, Av, ia );
					tr = xv[ jx ];
					ti = xv[ jx + 1 ];
				}
			} else {
				// Conjugate transpose
				ix = oX;
				for ( i = 0; i < j; i++ ) {
					ia = oA + (i * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate

					// Temp -= conj(A(i,j)) * x(i)
					tr -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					ti -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix += sx;
				}
				if ( nounit ) {
					// Temp = temp / conj(A(j,j))
					ia = oA + (j * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate

					// Divide temp by conj(A(j,j)) using Smith's formula
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;

					// Need to divide by conjugated diagonal — write conj into temp storage

					// We store conj value, divide, then proceed
					xr = tr;
					xi = ti;
					if ( Math.abs( ai ) <= Math.abs( ar ) ) {
						ti = ai / ar;
						tr = ar + (ai * ti);
						xv[ jx ] = ( xr + (xi * ti) ) / tr;
						xv[ jx + 1 ] = ( xi - (xr * ti) ) / tr;
					} else {
						ti = ar / ai;
						tr = ai + (ar * ti);
						xv[ jx ] = ( (xr * ti) + xi ) / tr;
						xv[ jx + 1 ] = ( (xi * ti) - xr ) / tr;
					}
					tr = xv[ jx ];
					ti = xv[ jx + 1 ];
				}
			}
			xv[ jx ] = tr;
			xv[ jx + 1 ] = ti;
			jx += sx;
		}
	} else {
		// Back substitution on transposed lower
		jx = oX + (( N - 1 ) * sx);
		for ( j = N - 1; j >= 0; j-- ) {
			tr = xv[ jx ];
			ti = xv[ jx + 1 ];
			if ( noconj ) {
				// Transpose (no conjugate)
				ix = oX + (( N - 1 ) * sx);
				for ( i = N - 1; i > j; i-- ) {
					ia = oA + (i * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = Av[ ia + 1 ];

					// Temp -= A(i,j) * x(i)
					tr -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					ti -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix -= sx;
				}
				if ( nounit ) {
					// Temp = temp / A(j,j)
					ia = oA + (j * sa1) + (j * sa2);
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
					cmplx.divAt( xv, jx, xv, jx, Av, ia );
					tr = xv[ jx ];
					ti = xv[ jx + 1 ];
				}
			} else {
				// Conjugate transpose
				ix = oX + (( N - 1 ) * sx);
				for ( i = N - 1; i > j; i-- ) {
					ia = oA + (i * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate

					// Temp -= conj(A(i,j)) * x(i)
					tr -= (ar * xv[ ix ]) - (ai * xv[ ix + 1 ]);
					ti -= (ar * xv[ ix + 1 ]) + (ai * xv[ ix ]);
					ix -= sx;
				}
				if ( nounit ) {
					// Temp = temp / conj(A(j,j))
					ia = oA + (j * sa1) + (j * sa2);
					ar = Av[ ia ];
					ai = -Av[ ia + 1 ]; // conjugate
					xr = tr;
					xi = ti;
					if ( Math.abs( ai ) <= Math.abs( ar ) ) {
						ti = ai / ar;
						tr = ar + (ai * ti);
						xv[ jx ] = ( xr + (xi * ti) ) / tr;
						xv[ jx + 1 ] = ( xi - (xr * ti) ) / tr;
					} else {
						ti = ar / ai;
						tr = ai + (ar * ti);
						xv[ jx ] = ( (xr * ti) + xi ) / tr;
						xv[ jx + 1 ] = ( (xi * ti) - xr ) / tr;
					}
					tr = xv[ jx ];
					ti = xv[ jx + 1 ];
				}
			}
			xv[ jx ] = tr;
			xv[ jx + 1 ] = ti;
			jx -= sx;
		}
	}
	return x;
}


// EXPORTS //

export default ztrsv;
