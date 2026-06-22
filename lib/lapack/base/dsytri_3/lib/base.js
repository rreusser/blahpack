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

import dsytri3x from './../../../../lapack/base/dsytri_3x/lib/base.js';


// VARIABLES //

// Block size. Reference LAPACK calls ILAENV(1,'DSYTRI_3',...), which has no entry for SY/TRI and returns the default NB = 1; we hardcode the same value to match the reference workspace-query result bit-for-bit. (`dsytri_3x` accepts any valid block size.)
var NB = 1;


// MAIN //

/**
* Computes the inverse of a real symmetric indefinite matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` as computed by `dsytrf_rk`. This is the blocked driver; it picks a block size and forwards to `dsytri_3x`.
*
* If `lwork === -1`, performs a workspace query: writes the optimal `LWORK` into `WORK[offsetWORK]` and returns `0` without touching `A`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix (factored form on entry; inverse on exit)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float64Array} e - super/sub-diagonal of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - index offset for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Float64Array} WORK - workspace of length `(N+NB+1)*(NB+3)`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - index offset for `WORK`
* @param {integer} lwork - length of `WORK`, or `-1` for a workspace query
* @returns {integer} status code (`0` = success; `-i` = illegal argument; `> 0` = singular diagonal block)
*/
function dsytri3( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line max-len, max-params
	var lwkopt;
	var lquery;
	var info;

	lquery = ( lwork === -1 );

	// Determine the block size (see the NB comment above).
	lwkopt = ( N + NB + 1 ) * ( NB + 3 );

	// Argument validation.
	if ( uplo !== 'upper' && uplo !== 'lower' ) {
		return -1;
	}
	if ( N < 0 ) {
		return -2;
	}
	if ( lwork < lwkopt && !lquery ) {
		return -8;
	}
	if ( lquery ) {
		WORK[ offsetWORK ] = lwkopt;
		return 0;
	}

	// Quick return.
	if ( N === 0 ) {
		return 0;
	}

	info = dsytri3x( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, NB ); // eslint-disable-line max-len

	WORK[ offsetWORK ] = lwkopt;
	return info;
}


// EXPORTS //

export default dsytri3;
