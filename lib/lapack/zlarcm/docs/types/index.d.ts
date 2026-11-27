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
* Interface describing `zlarcm`.
*/
interface Routine {
	/**
	* real-by-complex matrix multiply C = A*B
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param C - input matrix
	* @param LDC - leading dimension of `C`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, C: Float64Array, LDC: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

	/**
	* real-by-complex matrix multiply C = A*B, using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param C - input matrix
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* real-by-complex matrix multiply C = A*B
*/
declare var zlarcm: Routine;


// EXPORTS //

export = zlarcm;
