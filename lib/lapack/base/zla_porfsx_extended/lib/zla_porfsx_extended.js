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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isNonNegativeInteger$cjs from '@stdlib/assert/is-nonnegative-integer/lib/index.js';
const isNonNegativeInteger = isNonNegativeInteger$cjs.isPrimitive;
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} prec_type - intermediate precision selector (ignored by this port)
* @param {string} uplo - `'upper'` if the upper triangle of `A` is stored, `'lower'` otherwise
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - Cholesky factor of `A`
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {boolean} colequ - `true` if column equilibration was applied
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride length for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} Y - initial / refined solution matrix
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @param {Float64Array} BERR_OUT - output backward error bounds
* @param {integer} strideBERR_OUT - stride length for `BERR_OUT`
* @param {integer} n_norms - error-bound request level
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds
* @param {PositiveInteger} LDERR_BNDS_NORM - leading dimension of `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds
* @param {PositiveInteger} LDERR_BNDS_COMP - leading dimension of `ERR_BNDS_COMP`
* @param {Complex128Array} RES - complex workspace for the residual
* @param {integer} strideRES - stride length for `RES`
* @param {Float64Array} AYB - real workspace for `|A|*|Y|+|B|`
* @param {integer} strideAYB - stride length for `AYB`
* @param {Complex128Array} DY - complex workspace for the correction
* @param {integer} strideDY - stride length for `DY`
* @param {Complex128Array} Y_TAIL - complex workspace for trailing bits of the solution
* @param {integer} strideY_TAIL - stride length for `Y_TAIL`
* @param {number} rcond - reciprocal scaled condition number
* @param {integer} ithresh - maximum refinement iterations per right-hand side
* @param {number} rthresh - refinement-progress threshold in `(0, 1]`
* @param {number} dz_ub - componentwise stability threshold in `(0, 1]`
* @param {boolean} ignore_cwise - ignore componentwise convergence
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} `N` must be a non-negative integer
* @throws {RangeError} `nrhs` must be a non-negative integer
* @throws {RangeError} leading dimensions must satisfy `LDX >= max(1, N)` (or `LDERR_* >= max(1, nrhs)`)
* @returns {integer} status code (`0` on success)
*/
function zla_porfsx_extended( order, prec_type, uplo, N, nrhs, A, LDA, AF, LDAF, colequ, c, strideC, B, LDB, Y, LDY, BERR_OUT, strideBERR_OUT, n_norms, ERR_BNDS_NORM, LDERR_BNDS_NORM, ERR_BNDS_COMP, LDERR_BNDS_COMP, RES, strideRES, AYB, strideAYB, DY, strideDY, Y_TAIL, strideY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var serr_bnds_norm1;
	var serr_bnds_norm2;
	var serr_bnds_comp1;
	var serr_bnds_comp2;
	var saf1;
	var saf2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sy1;
	var sy2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isNonNegativeInteger( N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a non-negative integer. Value: `%s`.', N ) );
	}
	if ( !isNonNegativeInteger( nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a non-negative integer. Value: `%s`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( LDERR_BNDS_NORM < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. 21st argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDERR_BNDS_NORM ) );
	}
	if ( LDERR_BNDS_COMP < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. 23rd argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDERR_BNDS_COMP ) );
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
		serr_bnds_norm1 = 1;
		serr_bnds_norm2 = LDERR_BNDS_NORM;
		serr_bnds_comp1 = 1;
		serr_bnds_comp2 = LDERR_BNDS_COMP;
	} else {
		sa1 = LDA;
		sa2 = 1;
		saf1 = LDAF;
		saf2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sy1 = LDY;
		sy2 = 1;
		serr_bnds_norm1 = LDERR_BNDS_NORM;
		serr_bnds_norm2 = 1;
		serr_bnds_comp1 = LDERR_BNDS_COMP;
		serr_bnds_comp2 = 1;
	}
	return base( prec_type, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, colequ, c, strideC, 0, B, sb1, sb2, 0, Y, sy1, sy2, 0, BERR_OUT, strideBERR_OUT, 0, n_norms, ERR_BNDS_NORM, serr_bnds_norm1, serr_bnds_norm2, 0, ERR_BNDS_COMP, serr_bnds_comp1, serr_bnds_comp2, 0, RES, strideRES, 0, AYB, strideAYB, 0, DY, strideDY, 0, Y_TAIL, strideY_TAIL, 0, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zla_porfsx_extended;
