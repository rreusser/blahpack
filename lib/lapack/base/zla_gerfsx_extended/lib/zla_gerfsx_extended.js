/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution to a complex general system of linear equations using extra-precise iterative refinement.
*
* ## Notes
*
* -   This routine is a private helper called from `zgerfsx` and is not intended for direct application use. It accepts a storage layout (`'row-major'` or `'column-major'`), derives the per-matrix strides, and delegates to the ndarray implementation.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} prec_type - extended-precision type code (ignored — XBLAS fallback)
* @param {string} trans_type - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - coefficient matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - `LU`-factored matrix
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - pivot indices
* @param {boolean} colequ - whether column equilibration was applied
* @param {Float64Array} c - column scale factors
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} Y - initial solution (updated on exit)
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @param {Float64Array} BERR_OUT - componentwise backward error per RHS
* @param {integer} n_norms - number of error bounds to compute
* @param {Float64Array} ERRS_N - normwise error bounds
* @param {PositiveInteger} LDERRS_N - leading dimension of `ERRS_N`
* @param {Float64Array} ERRS_C - componentwise error bounds
* @param {PositiveInteger} LDERRS_C - leading dimension of `ERRS_C`
* @param {Complex128Array} RES - workspace (length `N`)
* @param {Float64Array} AYB - workspace (length `N`)
* @param {Complex128Array} DY - workspace (length `N`)
* @param {Complex128Array} Y_TAIL - workspace (length `N`)
* @param {number} rcond - reciprocal condition estimate
* @param {integer} ithresh - maximum refinement iterations
* @param {number} rthresh - ratio threshold for stagnation
* @param {number} dz_ub - componentwise stability threshold
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `N` must be a non-negative integer
* @throws {RangeError} leading dimensions must be at least `max(1, N)`
* @returns {integer} status code (`0` = success)
*/
function zla_gerfsx_extended( order, prec_type, trans_type, N, nrhs, A, LDA, AF, LDAF, IPIV, colequ, c, B, LDB, Y, LDY, BERR_OUT, n_norms, ERRS_N, LDERRS_N, ERRS_C, LDERRS_C, RES, AYB, DY, Y_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var saf1;
	var saf2;
	var sen1;
	var sen2;
	var sec1;
	var sec2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sy1;
	var sy2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. LDB must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. LDY must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		saf1 = 1;
		saf2 = LDAF;
		sb1 = 1;
		sb2 = LDB;
		sy1 = 1;
		sy2 = LDY;
		sen1 = 1;
		sen2 = LDERRS_N;
		sec1 = 1;
		sec2 = LDERRS_C;
	} else {
		sa1 = LDA;
		sa2 = 1;
		saf1 = LDAF;
		saf2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sy1 = LDY;
		sy2 = 1;
		sen1 = LDERRS_N;
		sen2 = 1;
		sec1 = LDERRS_C;
		sec2 = 1;
	}
	if ( trans_type !== 'no-transpose' && trans_type !== 'transpose' && trans_type !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of: "no-transpose", "transpose", "conjugate-transpose". Value: `%s`.', trans_type ) );
	}
	return base( prec_type, trans_type, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, 1, 0, colequ, c, 1, 0, B, sb1, sb2, 0, Y, sy1, sy2, 0, BERR_OUT, 1, 0, n_norms, ERRS_N, sen1, sen2, 0, ERRS_C, sec1, sec2, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, Y_TAIL, 1, 0, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zla_gerfsx_extended;
