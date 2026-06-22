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

/* eslint-disable max-len, max-params */

// MODULES //

import dlarfg from '../../dlarfg/lib/base.js';
import dspmv from '../../../../blas/base/dspmv/lib/base.js';
import dspr2 from '../../../../blas/base/dspr2/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';


// VARIABLES //

var HALF = 0.5;


// MAIN //

/**
* Reduces a real symmetric matrix in packed form to tridiagonal form.
*
* Uses an orthogonal similarity transformation: `Q^T * A * Q = T`.
*
* If UPLO = 'upper', the matrix Q is represented as a product of elementary
* reflectors `Q = H(n-1)*...*H(2)*H(1)`, and if UPLO = 'lower', the matrix
* Q is represented as `Q = H(1)*H(2)*...*H(n-1)`.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix; on exit, overwritten with tridiagonal form and reflectors
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Float64Array} d - output array for the diagonal elements of T (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array for the off-diagonal elements of T (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} TAU - output array for the scalar factors of the reflectors (length N-1)
* @param {integer} strideTAU - stride length for `TAU`
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU`
* @returns {integer} status code (0 = success)
*/
function dsptrd( uplo, N, AP, strideAP, offsetAP, d, strideD, offsetD, e, strideE, offsetE, TAU, strideTAU, offsetTAU ) {
	var alpha;
	var i1i1;
	var taui;
	var oAP;
	var ii;
	var i1;
	var i;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	oAP = offsetAP;

	if ( uplo === 'upper' ) {
		// Reduce the upper triangle of A.
		// i1 is the 0-based index in AP of A(1,I+1) in Fortran terms.
		// Fortran: I1 = N*(N-1)/2 + 1 (1-based)
		// JS 0-based: i1 = N*(N-1)/2
		i1 = ( N * ( N - 1 ) / 2 ) * strideAP;

		// Fortran: DO 10 I = N-1, 1, -1
		for ( i = N - 2; i >= 0; i-- ) {
			// Generate elementary reflector H(i) = I - tau * v * v**T
			// To annihilate A(1:i-1, i+1)

			// Fortran: DLARFG( I, AP(I1+I-1), AP(I1), 1, TAUI )
			// I (Fortran) = i+1
			// AP(I1+I-1) in 1-based → AP[i1 + i*strideAP] in 0-based (alpha)
			// AP(I1) in 1-based → AP[i1] in 0-based (start of vector)
			// Vector length for dlarfg: Fortran I = i+1
			dlarfg(i + 1, AP, oAP + i1 + ( i * strideAP ), AP, strideAP, oAP + i1, TAU, offsetTAU + ( i * strideTAU ));
			e[ offsetE + ( i * strideE ) ] = AP[ oAP + i1 + ( i * strideAP ) ];

			taui = TAU[ offsetTAU + ( i * strideTAU ) ];

			if ( taui !== 0.0 ) {
				// Set A(i,i+1) = 1 (the element that was alpha)
				AP[ oAP + i1 + ( i * strideAP ) ] = 1.0;

				// Compute y := tau * A * v, storing y in TAU(1:i)

				// Fortran: DSPMV( UPLO, I, TAUI, AP, AP(I1), 1, ZERO, TAU, 1 )

				// I (Fortran) = i+1
				dspmv(uplo, i + 1, taui, AP, strideAP, oAP, AP, strideAP, oAP + i1, 0.0, TAU, strideTAU, offsetTAU);

				// Compute w := y - 1/2 * tau * (y**T * v) * v

				// Fortran: ALPHA = -HALF*TAUI*DDOT( I, TAU, 1, AP(I1), 1 )
				alpha = -( HALF * taui ) * ddot(i + 1, TAU, strideTAU, offsetTAU, AP, strideAP, oAP + i1);

				// Fortran: DAXPY( I, ALPHA, AP(I1), 1, TAU, 1 )
				daxpy(i + 1, alpha, AP, strideAP, oAP + i1, TAU, strideTAU, offsetTAU);

				// Apply the transformation as a rank-2 update:

				//   A := A - v * w**T - w * v**T

				// Fortran: DSPR2( UPLO, I, -ONE, AP(I1), 1, TAU, 1, AP )
				dspr2(uplo, i + 1, -1.0, AP, strideAP, oAP + i1, TAU, strideTAU, offsetTAU, AP, strideAP, oAP);

				// Restore AP(I1+I-1) = E(I)
				AP[ oAP + i1 + ( i * strideAP ) ] = e[ offsetE + ( i * strideE ) ];
			}
			// D(I+1) = AP(I1+I) in Fortran (1-based)
			// 0-based: d[i+1] = AP[i1 + (i+1)*strideAP]
			// But AP(I1+I) in 1-based = AP[i1 + i*strideAP + strideAP] in 0-based
			// Since i1 is already 0-based, AP(I1+I) = AP[i1 + i*strideAP + strideAP - strideAP]
			// Wait: Fortran I1+I, where I=i+1 → I1+I = (i1/strideAP + 1) + (i+1) in 1-based
			// Let me just track: Fortran AP(I1+I) where I1 is 1-based index.
			// I1 (1-based) = i1/strideAP + 1
			// So AP(I1+I) in 1-based = AP[(i1/strideAP + 1) + (i+1) - 1] in 0-based
			//   = AP[i1/strideAP + i + 1] in 0-based
			//   = AP[oAP + (i1/strideAP + i + 1)*strideAP] — no, offsets are already element offsets
			// Simpler: i1 = base offset in elements (0-based). Fortran index offset from I1 is I-1 for 0-based.
			// AP(I1 + I) in Fortran 1-based → index (I1-1) + I in 0-based = i1/strideAP + I
			// But I (Fortran) = i+1, so: i1/strideAP + i + 1
			// As byte offset: oAP + i1 + (i+1)*strideAP
			d[ offsetD + ( ( i + 1 ) * strideD ) ] = AP[ oAP + i1 + ( ( i + 1 ) * strideAP ) ];
			TAU[ offsetTAU + ( i * strideTAU ) ] = taui;

			// Fortran: I1 = I1 - I → JS: i1 = i1 - (i+1)*strideAP
			i1 -= ( i + 1 ) * strideAP;
		}
		// D(1) = AP(1) in Fortran → d[0] = AP[oAP]
		d[ offsetD ] = AP[ oAP ];
	} else {
		// Reduce the lower triangle of A.
		// II is the 0-based index in AP of A(i,i).
		// Fortran: II = 1 (1-based) → JS: ii = 0
		ii = 0;

		// Fortran: DO 20 I = 1, N-1
		for ( i = 0; i < N - 1; i++ ) {
			// I1I1 is the index of A(i+1,i+1) in packed storage.
			// Fortran: I1I1 = II + N - I + 1 (1-based, I = i+1)
			// 0-based: i1i1 = ii + (N - (i+1)) + 1 = ii + N - i
			// But we need element offsets: i1i1 = ii + (N - i) * strideAP
			// Wait, Fortran: I1I1 = II + N - I + 1 where II is 1-based, I is 1-based (i+1)
			// = II + N - (i+1) + 1 = II + N - i
			// 0-based: i1i1 = ii + (N - i) * strideAP
			i1i1 = ii + ( ( N - i ) * strideAP );

			// Generate elementary reflector H(i) = I - tau * v * v**T

			// To annihilate A(i+2:n, i)

			// Fortran: DLARFG( N-I, AP(II+1), AP(II+2), 1, TAUI )

			// N-I (Fortran) = N - (i+1) = N - i - 1

			// AP(II+1) in 1-based → AP[ii + strideAP] in 0-based

			// AP(II+2) in 1-based → AP[ii + 2*strideAP] in 0-based
			dlarfg(N - i - 1, AP, oAP + ii + strideAP, AP, strideAP, oAP + ii + ( 2 * strideAP ), TAU, offsetTAU + ( i * strideTAU ));
			e[ offsetE + ( i * strideE ) ] = AP[ oAP + ii + strideAP ];

			taui = TAU[ offsetTAU + ( i * strideTAU ) ];

			if ( taui !== 0.0 ) {
				// Set A(i+1, i) = 1
				AP[ oAP + ii + strideAP ] = 1.0;

				// Compute y := tau * A * v, storing y in TAU(i:n-1)

				// Fortran: DSPMV( UPLO, N-I, TAUI, AP(I1I1), AP(II+1), 1, ZERO, TAU(I), 1 )
				dspmv(uplo, N - i - 1, taui, AP, strideAP, oAP + i1i1, AP, strideAP, oAP + ii + strideAP, 0.0, TAU, strideTAU, offsetTAU + ( i * strideTAU ));

				// Compute w := y - 1/2 * tau * (y**T * v) * v

				// Fortran: ALPHA = -HALF*TAUI*DDOT( N-I, TAU(I), 1, AP(II+1), 1 )
				alpha = -( HALF * taui ) * ddot(N - i - 1, TAU, strideTAU, offsetTAU + ( i * strideTAU ), AP, strideAP, oAP + ii + strideAP);

				// Fortran: DAXPY( N-I, ALPHA, AP(II+1), 1, TAU(I), 1 )
				daxpy(N - i - 1, alpha, AP, strideAP, oAP + ii + strideAP, TAU, strideTAU, offsetTAU + ( i * strideTAU ));

				// Apply the transformation as a rank-2 update:

				//   A := A - v * w**T - w * v**T

				// Fortran: DSPR2( UPLO, N-I, -ONE, AP(II+1), 1, TAU(I), 1, AP(I1I1) )
				dspr2(uplo, N - i - 1, -1.0, AP, strideAP, oAP + ii + strideAP, TAU, strideTAU, offsetTAU + ( i * strideTAU ), AP, strideAP, oAP + i1i1);

				// Restore AP(II+1) = E(I)
				AP[ oAP + ii + strideAP ] = e[ offsetE + ( i * strideE ) ];
			}
			// D(I) = AP(II) in Fortran → d[i] = AP[oAP + ii]
			d[ offsetD + ( i * strideD ) ] = AP[ oAP + ii ];
			TAU[ offsetTAU + ( i * strideTAU ) ] = taui;

			// Fortran: II = I1I1
			ii = i1i1;
		}
		// D(N) = AP(II) in Fortran → d[N-1] = AP[oAP + ii]
		d[ offsetD + ( ( N - 1 ) * strideD ) ] = AP[ oAP + ii ];
	}

	return 0;
}


// EXPORTS //

export default dsptrd;
