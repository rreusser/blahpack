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

import { TransposeOperation, Layout } from '@stdlib/types/blas';

/**
* Interface describing `dtprfb`.
*/
interface Routine {
	/**
	* Applies a real triangular-pentagonal block reflector to a matrix
	*
	* @param order - storage layout
	* @param side - specifies the operation type
	* @param trans - specifies the operation type
	* @param direct - specifies the operation type
	* @param storev - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param K - number of superdiagonals
	* @param l - l
	* @param V - input matrix
	* @param LDV - leading dimension of `V`
	* @param T - input matrix
	* @param LDT - leading dimension of `T`
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param WORK - output matrix
	* @param LDWORK - leading dimension of `WORK`
	* @returns result
	*/
	( order: Layout, side: string, trans: TransposeOperation, direct: string, storev: string, M: number, N: number, K: number, l: number, V: Float64Array, LDV: number, T: Float64Array, LDT: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, WORK: Float64Array, LDWORK: number ): Float64Array;

	/**
	* Applies a real triangular-pentagonal block reflector to a matrix, using alternative indexing semantics.
	*
	* @param side - specifies the operation type
	* @param trans - specifies the operation type
	* @param direct - specifies the operation type
	* @param storev - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param K - number of superdiagonals
	* @param l - l
	* @param V - input matrix
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param T - input matrix
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param WORK - output matrix
	* @param strideWORK1 - stride of `WORK`
	* @param strideWORK2 - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: string, trans: TransposeOperation, direct: string, storev: string, M: number, N: number, K: number, l: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, WORK: Float64Array, strideWORK1: number, strideWORK2: number, offsetWORK: number ): Float64Array;
}

/**
* Applies a real triangular-pentagonal block reflector to a matrix
*/
declare var dtprfb: Routine;


// EXPORTS //

export = dtprfb;
