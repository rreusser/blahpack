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

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Forms the right or left eigenvectors of a real generalized eigenvalue problem by backward transformation on the computed eigenvectors of the balanced matrix output by DGGBAL.
*
* @param {string} job - specifies the type of backward transformation: `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
* @param {NonNegativeInteger} N - number of rows of `V`
* @param {integer} ilo - ilo from balancing (1-based)
* @param {integer} ihi - ihi from balancing (1-based)
* @param {Float64Array} LSCALE - left scaling/permutation factors from DGGBAL
* @param {integer} strideLSCALE - stride for `LSCALE`
* @param {NonNegativeInteger} offsetLSCALE - starting index for `LSCALE`
* @param {Float64Array} RSCALE - right scaling/permutation factors from DGGBAL
* @param {integer} strideRSCALE - stride for `RSCALE`
* @param {NonNegativeInteger} offsetRSCALE - starting index for `RSCALE`
* @param {NonNegativeInteger} M - number of columns of `V`
* @param {Float64Array} V - eigenvector matrix (modified in-place)
* @param {integer} strideV1 - stride of the first dimension of `V`
* @param {integer} strideV2 - stride of the second dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @throws {TypeError} first argument must be a valid job type
* @throws {TypeError} second argument must be a valid operation side
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} twelfth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dggbak( job, side, N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, M, V, strideV1, strideV2, offsetV ) {
	if ( job !== 'none' && job !== 'permute' && job !== 'scale' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job type. Value: `%s`.', job ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( job, side, N, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, M, V, strideV1, strideV2, offsetV );
}


// EXPORTS //

export default dggbak;
