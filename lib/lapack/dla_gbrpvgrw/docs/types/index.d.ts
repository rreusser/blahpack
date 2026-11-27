/*
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

// TypeScript Version: 4.1

/// <reference types="@stdlib/types"/>

import { Layout } from '@stdlib/types/blas';

/**
* Interface describing `dla_gbrpvgrw`.
*/
interface Routine {
	/**
	* Compute the reciprocal pivot growth factor norm(A)/norm(U) for a general banded matrix.
	*
	* @param order - storage layout
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param ncols - `ncols`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param AFB - `AFB`
	* @param LDAFB - leading dimension of `AFB`
	* @returns result
	*/
	( order: Layout, N: number, kl: number, ku: number, ncols: number, AB: Float64Array, LDAB: number, AFB: Float64Array, LDAFB: number ): Float64Array;

	/**
	* Compute the reciprocal pivot growth factor norm(A)/norm(U) for a general banded matrix using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param ncols - `ncols`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param AFB - `AFB`
	* @param strideAFB1 - stride of `AFB`
	* @param strideAFB2 - stride of `AFB`
	* @param offsetAFB - starting index for `AFB`
	* @returns result
	*/
	ndarray( N: number, kl: number, ku: number, ncols: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, AFB: Float64Array, strideAFB1: number, strideAFB2: number, offsetAFB: number ): Float64Array;
}

/**
* Compute the reciprocal pivot growth factor norm(A)/norm(U) for a general banded matrix.
*/
declare var dla_gbrpvgrw: Routine;


// EXPORTS //

export = dla_gbrpvgrw;
