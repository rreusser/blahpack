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
* Interface describing `dgetsqrhrt`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param mb1 - `mb1`
	* @param nb1 - `nb1`
	* @param nb2 - `nb2`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param WORK - `WORK`
	* @returns result
	*/
	( order: Layout, M: number, N: number, mb1: number, nb1: number, nb2: number, A: Float64Array, LDA: number, T: Float64Array, LDT: number, WORK: Float64Array ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param mb1 - `mb1`
	* @param nb1 - `nb1`
	* @param nb2 - `nb2`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( M: number, N: number, mb1: number, nb1: number, nb2: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* @license MIT.
*/
declare var dgetsqrhrt: Routine;


// EXPORTS //

export = dgetsqrhrt;
