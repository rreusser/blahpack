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

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for complex banded matrices.
*
* @param {integer} prec_type - requested extended-precision type (ignored in this build)
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AB - input banded matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Complex128Array} AFB - LU factorization of `AB`
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Int32Array} IPIV - pivot indices (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - column-equilibration flag
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - current solution matrix (improved on exit)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - output backward error (length nrhs)
* @param {integer} strideBERR_OUT - stride length for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {integer} n_norms - number of error bound columns to write
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds (nrhs by 3)
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds (nrhs by 3)
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index
* @param {Complex128Array} RES - residual workspace (length N)
* @param {integer} strideRES - stride for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - real workspace `|A|*|Y|+|B|` (length N)
* @param {integer} strideAYB - stride for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - refinement update workspace (length N)
* @param {integer} strideDY - stride for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - extended-precision tail workspace (length N)
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - estimate of the reciprocal condition number
* @param {integer} ithresh - maximum number of refinement iterations
* @param {number} rthresh - progress threshold ratio
* @param {number} dz_ub - upper bound on componentwise stopping criterion
* @param {boolean} ignore_cwise - skip componentwise tracking
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} `N` and `nrhs` must be nonnegative integers
* @returns {integer} status code (0 = success)
*/
function zla_gbrfsx_extended( prec_type, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( prec_type, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zla_gbrfsx_extended;
