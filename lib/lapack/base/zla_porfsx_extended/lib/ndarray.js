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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isNonNegativeInteger$cjs from '@stdlib/assert/is-nonnegative-integer/lib/index.js';
const isNonNegativeInteger = isNonNegativeInteger$cjs.isPrimitive;
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices.
*
* @param {integer} prec_type - intermediate precision selector (accepted for API compatibility; ignored)
* @param {string} uplo - `'upper'` if the upper triangle of `A` is stored, `'lower'` otherwise
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - original `N`-by-`N` Hermitian positive-definite matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - Cholesky factor of `A`
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {boolean} colequ - `true` if column equilibration was applied
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - initial/refined solution matrix
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - output backward error bounds
* @param {integer} strideBERR_OUT - stride length for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {integer} n_norms - `>= 1` for normwise bounds, `>= 2` for componentwise
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension of `ERR_BNDS_NORM`
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension of `ERR_BNDS_NORM`
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index for `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension of `ERR_BNDS_COMP`
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension of `ERR_BNDS_COMP`
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index for `ERR_BNDS_COMP`
* @param {Complex128Array} RES - complex workspace for residual
* @param {integer} strideRES - stride length for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - real workspace for `|A|*|Y|+|B|`
* @param {integer} strideAYB - stride length for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - complex workspace for the correction
* @param {integer} strideDY - stride length for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - complex workspace for trailing bits of the solution
* @param {integer} strideY_TAIL - stride length for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - reciprocal scaled condition number
* @param {integer} ithresh - maximum refinement iterations per right-hand side
* @param {number} rthresh - refinement-progress threshold in `(0, 1]`
* @param {number} dz_ub - componentwise stability threshold in `(0, 1]`
* @param {boolean} ignore_cwise - ignore componentwise convergence
* @throws {TypeError} `uplo` must be a valid matrix triangle
* @throws {RangeError} `N` must be a non-negative integer
* @throws {RangeError} `nrhs` must be a non-negative integer
* @returns {integer} status code (`0` on success)
*/
function zla_porfsx_extended( prec_type, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isNonNegativeInteger( N ) ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a non-negative integer. Value: `%s`.', N ) );
	}
	if ( !isNonNegativeInteger( nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a non-negative integer. Value: `%s`.', nrhs ) );
	}
	return base( prec_type, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zla_porfsx_extended;
