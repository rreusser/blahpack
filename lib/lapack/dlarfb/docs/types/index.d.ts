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

import { OperationSide, TransposeOperation, Layout } from '@stdlib/types/blas';

/**
* Interface describing `dlarfb`.
*/
interface Routine {
	/**
	* Applies a real block reflector H or its transpose H**T to a.
	*
	* @param order - storage layout
	* @param side - specifies the side of the operation
	* @param trans - specifies whether the matrix should be transposed
	* @param direct - `direct`
	* @param storev - `storev`
	* @param M - number of rows
	* @param N - number of columns
	* @param K - inner dimension
	* @param V - `V`
	* @param LDV - leading dimension of `V`
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param WORK - `WORK`
	* @param LDWORK - leading dimension of `WORK`
	* @returns result
	*/
	( order: Layout, side: OperationSide, trans: TransposeOperation, direct: string, storev: string, M: number, N: number, K: number, V: Float64Array, LDV: number, T: Float64Array, LDT: number, C: Float64Array, LDC: number, WORK: Float64Array, LDWORK: number ): Float64Array;

	/**
	* Applies a real block reflector H or its transpose H**T to a using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param trans - specifies whether the matrix should be transposed
	* @param direct - `direct`
	* @param storev - `storev`
	* @param M - number of rows
	* @param N - number of columns
	* @param K - inner dimension
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - `WORK`
	* @param strideWORK1 - stride of `WORK`
	* @param strideWORK2 - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: OperationSide, trans: TransposeOperation, direct: string, storev: string, M: number, N: number, K: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK1: number, strideWORK2: number, offsetWORK: number ): Float64Array;
}

/**
* Applies a real block reflector H or its transpose H**T to a.
*/
declare var dlarfb: Routine;


// EXPORTS //

export = dlarfb;
