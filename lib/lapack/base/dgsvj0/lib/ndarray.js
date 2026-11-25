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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for dgesvj performing Jacobi rotations.
*
* @param {('compute-v'|'apply-v'|'no-v')} jobv - `'compute-v'` to accumulate into V (RSVEC), `'apply-v'` to apply to existing MV-by-N V (APPLV), `'no-v'` otherwise
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} sva - input array
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index for `sva`
* @param {integer} mv - if `jobv === 'apply-v'`, then MV rows of V are post-multiplied by a sequence of Jacobi rotations.
* @param {Float64Array} V - output matrix
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {number} eps - ePS = DLAMCH('Epsilon')
* @param {number} sfmin - sFMIN = DLAMCH('Safe Minimum')
* @param {number} tol - tOL is the threshold for Jacobi rotations.
* @param {NonNegativeInteger} nsweep - nSWEEP is the number of sweeps of Jacobi rotations to be performed.
* @param {Float64Array} work - input array
* @param {integer} strideWork - stride length for `work`
* @param {NonNegativeInteger} offsetWork - starting index for `work`
* @throws {TypeError} first argument must be one of the following: "apply-v", "no-v", "compute-v"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < 0 || N > M`)
* @throws {RangeError} fourteenth argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`)
* @throws {RangeError} twenty-first argument is invalid (rejected when `tol <= eps`)
* @throws {RangeError} twenty-second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dgsvj0( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( jobv !== 'apply-v' && jobv !== 'no-v' && jobv !== 'compute-v' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "apply-v", "no-v", "compute-v". Value: `%s`.', jobv ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `N < 0 || N > M`). Value: `%d`.', N ) );
	}
	if ( ( jobv === 'compute-v' || jobv === 'apply-v' ) && mv < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`). Value: `%d`.', mv ) );
	}
	if ( tol <= eps ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument is invalid (rejected when `tol <= eps`). Value: `%s`.', tol ) );
	}
	if ( nsweep < 0 ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be a nonnegative integer. Value: `%d`.', nsweep ) );
	}

	// The caller owns the workspace; base itself validates its length and
	// returns INFO = -26 when it holds fewer than `M` elements (never reading
	// past the provided length), so no throwing assertion is needed.
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( jobv, M, N, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgsvj0;
