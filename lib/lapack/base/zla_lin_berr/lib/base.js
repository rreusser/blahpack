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
* @param {integer} strideRES - element stride for `res` (in complex elements)
* @param {NonNegativeInteger} offsetRES - starting complex index for `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {integer} strideAYB - element stride for `ayb`
* @param {NonNegativeInteger} offsetAYB - starting index for `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @param {integer} strideBERR - stride length for `berr`
* @param {NonNegativeInteger} offsetBERR - starting index for `berr`
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( N, nz, nrhs, res, strideRES, offsetRES, ayb, strideAYB, offsetAYB, berr, strideBERR, offsetBERR ) { // eslint-disable-line max-len, max-params
	var resView;
	var safe1;
	var sRx2;
	var oRx2;
	var bmax;
	var tmp;
	var re;
	var im;
	var iR;
	var iA;
	var ib;
	var k;
	var i;
	var j;

	// Quick return...
	if ( nrhs <= 0 ) {
		return berr;
	}

	// Reinterpret the complex residual array as a `Float64Array` view (zero-copy):
	resView = reinterpret( res, 0 );
	sRx2 = strideRES * 2;
	oRx2 = offsetRES * 2;

	// Guard term added to the numerator to avoid spuriously zero residuals:
	safe1 = ( nz + 1 ) * SAFE_MIN;

	ib = offsetBERR;
	for ( j = 0; j < nrhs; j++ ) {
		bmax = 0.0;
		k = j * N;
		iR = oRx2 + ( k * sRx2 );
		iA = offsetAYB + ( k * strideAYB );
		for ( i = 0; i < N; i++ ) {
			if ( ayb[ iA ] !== 0.0 ) {
				// `CABS1(res) = |re| + |im|` — LAPACK's fast 1-norm modulus:
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
			iR += sRx2;
			iA += strideAYB;
		}
		berr[ ib ] = bmax;
		ib += strideBERR;
	}
	return berr;
}


// EXPORTS //

export default zlaLinBerr;
