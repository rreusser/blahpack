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
* Interface describing `dsortr`.
*/
interface Routine {
	/**
	* Sorts the values in `x1` with a gapped (Shell) insertion sort, optionally applying the same permutation to a companion vector `x2`.
	*
	* @param which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
	* @param apply - whether to apply the sorting permutation to `x2`
	* @param N - number of elements to sort
	* @param x1 - array whose values determine (and receive) the sort
	* @param strideX1 - stride length for `x1`
	* @param x2 - companion array permuted alongside `x1` when `apply` is `true`
	* @param strideX2 - stride length for `x2`
	*/
	( which: string, apply: boolean, N: number, x1: Float64Array, strideX1: number, x2: Float64Array, strideX2: number ): void;

	/**
	* Sorts the values in `x1` with a gapped (Shell) insertion sort, optionally applying the same permutation to a companion vector `x2`, using alternative indexing semantics.
	*
	* @param which - ordering: `'LM'`, `'SM'`, `'LA'`, or `'SA'`
	* @param apply - whether to apply the sorting permutation to `x2`
	* @param N - number of elements to sort
	* @param x1 - array whose values determine (and receive) the sort
	* @param strideX1 - stride length for `x1`
	* @param offsetX1 - starting index for `x1`
	* @param x2 - companion array permuted alongside `x1` when `apply` is `true`
	* @param strideX2 - stride length for `x2`
	* @param offsetX2 - starting index for `x2`
	*/
	ndarray( which: string, apply: boolean, N: number, x1: Float64Array, strideX1: number, offsetX1: number, x2: Float64Array, strideX2: number, offsetX2: number ): void;
}

/**
* Sorts eigenvalues (and optionally applies the permutation to a companion vector) for the symmetric Lanczos/Arnoldi iteration.
*/
declare var dsortr: Routine;


// EXPORTS //

export = dsortr;
