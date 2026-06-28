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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution `Y` to a banded system of linear equations using extra-precise iterative refinement and computes backward/forward error bounds.
*
* @param {integer} prec_type - extended-precision type code (ignored — XBLAS fallback)
* @param {string} trans_type - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AB - original banded matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - `LU`-factored banded matrix
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Int32Array} IPIV - 0-based pivot indices
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was applied
* @param {Float64Array} c - column scaling vector
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Y - initial solution (updated on exit)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - output backward error per RHS
* @param {integer} strideBERR_OUT - stride for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {NonNegativeInteger} n_norms - number of error bounds to compute
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds matrix
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension of `ERR_BNDS_NORM`
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension of `ERR_BNDS_NORM`
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index for `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds matrix
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension of `ERR_BNDS_COMP`
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension of `ERR_BNDS_COMP`
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index for `ERR_BNDS_COMP`
* @param {Float64Array} RES - workspace of length `N`
* @param {integer} strideRES - stride for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - workspace of length `N`
* @param {integer} strideAYB - stride for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Float64Array} DY - workspace of length `N` (update direction)
* @param {integer} strideDY - stride for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Float64Array} Y_TAIL - workspace of length `N`
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - reciprocal condition estimate
* @param {NonNegativeInteger} ithresh - maximum number of refinement iterations
* @param {number} rthresh - ratio threshold for stagnation detection
* @param {number} dz_ub - componentwise update ratio upper bound
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @throws {TypeError} `trans_type` must be `'no-transpose'` or `'transpose'`
* @returns {integer} `0` on success
*/
function dla_gbrfsx_extended( prec_type, trans_type, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	if ( trans_type !== 'no-transpose' && trans_type !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be `no-transpose` or `transpose`. Value: `%s`.', trans_type ) );
	}
	return base( prec_type, trans_type, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default dla_gbrfsx_extended;
