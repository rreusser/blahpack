/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Performs the Hermitian packed rank-2 update `A := alpha*x*y**H + conj(alpha)*y*x**H + A`.
*
* `alpha` is a complex scalar, `x` and `y` are `N` element complex vectors,
* and `A` is an `N` by `N` Hermitian matrix supplied in packed form.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar constant
* @param {Complex128Array} x - first input vector
* @param {integer} strideX - `x` stride length (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second input vector
* @param {integer} strideY - `y` stride length (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} AP - packed Hermitian matrix
* @param {integer} strideAP - `AP` stride length (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @returns {Complex128Array} `AP`
*/
function zhpr2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, AP, strideAP, offsetAP ) {
	let temp1R, temp1I, temp2R, temp2I, ix, iy, jx, jy, kk, tr, i, j, k;

	if ( N === 0 ) {
		return AP;
	}

	const alphaR = real( alpha );
	const alphaI = imag( alpha );

	// Quick return if alpha is zero
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return AP;
	}

	const APv = reinterpret( AP, 0 );
	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );

	const sx = strideX * 2;
	const sy = strideY * 2;
	const sap = strideAP * 2;

	jx = offsetX * 2;
	jy = offsetY * 2;
	kk = offsetAP * 2;

	if ( uplo === 'upper' ) {
		// Form A when the upper triangle is stored in AP
		for ( j = 0; j < N; j += 1 ) {
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ||
				yv[ jy ] !== 0.0 || yv[ jy + 1 ] !== 0.0 ) {
				// temp1 = alpha * conj(y[j])
				temp1R = ( alphaR * yv[ jy ] ) + ( alphaI * yv[ jy + 1 ] );
				temp1I = -( alphaR * yv[ jy + 1 ] ) + ( alphaI * yv[ jy ] );

				// temp2 = conj(alpha * x[j]) = conj(alpha) * conj(x[j])
				tr = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
				temp2I = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
				temp2R = tr;
				temp2I = -temp2I;

				ix = offsetX * 2;
				iy = offsetY * 2;
				k = kk;
				for ( i = 0; i < j; i += 1 ) {
					// AP[k] += x[i] * temp1 + y[i] * temp2
					APv[ k ] += ( xv[ ix ] * temp1R ) - ( xv[ ix + 1 ] * temp1I ) +
						( yv[ iy ] * temp2R ) - ( yv[ iy + 1 ] * temp2I );
					APv[ k + 1 ] += ( xv[ ix ] * temp1I ) + ( xv[ ix + 1 ] * temp1R ) +
						( yv[ iy ] * temp2I ) + ( yv[ iy + 1 ] * temp2R );
					k += sap;
					ix += sx;
					iy += sy;
				}
				// Diagonal: AP(j,j) = real(AP(j,j)) + real(x[j]*temp1 + y[j]*temp2)
				APv[ k ] = APv[ k ] +
					( ( xv[ jx ] * temp1R ) - ( xv[ jx + 1 ] * temp1I ) ) +
					( ( yv[ jy ] * temp2R ) - ( yv[ jy + 1 ] * temp2I ) );
				APv[ k + 1 ] = 0.0;
			} else {
				// Ensure diagonal is real
				APv[ kk + (j * sap) ] = APv[ kk + (j * sap) ];
				APv[ kk + (j * sap) + 1 ] = 0.0;
			}
			jx += sx;
			jy += sy;
			kk += ( j + 1 ) * sap;
		}
	} else {
		// Form A when the lower triangle is stored in AP
		for ( j = 0; j < N; j += 1 ) {
			if ( xv[ jx ] !== 0.0 || xv[ jx + 1 ] !== 0.0 ||
				yv[ jy ] !== 0.0 || yv[ jy + 1 ] !== 0.0 ) {
				// temp1 = alpha * conj(y[j])
				temp1R = ( alphaR * yv[ jy ] ) + ( alphaI * yv[ jy + 1 ] );
				temp1I = -( alphaR * yv[ jy + 1 ] ) + ( alphaI * yv[ jy ] );

				// temp2 = conj(alpha * x[j]) = conj(alpha) * conj(x[j])
				tr = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
				temp2I = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
				temp2R = tr;
				temp2I = -temp2I;

				// Diagonal: AP(j,j) = real(AP(j,j)) + real(x[j]*temp1 + y[j]*temp2)
				APv[ kk ] = APv[ kk ] +
					( ( xv[ jx ] * temp1R ) - ( xv[ jx + 1 ] * temp1I ) ) +
					( ( yv[ jy ] * temp2R ) - ( yv[ jy + 1 ] * temp2I ) );
				APv[ kk + 1 ] = 0.0;

				ix = jx + sx;
				iy = jy + sy;
				k = kk + sap;
				for ( i = j + 1; i < N; i += 1 ) {
					// AP[k] += x[i] * temp1 + y[i] * temp2
					APv[ k ] += ( xv[ ix ] * temp1R ) - ( xv[ ix + 1 ] * temp1I ) +
						( yv[ iy ] * temp2R ) - ( yv[ iy + 1 ] * temp2I );
					APv[ k + 1 ] += ( xv[ ix ] * temp1I ) + ( xv[ ix + 1 ] * temp1R ) +
						( yv[ iy ] * temp2I ) + ( yv[ iy + 1 ] * temp2R );
					k += sap;
					ix += sx;
					iy += sy;
				}
			} else {
				// Ensure diagonal is real
				APv[ kk + 1 ] = 0.0;
			}
			jx += sx;
			jy += sy;
			kk += ( N - j ) * sap;
		}
	}
	return AP;
}


// EXPORTS //

export default zhpr2;
