/* eslint-disable max-len, max-params */

// MODULES //

import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var FUDGE = 2.0;
var HALF = 0.5;
var EPS = dlamch( 'precision' );


// MAIN //

/**
* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy via bisection.
*
* ## Notes
*
* -   Helper for `dlarrd`. Given the tridiagonal matrix `T` represented by its
*     diagonal `D` and the squared off-diagonal `E2`, refines the `iw`-th
*     eigenvalue (1-based index) in the initial interval `(gl, gu]` to the
*     requested relative accuracy `reltol`.
*
* -   On return, `w[0]` contains the refined eigenvalue and `werr[0]` contains
*     a semi-width of its uncertainty interval.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {integer} iw - 1-based index of the eigenvalue to compute
* @param {number} gl - lower bound of the initial interval
* @param {number} gu - upper bound of the initial interval
* @param {Float64Array} D - diagonal elements (length `N`)
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} E2 - squared off-diagonal elements (length `N-1`)
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {number} reltol - relative tolerance for the returned eigenvalue
* @param {Float64Array} w - output array for the computed eigenvalue (length >= 1)
* @param {Float64Array} werr - output array for the error bound (length >= 1)
* @returns {integer} info - status code (0 = success, -1 = did not converge)
*/
function dlarrk( N, iw, gl, gu, D, strideD, offsetD, E2, strideE2, offsetE2, pivmin, reltol, w, werr ) {
	var negcnt;
	var itmax;
	var atoli;
	var rtoli;
	var right;
	var tnorm;
	var info;
	var left;
	var tmp1;
	var tmp2;
	var mid;
	var it;
	var i;

	// Quick return:
	if ( N <= 0 ) {
		w[ 0 ] = HALF * ( gl + gu );
		werr[ 0 ] = 0.0;
		return 0;
	}

	tnorm = Math.max( Math.abs( gl ), Math.abs( gu ) );
	rtoli = reltol;
	atoli = FUDGE * 2.0 * pivmin;

	itmax = ( ( Math.log( tnorm + pivmin ) - Math.log( pivmin ) ) / Math.log( 2.0 ) ) | 0;
	itmax += 2;

	info = -1;

	left = gl - ( FUDGE * tnorm * EPS * N ) - ( FUDGE * 2.0 * pivmin );
	right = gu + ( FUDGE * tnorm * EPS * N ) + ( FUDGE * 2.0 * pivmin );
	it = 0;

	for ( ;; ) {
		tmp1 = Math.abs( right - left );
		tmp2 = Math.max( Math.abs( right ), Math.abs( left ) );
		if ( tmp1 < Math.max( atoli, pivmin, rtoli * tmp2 ) ) {
			info = 0;
			break;
		}
		if ( it > itmax ) {
			break;
		}

		it += 1;
		mid = HALF * ( left + right );
		negcnt = 0;
		tmp1 = D[ offsetD ] - mid;
		if ( Math.abs( tmp1 ) < pivmin ) {
			tmp1 = -pivmin;
		}
		if ( tmp1 <= 0.0 ) {
			negcnt += 1;
		}
		for ( i = 1; i < N; i += 1 ) {
			tmp1 = D[ offsetD + ( i * strideD ) ] - ( E2[ offsetE2 + ( ( i - 1 ) * strideE2 ) ] / tmp1 ) - mid;
			if ( Math.abs( tmp1 ) < pivmin ) {
				tmp1 = -pivmin;
			}
			if ( tmp1 <= 0.0 ) {
				negcnt += 1;
			}
		}
		if ( negcnt >= iw ) {
			right = mid;
		} else {
			left = mid;
		}
	}

	w[ 0 ] = HALF * ( left + right );
	werr[ 0 ] = HALF * Math.abs( right - left );

	return info;
}


// EXPORTS //

export default dlarrk;
