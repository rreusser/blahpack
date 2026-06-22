/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, @cspell/spellchecker */

// VARIABLES //

var floor = Math.floor;
var abs = Math.abs;
var max = Math.max;
var ln = Math.log;


// MAIN //

/**
* Refines eigenvalue approximations of a symmetric tridiagonal matrix using bisection given initial intervals.
*
* ## Notes
*
* -   Given initial eigenvalue approximations in `w` with error bounds in `WERR`, the routine performs bisection to refine eigenvalues `ifirst` through `ilast`.
* -   During bisection, intervals `[left, right]` are maintained by storing their midpoints and semi-widths in `w` and `WERR`.
* -   Uses 1-based internal indexing matching Fortran conventions. The parameters `ifirst`, `ilast`, and `offset` are 1-based eigenvalue indices.
*
* @private
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal elements of T, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} E2 - squares of the subdiagonal elements of T, length N-1
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {integer} ifirst - index of the first eigenvalue to be computed (1-based)
* @param {integer} ilast - index of the last eigenvalue to be computed (1-based)
* @param {number} rtol - tolerance for convergence of bisection intervals
* @param {integer} offset - offset for the arrays w and WERR
* @param {Float64Array} w - eigenvalue approximations (in/out), length N
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} WERR - error estimates for eigenvalues (in/out), length N
* @param {integer} strideWERR - stride length for `WERR`
* @param {NonNegativeInteger} offsetWERR - starting index for `WERR`
* @param {Float64Array} WORK - workspace array, length 2*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {Int32Array} IWORK - integer workspace array, length 2*N
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @param {number} pivmin - minimum pivot in the Sturm sequence for T
* @param {number} spdiam - spectral diameter of T
* @returns {integer} info - 0 on success
*/
function dlarrj( N, d, strideD, offsetD, E2, strideE2, offsetE2, ifirst, ilast, rtol, offset, w, strideW, offsetW, WERR, strideWERR, offsetWERR, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, pivmin, spdiam ) {
	var OLNINT;
	var MAXITR;
	var dplus;
	var right;
	var SAVI1;
	var width;
	var left;
	var NINT;
	var PREV;
	var NEXT;
	var iter;
	var info;
	var mid;
	var cnt;
	var fac;
	var tmp;
	var oD;
	var sD;
	var I1;
	var I2;
	var II;
	var I;
	var J;
	var K;
	var P;
	var s;

	oD = offsetD;
	sD = strideD;
	info = 0;

	// Quick return if possible:
	if ( N <= 0 ) {
		return info;
	}

	MAXITR = floor( ( ( ln( spdiam + pivmin ) ) - ln( pivmin ) ) / ln( 2.0 ) ) + 2;

	// Initialize unconverged intervals in WORK and IWORK. All indices are 1-based.

	I1 = ifirst;
	I2 = ilast;
	NINT = 0;
	PREV = 0;

	for ( I = I1; I <= I2; I += 1 ) {
		K = 2 * I;
		II = I - offset;
		left = w[ offsetW + ((II - 1) * strideW) ] - WERR[ offsetWERR + ((II - 1) * strideWERR) ];
		mid = w[ offsetW + ((II - 1) * strideW) ];
		right = w[ offsetW + ((II - 1) * strideW) ] + WERR[ offsetWERR + ((II - 1) * strideWERR) ];
		width = right - mid;
		tmp = max( abs( left ), abs( right ) );

		if ( width < ( rtol * tmp ) ) {
			// This interval has already converged. Remove it from the list.
			IWORK[ offsetIWORK + ((K - 2) * strideIWORK) ] = -1;

			// Make sure that I1 always points to the first unconverged interval:
			if ( I === I1 && I < I2 ) {
				I1 = I + 1;
			}
			if ( PREV >= I1 && I <= I2 ) {
				IWORK[ offsetIWORK + (((2 * PREV) - 2) * strideIWORK) ] = I + 1;
			}
		} else {
			// Unconverged interval found:
			PREV = I;

			// Make sure that [LEFT,RIGHT] contains the desired eigenvalue.

			// Do while( CNT(LEFT) > I-1 ):
			fac = 1.0;
			while ( true ) {
				cnt = 0;
				s = left;
				dplus = d[ oD ] - s;
				if ( dplus < 0.0 ) {
					cnt += 1;
				}
				for ( J = 2; J <= N; J += 1 ) {
					dplus = d[ oD + ((J - 1) * sD) ] - s - ( E2[ offsetE2 + ((J - 2) * strideE2) ] / dplus );
					if ( dplus < 0.0 ) {
						cnt += 1;
					}
				}
				if ( cnt > I - 1 ) {
					left -= WERR[ offsetWERR + ((II - 1) * strideWERR) ] * fac;
					fac *= 2.0;
				} else {
					break;
				}
			}

			// Do while( CNT(RIGHT) < I ):
			fac = 1.0;
			while ( true ) {
				cnt = 0;
				s = right;
				dplus = d[ oD ] - s;
				if ( dplus < 0.0 ) {
					cnt += 1;
				}
				for ( J = 2; J <= N; J += 1 ) {
					dplus = d[ oD + ((J - 1) * sD) ] - s - ( E2[ offsetE2 + ((J - 2) * strideE2) ] / dplus );
					if ( dplus < 0.0 ) {
						cnt += 1;
					}
				}
				if ( cnt < I ) {
					right += WERR[ offsetWERR + ((II - 1) * strideWERR) ] * fac;
					fac *= 2.0;
				} else {
					break;
				}
			}
			NINT += 1;
			IWORK[ offsetIWORK + ((K - 2) * strideIWORK) ] = I + 1;
			IWORK[ offsetIWORK + ((K - 1) * strideIWORK) ] = cnt;
		}

		// Store left and right endpoints:
		WORK[ offsetWORK + ((K - 2) * strideWORK) ] = left;
		WORK[ offsetWORK + ((K - 1) * strideWORK) ] = right;
	}

	SAVI1 = I1;

	// Iterate while there are still unconverged intervals and ITER <= MAXITR:
	iter = 0;
	while ( NINT > 0 && iter <= MAXITR ) {
		PREV = I1 - 1;
		I = I1;
		OLNINT = NINT;

		for ( P = 1; P <= OLNINT; P += 1 ) {
			K = 2 * I;
			II = I - offset;
			NEXT = IWORK[ offsetIWORK + ((K - 2) * strideIWORK) ];
			left = WORK[ offsetWORK + ((K - 2) * strideWORK) ];
			right = WORK[ offsetWORK + ((K - 1) * strideWORK) ];
			mid = 0.5 * ( left + right );

			// Semiwidth of interval:
			width = right - mid;
			tmp = max( abs( left ), abs( right ) );

			if ( width < ( rtol * tmp ) || iter === MAXITR ) {
				// Reduce number of unconverged intervals:
				NINT -= 1;

				// Mark interval as converged:
				IWORK[ offsetIWORK + ((K - 2) * strideIWORK) ] = 0;
				if ( I1 === I ) {
					I1 = NEXT;
				} else if ( PREV >= I1 ) {
					// PREV holds the last unconverged interval previously examined:
					IWORK[ offsetIWORK + (((2 * PREV) - 2) * strideIWORK) ] = NEXT;
				}
				I = NEXT;
				continue;
			}
			PREV = I;

			// Perform one bisection step:
			cnt = 0;
			s = mid;
			dplus = d[ oD ] - s;
			if ( dplus < 0.0 ) {
				cnt += 1;
			}
			for ( J = 2; J <= N; J += 1 ) {
				dplus = d[ oD + ((J - 1) * sD) ] - s - ( E2[ offsetE2 + ((J - 2) * strideE2) ] / dplus );
				if ( dplus < 0.0 ) {
					cnt += 1;
				}
			}
			if ( cnt <= I - 1 ) {
				WORK[ offsetWORK + ((K - 2) * strideWORK) ] = mid;
			} else {
				WORK[ offsetWORK + ((K - 1) * strideWORK) ] = mid;
			}
			I = NEXT;
		}
		iter += 1;
	}

	// At this point, all the intervals have converged.
	// Update W and WERR with refined values:
	for ( I = SAVI1; I <= ilast; I += 1 ) {
		K = 2 * I;
		II = I - offset;

		// All intervals marked by 0 have been refined:
		if ( IWORK[ offsetIWORK + ((K - 2) * strideIWORK) ] === 0 ) {
			w[ offsetW + ((II - 1) * strideW) ] = 0.5 * ( WORK[ offsetWORK + ((K - 2) * strideWORK) ] + WORK[ offsetWORK + ((K - 1) * strideWORK) ] );
			WERR[ offsetWERR + ((II - 1) * strideWERR) ] = WORK[ offsetWORK + ((K - 1) * strideWORK) ] - w[ offsetW + ((II - 1) * strideW) ];
		}
	}

	return info;
}


// EXPORTS //

export default dlarrj;
