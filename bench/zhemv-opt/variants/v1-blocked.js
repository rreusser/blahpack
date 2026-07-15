/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform Hermitian matrix-vector multiplication:.
* `y := alpha*A*x + beta * y`
* where A is an N-by-N Hermitian matrix.
*
* ## Method
*
* Blocks four columns per pass. Each loaded stored element `A[i,j]` serves
* two contributions exactly as the reference does: the row update
* `y[i] += temp1_j * A[i,j]` and the (implicitly conjugated) column reduction
* `temp2_j += conj(A[i,j]) * x[i]`. Blocking four columns amortizes each
* `x[i]` load and `y[i]` load/store over four column contributions.
*
* Diagonal elements of a Hermitian matrix are real by definition; the kernel
* reads only the stored real part of `A[j,j]` (mirroring the reference's
* `DBLE(A(j,j))`) and ignores any stored imaginary part.
*
* The blocked passes reorder the summation relative to the reference, so the
* kernel is verified at a backward-error tolerance against the preserved
* reference variant (see `bench/zhemv-opt/`).
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128} beta - complex scalar
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride for y (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
* @returns {Complex128Array} `y`
*/
function zhemv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var aijR;
	var aijI;
	var ajjR;
	var t0R;
	var t0I;
	var t1R;
	var t1I;
	var t2R;
	var t2I;
	var t3R;
	var t3I;
	var s0R;
	var s0I;
	var s1R;
	var s1I;
	var s2R;
	var s2I;
	var s3R;
	var s3I;
	var a0R;
	var a0I;
	var a1R;
	var a1I;
	var a2R;
	var a2I;
	var a3R;
	var a3I;
	var xr;
	var xi;
	var yr;
	var yi;
	var Av;
	var xv;
	var yv;
	var oA;
	var oX;
	var oY;
	var sa1;
	var sa2;
	var sa1_2;
	var sa1_3;
	var sx;
	var sy;
	var sx2;
	var sx3;
	var sy2;
	var sy3;
	var ia0;
	var ia1;
	var ia2;
	var ia3;
	var ia;
	var ix;
	var iy;
	var jx;
	var jy;
	var n4;
	var i;
	var j;

	if ( N === 0 ) {
		return y;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	// Quick return if alpha=0 and beta=1
	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return y;
	}

	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );

	oA = offsetA * 2;
	oX = offsetX * 2;
	oY = offsetY * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	sy = strideY * 2;

	// First form y := beta * y
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = oY;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < N; i++ ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				temp1R = (betaR * yv[ iy ]) - (betaI * yv[ iy + 1 ]);
				temp1I = (betaR * yv[ iy + 1 ]) + (betaI * yv[ iy ]);
				yv[ iy ] = temp1R;
				yv[ iy + 1 ] = temp1I;
				iy += sy;
			}
		}
	}

	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	sa1_2 = 2 * sa1;
	sa1_3 = 3 * sa1;
	sx2 = 2 * sx;
	sx3 = 3 * sx;
	sy2 = 2 * sy;
	sy3 = 3 * sy;
	n4 = N - ( N % 4 );
	jx = oX;
	jy = oY;

	if ( uplo === 'upper' ) {
		// Upper triangle stored: element (i,j), i <= j, at oA + i*sa1 + j*sa2.
		for ( j = 0; j < n4; j += 4 ) {
			t0R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			t0I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			t1R = (alphaR * xv[ jx + sx ]) - (alphaI * xv[ jx + sx + 1 ]);
			t1I = (alphaR * xv[ jx + sx + 1 ]) + (alphaI * xv[ jx + sx ]);
			t2R = (alphaR * xv[ jx + sx2 ]) - (alphaI * xv[ jx + sx2 + 1 ]);
			t2I = (alphaR * xv[ jx + sx2 + 1 ]) + (alphaI * xv[ jx + sx2 ]);
			t3R = (alphaR * xv[ jx + sx3 ]) - (alphaI * xv[ jx + sx3 + 1 ]);
			t3I = (alphaR * xv[ jx + sx3 + 1 ]) + (alphaI * xv[ jx + sx3 ]);
			s0R = 0.0;
			s0I = 0.0;
			s1R = 0.0;
			s1I = 0.0;
			s2R = 0.0;
			s2I = 0.0;
			s3R = 0.0;
			s3I = 0.0;
			ia0 = oA + ( j * sa2 );
			ia1 = ia0 + sa2;
			ia2 = ia1 + sa2;
			ia3 = ia2 + sa2;
			ix = oX;
			iy = oY;

			// Rectangular part: rows strictly above the 4x4 diagonal corner.
			for ( i = 0; i < j; i++ ) {
				xr = xv[ ix ];
				xi = xv[ ix + 1 ];
				a0R = Av[ ia0 ];
				a0I = Av[ ia0 + 1 ];
				a1R = Av[ ia1 ];
				a1I = Av[ ia1 + 1 ];
				a2R = Av[ ia2 ];
				a2I = Av[ ia2 + 1 ];
				a3R = Av[ ia3 ];
				a3I = Av[ ia3 + 1 ];
				yr = yv[ iy ];
				yi = yv[ iy + 1 ];
				yr += ((t0R * a0R) - (t0I * a0I)) + ((t1R * a1R) - (t1I * a1I)) + ((t2R * a2R) - (t2I * a2I)) + ((t3R * a3R) - (t3I * a3I));
				yi += ((t0R * a0I) + (t0I * a0R)) + ((t1R * a1I) + (t1I * a1R)) + ((t2R * a2I) + (t2I * a2R)) + ((t3R * a3I) + (t3I * a3R));
				yv[ iy ] = yr;
				yv[ iy + 1 ] = yi;
				s0R += (a0R * xr) + (a0I * xi);
				s0I += (a0R * xi) - (a0I * xr);
				s1R += (a1R * xr) + (a1I * xi);
				s1I += (a1R * xi) - (a1I * xr);
				s2R += (a2R * xr) + (a2I * xi);
				s2I += (a2R * xi) - (a2I * xr);
				s3R += (a3R * xr) + (a3I * xi);
				s3I += (a3R * xi) - (a3I * xr);
				ia0 += sa1;
				ia1 += sa1;
				ia2 += sa1;
				ia3 += sa1;
				ix += sx;
				iy += sy;
			}
			// 4x4 diagonal corner. ia0..ia3 sit at row j; ix===jx, iy===jy.
			// Column j: diagonal only (A[j,j] real).
			ajjR = Av[ ia0 ];
			yv[ jy ] += (t0R * ajjR) + ((alphaR * s0R) - (alphaI * s0I));
			yv[ jy + 1 ] += (t0I * ajjR) + ((alphaR * s0I) + (alphaI * s0R));

			// Column j+1: row j (off-diagonal), then diagonal.
			a0R = Av[ ia1 ];
			a0I = Av[ ia1 + 1 ];
			yv[ jy ] += (t1R * a0R) - (t1I * a0I);
			yv[ jy + 1 ] += (t1R * a0I) + (t1I * a0R);
			xr = xv[ jx ];
			xi = xv[ jx + 1 ];
			s1R += (a0R * xr) + (a0I * xi);
			s1I += (a0R * xi) - (a0I * xr);
			ajjR = Av[ ia1 + sa1 ];
			yv[ jy + sy ] += (t1R * ajjR) + ((alphaR * s1R) - (alphaI * s1I));
			yv[ jy + sy + 1 ] += (t1I * ajjR) + ((alphaR * s1I) + (alphaI * s1R));

			// Column j+2: rows j, j+1, then diagonal.
			a0R = Av[ ia2 ];
			a0I = Av[ ia2 + 1 ];
			a1R = Av[ ia2 + sa1 ];
			a1I = Av[ ia2 + sa1 + 1 ];
			yv[ jy ] += (t2R * a0R) - (t2I * a0I);
			yv[ jy + 1 ] += (t2R * a0I) + (t2I * a0R);
			yv[ jy + sy ] += (t2R * a1R) - (t2I * a1I);
			yv[ jy + sy + 1 ] += (t2R * a1I) + (t2I * a1R);
			xr = xv[ jx ];
			xi = xv[ jx + 1 ];
			s2R += (a0R * xr) + (a0I * xi);
			s2I += (a0R * xi) - (a0I * xr);
			xr = xv[ jx + sx ];
			xi = xv[ jx + sx + 1 ];
			s2R += (a1R * xr) + (a1I * xi);
			s2I += (a1R * xi) - (a1I * xr);
			ajjR = Av[ ia2 + sa1_2 ];
			yv[ jy + sy2 ] += (t2R * ajjR) + ((alphaR * s2R) - (alphaI * s2I));
			yv[ jy + sy2 + 1 ] += (t2I * ajjR) + ((alphaR * s2I) + (alphaI * s2R));

			// Column j+3: rows j, j+1, j+2, then diagonal.
			a0R = Av[ ia3 ];
			a0I = Av[ ia3 + 1 ];
			a1R = Av[ ia3 + sa1 ];
			a1I = Av[ ia3 + sa1 + 1 ];
			a2R = Av[ ia3 + sa1_2 ];
			a2I = Av[ ia3 + sa1_2 + 1 ];
			yv[ jy ] += (t3R * a0R) - (t3I * a0I);
			yv[ jy + 1 ] += (t3R * a0I) + (t3I * a0R);
			yv[ jy + sy ] += (t3R * a1R) - (t3I * a1I);
			yv[ jy + sy + 1 ] += (t3R * a1I) + (t3I * a1R);
			yv[ jy + sy2 ] += (t3R * a2R) - (t3I * a2I);
			yv[ jy + sy2 + 1 ] += (t3R * a2I) + (t3I * a2R);
			xr = xv[ jx ];
			xi = xv[ jx + 1 ];
			s3R += (a0R * xr) + (a0I * xi);
			s3I += (a0R * xi) - (a0I * xr);
			xr = xv[ jx + sx ];
			xi = xv[ jx + sx + 1 ];
			s3R += (a1R * xr) + (a1I * xi);
			s3I += (a1R * xi) - (a1I * xr);
			xr = xv[ jx + sx2 ];
			xi = xv[ jx + sx2 + 1 ];
			s3R += (a2R * xr) + (a2I * xi);
			s3I += (a2R * xi) - (a2I * xr);
			ajjR = Av[ ia3 + sa1_3 ];
			yv[ jy + sy3 ] += (t3R * ajjR) + ((alphaR * s3R) - (alphaI * s3I));
			yv[ jy + sy3 + 1 ] += (t3I * ajjR) + ((alphaR * s3I) + (alphaI * s3R));

			jx += 4 * sx;
			jy += 4 * sy;
		}
		// Scalar remainder columns (reference upper loop).
		for ( ; j < N; j++ ) {
			temp1R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			temp1I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			temp2R = 0.0;
			temp2I = 0.0;
			ix = oX;
			iy = oY;
			ia = oA + ( j * sa2 );
			for ( i = 0; i < j; i++ ) {
				aijR = Av[ ia ];
				aijI = Av[ ia + 1 ];
				yv[ iy ] += (temp1R * aijR) - (temp1I * aijI);
				yv[ iy + 1 ] += (temp1R * aijI) + (temp1I * aijR);
				temp2R += (aijR * xv[ ix ]) + (aijI * xv[ ix + 1 ]);
				temp2I += (aijR * xv[ ix + 1 ]) - (aijI * xv[ ix ]);
				ix += sx;
				iy += sy;
				ia += sa1;
			}
			ajjR = Av[ ia ];
			yv[ jy ] += (temp1R * ajjR) + ((alphaR * temp2R) - (alphaI * temp2I));
			yv[ jy + 1 ] += (temp1I * ajjR) + ((alphaR * temp2I) + (alphaI * temp2R));
			jx += sx;
			jy += sy;
		}
	} else {
		// Lower triangle stored: element (i,j), i >= j, at oA + i*sa1 + j*sa2.
		for ( j = 0; j < n4; j += 4 ) {
			t0R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			t0I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			t1R = (alphaR * xv[ jx + sx ]) - (alphaI * xv[ jx + sx + 1 ]);
			t1I = (alphaR * xv[ jx + sx + 1 ]) + (alphaI * xv[ jx + sx ]);
			t2R = (alphaR * xv[ jx + sx2 ]) - (alphaI * xv[ jx + sx2 + 1 ]);
			t2I = (alphaR * xv[ jx + sx2 + 1 ]) + (alphaI * xv[ jx + sx2 ]);
			t3R = (alphaR * xv[ jx + sx3 ]) - (alphaI * xv[ jx + sx3 + 1 ]);
			t3I = (alphaR * xv[ jx + sx3 + 1 ]) + (alphaI * xv[ jx + sx3 ]);
			s0R = 0.0;
			s0I = 0.0;
			s1R = 0.0;
			s1I = 0.0;
			s2R = 0.0;
			s2I = 0.0;
			s3R = 0.0;
			s3I = 0.0;

			// 4x4 diagonal corner (reference-style scalar).
			// Column j: diagonal (A[j,j] real), then rows j+1, j+2, j+3.
			ia = oA + ( j * sa1 ) + ( j * sa2 );
			ajjR = Av[ ia ];
			yv[ jy ] += t0R * ajjR;
			yv[ jy + 1 ] += t0I * ajjR;
			a0R = Av[ ia + sa1 ];
			a0I = Av[ ia + sa1 + 1 ];
			a1R = Av[ ia + sa1_2 ];
			a1I = Av[ ia + sa1_2 + 1 ];
			a2R = Av[ ia + sa1_3 ];
			a2I = Av[ ia + sa1_3 + 1 ];
			yv[ jy + sy ] += (t0R * a0R) - (t0I * a0I);
			yv[ jy + sy + 1 ] += (t0R * a0I) + (t0I * a0R);
			yv[ jy + sy2 ] += (t0R * a1R) - (t0I * a1I);
			yv[ jy + sy2 + 1 ] += (t0R * a1I) + (t0I * a1R);
			yv[ jy + sy3 ] += (t0R * a2R) - (t0I * a2I);
			yv[ jy + sy3 + 1 ] += (t0R * a2I) + (t0I * a2R);
			xr = xv[ jx + sx ];
			xi = xv[ jx + sx + 1 ];
			s0R += (a0R * xr) + (a0I * xi);
			s0I += (a0R * xi) - (a0I * xr);
			xr = xv[ jx + sx2 ];
			xi = xv[ jx + sx2 + 1 ];
			s0R += (a1R * xr) + (a1I * xi);
			s0I += (a1R * xi) - (a1I * xr);
			xr = xv[ jx + sx3 ];
			xi = xv[ jx + sx3 + 1 ];
			s0R += (a2R * xr) + (a2I * xi);
			s0I += (a2R * xi) - (a2I * xr);

			// Column j+1: diagonal, then rows j+2, j+3.
			ia += sa1 + sa2;
			ajjR = Av[ ia ];
			yv[ jy + sy ] += t1R * ajjR;
			yv[ jy + sy + 1 ] += t1I * ajjR;
			a0R = Av[ ia + sa1 ];
			a0I = Av[ ia + sa1 + 1 ];
			a1R = Av[ ia + sa1_2 ];
			a1I = Av[ ia + sa1_2 + 1 ];
			yv[ jy + sy2 ] += (t1R * a0R) - (t1I * a0I);
			yv[ jy + sy2 + 1 ] += (t1R * a0I) + (t1I * a0R);
			yv[ jy + sy3 ] += (t1R * a1R) - (t1I * a1I);
			yv[ jy + sy3 + 1 ] += (t1R * a1I) + (t1I * a1R);
			xr = xv[ jx + sx2 ];
			xi = xv[ jx + sx2 + 1 ];
			s1R += (a0R * xr) + (a0I * xi);
			s1I += (a0R * xi) - (a0I * xr);
			xr = xv[ jx + sx3 ];
			xi = xv[ jx + sx3 + 1 ];
			s1R += (a1R * xr) + (a1I * xi);
			s1I += (a1R * xi) - (a1I * xr);

			// Column j+2: diagonal, then row j+3.
			ia += sa1 + sa2;
			ajjR = Av[ ia ];
			yv[ jy + sy2 ] += t2R * ajjR;
			yv[ jy + sy2 + 1 ] += t2I * ajjR;
			a0R = Av[ ia + sa1 ];
			a0I = Av[ ia + sa1 + 1 ];
			yv[ jy + sy3 ] += (t2R * a0R) - (t2I * a0I);
			yv[ jy + sy3 + 1 ] += (t2R * a0I) + (t2I * a0R);
			xr = xv[ jx + sx3 ];
			xi = xv[ jx + sx3 + 1 ];
			s2R += (a0R * xr) + (a0I * xi);
			s2I += (a0R * xi) - (a0I * xr);

			// Column j+3: diagonal only.
			ia += sa1 + sa2;
			ajjR = Av[ ia ];
			yv[ jy + sy3 ] += t3R * ajjR;
			yv[ jy + sy3 + 1 ] += t3I * ajjR;

			// Rectangular part: rows strictly below the 4x4 diagonal corner.
			ia0 = oA + ( j * sa2 ) + ( ( j + 4 ) * sa1 );
			ia1 = ia0 + sa2;
			ia2 = ia1 + sa2;
			ia3 = ia2 + sa2;
			ix = jx + ( 4 * sx );
			iy = jy + ( 4 * sy );
			for ( i = j + 4; i < N; i++ ) {
				xr = xv[ ix ];
				xi = xv[ ix + 1 ];
				a0R = Av[ ia0 ];
				a0I = Av[ ia0 + 1 ];
				a1R = Av[ ia1 ];
				a1I = Av[ ia1 + 1 ];
				a2R = Av[ ia2 ];
				a2I = Av[ ia2 + 1 ];
				a3R = Av[ ia3 ];
				a3I = Av[ ia3 + 1 ];
				yr = yv[ iy ];
				yi = yv[ iy + 1 ];
				yr += ((t0R * a0R) - (t0I * a0I)) + ((t1R * a1R) - (t1I * a1I)) + ((t2R * a2R) - (t2I * a2I)) + ((t3R * a3R) - (t3I * a3I));
				yi += ((t0R * a0I) + (t0I * a0R)) + ((t1R * a1I) + (t1I * a1R)) + ((t2R * a2I) + (t2I * a2R)) + ((t3R * a3I) + (t3I * a3R));
				yv[ iy ] = yr;
				yv[ iy + 1 ] = yi;
				s0R += (a0R * xr) + (a0I * xi);
				s0I += (a0R * xi) - (a0I * xr);
				s1R += (a1R * xr) + (a1I * xi);
				s1I += (a1R * xi) - (a1I * xr);
				s2R += (a2R * xr) + (a2I * xi);
				s2I += (a2R * xi) - (a2I * xr);
				s3R += (a3R * xr) + (a3I * xi);
				s3I += (a3R * xi) - (a3I * xr);
				ia0 += sa1;
				ia1 += sa1;
				ia2 += sa1;
				ia3 += sa1;
				ix += sx;
				iy += sy;
			}
			yv[ jy ] += (alphaR * s0R) - (alphaI * s0I);
			yv[ jy + 1 ] += (alphaR * s0I) + (alphaI * s0R);
			yv[ jy + sy ] += (alphaR * s1R) - (alphaI * s1I);
			yv[ jy + sy + 1 ] += (alphaR * s1I) + (alphaI * s1R);
			yv[ jy + sy2 ] += (alphaR * s2R) - (alphaI * s2I);
			yv[ jy + sy2 + 1 ] += (alphaR * s2I) + (alphaI * s2R);
			yv[ jy + sy3 ] += (alphaR * s3R) - (alphaI * s3I);
			yv[ jy + sy3 + 1 ] += (alphaR * s3I) + (alphaI * s3R);

			jx += 4 * sx;
			jy += 4 * sy;
		}
		// Scalar remainder columns (reference lower loop).
		for ( ; j < N; j++ ) {
			temp1R = (alphaR * xv[ jx ]) - (alphaI * xv[ jx + 1 ]);
			temp1I = (alphaR * xv[ jx + 1 ]) + (alphaI * xv[ jx ]);
			temp2R = 0.0;
			temp2I = 0.0;
			ia = oA + ( j * sa1 ) + ( j * sa2 );
			ajjR = Av[ ia ];
			yv[ jy ] += temp1R * ajjR;
			yv[ jy + 1 ] += temp1I * ajjR;
			ix = jx + sx;
			iy = jy + sy;
			ia += sa1;
			for ( i = j + 1; i < N; i++ ) {
				aijR = Av[ ia ];
				aijI = Av[ ia + 1 ];
				yv[ iy ] += (temp1R * aijR) - (temp1I * aijI);
				yv[ iy + 1 ] += (temp1R * aijI) + (temp1I * aijR);
				temp2R += (aijR * xv[ ix ]) + (aijI * xv[ ix + 1 ]);
				temp2I += (aijR * xv[ ix + 1 ]) - (aijI * xv[ ix ]);
				ix += sx;
				iy += sy;
				ia += sa1;
			}
			yv[ jy ] += (alphaR * temp2R) - (alphaI * temp2I);
			yv[ jy + 1 ] += (alphaR * temp2I) + (alphaI * temp2R);
			jx += sx;
			jy += sy;
		}
	}
	return y;
}


// EXPORTS //

export default zhemv;
