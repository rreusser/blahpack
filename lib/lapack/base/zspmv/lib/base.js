/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Performs the symmetric packed matrix-vector operation `y := alpha*A*x + beta*y`.
*
* `A` is an `N` by `N` complex symmetric matrix supplied in packed form, `x`
* and `y` are `N`-element complex vectors, and `alpha` and `beta` are complex
* scalars. Unlike the Hermitian variant (zhpmv), the symmetric variant uses
* `A[i,j]` directly (no conjugation) for off-diagonal elements, and the
* diagonal elements are fully complex.
*
* @private
* @param {string} uplo - specifies whether upper or lower triangle is stored
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128} alpha - complex scalar multiplier for `A*x`
* @param {Complex128Array} AP - packed symmetric matrix
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128} beta - complex scalar multiplier for `y`
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride length for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @returns {Complex128Array} `y`
*/
function zspmv( uplo, N, alpha, AP, strideAP, offsetAP, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	let temp1R, temp1I, temp2R, temp2I, apkR, apkI, ajjR, ajjI, ix, iy, jx, jy;
	let kk, yr, yi, k, i, j;

	// Quick return if possible:
	if ( N === 0 ) {
		return y;
	}

	const alphaR = real( alpha );
	const alphaI = imag( alpha );
	const betaR = real( beta );
	const betaI = imag( beta );

	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return y;
	}

	// Reinterpret Complex128Arrays as Float64Arrays:
	const APv = reinterpret( AP, 0 );
	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	const oAP = offsetAP * 2;
	const oX = offsetX * 2;
	const oY = offsetY * 2;
	const sap = strideAP * 2;
	const sx = strideX * 2;
	const sy = strideY * 2;

	// First form y := beta * y:
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = oY;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < N; i += 1 ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < N; i += 1 ) {
				// y[i] = beta * y[i]
				yr = yv[ iy ];
				yi = yv[ iy + 1 ];
				yv[ iy ] = ( betaR * yr ) - ( betaI * yi );
				yv[ iy + 1 ] = ( betaR * yi ) + ( betaI * yr );
				iy += sy;
			}
		}
	}
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	kk = oAP;
	if ( uplo === 'upper' ) {
		// Form y when AP contains the upper triangle:
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j += 1 ) {
			// temp1 = alpha * x[j]
			temp1R = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
			temp1I = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
			temp2R = 0.0;
			temp2I = 0.0;
			ix = oX;
			iy = oY;
			k = kk;
			for ( i = 0; i < j; i += 1 ) {
				apkR = APv[ k ];
				apkI = APv[ k + 1 ];

				// y[i] += temp1 * AP[k] (no conjugation — symmetric, not Hermitian)
				yv[ iy ] += ( temp1R * apkR ) - ( temp1I * apkI );
				yv[ iy + 1 ] += ( temp1R * apkI ) + ( temp1I * apkR );

				// temp2 += AP[k] * x[i] (no conjugation — symmetric)
				temp2R += ( apkR * xv[ ix ] ) - ( apkI * xv[ ix + 1 ] );
				temp2I += ( apkR * xv[ ix + 1 ] ) + ( apkI * xv[ ix ] );

				ix += sx;
				iy += sy;
				k += sap;
			}

			// Diagonal element: A(j,j) is fully complex for symmetric matrix
			ajjR = APv[ kk + ( j * sap ) ];
			ajjI = APv[ kk + ( j * sap ) + 1 ];

			// y[j] += temp1 * A[j,j] + alpha * temp2
			yv[ jy ] += ( ( temp1R * ajjR ) - ( temp1I * ajjI ) ) + ( ( alphaR * temp2R ) - ( alphaI * temp2I ) );
			yv[ jy + 1 ] += ( ( temp1R * ajjI ) + ( temp1I * ajjR ) ) + ( ( alphaR * temp2I ) + ( alphaI * temp2R ) );

			jx += sx;
			jy += sy;
			kk += ( j + 1 ) * sap;
		}
	} else {
		// Form y when AP contains the lower triangle:
		jx = oX;
		jy = oY;
		for ( j = 0; j < N; j += 1 ) {
			// temp1 = alpha * x[j]
			temp1R = ( alphaR * xv[ jx ] ) - ( alphaI * xv[ jx + 1 ] );
			temp1I = ( alphaR * xv[ jx + 1 ] ) + ( alphaI * xv[ jx ] );
			temp2R = 0.0;
			temp2I = 0.0;

			// Diagonal element: A(j,j) is fully complex for symmetric matrix
			ajjR = APv[ kk ];
			ajjI = APv[ kk + 1 ];
			yv[ jy ] += ( temp1R * ajjR ) - ( temp1I * ajjI );
			yv[ jy + 1 ] += ( temp1R * ajjI ) + ( temp1I * ajjR );

			ix = jx;
			iy = jy;
			k = kk + sap;
			for ( i = j + 1; i < N; i += 1 ) {
				ix += sx;
				iy += sy;
				apkR = APv[ k ];
				apkI = APv[ k + 1 ];

				// y[i] += temp1 * AP[k] (no conjugation — symmetric)
				yv[ iy ] += ( temp1R * apkR ) - ( temp1I * apkI );
				yv[ iy + 1 ] += ( temp1R * apkI ) + ( temp1I * apkR );

				// temp2 += AP[k] * x[i] (no conjugation — symmetric)
				temp2R += ( apkR * xv[ ix ] ) - ( apkI * xv[ ix + 1 ] );
				temp2I += ( apkR * xv[ ix + 1 ] ) + ( apkI * xv[ ix ] );

				k += sap;
			}

			// y[j] += alpha * temp2
			yv[ jy ] += ( alphaR * temp2R ) - ( alphaI * temp2I );
			yv[ jy + 1 ] += ( alphaR * temp2I ) + ( alphaI * temp2R );

			jx += sx;
			jy += sy;
			kk += ( N - j ) * sap;
		}
	}
	return y;
}


// EXPORTS //

export default zspmv;
