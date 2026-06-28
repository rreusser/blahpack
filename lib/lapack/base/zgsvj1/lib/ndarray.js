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

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* @param {string} jobv - one of `'compute-v'`, `'apply-v'`, or `'no-v'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} n1 - block partition (first `n1` columns rotated against the remaining `N-n1`)
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index into `A` (in complex elements)
* @param {Complex128Array} d - diagonal scale array
* @param {integer} strideD - stride length for `d` (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index into `d` (in complex elements)
* @param {Float64Array} sva - column-norm vector
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} offsetSVA - starting index into `sva`
* @param {NonNegativeInteger} mv - rows of `V` when `jobv === 'apply-v'`
* @param {Complex128Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {integer} strideV1 - stride of the first dimension of `V` (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of `V` (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index into `V` (in complex elements)
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance
* @param {NonNegativeInteger} nsweep - number of sweeps
* @param {Complex128Array} work - workspace
* @param {integer} strideWork - stride length for `work` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index into `work` (in complex elements)
* @param {NonNegativeInteger} lwork - workspace length
* @throws {TypeError} first argument must be a valid `jobv` value
* @returns {integer} status code (`0` on convergence, `nsweep-1` if all sweeps used, otherwise a negative argument-error code)
*/
function zgsvj1( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	if ( jobv !== 'compute-v' && jobv !== 'apply-v' && jobv !== 'no-v' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobv` value. Value: `%s`.', jobv ) );
	}
	return base( jobv, M, N, n1, A, strideA1, strideA2, offsetA, d, strideD, offsetD, sva, strideSVA, offsetSVA, mv, V, strideV1, strideV2, offsetV, eps, sfmin, tol, nsweep, work, strideWork, offsetWork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgsvj1;
