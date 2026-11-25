/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for dgesvj performing Jacobi rotations.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('compute-v'|'apply-v'|'no-v')} jobv - `'compute-v'` to accumulate into V (RSVEC), `'apply-v'` to apply to existing MV-by-N V (APPLV), `'no-v'` otherwise
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} sva - input array
* @param {integer} strideSVA - stride length for `sva`
* @param {integer} mv - if `jobv === 'apply-v'`, then MV rows of V are post-multiplied by a sequence of Jacobi rotations.
* @param {Float64Array} V - output matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {number} eps - ePS = DLAMCH('Epsilon')
* @param {number} sfmin - sFMIN = DLAMCH('Safe Minimum')
* @param {number} tol - tOL is the threshold for Jacobi rotations.
* @param {NonNegativeInteger} nsweep - nSWEEP is the number of sweeps of Jacobi rotations to be performed.
* @param {(Float64Array|null)} work - input array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "apply-v", "no-v", "compute-v"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument is invalid (rejected when `N < 0 || N > M`)
* @throws {RangeError} sixth argument must be greater than or equal to `M` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eleventh argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`)
* @throws {RangeError} thirteenth argument is invalid (rejected when `( jobv === "compute-v" && LDV < N ) || ( jobv === "apply-v" && LDV < mv )`)
* @throws {RangeError} sixteenth argument is invalid (rejected when `tol <= eps`)
* @throws {RangeError} seventeenth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dgsvj0( order, jobv, M, N, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sv1, sv2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobv !== 'apply-v' && jobv !== 'no-v' && jobv !== 'compute-v' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "apply-v", "no-v", "compute-v". Value: `%s`.', jobv ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `N < 0 || N > M`). Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to %d. Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( ( jobv === 'compute-v' || jobv === 'apply-v' ) && mv < 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`). Value: `%d`.', mv ) );
	}
	if ( ( jobv === 'compute-v' && LDV < N ) || ( jobv === 'apply-v' && LDV < mv ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument is invalid (rejected when `( jobv === "compute-v" && LDV < N ) || ( jobv === "apply-v" && LDV < mv )`). Value: `%d`.', LDV ) );
	}
	if ( tol <= eps ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `tol <= eps`). Value: `%s`.', tol ) );
	}
	if ( nsweep < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be a nonnegative integer. Value: `%d`.', nsweep ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sv1 = 1;
		sv2 = LDV;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sv1 = LDV;
		sv2 = 1;
	}
	if ( work === null || work === void 0 ) {
		work = new Float64Array( max( 1, M ) );
	}
	return base( jobv, M, N, A, sa1, sa2, 0, d, strideD, 0, sva, strideSVA, 0, mv, V, sv1, sv2, 0, eps, sfmin, tol, nsweep, work, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgsvj0;
