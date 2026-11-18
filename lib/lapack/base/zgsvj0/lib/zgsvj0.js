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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for zgesvj performing Jacobi rotations.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} jobv - `'compute-v'`, `'apply-v'`, or `'no-v'`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} d - N-length diagonal phase array
* @param {integer} strideD - stride length for `d` (in complex elements)
* @param {Float64Array} sva - N-length array of column norms
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} mv - number of rows of `V` when `jobv='apply-v'`
* @param {Complex128Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance (must be > eps)
* @param {NonNegativeInteger} nsweep - number of sweeps to perform
* @param {Complex128Array} work - workspace array (length >= M complex elements)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid `jobv` value
* @throws {RangeError} `M` must be a nonnegative integer
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `LDA` must be >= max(1,M) (column-major) or max(1,N) (row-major)
* @throws {RangeError} `LDV` must be >= max(1,N) (column-major) or max(1,M) (row-major) when `jobv` is not `'no-v'`
* @returns {integer} info code (0 on success)
*/
function zgsvj0( order, jobv, M, N, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work ) {
	let sa1, sa2, sv1, sv2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobv !== 'compute-v' && jobv !== 'apply-v' && jobv !== 'no-v' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobv` value. Value: `%s`.', jobv ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument violates the reference leading-dimension rule (column-major: rejected when `LDA.LT.M`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && ( ( ( jobv === 'compute-v' ) && ( LDV < N ) ) || ( ( jobv === 'apply-v' ) && ( LDV < mv ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument violates the reference leading-dimension rule (column-major: rejected when `( RSVEC.AND.( LDV.LT.N ) ).OR. ( APPLV.AND.( LDV.LT.MV ) )`). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && ( ( ( jobv === 'compute-v' ) && ( LDV < N ) ) || ( ( jobv === 'apply-v' ) && ( LDV < max( 1, N ) ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDV ) );
	}
	if ( jobv !== 'no-v' ) {
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
		work = new Complex128Array( max( 1, M ) );
	}
	return base( jobv, M, N, A, sa1, sa2, 0, d, strideD, 0, sva, strideSVA, 0, mv, V, sv1, sv2, 0, eps, sfmin, tol, nsweep, work, 1, 0 );
}


// EXPORTS //

export default zgsvj0;
