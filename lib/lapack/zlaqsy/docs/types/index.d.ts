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

import { MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `zlaqsy`.
*/
interface Routine {
	/**
	* Equilibrates a symmetric matrix A using the scaling factors in the vector S.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param scond - `scond`
	* @param amax - `amax`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, s: Float64Array, strideS: number, scond: number, amax: number ): Float64Array;

	/**
	* Equilibrates a symmetric matrix A using the scaling factors in the vector S using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @param scond - `scond`
	* @param amax - `amax`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, s: Float64Array, strideS: number, offsetS: number, scond: number, amax: number ): Float64Array;
}

/**
* Equilibrates a symmetric matrix A using the scaling factors in the vector S.
*/
declare var zlaqsy: Routine;


// EXPORTS //

export = zlaqsy;
