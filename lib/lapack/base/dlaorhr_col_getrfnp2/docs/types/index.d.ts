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
* Interface describing `dlaorhr_col_getrfnp2`.
*/
interface Routine {
	/**
	* Computes the modified LU factorization without pivoting of a real general M-by-N matrix `A` (recursive kernel).
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, d: Float64Array, strideD: number ): number;

	/**
	* Computes the modified LU factorization without pivoting of a real general M-by-N matrix `A` (recursive kernel) using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param D - `D`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, D: Float64Array, strideD: number, offsetD: number ): number;
}

/**
* Computes the modified LU factorization without pivoting of a real general M-by-N matrix `A` (recursive kernel).
*/
declare var dlaorhr_col_getrfnp2: Routine;


// EXPORTS //

export = dlaorhr_col_getrfnp2;
