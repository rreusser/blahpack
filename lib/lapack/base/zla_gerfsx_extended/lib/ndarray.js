/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution `Y` to a complex general system of linear equations using extra-precise iterative refinement and computes backward/forward error bounds.
*
* @param {integer} prec_type - extended-precision type code (ignored — XBLAS fallback)
* @param {string} trans_type - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - coefficient matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - `LU`-factored matrix
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was applied
* @param {Float64Array} c - column scaling vector
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - initial solution (updated on exit)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - output backward error per RHS
* @param {integer} strideBERR_OUT - stride for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {NonNegativeInteger} n_norms - number of error bounds to compute
* @param {Float64Array} ERRS_N - normwise error bounds matrix
* @param {integer} strideERRS_N1 - stride of the first dimension of `ERRS_N`
* @param {integer} strideERRS_N2 - stride of the second dimension of `ERRS_N`
* @param {NonNegativeInteger} offsetERRS_N - starting index for `ERRS_N`
* @param {Float64Array} ERRS_C - componentwise error bounds matrix
* @param {integer} strideERRS_C1 - stride of the first dimension of `ERRS_C`
* @param {integer} strideERRS_C2 - stride of the second dimension of `ERRS_C`
* @param {NonNegativeInteger} offsetERRS_C - starting index for `ERRS_C`
* @param {Complex128Array} RES - workspace of length `N`
* @param {integer} strideRES - stride for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - workspace of length `N`
* @param {integer} strideAYB - stride for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - workspace of length `N` (update direction)
* @param {integer} strideDY - stride for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - workspace of length `N`
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - reciprocal condition estimate
* @param {NonNegativeInteger} ithresh - maximum number of refinement iterations
* @param {number} rthresh - ratio threshold for stagnation detection
* @param {number} dz_ub - componentwise update ratio upper bound
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @throws {TypeError} `trans_type` must be `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @throws {RangeError} `N` must be a non-negative integer
* @throws {RangeError} `nrhs` must be a non-negative integer
* @returns {integer} `0` on success
*/
function zla_gerfsx_extended( prec_type, trans_type, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERRS_N, strideERRS_N1, strideERRS_N2, offsetERRS_N, ERRS_C, strideERRS_C1, strideERRS_C2, offsetERRS_C, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	if ( trans_type !== 'no-transpose' && trans_type !== 'transpose' && trans_type !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of: "no-transpose", "transpose", "conjugate-transpose". Value: `%s`.', trans_type ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( prec_type, trans_type, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERRS_N, strideERRS_N1, strideERRS_N2, offsetERRS_N, ERRS_C, strideERRS_C1, strideERRS_C2, offsetERRS_C, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zla_gerfsx_extended;
