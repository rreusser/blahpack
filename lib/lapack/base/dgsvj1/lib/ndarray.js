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
* Pre-processor for `dgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* @param {('compute-v'|'apply-v'|'no-v')} jobv - one of `'compute-v'`, `'apply-v'`, or `'no-v'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} n1 - block partition (first `n1` columns rotated against the remaining `N-n1`)
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index into `A`
* @param {Float64Array} d - diagonal scale array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index into `d`
* @param {Float64Array} sva - column-norm vector
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index into `sva`
* @param {integer} mv - rows of `V` when `jobv === 'apply-v'`
* @param {Float64Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index into `V`
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance
* @param {NonNegativeInteger} nsweep - number of sweeps
* @param {Float64Array} work - workspace
* @param {integer} strideWork - stride length for `work`
* @param {NonNegativeInteger} offsetWork - starting index into `work`
* @throws {TypeError} first argument must be one of the following: "apply-v", "no-v", "compute-v"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `N < 0 || N > M`)
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifteenth argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`)
* @throws {RangeError} twenty-second argument is invalid (rejected when `tol <= eps`)
* @throws {RangeError} twenty-third argument must be a nonnegative integer
* @returns {integer} status code (`0` on convergence, `nsweep-1` if all sweeps used, otherwise a negative argument-error code)
*/
function dgsvj1( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( jobv !== 'apply-v' && jobv !== 'no-v' && jobv !== 'compute-v' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "apply-v", "no-v", "compute-v". Value: `%s`.', jobv ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `N < 0 || N > M`). Value: `%d`.', N ) );
	}
	if ( n1 < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', n1 ) );
	}
	if ( ( jobv === 'compute-v' || jobv === 'apply-v' ) && mv < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`). Value: `%d`.', mv ) );
	}
	if ( tol <= eps ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument is invalid (rejected when `tol <= eps`). Value: `%s`.', tol ) );
	}
	if ( nsweep < 0 ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument must be a nonnegative integer. Value: `%d`.', nsweep ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgsvj1;
