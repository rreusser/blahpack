/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import SAFE_MIN from '@stdlib/constants/float64/smallest-normal/lib/index.js';


// MAIN //

/**
* Computes a component-wise relative backward error.
*
* ## Notes
*
* -   Computes `max(i) ( |R(i)| / ( |op(A_s)|*|Y| + |B_s| )(i) )` for each
*     right-hand side, where `|z| = |re(z)| + |im(z)|` (CABS1) is LAPACK's
*     fast 1-norm modulus used for error bounds.
*
* -   A guard term `(nz+1)*safmin` is added to the numerator to avoid
*     spuriously zero residuals; entries with `AYB(i,j) == 0` are skipped.
*
* -   `res` is a `Complex128Array` viewed via `reinterpret` (strides and
*     offset are doubled for `Float64Array` access). `ayb` is a
*     `Float64Array`. Both matrices are accessed in column-major order
*     with implied leading dimension `N`; element `(i,j)` sits at linear
*     index `i + j*N` scaled by the supplied stride.
*
* @private
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - sparsity guard parameter (`(nz+1)*safmin` added to numerator)
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} res - residual matrix, dimension `(N, nrhs)`
* @param {integer} strideRES1 - stride of the first dimension of `res` (in complex elements)
* @param {integer} strideRES2 - stride of the second dimension of `res` (in complex elements)
* @param {NonNegativeInteger} offsetRES - starting complex index for `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {integer} strideAYB1 - stride of the first dimension of `ayb`
* @param {integer} strideAYB2 - stride of the second dimension of `ayb`
* @param {NonNegativeInteger} offsetAYB - starting index for `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @param {integer} strideBERR - stride length for `berr`
* @param {NonNegativeInteger} offsetBERR - starting index for `berr`
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR ) { // eslint-disable-line max-len, max-params
	let bmax, tmp, re, im, iR, iA, jres, jayb, ib, i, j;

	// Quick return...
	if ( N <= 0 || nrhs <= 0 ) {
		return berr;
	}

	// Reinterpret the complex residual array as a `Float64Array` view (zero-copy):
	const resView = reinterpret( res, 0 );

	// Guard term added to the numerator to avoid spuriously zero residuals:
	const safe1 = ( nz + 1 ) * SAFE_MIN;

	ib = offsetBERR;
	for ( j = 0; j < nrhs; j++ ) {
		bmax = 0.0;
		jres = offsetRES + ( j * strideRES2 );
		jayb = offsetAYB + ( j * strideAYB2 );
		for ( i = 0; i < N; i++ ) {
			iA = jayb + ( i * strideAYB1 );
			if ( ayb[ iA ] !== 0.0 ) {
				// `CABS1(res) = |re| + |im|` — LAPACK's fast 1-norm modulus:
				iR = ( jres + ( i * strideRES1 ) ) * 2;
				re = resView[ iR ];
				im = resView[ iR + 1 ];
				if ( re < 0.0 ) {
					re = -re;
				}
				if ( im < 0.0 ) {
					im = -im;
				}
				tmp = ( safe1 + re + im ) / ayb[ iA ];
				if ( tmp > bmax ) {
					bmax = tmp;
				}
			}
		}
		berr[ ib ] = bmax;
		ib += strideBERR;
	}
	return berr;
}


// EXPORTS //

export default zlaLinBerr;
