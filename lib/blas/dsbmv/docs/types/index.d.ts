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
* Interface describing `dsbmv`.
*/
interface Routine {
	/**
	* Performs the matrix-vector operation `y := alpha*A*x + beta*y`.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param K - inner dimension
	* @param alpha - scalar constant
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param beta - scalar constant
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, K: number, alpha: number, A: Float64Array, LDA: number, x: Float64Array, strideX: number, beta: number, y: Float64Array, strideY: number ): Float64Array;

	/**
	* Performs the matrix-vector operation `y := alpha*A*x + beta*y` using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param K - inner dimension
	* @param alpha - scalar constant
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param beta - scalar constant
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, K: number, alpha: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, x: Float64Array, strideX: number, offsetX: number, beta: number, y: Float64Array, strideY: number, offsetY: number ): Float64Array;
}

/**
* Performs the matrix-vector operation `y := alpha*A*x + beta*y`.
*/
declare var dsbmv: Routine;


// EXPORTS //

export = dsbmv;
