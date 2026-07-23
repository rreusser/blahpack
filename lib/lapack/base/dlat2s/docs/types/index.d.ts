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

import { Layout, MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `dlat2s`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param SA - `SA`
	* @param LDSA - leading dimension of `SA`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, SA: Float64Array, LDSA: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param SA - `SA`
	* @param strideSA1 - stride of `SA`
	* @param strideSA2 - stride of `SA`
	* @param offsetSA - starting index for `SA`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, SA: Float64Array, strideSA1: number, strideSA2: number, offsetSA: number ): number;
}

/**
* @license MIT.
*/
declare var dlat2s: Routine;


// EXPORTS //

export = dlat2s;
