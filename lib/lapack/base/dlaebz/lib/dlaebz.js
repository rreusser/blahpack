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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Computes the number of eigenvalues of a real symmetric tridiagonal matrix which are less than or equal to a given value, and performs other tasks required by the routine sstebz.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {integer} ijob - specifies what is to be done: = 1: Compute NAB for the initial intervals. = 2: Perform bisection iteration to find eigenvalues of T. = 3: Perform bisection iteration to invert N(w), i.e., to find a point which has a specified number of eigenvalues of T to its left.
* @param {integer} nitmax - the maximum number of "levels" of bisection to be performed, i.e., an interval of width W will not be made smaller than 2^(-NITMAX) * W.
* @param {NonNegativeInteger} N - the dimension n of the tridiagonal matrix T.
* @param {NonNegativeInteger} mmax - the maximum number of intervals.
* @param {NonNegativeInteger} minp - the initial number of intervals.
* @param {integer} nbmin - the smallest number of intervals that should be processed using a vector loop.
* @param {number} abstol - the minimum (absolute) width of an interval.
* @param {number} reltol - the minimum relative width of an interval.
* @param {number} pivmin - the minimum absolute value of a "pivot" in the Sturm sequence loop.
* @param {Float64Array} d - the diagonal elements of the tridiagonal matrix T.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - the offdiagonal elements of the tridiagonal matrix T in positions 1 through N-1.
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} E2 - the squares of the offdiagonal elements of the tridiagonal matrix T.
* @param {integer} strideE2 - stride length for `E2`
* @param {Int32Array} NVAL - if IJOB=1 or 2, not referenced (0-based).
* @param {integer} strideNVAL - stride length for `NVAL`
* @param {Float64Array} AB - the endpoints of the intervals.
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} c - if IJOB=1, ignored.
* @param {integer} strideC - stride length for `c`
* @param {Int32Array} mout - if IJOB=1, the number of eigenvalues in the intervals.
* @param {Int32Array} NAB - if IJOB=1, then on output NAB(i,j) will be set to N(AB(i,j)).
* @param {PositiveInteger} LDNAB - leading dimension of `NAB`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `mmax` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `mmax` elements
* @throws {TypeError} first argument must be a valid order
* @returns {integer} info status code
*/
function dlaebz( order, ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, e, strideE, E2, strideE2, NVAL, strideNVAL, AB, LDAB, c, strideC, mout, NAB, LDNAB, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const snab1 = ( order === 'column-major' ) ? 1 : LDNAB;
	const snab2 = ( order === 'column-major' ) ? LDNAB : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N, strideE );
	const oe2 = stride2offset( N, strideE2 );
	const onval = stride2offset( minp, strideNVAL );
	const oc = stride2offset( mmax, strideC );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, mmax );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, mmax );
		IWORK = new Int32Array( minIwork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, 2 ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,2). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDNAB < max( 1, 2 ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,2). Value: `%d`.', LDNAB ) );
	}
	if ( order === 'column-major' && LDNAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDNAB ) );
	}
	return ndarray( ijob, nitmax, N, mmax, minp, nbmin, abstol, reltol, pivmin, d, strideD, od, e, strideE, oe, E2, strideE2, oe2, NVAL, strideNVAL, onval, AB, sab1, sab2, 0, c, strideC, oc, mout, NAB, snab1, snab2, 0, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaebz;
