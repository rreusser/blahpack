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
* Perform the rank 1 operation A := alpha*x*y**H + A.
* where alpha is a complex scalar, x is an M element complex vector,
* y is an N element complex vector, and A is an M by N complex matrix.
*
* This routine conjugates y (unlike zgeru).
*
* ## Method
*
* Register-blocked, layout-adaptive rank-1 update (complex analog of the
* shipped `dger` blocked kernel). The kernel walks whichever dimension of `A`
* has the smaller stride in the inner loop and blocks the other four wide:
*
* -   **column form** (four columns per pass, hoisted `temp = alpha*conj(y[j+k])`)
*     when the first dimension has the smaller stride;
* -   **row form** (four rows per pass, hoisted `x[i+k]`) otherwise.
*
* Every `A(i,j)` receives exactly the reference fused update
* `x(i) * (alpha*conj(y(j)))` with the identical floating-point expression, and
* the reference `y(j) !== 0` column guard is preserved, so this only
* reschedules memory: it is verified bit-identically against the reference
* kernel (`bench/zger-opt/`). See `DIFFERENCES.md`.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} x - first complex input vector
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second complex input vector
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} A - complex matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @returns {Complex128Array} `A`
*/
function zgerc( M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	let m4, n4, ix, jy, jj, aj, ia0, ia1, ia2, ia3, t0r, t0i, t1r, t1i, t2r;
	let t2i, t3r, t3i, x0r, x0i, x1r, x1i, x2r, x2i, x3r, x3i, xr, xi, yr, yi;
	let tr, ti, i, j, k;

	if ( M <= 0 || N <= 0 ) {
		return A;
	}

	const alphaRe = real( alpha );
	const alphaIm = imag( alpha );

	// Quick return if alpha is zero
	if ( alphaRe === 0.0 && alphaIm === 0.0 ) {
		return A;
	}

	// Get Float64Array views and convert offsets/strides to double units
	const Av = reinterpret( A, 0 );
	const oA = offsetA * 2;
	const xv = reinterpret( x, 0 );
	const yv = reinterpret( y, 0 );
	const sx = strideX * 2;
	const sy = strideY * 2;
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;

	if ( ( sa1 < 0 ? -sa1 : sa1 ) <= ( sa2 < 0 ? -sa2 : sa2 ) ) {
		// Column form: inner loop over rows (stride `sa1`), four columns per pass
		n4 = N - ( N % 4 );
		jy = offsetY * 2;
		for ( j = 0; j < n4; j += 4 ) {
			t0r = yv[ jy ];
			t0i = yv[ jy + 1 ];
			t1r = yv[ jy + sy ];
			t1i = yv[ jy + sy + 1 ];
			t2r = yv[ jy + ( 2 * sy ) ];
			t2i = yv[ jy + ( 2 * sy ) + 1 ];
			t3r = yv[ jy + ( 3 * sy ) ];
			t3i = yv[ jy + ( 3 * sy ) + 1 ];
			if (
				( t0r !== 0.0 || t0i !== 0.0 ) &&
				( t1r !== 0.0 || t1i !== 0.0 ) &&
				( t2r !== 0.0 || t2i !== 0.0 ) &&
				( t3r !== 0.0 || t3i !== 0.0 )
			) {
				// temp[k] = alpha * conj(y(j+k))
				tr = ( alphaRe * t0r ) + ( alphaIm * t0i ); ti = ( alphaIm * t0r ) - ( alphaRe * t0i ); t0r = tr; t0i = ti;
				tr = ( alphaRe * t1r ) + ( alphaIm * t1i ); ti = ( alphaIm * t1r ) - ( alphaRe * t1i ); t1r = tr; t1i = ti;
				tr = ( alphaRe * t2r ) + ( alphaIm * t2i ); ti = ( alphaIm * t2r ) - ( alphaRe * t2i ); t2r = tr; t2i = ti;
				tr = ( alphaRe * t3r ) + ( alphaIm * t3i ); ti = ( alphaIm * t3r ) - ( alphaRe * t3i ); t3r = tr; t3i = ti;
				ia0 = oA + ( j * sa2 );
				ia1 = ia0 + sa2;
				ia2 = ia1 + sa2;
				ia3 = ia2 + sa2;
				ix = offsetX * 2;
				for ( i = 0; i < M; i++ ) {
					xr = xv[ ix ];
					xi = xv[ ix + 1 ];
					Av[ ia0 ] += ( xr * t0r ) - ( xi * t0i );
					Av[ ia0 + 1 ] += ( xr * t0i ) + ( xi * t0r );
					Av[ ia1 ] += ( xr * t1r ) - ( xi * t1i );
					Av[ ia1 + 1 ] += ( xr * t1i ) + ( xi * t1r );
					Av[ ia2 ] += ( xr * t2r ) - ( xi * t2i );
					Av[ ia2 + 1 ] += ( xr * t2i ) + ( xi * t2r );
					Av[ ia3 ] += ( xr * t3r ) - ( xi * t3i );
					Av[ ia3 + 1 ] += ( xr * t3i ) + ( xi * t3r );
					ix += sx;
					ia0 += sa1;
					ia1 += sa1;
					ia2 += sa1;
					ia3 += sa1;
				}
			} else {
				// One or more zero columns: reference-style scalar columns
				jj = jy;
				aj = oA + ( j * sa2 );
				for ( k = 0; k < 4; k++ ) {
					yr = yv[ jj ];
					yi = yv[ jj + 1 ];
					if ( yr !== 0.0 || yi !== 0.0 ) {
						tr = ( alphaRe * yr ) + ( alphaIm * yi );
						ti = ( alphaIm * yr ) - ( alphaRe * yi );
						ia0 = aj;
						ix = offsetX * 2;
						for ( i = 0; i < M; i++ ) {
							xr = xv[ ix ];
							xi = xv[ ix + 1 ];
							Av[ ia0 ] += ( xr * tr ) - ( xi * ti );
							Av[ ia0 + 1 ] += ( xr * ti ) + ( xi * tr );
							ix += sx;
							ia0 += sa1;
						}
					}
					jj += sy;
					aj += sa2;
				}
			}
			jy += 4 * sy;
		}
		for ( ; j < N; j++ ) {
			yr = yv[ jy ];
			yi = yv[ jy + 1 ];
			if ( yr !== 0.0 || yi !== 0.0 ) {
				tr = ( alphaRe * yr ) + ( alphaIm * yi );
				ti = ( alphaIm * yr ) - ( alphaRe * yi );
				ia0 = oA + ( j * sa2 );
				ix = offsetX * 2;
				for ( i = 0; i < M; i++ ) {
					xr = xv[ ix ];
					xi = xv[ ix + 1 ];
					Av[ ia0 ] += ( xr * tr ) - ( xi * ti );
					Av[ ia0 + 1 ] += ( xr * ti ) + ( xi * tr );
					ix += sx;
					ia0 += sa1;
				}
			}
			jy += sy;
		}
	} else {
		// Row form: inner loop over columns (stride `sa2`), four rows per pass
		m4 = M - ( M % 4 );
		ix = offsetX * 2;
		for ( i = 0; i < m4; i += 4 ) {
			x0r = xv[ ix ];
			x0i = xv[ ix + 1 ];
			x1r = xv[ ix + sx ];
			x1i = xv[ ix + sx + 1 ];
			x2r = xv[ ix + ( 2 * sx ) ];
			x2i = xv[ ix + ( 2 * sx ) + 1 ];
			x3r = xv[ ix + ( 3 * sx ) ];
			x3i = xv[ ix + ( 3 * sx ) + 1 ];
			ia0 = oA + ( i * sa1 );
			ia1 = ia0 + sa1;
			ia2 = ia1 + sa1;
			ia3 = ia2 + sa1;
			jy = offsetY * 2;
			for ( j = 0; j < N; j++ ) {
				yr = yv[ jy ];
				yi = yv[ jy + 1 ];
				if ( yr !== 0.0 || yi !== 0.0 ) {
					tr = ( alphaRe * yr ) + ( alphaIm * yi );
					ti = ( alphaIm * yr ) - ( alphaRe * yi );
					Av[ ia0 ] += ( x0r * tr ) - ( x0i * ti );
					Av[ ia0 + 1 ] += ( x0r * ti ) + ( x0i * tr );
					Av[ ia1 ] += ( x1r * tr ) - ( x1i * ti );
					Av[ ia1 + 1 ] += ( x1r * ti ) + ( x1i * tr );
					Av[ ia2 ] += ( x2r * tr ) - ( x2i * ti );
					Av[ ia2 + 1 ] += ( x2r * ti ) + ( x2i * tr );
					Av[ ia3 ] += ( x3r * tr ) - ( x3i * ti );
					Av[ ia3 + 1 ] += ( x3r * ti ) + ( x3i * tr );
				}
				ia0 += sa2;
				ia1 += sa2;
				ia2 += sa2;
				ia3 += sa2;
				jy += sy;
			}
			ix += 4 * sx;
		}
		for ( ; i < M; i++ ) {
			x0r = xv[ ix ];
			x0i = xv[ ix + 1 ];
			ia0 = oA + ( i * sa1 );
			jy = offsetY * 2;
			for ( j = 0; j < N; j++ ) {
				yr = yv[ jy ];
				yi = yv[ jy + 1 ];
				if ( yr !== 0.0 || yi !== 0.0 ) {
					tr = ( alphaRe * yr ) + ( alphaIm * yi );
					ti = ( alphaIm * yr ) - ( alphaRe * yi );
					Av[ ia0 ] += ( x0r * tr ) - ( x0i * ti );
					Av[ ia0 + 1 ] += ( x0r * ti ) + ( x0i * tr );
				}
				ia0 += sa2;
				jy += sy;
			}
			ix += sx;
		}
	}
	return A;
}


// EXPORTS //

export default zgerc;
