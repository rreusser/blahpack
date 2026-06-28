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

/* eslint-disable max-len, max-params */

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isNonNegativeInteger$cjs from '@stdlib/assert/is-nonnegative-integer/lib/index.js';
const isNonNegativeInteger = isNonNegativeInteger$cjs.isPrimitive;
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices.
*
* @param {integer} precType - requested residual precision (currently ignored; see base.js)
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
* @param {Float64Array} berrOut - componentwise backward error
* @param {integer} strideBerrOut - stride length for `berrOut`
* @param {NonNegativeInteger} offsetBerrOut - starting index for `berrOut`
* @param {integer} nNorms - number of error bound components
* @param {Float64Array} errBndsNorm - normwise error bounds
* @param {integer} strideErrBndsNorm1 - stride of the first dimension of `errBndsNorm`
* @param {integer} strideErrBndsNorm2 - stride of the second dimension of `errBndsNorm`
* @param {NonNegativeInteger} offsetErrBndsNorm - starting index for `errBndsNorm`
* @param {Float64Array} errBndsComp - componentwise error bounds
* @param {integer} strideErrBndsComp1 - stride of the first dimension of `errBndsComp`
* @param {integer} strideErrBndsComp2 - stride of the second dimension of `errBndsComp`
* @param {NonNegativeInteger} offsetErrBndsComp - starting index for `errBndsComp`
* @param {Complex128Array} RES - workspace residual
* @param {integer} strideRES - stride length for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - real workspace
* @param {integer} strideAYB - stride length for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - complex correction workspace
* @param {integer} strideDY - stride length for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} yTail - double-double tail of `Y`
* @param {integer} strideYTail - stride length for `yTail`
* @param {NonNegativeInteger} offsetYTail - starting index for `yTail`
* @param {number} rcond - reciprocal condition number
* @param {integer} ithresh - maximum refinement iterations
* @param {number} rthresh - convergence ratio threshold
* @param {number} dzUb - componentwise update upper bound
* @param {boolean} ignoreCwise - whether to ignore componentwise convergence
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {TypeError} `N` must be a nonnegative integer
* @throws {TypeError} `nrhs` must be a nonnegative integer
* @returns {integer} status code (`0` on success)
*/
function zlaHerfsxExtended( precType, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, berrOut, strideBerrOut, offsetBerrOut, nNorms, errBndsNorm, strideErrBndsNorm1, strideErrBndsNorm2, offsetErrBndsNorm, errBndsComp, strideErrBndsComp1, strideErrBndsComp2, offsetErrBndsComp, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, yTail, strideYTail, offsetYTail, rcond, ithresh, rthresh, dzUb, ignoreCwise ) {
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isNonNegativeInteger( N ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%s`.', N ) );
	}
	if ( !isNonNegativeInteger( nrhs ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%s`.', nrhs ) );
	}
	return base( precType, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, berrOut, strideBerrOut, offsetBerrOut, nNorms, errBndsNorm, strideErrBndsNorm1, strideErrBndsNorm2, offsetErrBndsNorm, errBndsComp, strideErrBndsComp1, strideErrBndsComp2, offsetErrBndsComp, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, yTail, strideYTail, offsetYTail, rcond, ithresh, rthresh, dzUb, ignoreCwise );
}


// EXPORTS //

export default zlaHerfsxExtended;
