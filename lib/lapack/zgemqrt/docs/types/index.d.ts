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
* Interface describing `zgemqrt`.
*/
interface Routine {
	/**
	* Overwrites a complex M-by-N matrix C with op(Q)*C or C*op(Q), where Q is a unitary matrix defined as the product of K elementary reflectors stored in the compact WY representation produced by ZGEQRT
	*
	* @param order - storage layout
	* @param side - specifies the operation type
	* @param trans - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param K - number of superdiagonals
	* @param nb - nb
	* @param V - input matrix
	* @param LDV - leading dimension of `V`
	* @param T - input matrix
	* @param LDT - leading dimension of `T`
	* @param C - input matrix
	* @param LDC - leading dimension of `C`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, side: string, trans: TransposeOperation, M: number, N: number, K: number, nb: number, V: Float64Array, LDV: number, T: Float64Array, LDT: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Overwrites a complex M-by-N matrix C with op(Q)*C or C*op(Q), where Q is a unitary matrix defined as the product of K elementary reflectors stored in the compact WY representation produced by ZGEQRT, using alternative indexing semantics.
	*
	* @param side - specifies the operation type
	* @param trans - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param K - number of superdiagonals
	* @param nb - nb
	* @param V - input matrix
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param T - input matrix
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param C - input matrix
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: string, trans: TransposeOperation, M: number, N: number, K: number, nb: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Overwrites a complex M-by-N matrix C with op(Q)*C or C*op(Q), where Q is a unitary matrix defined as the product of K elementary reflectors stored in the compact WY representation produced by ZGEQRT
*/
declare var zgemqrt: Routine;


// EXPORTS //

export = zgemqrt;
