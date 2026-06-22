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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zlarfg from '../../zlarfg/lib/base.js';
import zhpmv from '../../../../blas/base/zhpmv/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zhpr2 from '../../../../blas/base/zhpr2/lib/base.js';


// VARIABLES //

var ZERO = new Complex128( 0.0, 0.0 );
var NEGONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian matrix stored in packed form to real symmetric tridiagonal form.
*
* Uses a unitary similarity transformation: `Q^H * A * Q = T`.
*
* If UPLO = 'upper', the matrix Q is represented as a product of elementary
* reflectors `Q = H(n-1)*...*H(2)*H(1)`, and if UPLO = 'lower', the matrix
* Q is represented as `Q = H(1)*H(2)*...*H(n-1)`.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed Hermitian matrix; on exit, overwritten with tridiagonal form and reflectors
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Float64Array} d - output array for the diagonal elements of T (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array for the off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Complex128Array} TAU - output array for the scalar factors of the reflectors (length N-1)
* @param {integer} strideTAU - stride length for `TAU` (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (in complex elements)
* @returns {integer} status code (0 = success)
*/
function zhptrd( uplo, N, AP, strideAP, offsetAP, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	var alpha;
	var tauiR;
	var tauiI;
	var i1i1;
	var tauv;
	var dot;
	var apv;
	var oAP;
	var oT;
	var ii;
	var i1;
	var tr;
	var ti;
	var i;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	apv = reinterpret( AP, 0 );
	tauv = reinterpret( TAU, 0 );
	oAP = offsetAP;

	if ( uplo === 'upper' ) {
		// Reduce the upper triangle of A.
		// i1 is the 0-based complex element index in AP where column (i+2) starts.
		// Fortran 1-based: I1 = N*(N-1)/2 + 1. JS 0-based: i1 = N*(N-1)/2
		i1 = ( N * ( N - 1 ) / 2 ) * strideAP;

		// Make the diagonal element real (Fortran: AP(I1+N-1) = DBLE(AP(I1+N-1)))
		apv[ (( oAP + i1 + ( ( N - 1 ) * strideAP ) ) * 2) + 1 ] = 0.0;

		// Fortran: DO 10 I = N-1, 1, -1 (1-based)
		for ( i = N - 2; i >= 0; i-- ) {
			// Generate elementary reflector H(i+1) = I - tau * v * v^H
			// To annihilate A(1:i, i+2) [0-based: AP at i1 through i1+i-1]

			// Fortran: ZLARFG( I, AP(I1+I-1), AP(I1), 1, TAUI )
			// alpha = AP(I1+I-1) in 1-based = AP[i1 + i*strideAP] in 0-based complex
			// Vector starts at AP(I1) in 1-based = AP[i1] in 0-based complex
			// Length I (Fortran) = i+1 (0-based)
			zlarfg( i + 1, AP, oAP + i1 + ( i * strideAP ), AP, strideAP, oAP + i1, TAU, offsetTAU + ( i * strideTAU ) );

			// E(I) = DBLE(ALPHA) — Fortran I = i+1
			e[ offsetE + ( i * strideE ) ] = apv[ ( oAP + i1 + ( i * strideAP ) ) * 2 ];

			oT = ( offsetTAU + ( i * strideTAU ) ) * 2;
			tauiR = tauv[ oT ];
			tauiI = tauv[ oT + 1 ];

			if ( tauiR !== 0.0 || tauiI !== 0.0 ) {
				// Set A(i+1, i+2) = (1.0, 0.0)
				apv[ ( oAP + i1 + ( i * strideAP ) ) * 2 ] = 1.0;
				apv[ (( oAP + i1 + ( i * strideAP ) ) * 2) + 1 ] = 0.0;

				// Compute y := tau * A * v, storing y in TAU(0:i)

				// Fortran: ZHPMV( UPLO, I, TAUI, AP, AP(I1), 1, ZERO, TAU, 1 )
				alpha = new Complex128( tauiR, tauiI );
				zhpmv( uplo, i + 1, alpha, AP, strideAP, oAP, AP, strideAP, oAP + i1, ZERO, TAU, strideTAU, offsetTAU );

				// Compute w := y - 1/2 * tau * (y^H * v) * v

				// Fortran: ALPHA = -HALF*TAUI*ZDOTC( I, TAU, 1, AP(I1), 1 )
				dot = zdotc( i + 1, TAU, strideTAU, offsetTAU, AP, strideAP, oAP + i1 );

				// alpha = -0.5 * taui * dot
				tr = real( dot );
				ti = imag( dot );

				// -0.5 * (tauiR + tauiI*j) * (tr + ti*j)

				// = -0.5 * ( (tauiR*tr - tauiI*ti) + (tauiR*ti + tauiI*tr)*j )
				alpha = new Complex128(-0.5 * ( ( tauiR * tr ) - ( tauiI * ti ) ), -0.5 * ( ( tauiR * ti ) + ( tauiI * tr ) ));

				// Fortran: ZAXPY( I, ALPHA, AP(I1), 1, TAU, 1 )
				zaxpy( i + 1, alpha, AP, strideAP, oAP + i1, TAU, strideTAU, offsetTAU );

				// Apply the transformation as a rank-2 update:

				// A := A - v * w^H - w * v^H

				// Fortran: ZHPR2( UPLO, I, -ONE, AP(I1), 1, TAU, 1, AP )
				zhpr2( uplo, i + 1, NEGONE, AP, strideAP, oAP + i1, TAU, strideTAU, offsetTAU, AP, strideAP, oAP );
			}

			// Restore AP(I1+I-1) = E(I)
			apv[ ( oAP + i1 + ( i * strideAP ) ) * 2 ] = e[ offsetE + ( i * strideE ) ];
			apv[ (( oAP + i1 + ( i * strideAP ) ) * 2) + 1 ] = 0.0;

			// D(I+1) = DBLE(AP(I1+I)) — Fortran 1-based
			d[ offsetD + ( ( i + 1 ) * strideD ) ] = apv[ ( oAP + i1 + ( ( i + 1 ) * strideAP ) ) * 2 ];

			// TAU(I) = TAUI — restore after workspace operations
			tauv[ oT ] = tauiR;
			tauv[ oT + 1 ] = tauiI;

			// Fortran: I1 = I1 - I
			i1 -= ( i + 1 ) * strideAP;
		}
		// D(1) = DBLE(AP(1)) — Fortran: D(1) = DBLE(AP(1))
		d[ offsetD ] = apv[ oAP * 2 ];
	} else {
		// Reduce the lower triangle of A.
		// ii is the 0-based complex element index in AP of A(i+1,i+1)
		ii = 0;

		// Make the diagonal element real
		apv[ (oAP * 2) + 1 ] = 0.0;

		// Fortran: DO 20 I = 1, N-1 (1-based)
		for ( i = 0; i < N - 1; i++ ) {
			// I1I1 is the index of A(i+2, i+2) in packed storage
			// Fortran: I1I1 = II + N - I + 1 where I=i+1 (1-based)
			// = II + N - i
			i1i1 = ii + ( ( N - i ) * strideAP );

			// Generate elementary reflector H(i+1)

			// Fortran: ZLARFG( N-I, AP(II+1), AP(II+2), 1, TAUI )

			// N-I (Fortran) = N-(i+1) = N-i-1

			// AP(II+1) in 1-based = AP[ii+strideAP] in 0-based complex

			// AP(II+2) in 1-based = AP[ii+2*strideAP] in 0-based complex
			zlarfg( N - i - 1, AP, oAP + ii + strideAP, AP, strideAP, oAP + ii + ( 2 * strideAP ), TAU, offsetTAU + ( i * strideTAU ) );

			// E(I) = DBLE(ALPHA)
			e[ offsetE + ( i * strideE ) ] = apv[ ( oAP + ii + strideAP ) * 2 ];

			oT = ( offsetTAU + ( i * strideTAU ) ) * 2;
			tauiR = tauv[ oT ];
			tauiI = tauv[ oT + 1 ];

			if ( tauiR !== 0.0 || tauiI !== 0.0 ) {
				// Set A(i+2, i+1) = (1.0, 0.0)
				apv[ ( oAP + ii + strideAP ) * 2 ] = 1.0;
				apv[ (( oAP + ii + strideAP ) * 2) + 1 ] = 0.0;

				// Compute y := tau * A * v, storing y in TAU(i:n-1)

				// Fortran: ZHPMV( UPLO, N-I, TAUI, AP(I1I1), AP(II+1), 1, ZERO, TAU(I), 1 )
				alpha = new Complex128( tauiR, tauiI );
				zhpmv( uplo, N - i - 1, alpha, AP, strideAP, oAP + i1i1, AP, strideAP, oAP + ii + strideAP, ZERO, TAU, strideTAU, offsetTAU + ( i * strideTAU ) );

				// Compute w := y - 1/2 * tau * (y^H * v) * v

				// Fortran: ALPHA = -HALF*TAUI*ZDOTC( N-I, TAU(I), 1, AP(II+1), 1 )
				dot = zdotc( N - i - 1, TAU, strideTAU, offsetTAU + ( i * strideTAU ), AP, strideAP, oAP + ii + strideAP );

				tr = real( dot );
				ti = imag( dot );
				alpha = new Complex128(-0.5 * ( ( tauiR * tr ) - ( tauiI * ti ) ), -0.5 * ( ( tauiR * ti ) + ( tauiI * tr ) ));

				// Fortran: ZAXPY( N-I, ALPHA, AP(II+1), 1, TAU(I), 1 )
				zaxpy( N - i - 1, alpha, AP, strideAP, oAP + ii + strideAP, TAU, strideTAU, offsetTAU + ( i * strideTAU ) );

				// Apply the transformation as a rank-2 update:

				// A := A - v * w^H - w * v^H

				// Fortran: ZHPR2( UPLO, N-I, -ONE, AP(II+1), 1, TAU(I), 1, AP(I1I1) )
				zhpr2( uplo, N - i - 1, NEGONE, AP, strideAP, oAP + ii + strideAP, TAU, strideTAU, offsetTAU + ( i * strideTAU ), AP, strideAP, oAP + i1i1 );
			}

			// Restore AP(II+1) = E(I)
			apv[ ( oAP + ii + strideAP ) * 2 ] = e[ offsetE + ( i * strideE ) ];
			apv[ (( oAP + ii + strideAP ) * 2) + 1 ] = 0.0;

			// D(I) = DBLE(AP(II))
			d[ offsetD + ( i * strideD ) ] = apv[ ( oAP + ii ) * 2 ];

			// TAU(I) = TAUI — restore after workspace operations
			tauv[ oT ] = tauiR;
			tauv[ oT + 1 ] = tauiI;

			// Fortran: II = I1I1
			ii = i1i1;
		}
		// D(N) = DBLE(AP(II))
		d[ offsetD + ( ( N - 1 ) * strideD ) ] = apv[ ( oAP + ii ) * 2 ];
	}

	return 0;
}


// EXPORTS //

export default zhptrd;
