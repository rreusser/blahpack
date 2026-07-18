/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

const scratch = new Float64Array( 2 );


// MAIN //

/**
* Solves one of the systems of equations `A*x = b`, `A**T*x = b`, or `A**H*x = b`.
*
* `b` and `x` are N element complex vectors and `A` is an N by N unit or
* non-unit, upper or lower triangular matrix, supplied in packed form.
* No test for singularity or near-singularity is included. Such tests must
* be performed before calling this routine.
*
* @private
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the operation to be performed
* @param {string} diag - specifies whether the matrix is unit or non-unit triangular
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} AP - packed triangular matrix (complex-element strides)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} x - input/output vector (b on entry, x on exit; complex-element strides)
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @returns {Complex128Array} `x`
*/
function ztpsv( uplo, trans, diag, N, AP, strideAP, offsetAP, x, strideX, offsetX ) {
	let diagp, kk, ix, jx, ip, tr, ti, ar, ai, i, j;

	if ( N === 0 ) {
		return x;
	}

	const noconj = ( trans === 'transpose' );
	const nounit = ( diag === 'non-unit' );

	// Get Float64Array views and convert offsets/strides from complex to double
	const APv = reinterpret( AP, 0 );
	const oAP = offsetAP * 2;
	const sap = strideAP * 2;
	const xv = reinterpret( x, 0 );
	const oX = offsetX * 2;
	const sx = strideX * 2;

	if ( trans === 'no-transpose' ) {
		// Solve A*x = b
		if ( uplo === 'upper' ) {
			// Upper triangular, no transpose: backward substitution
			kk = oAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * sap );
			jx = oX + ( ( N - 1 ) * sx );
			for ( j = N - 1; j >= 0; j -= 1 ) {
				if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
					if ( nounit ) {
						// x[j] = x[j] / A[j,j]
						cmplx.divAt( xv, jx, xv, jx, APv, kk );
					}
					tr = xv[ jx ];
					ti = xv[ jx + 1 ];
					ip = kk - sap;
					ix = jx - sx;
					for ( i = j - 1; i >= 0; i -= 1 ) {
						ar = APv[ ip ];
						ai = APv[ ip + 1 ];

						// X[i] -= temp * AP[k]
						xv[ ix ] -= ( tr * ar ) - ( ti * ai );
						xv[ ix + 1 ] -= ( tr * ai ) + ( ti * ar );
						ip -= sap;
						ix -= sx;
					}
				}
				jx -= sx;
				kk -= ( j + 1 ) * sap;
			}
		} else {
			// Lower triangular, no transpose: forward substitution
			kk = oAP;
			jx = oX;
			for ( j = 0; j < N; j += 1 ) {
				if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ) {
					if ( nounit ) {
						// x[j] = x[j] / A[j,j]
						cmplx.divAt( xv, jx, xv, jx, APv, kk );
					}
					tr = xv[ jx ];
					ti = xv[ jx + 1 ];
					ip = kk + sap;
					ix = jx + sx;
					for ( i = j + 1; i < N; i += 1 ) {
						ar = APv[ ip ];
						ai = APv[ ip + 1 ];

						// X[i] -= temp * AP[k]
						xv[ ix ] -= ( tr * ar ) - ( ti * ai );
						xv[ ix + 1 ] -= ( tr * ai ) + ( ti * ar );
						ip += sap;
						ix += sx;
					}
				}
				jx += sx;
				kk += ( N - j ) * sap;
			}
		}
	} else if ( uplo === 'upper' ) {
		// Solve A**T*x = b or A**H*x = b, upper triangular: forward substitution
		kk = oAP;
		jx = oX;
		for ( j = 0; j < N; j += 1 ) {
			tr = xv[ jx ];
			ti = xv[ jx + 1 ];
			ip = kk;
			ix = oX;
			if ( noconj ) {
				// Transpose (no conjugate)
				for ( i = 0; i < j; i += 1 ) {
					ar = APv[ ip ];
					ai = APv[ ip + 1 ];

					// Temp -= AP[k] * x[i]
					tr -= ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti -= ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip += sap;
					ix += sx;
				}
				if ( nounit ) {
					// Temp = temp / A[j,j]
					diagp = kk + ( j * sap );
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
					cmplx.divAt( xv, jx, xv, jx, APv, diagp );
				} else {
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
				}
			} else {
				// Conjugate transpose
				for ( i = 0; i < j; i += 1 ) {
					ar = APv[ ip ];
					ai = -APv[ ip + 1 ];

					// Temp -= conj(AP[k]) * x[i]
					tr -= ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti -= ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip += sap;
					ix += sx;
				}
				if ( nounit ) {
					// Temp = temp / conj(A[j,j])
					diagp = kk + ( j * sap );
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
					scratch[ 0 ] = APv[ diagp ];
					scratch[ 1 ] = -APv[ diagp + 1 ];
					cmplx.divAt( xv, jx, xv, jx, scratch, 0 );
				} else {
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
				}
			}
			jx += sx;
			kk += ( j + 1 ) * sap;
		}
	} else {
		// Solve A**T*x = b or A**H*x = b, lower triangular: backward substitution
		kk = oAP + ( ( ( ( N * ( N + 1 ) ) / 2 ) - 1 ) * sap );
		jx = oX + ( ( N - 1 ) * sx );
		for ( j = N - 1; j >= 0; j -= 1 ) {
			tr = xv[ jx ];
			ti = xv[ jx + 1 ];
			ip = kk;
			ix = oX + ( ( N - 1 ) * sx );
			if ( noconj ) {
				// Transpose (no conjugate)
				for ( i = N - 1; i > j; i -= 1 ) {
					ar = APv[ ip ];
					ai = APv[ ip + 1 ];

					// Temp -= AP[k] * x[i]
					tr -= ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti -= ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip -= sap;
					ix -= sx;
				}
				if ( nounit ) {
					// Temp = temp / A[j,j]; diagonal is at kk - (N-1-j)*sap
					diagp = kk - ( ( N - 1 - j ) * sap );
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
					cmplx.divAt( xv, jx, xv, jx, APv, diagp );
				} else {
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
				}
			} else {
				// Conjugate transpose
				for ( i = N - 1; i > j; i -= 1 ) {
					ar = APv[ ip ];
					ai = -APv[ ip + 1 ];

					// Temp -= conj(AP[k]) * x[i]
					tr -= ( ar * xv[ ix ] ) - ( ai * xv[ ix + 1 ] );
					ti -= ( ar * xv[ ix + 1 ] ) + ( ai * xv[ ix ] );
					ip -= sap;
					ix -= sx;
				}
				if ( nounit ) {
					// Temp = temp / conj(A[j,j])
					diagp = kk - ( ( N - 1 - j ) * sap );
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
					scratch[ 0 ] = APv[ diagp ];
					scratch[ 1 ] = -APv[ diagp + 1 ];
					cmplx.divAt( xv, jx, xv, jx, scratch, 0 );
				} else {
					xv[ jx ] = tr;
					xv[ jx + 1 ] = ti;
				}
			}
			jx -= sx;
			kk -= ( N - j ) * sap;
		}
	}
	return x;
}


// EXPORTS //

export default ztpsv;
