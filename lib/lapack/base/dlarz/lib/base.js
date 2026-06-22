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

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dger from '../../../../blas/base/dger/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';


// MAIN //

/**
* Applies a real elementary reflector `H` to a real M-by-N matrix `C`, from either the left or the right.
*
* ## Notes
*
* -   The reflector is stored in the form used by the RZ factorization (i.e., as produced by `dtzrzf`): `H = I - tau * v * v**T`, where `v` has the structure `v = [ 1; 0; ...; 0; z ]` and only the trailing `L`-vector `z` is stored explicitly.
*
* @private
* @param {string} side - `'left'` to apply `H` from the left, `'right'` to apply `H` from the right
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} l - number of entries of the vector `z` (the trailing part of `v`)
* @param {Float64Array} v - the vector `z` defining the reflector
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {number} tau - scalar factor of the reflector
* @param {Float64Array} C - matrix, modified in-place
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Float64Array} WORK - workspace array (length at least `N` if `side='left'`, `M` if `side='right'`)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {Float64Array} `C`
*/
function dlarz( side, M, N, l, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) {
	var offsetCtail;

	if ( side === 'left' ) {
		// Form H * C.
		if ( tau !== 0.0 ) {
			// w( 1:n ) := C( 1, 1:n )**T
			dcopy( N, C, strideC2, offsetC, WORK, strideWORK, offsetWORK );

			if ( l > 0 ) {
				// w( 1:n ) := w( 1:n ) + C( m-l+1:m, 1:n )**T * v( 1:l )
				offsetCtail = offsetC + ( ( M - l ) * strideC1 );
				dgemv( 'transpose', l, N, 1.0, C, strideC1, strideC2, offsetCtail, v, strideV, offsetV, 1.0, WORK, strideWORK, offsetWORK );
			}

			// C( 1, 1:n ) := C( 1, 1:n ) - tau * w( 1:n )
			daxpy( N, -tau, WORK, strideWORK, offsetWORK, C, strideC2, offsetC );

			if ( l > 0 ) {
				// C( m-l+1:m, 1:n ) := C( m-l+1:m, 1:n ) - v( 1:l ) * w( 1:n )**T
				offsetCtail = offsetC + ( ( M - l ) * strideC1 );
				dger( l, N, -tau, v, strideV, offsetV, WORK, strideWORK, offsetWORK, C, strideC1, strideC2, offsetCtail );
			}
		}
		return C;
	}
	// Form C * H.
	if ( tau !== 0.0 ) {
		// w( 1:m ) := C( 1:m, 1 )
		dcopy( M, C, strideC1, offsetC, WORK, strideWORK, offsetWORK );

		if ( l > 0 ) {
			// w( 1:m ) := w( 1:m ) + C( 1:m, n-l+1:n ) * v( 1:l )
			offsetCtail = offsetC + ( ( N - l ) * strideC2 );
			dgemv( 'no-transpose', M, l, 1.0, C, strideC1, strideC2, offsetCtail, v, strideV, offsetV, 1.0, WORK, strideWORK, offsetWORK );
		}

		// C( 1:m, 1 ) := C( 1:m, 1 ) - tau * w( 1:m )
		daxpy( M, -tau, WORK, strideWORK, offsetWORK, C, strideC1, offsetC );

		if ( l > 0 ) {
			// C( 1:m, n-l+1:n ) := C( 1:m, n-l+1:n ) - w( 1:m ) * v( 1:l )**T
			offsetCtail = offsetC + ( ( N - l ) * strideC2 );
			dger( M, l, -tau, WORK, strideWORK, offsetWORK, v, strideV, offsetV, C, strideC1, strideC2, offsetCtail );
		}
	}
	return C;
}


// EXPORTS //

export default dlarz;
