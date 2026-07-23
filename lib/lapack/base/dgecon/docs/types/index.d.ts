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
* Interface describing `dgecon`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param norm - `norm`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param anorm - `anorm`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @returns result
	*/
	( order: Layout, norm: string, N: number, A: Float64Array, LDA: number, anorm: number, rcond: number, WORK: Float64Array, strideWork: number, IWORK: Int32Array, strideIWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param norm - `norm`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param anorm - `anorm`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( norm: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, anorm: number, rcond: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* @license MIT.
*/
declare var dgecon: Routine;


// EXPORTS //

export = dgecon;
