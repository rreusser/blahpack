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

import { MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `dlatrd`.
*/
interface Routine {
	/**
	* Reduces NB rows and columns of a real symmetric matrix A to symmetric.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nb - `nb`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param W - `W`
	* @param LDW - leading dimension of `W`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, nb: number, A: Float64Array, LDA: number, e: Float64Array, strideE: number, TAU: Float64Array, strideTAU: number, W: Float64Array, LDW: number ): Float64Array;

	/**
	* Reduces NB rows and columns of a real symmetric matrix A to symmetric using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nb - `nb`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param W - `W`
	* @param strideW1 - stride of `W`
	* @param strideW2 - stride of `W`
	* @param offsetW - starting index for `W`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, e: Float64Array, strideE: number, offsetE: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, W: Float64Array, strideW1: number, strideW2: number, offsetW: number ): Float64Array;
}

/**
* Reduces NB rows and columns of a real symmetric matrix A to symmetric.
*/
declare var dlatrd: Routine;


// EXPORTS //

export = dlatrd;
