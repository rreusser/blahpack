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
* Interface describing `zggsvd3`.
*/
interface Routine {
	/**
	* Computes the generalized SVD of a pair of complex matrices
	*
	* @param order - storage layout
	* @param jobu - specifies the operation type
	* @param jobv - specifies the operation type
	* @param jobq - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param p - p
	* @param K - number of superdiagonals
	* @param l - l
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param ALPHA - input array
	* @param strideALPHA - stride length for `ALPHA`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param U - input matrix
	* @param LDU - leading dimension of `U`
	* @param V - input matrix
	* @param LDV - leading dimension of `V`
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param RWORK - input array
	* @param strideRWORK - stride length for `RWORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, jobu: string, jobv: string, jobq: string, M: number, N: number, p: number, K: number, l: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, ALPHA: Float64Array, strideALPHA: number, BETA: Float64Array, strideBETA: number, U: Float64Array, LDU: number, V: Float64Array, LDV: number, Q: Float64Array, LDQ: number, WORK: Float64Array, strideWORK: number, RWORK: Float64Array, strideRWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Computes the generalized SVD of a pair of complex matrices, using alternative indexing semantics.
	*
	* @param jobu - specifies the operation type
	* @param jobv - specifies the operation type
	* @param jobq - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param p - p
	* @param K - number of superdiagonals
	* @param l - l
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param ALPHA - input array
	* @param strideALPHA - stride length for `ALPHA`
	* @param offsetALPHA - starting index for `ALPHA`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param U - input matrix
	* @param strideU1 - stride of `U`
	* @param strideU2 - stride of `U`
	* @param offsetU - starting index for `U`
	* @param V - input matrix
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - input array
	* @param strideRWORK - stride length for `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( jobu: string, jobv: string, jobq: string, M: number, N: number, p: number, K: number, l: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, ALPHA: Float64Array, strideALPHA: number, offsetALPHA: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Computes the generalized SVD of a pair of complex matrices
*/
declare var zggsvd3: Routine;


// EXPORTS //

export = zggsvd3;
