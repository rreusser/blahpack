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
* Interface describing `zunhr_col`.
*/
interface Routine {
	/**
	* TODO: Add description for ZUNHR_COL.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param nb - `nb`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @returns result
	*/
	( order: Layout, M: number, N: number, nb: number, A: Float64Array, LDA: number, T: Float64Array, LDT: number, d: Float64Array, strideD: number ): number;

	/**
	* TODO: Add description for ZUNHR_COL using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param nb - `nb`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @returns result
	*/
	ndarray( M: number, N: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, d: Float64Array, strideD: number, offsetD: number ): number;
}

/**
* TODO: Add description for ZUNHR_COL.
*/
declare var zunhr_col: Routine;


// EXPORTS //

export = zunhr_col;
