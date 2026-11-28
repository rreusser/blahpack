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
* Interface describing `dlasyf`.
*/
interface Routine {
	/**
	* Computes a partial factorization of a real symmetric matrix A using the.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nb - `nb`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param W - `W`
	* @param LDW - leading dimension of `W`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, nb: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number, W: Float64Array, LDW: number ): Float64Array;

	/**
	* Computes a partial factorization of a real symmetric matrix A using the using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nb - `nb`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param W - `W`
	* @param strideW1 - stride of `W`
	* @param strideW2 - stride of `W`
	* @param offsetW - starting index for `W`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, W: Float64Array, strideW1: number, strideW2: number, offsetW: number ): Float64Array;
}

/**
* Computes a partial factorization of a real symmetric matrix A using the.
*/
declare var dlasyf: Routine;


// EXPORTS //

export = dlasyf;
