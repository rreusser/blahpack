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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Forms the right or left eigenvectors of a real generalized eigenvalue problem by backward transformation on the computed eigenvectors of the balanced matrix output by DGGBAL.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} job - specifies the type of backward transformation: `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} side - `'right'` for right eigenvectors, `'left'` for left eigenvectors
* @param {NonNegativeInteger} N - number of rows of `V`
* @param {integer} ilo - ilo from balancing (1-based)
* @param {integer} ihi - ihi from balancing (1-based)
* @param {Float64Array} LSCALE - left scaling/permutation factors from DGGBAL
* @param {integer} strideLSCALE - stride for `LSCALE`
* @param {Float64Array} RSCALE - right scaling/permutation factors from DGGBAL
* @param {integer} strideRSCALE - stride for `RSCALE`
* @param {NonNegativeInteger} M - number of columns of `V`
* @param {Float64Array} V - eigenvector matrix (modified in-place)
* @param {PositiveInteger} LDV - leading dimension of `V`
* @throws {TypeError} first argument must be a valid order
* @returns {integer} status code (0 = success)
*/
function dggbak( order, job, side, N, ilo, ihi, LSCALE, strideLSCALE, RSCALE, strideRSCALE, M, V, LDV ) {
	var sv1;
	var sv2;
	var ol;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( order === 'row-major' && LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( job !== 'none' && job !== 'scale' && job !== 'both' && job !== 'permute' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
	} else {
		sv1 = LDV;
		sv2 = 1;
	}
	ol = stride2offset( N, strideLSCALE );
	or = stride2offset( N, strideRSCALE );
	return base( job, side, N, ilo, ihi, LSCALE, strideLSCALE, ol, RSCALE, strideRSCALE, or, M, V, sv1, sv2, 0 );
}


// EXPORTS //

export default dggbak;
