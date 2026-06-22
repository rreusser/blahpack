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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Performs one of the matrix-vector operations `x := A*x`, `x := A**T*x`, or `x := A**H*x`.
*
* `x` is an N element complex vector and A is an N by N unit or non-unit,
* upper or lower triangular matrix, supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to perform
* @param {string} diag - specifies whether the matrix is unit triangular
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed triangular matrix (complex-element strides)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} x - input/output vector (complex-element strides)
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @returns {Complex128Array} `x`
*/
function ztpmv( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX ) {
	var noconj;
	var nounit;
	var APv;
	var sap;
	var oAP;
	var xv;
	var sx;
	var oX;
	var kk;
	var ix;
	var jx;
	var ip;
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

	noconj = ( trans === 'transpose' );
	nounit = ( diag === 'non-unit' );

	// Get Float64Array views and convert offsets/strides from complex to double
	APv = reinterpret( AP, 0 );
	oAP = offsetAP * 2;
	sap = strideAP * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;
	sx = strideX * 2;

	if ( trans === 'no-transpose' ) {
		// Form x := A*x
		if ( uplo === 'upper' ) {
			// Upper triangular, no-transpose
			kk = oAP;
			jx = oX;
			for ( j = 0; j < N; j += 1 ) {
				xr = xv[ jx ];
				xi = xv[ jx + 1 ];
				if ( xr !== 0.0 || xi !== 0.0 ) {
					ix = oX;
					ip = kk;
					for ( i = 0; i < j; i += 1 ) {
						ar = APv[ ip ];
						ai = APv[ ip + 1 ];

						// X[ix] += temp * AP[ip]
						xv[ ix ] += ( xr * ar ) - ( xi * ai );
						xv[ ix + 1 ] += ( xr * ai ) + ( xi * ar );
						ix += sx;
						ip += sap;
					}
					if ( nounit ) {
						// Diagonal element at kk + j*sap
						ar = APv[ kk + ( j * sap ) ];
						ai = APv[ kk + ( j * sap ) + 1 ];
						tr = ( xr * ar ) - ( xi * ai );
						ti = ( xr * ai ) + ( xi * ar );
						xv[ jx ] = tr;
						xv[ jx + 1 ] = ti;
					}
				}
				jx += sx;
				kk += ( j + 1 ) * sap;
			}
		} else {
			// Lower triangular, no-transpose
			kk = oAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * sap );
			jx = oX + ( ( N - 1 ) * sx );
			for ( j = N - 1; j >= 0; j -= 1 ) {
				xr = xv[ jx ];
				xi = xv[ jx + 1 ];
				if ( xr !== 0.0 || xi !== 0.0 ) {
					ix = oX + ( ( N - 1 ) * sx );
					ip = kk;
					for ( i = N - 1; i > j; i -= 1 ) {
						ar = APv[ ip ];
						ai = APv[ ip + 1 ];

						// X[ix] += temp * AP[ip]
						xv[ ix ] += ( xr * ar ) - ( xi * ai );
						xv[ ix + 1 ] += ( xr * ai ) + ( xi * ar );
						ix -= sx;
						ip -= sap;
					}
					if ( nounit ) {
						// Diagonal element at kk - (N-1-j)*sap
						ar = APv[ kk - ( ( N - 1 - j ) * sap ) ];
						ai = APv[ kk - ( ( N - 1 - j ) * sap ) + 1 ];
						tr = ( xr * ar ) - ( xi * ai );
						ti = ( xr * ai ) + ( xi * ar );
						xv[ jx ] = tr;
						xv[ jx + 1 ] = ti;
					}
				}
				jx -= sx;
				kk -= ( N - j ) * sap;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Form x := A**T*x or x := A**H*x, upper triangular
		kk = oAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * sap );
		jx = oX + ( ( N - 1 ) * sx );
		for ( j = N - 1; j >= 0; j -= 1 ) {
			tr = xv[ jx ];
			ti = xv[ jx + 1 ];
			if ( noconj ) {
				// Transpose (no conjugate)
				if ( nounit ) {
					ar = APv[ kk ];
					ai = APv[ kk + 1 ];
					xr = ( tr * ar ) - ( ti * ai );
					xi = ( tr * ai ) + ( ti * ar );
					tr = xr;
					ti = xi;
				}
				ip = kk - sap;
				ix = jx - sx;
				for ( i = j - 1; i >= 0; i -= 1 ) {
					ar = APv[ ip ];
					ai = APv[ ip + 1 ];

					// Temp += AP[ip] * x[ix]
					tr += ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti += ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip -= sap;
					ix -= sx;
				}
			} else {
				// Conjugate transpose
				if ( nounit ) {
					ar = APv[ kk ];
					ai = -APv[ kk + 1 ];
					xr = ( tr * ar ) - ( ti * ai );
					xi = ( tr * ai ) + ( ti * ar );
					tr = xr;
					ti = xi;
				}
				ip = kk - sap;
				ix = jx - sx;
				for ( i = j - 1; i >= 0; i -= 1 ) {
					ar = APv[ ip ];
					ai = -APv[ ip + 1 ];

					// Temp += conj(AP[ip]) * x[ix]
					tr += ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti += ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip -= sap;
					ix -= sx;
				}
			}
			xv[ jx ] = tr;
			xv[ jx + 1 ] = ti;
			jx -= sx;
			kk -= ( j + 1 ) * sap;
		}
	} else {
		// Form x := A**T*x or x := A**H*x, lower triangular
		kk = oAP;
		jx = oX;
		for ( j = 0; j < N; j += 1 ) {
			tr = xv[ jx ];
			ti = xv[ jx + 1 ];
			if ( noconj ) {
				// Transpose (no conjugate)
				if ( nounit ) {
					ar = APv[ kk ];
					ai = APv[ kk + 1 ];
					xr = ( tr * ar ) - ( ti * ai );
					xi = ( tr * ai ) + ( ti * ar );
					tr = xr;
					ti = xi;
				}
				ip = kk + sap;
				ix = jx + sx;
				for ( i = j + 1; i < N; i += 1 ) {
					ar = APv[ ip ];
					ai = APv[ ip + 1 ];

					// Temp += AP[ip] * x[ix]
					tr += ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti += ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip += sap;
					ix += sx;
				}
			} else {
				// Conjugate transpose
				if ( nounit ) {
					ar = APv[ kk ];
					ai = -APv[ kk + 1 ];
					xr = ( tr * ar ) - ( ti * ai );
					xi = ( tr * ai ) + ( ti * ar );
					tr = xr;
					ti = xi;
				}
				ip = kk + sap;
				ix = jx + sx;
				for ( i = j + 1; i < N; i += 1 ) {
					ar = APv[ ip ];
					ai = -APv[ ip + 1 ];

					// Temp += conj(AP[ip]) * x[ix]
					tr += ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti += ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip += sap;
					ix += sx;
				}
			}
			xv[ jx ] = tr;
			xv[ jx + 1 ] = ti;
			jx += sx;
			kk += ( N - j ) * sap;
		}
	}
	return x;
}


// EXPORTS //

export default ztpmv;
