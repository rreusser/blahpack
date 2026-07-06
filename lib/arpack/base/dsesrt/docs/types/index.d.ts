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



/**
* Interface describing `dsesrt`.
*/
interface Routine {
	/**
	* Sorts the values in `x` with a gapped (Shell) insertion sort, optionally applying the same permutation to the columns of a column-major companion matrix `A`.
	*
	* @param which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
	* @param apply - whether to apply the sorting permutation to the columns of `A`
	* @param N - number of elements to sort
	* @param x - array whose values determine (and receive) the sort
	* @param strideX - stride length for `x`
	* @param na - number of rows of `A` to permute
	* @param A - companion matrix (column-major) whose columns are permuted alongside `x` when `apply` is `true`
	* @param lda - leading dimension of `A`
	*/
	( which: string, apply: boolean, N: number, x: Float64Array, strideX: number, na: number, A: Float64Array, lda: number ): void;

	/**
	* Sorts the values in `x` with a gapped (Shell) insertion sort, optionally applying the same permutation to the columns of a companion matrix `A`, using alternative indexing semantics.
	*
	* @param which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
	* @param apply - whether to apply the sorting permutation to the columns of `A`
	* @param N - number of elements to sort
	* @param x - array whose values determine (and receive) the sort
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `x`
	* @param na - number of rows of `A` to permute
	* @param A - companion matrix whose columns are permuted alongside `x` when `apply` is `true`
	* @param strideA1 - stride of the first (row) dimension of `A`
	* @param strideA2 - stride of the second (column) dimension of `A`
	* @param offsetA - starting index for `A`
	*/
	ndarray( which: string, apply: boolean, N: number, x: Float64Array, strideX: number, offsetX: number, na: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number ): void;
}

/**
* Sorts eigenvalues and applies the permutation to the columns of a companion matrix for the symmetric Lanczos/Arnoldi iteration.
*/
declare var dsesrt: Routine;


// EXPORTS //

export = dsesrt;
