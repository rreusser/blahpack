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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices.
*
* @param {integer} prec_type - requested residual precision (currently ignored; see base.js)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - original Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - factored form of `A`
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from `zhetrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was performed on `A`
* @param {Float64Array} c - column scale factors for `A`
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - initial/improved solution
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - componentwise backward error
* @param {integer} strideBERR_OUT - stride length for `berrOut`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `berrOut`
* @param {integer} n_norms - number of error bound components
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension of `errBndsNorm`
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension of `errBndsNorm`
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index for `errBndsNorm`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension of `errBndsComp`
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension of `errBndsComp`
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index for `errBndsComp`
* @param {Complex128Array} RES - workspace residual
* @param {integer} strideRES - stride length for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - real workspace
* @param {integer} strideAYB - stride length for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - complex correction workspace
* @param {integer} strideDY - stride length for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - double-double tail of `Y`
* @param {integer} strideY_TAIL - stride length for `yTail`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `yTail`
* @param {number} rcond - reciprocal condition number
* @param {integer} ithresh - maximum refinement iterations
* @param {number} rthresh - convergence ratio threshold
* @param {number} dz_ub - componentwise update upper bound
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {TypeError} `N` must be a nonnegative integer
* @throws {TypeError} `nrhs` must be a nonnegative integer
* @returns {integer} status code (`0` on success)
*/
function zlaHerfsxExtended( prec_type, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( prec_type, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zlaHerfsxExtended;
