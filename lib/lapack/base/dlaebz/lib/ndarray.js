
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the number of eigenvalues of a symmetric tridiagonal matrix T.
* less than or equal to a given value, and performs bisection iteration.
*
* IJOB=1: Compute NAB for the initial intervals.
* IJOB=2: Perform bisection iteration to find eigenvalues of T.
* IJOB=3: Perform bisection iteration to invert N(w).
*
* @param {integer} ijob - specifies what is to be done (1, 2, or 3)
* @param {integer} nitmax - maximum number of bisection levels
* @param {NonNegativeInteger} N - dimension of the tridiagonal matrix
* @param {integer} mmax - maximum number of intervals
* @param {integer} minp - initial number of intervals
* @param {integer} nbmin - smallest number of intervals for vector loop
* @param {number} abstol - minimum absolute width of an interval
* @param {number} reltol - minimum relative width of an interval
* @param {number} pivmin - minimum absolute value of a pivot
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements, length N
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @param {Float64Array} E2 - squares of off-diagonal elements, length N
* @param {integer} strideE2 - stride for E2
* @param {NonNegativeInteger} offsetE2 - starting index for E2
* @param {Int32Array} NVAL - desired eigenvalue counts (IJOB=3 only)
* @param {integer} strideNVAL - stride for NVAL
* @param {NonNegativeInteger} offsetNVAL - starting index for NVAL
* @param {Float64Array} AB - interval endpoints, shape [MMAX, 2]
* @param {integer} strideAB1 - first dimension stride for AB
* @param {integer} strideAB2 - second dimension stride for AB
* @param {NonNegativeInteger} offsetAB - starting index for AB
* @param {Float64Array} c - search points / midpoints
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - starting index for c
* @param {Int32Array} mout - output: number of eigenvalues/intervals (mout[0])
* @param {Int32Array} NAB - eigenvalue counts at interval endpoints, shape [MMAX, 2]
* @param {integer} strideNAB1 - first dimension stride for NAB
* @param {integer} strideNAB2 - second dimension stride for NAB
* @param {NonNegativeInteger} offsetNAB - starting index for NAB
* @param {Float64Array} WORK - workspace, length MMAX
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {Int32Array} IWORK - workspace, length MMAX
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @returns {integer} info: 0=all converged, 1..MMAX=non-converged count, MMAX+1=overflow
*/
function dlaebz( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, NVAL, strideNVAL, offsetNVAL, AB, strideAB1, strideAB2, offsetAB, c, strideC, offsetC, mout, NAB, strideNAB1, strideNAB2, offsetNAB, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	var minWork = Math.max( 1, mmax );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, WORK ? WORK.length : 0 ) );
	}
	return base( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, NVAL, strideNVAL, offsetNVAL, AB, strideAB1, strideAB2, offsetAB, c, strideC, offsetC, mout, NAB, strideNAB1, strideNAB2, offsetNAB, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaebz;
