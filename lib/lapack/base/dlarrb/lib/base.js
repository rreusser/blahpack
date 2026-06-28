/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import dlaneg from './../../../../lapack/base/dlaneg/lib/base.js';


// VARIABLES //

var floor = Math.floor;
var abs = Math.abs;
var max = Math.max;
var min = Math.min;
var ln = Math.log;


// MAIN //

/**
* Provides limited bisection to locate eigenvalues of a symmetric tridiagonal matrix `T` for more accuracy.
*
* ## Notes
*
* -   The matrix `T` is represented by its factorization `T - sigma*I = L*D*L^T`, where the factor `D` is stored in `d` and the off-diagonal squared terms `L(i)^2 * D(i)` are stored in `LLD`.
* -   Given initial eigenvalue approximations in `w` with error bounds in `WERR`, the routine performs bisection using `dlaneg` Sturm counts to refine eigenvalues `ifirst` through `ilast`.
* -   The parameters `ifirst`, `ilast`, and `offset` are 1-based eigenvalue indices matching the Fortran reference.
* -   `twist` selects a twist index for the factorization; values outside `[1,N]` default to `N`.
*
* @private
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - `N` diagonal elements of the diagonal factor `D`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} LLD - `N-1` elements `L(i)*L(i)*D(i)`
* @param {integer} strideLLD - stride length for `LLD`
* @param {NonNegativeInteger} offsetLLD - starting index for `LLD`
* @param {integer} ifirst - index of the first eigenvalue to be refined (1-based)
* @param {integer} ilast - index of the last eigenvalue to be refined (1-based)
* @param {number} rtol1 - relative tolerance w.r.t. the eigenvalue gap
* @param {number} rtol2 - relative tolerance w.r.t. `max(|left|,|right|)`
* @param {integer} offset - offset for `w`, `WGAP`, and `WERR` (1-based eigenvalue indices map to slot `i-offset`)
* @param {Float64Array} w - eigenvalue approximations (in/out)
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} WGAP - estimated gaps between consecutive eigenvalues (in/out)
* @param {integer} strideWGAP - stride length for `WGAP`
* @param {NonNegativeInteger} offsetWGAP - starting index for `WGAP`
* @param {Float64Array} WERR - error estimates for eigenvalues (in/out)
* @param {integer} strideWERR - stride length for `WERR`
* @param {NonNegativeInteger} offsetWERR - starting index for `WERR`
* @param {Float64Array} WORK - workspace array of length `2*N`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array of length `2*N`
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @param {number} pivmin - minimum pivot in the Sturm sequence for `T`
* @param {number} spdiam - spectral diameter of `T`
* @param {integer} twist - twist index for twisted factorization
* @returns {integer} info - `0` on success
*/
function dlarrb( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, ifirst, ilast, rtol1, rtol2, offset, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork, pivmin, spdiam, twist ) {
	var OLNINT;
	var MAXITR;
	var NEGCNT;
	var MNWDTH;
	var CVRGD;
	var right;
	var width;
	var NINT;
	var LGAP;
	var RGAP;
	var PREV;
	var NEXT;
	var back;
	var left;
	var iter;
	var info;
	var mid;
	var gap;
	var tmp;
	var I1;
	var II;
	var IP;
	var R;
	var I;
	var K;

	info = 0;

	// Quick return if possible:
	if ( N <= 0 ) {
		return info;
	}

	MAXITR = floor( ( ln( spdiam + pivmin ) - ln( pivmin ) ) / ln( 2.0 ) ) + 2;
	MNWDTH = 2.0 * pivmin;

	R = twist;
	if ( R < 1 || R > N ) {
		R = N;
	}

	// Initialize unreduced intervals. In IWORK(2*I-1) the number of the last
	// Unconverged interval is stored. IWORK(2*I) is set to one if the
	// Interval at I is no longer considered to be unreduced (converged).
	I1 = ifirst;
	NINT = 0;
	PREV = 0;

	RGAP = WGAP[ offsetWGAP + ((I1 - offset - 1) * strideWGAP) ];
	for ( I = I1; I <= ilast; I += 1 ) {
		K = 2 * I;
		II = I - offset;
		left = w[ offsetW + ((II - 1) * strideW) ] - WERR[ offsetWERR + ((II - 1) * strideWERR) ];
		right = w[ offsetW + ((II - 1) * strideW) ] + WERR[ offsetWERR + ((II - 1) * strideWERR) ];
		LGAP = RGAP;
		RGAP = WGAP[ offsetWGAP + ((II - 1) * strideWGAP) ];
		gap = min( LGAP, RGAP );

		// Make sure that [LEFT,RIGHT] contains the desired eigenvalue.

		// Compute negcount from dstqds facto L+D+L+^T = L D L^T - LEFT.

		// Do while( NEGCNT(LEFT) > I-1 ):
		back = WERR[ offsetWERR + ((II - 1) * strideWERR) ];
		while ( true ) {
			NEGCNT = dlaneg( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, left, pivmin, R );
			if ( NEGCNT > I - 1 ) {
				left -= back;
				back *= 2.0;
			} else {
				break;
			}
		}

		// Do while( NEGCNT(RIGHT) < I ):
		// Compute negcount from dstqds facto L+D+L+^T = L D L^T - RIGHT.
		back = WERR[ offsetWERR + ((II - 1) * strideWERR) ];
		while ( true ) {
			NEGCNT = dlaneg( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, right, pivmin, R );
			if ( NEGCNT < I ) {
				right += back;
				back *= 2.0;
			} else {
				break;
			}
		}
		width = 0.5 * abs( left - right );
		tmp = max( abs( left ), abs( right ) );
		CVRGD = max( rtol1 * gap, rtol2 * tmp );
		if ( width <= CVRGD || width <= MNWDTH ) {
			// This interval has already converged and does not need refinement.
			// (Remove the interval from the list).
			IWORK[ offsetIWork + ((K - 2) * strideIWork) ] = -1;

			// Make sure that I1 always points to the first unconverged interval:
			if ( I === I1 && I < ilast ) {
				I1 = I + 1;
			}
			if ( PREV >= I1 && I <= ilast ) {
				IWORK[ offsetIWork + (((2 * PREV) - 2) * strideIWork) ] = I + 1;
			}
		} else {
			// Unconverged interval found:
			PREV = I;
			NINT += 1;
			IWORK[ offsetIWork + ((K - 2) * strideIWork) ] = I + 1;
			IWORK[ offsetIWork + ((K - 1) * strideIWork) ] = NEGCNT;
		}
		WORK[ offsetWork + ((K - 2) * strideWork) ] = left;
		WORK[ offsetWork + ((K - 1) * strideWork) ] = right;
	}

	// Do while( any unconverged intervals remain ):
	iter = 0;
	while ( true ) {
		PREV = I1 - 1;
		I = I1;
		OLNINT = NINT;

		for ( IP = 1; IP <= OLNINT; IP += 1 ) {
			K = 2 * I;
			II = I - offset;
			RGAP = WGAP[ offsetWGAP + ((II - 1) * strideWGAP) ];
			LGAP = RGAP;
			if ( II > 1 ) {
				LGAP = WGAP[ offsetWGAP + ((II - 2) * strideWGAP) ];
			}
			gap = min( LGAP, RGAP );
			NEXT = IWORK[ offsetIWork + ((K - 2) * strideIWork) ];
			left = WORK[ offsetWork + ((K - 2) * strideWork) ];
			right = WORK[ offsetWork + ((K - 1) * strideWork) ];
			mid = 0.5 * ( left + right );

			// Semiwidth of interval:
			width = right - mid;
			tmp = max( abs( left ), abs( right ) );
			CVRGD = max( rtol1 * gap, rtol2 * tmp );
			if ( width <= CVRGD || width <= MNWDTH || iter === MAXITR ) {
				// Reduce number of unconverged intervals:
				NINT -= 1;

				// Mark interval as converged:
				IWORK[ offsetIWork + ((K - 2) * strideIWork) ] = 0;
				if ( I1 === I ) {
					I1 = NEXT;
				} else if ( PREV >= I1 ) {
					// PREV holds the last unconverged interval previously examined:
					IWORK[ offsetIWork + (((2 * PREV) - 2) * strideIWork) ] = NEXT;
				}
				I = NEXT;
				continue;
			}
			PREV = I;

			// Perform one bisection step:
			NEGCNT = dlaneg( N, d, strideD, offsetD, LLD, strideLLD, offsetLLD, mid, pivmin, R );
			if ( NEGCNT <= I - 1 ) {
				WORK[ offsetWork + ((K - 2) * strideWork) ] = mid;
			} else {
				WORK[ offsetWork + ((K - 1) * strideWork) ] = mid;
			}
			I = NEXT;
		}
		iter += 1;
		if ( !( NINT > 0 && iter <= MAXITR ) ) {
			break;
		}
	}

	// At this point, all the intervals have converged.
	for ( I = ifirst; I <= ilast; I += 1 ) {
		K = 2 * I;
		II = I - offset;

		// All intervals marked by '0' have been refined:
		if ( IWORK[ offsetIWork + ((K - 2) * strideIWork) ] === 0 ) {
			w[ offsetW + ((II - 1) * strideW) ] = 0.5 * ( WORK[ offsetWork + ((K - 2) * strideWork) ] + WORK[ offsetWork + ((K - 1) * strideWork) ] );
			WERR[ offsetWERR + ((II - 1) * strideWERR) ] = WORK[ offsetWork + ((K - 1) * strideWork) ] - w[ offsetW + ((II - 1) * strideW) ];
		}
	}

	for ( I = ifirst + 1; I <= ilast; I += 1 ) {
		II = I - offset;
		tmp = w[ offsetW + ((II - 1) * strideW) ] - WERR[ offsetWERR + ((II - 1) * strideWERR) ] - w[ offsetW + ((II - 2) * strideW) ] - WERR[ offsetWERR + ((II - 2) * strideWERR) ];
		WGAP[ offsetWGAP + ((II - 2) * strideWGAP) ] = max( 0.0, tmp );
	}

	return info;
}


// EXPORTS //

export default dlarrb;
