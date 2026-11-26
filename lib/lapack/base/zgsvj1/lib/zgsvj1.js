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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {('compute-v'|'apply-v'|'no-v')} jobv - one of `'compute-v'`, `'apply-v'`, or `'no-v'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} n1 - block partition (first `n1` columns rotated against the remaining `N-n1`)
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} d - diagonal scale array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} sva - column-norm vector
* @param {integer} strideSVA - stride length for `sva`
* @param {integer} mv - rows of `V` when `jobv === 'apply-v'`
* @param {Complex128Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance
* @param {NonNegativeInteger} nsweep - number of sweeps
* @param {(Complex128Array|null)} WORK - workspace of at least `M` complex elements (the reference's LWORK >= M); if `null`, `max( 1, M )` are allocated
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "apply-v", "no-v", "compute-v"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument is invalid (rejected when `N < 0 || N > M`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `M` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} twelfth argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`)
* @throws {RangeError} fourteenth argument is invalid (rejected when `( jobv === "compute-v" && LDV < N ) || ( jobv === "apply-v" && LDV < mv )`)
* @throws {RangeError} seventeenth argument is invalid (rejected when `tol <= eps`)
* @throws {RangeError} eighteenth argument must be a nonnegative integer
* @throws {RangeError} dimensions and leading dimensions must be consistent
* @returns {integer} status code (`0` on convergence, `nsweep-1` if all sweeps used, otherwise a negative argument-error code)
*/
function zgsvj1( order, jobv, M, N, n1, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, WORK ) {
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
	if ( n1 < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', n1 ) );
	}
	if ( order === 'column-major' && ( LDA < M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to %d. Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( ( jobv === 'compute-v' || jobv === 'apply-v' ) && mv < 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (rejected when `( jobv === "compute-v" || jobv === "apply-v" ) && mv < 0`). Value: `%d`.', mv ) );
	}
	if ( ( jobv === 'compute-v' && LDV < N ) || ( jobv === 'apply-v' && LDV < mv ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `( jobv === "compute-v" && LDV < N ) || ( jobv === "apply-v" && LDV < mv )`). Value: `%d`.', LDV ) );
	}
	if ( tol <= eps ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `tol <= eps`). Value: `%s`.', tol ) );
	}
	if ( nsweep < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be a nonnegative integer. Value: `%d`.', nsweep ) );
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
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, M ) );
	}
	return base( jobv, M, N, n1, A, sa1, sa2, 0, d, strideD, 0, sva, strideSVA, 0, mv, V, sv1, sv2, 0, eps, sfmin, tol, nsweep, WORK, 1, 0 );
}


// EXPORTS //

export default zgsvj1;
