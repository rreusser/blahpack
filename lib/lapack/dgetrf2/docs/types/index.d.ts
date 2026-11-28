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
* Interface describing `dgetrf2`.
*/
interface Routine {
	/**
	* Computes an LU factorization of a general M-by-N matrix A using partial.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number ): Float64Array;

	/**
	* Computes an LU factorization of a general M-by-N matrix A using partial using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number ): Float64Array;
}

/**
* Computes an LU factorization of a general M-by-N matrix A using partial.
*/
declare var dgetrf2: Routine;


// EXPORTS //

export = dgetrf2;
