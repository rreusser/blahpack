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
* Interface describing `dgges`.
*/
interface Routine {
	/**
	* Computes generalized eigenvalues and real Schur form for a pair of real nonsymmetric matrices
	*
	* @param order - storage layout
	* @param jobvsl - specifies the operation type
	* @param jobvsr - specifies the operation type
	* @param sort - specifies the operation type
	* @param selctg - selctg
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param sdim - sdim
	* @param ALPHAR - input array
	* @param strideALPHAR - stride length for `ALPHAR`
	* @param ALPHAI - input array
	* @param strideALPHAI - stride length for `ALPHAI`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param VSL - input matrix
	* @param LDVSL - leading dimension of `VSL`
	* @param VSR - input matrix
	* @param LDVSR - leading dimension of `VSR`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param lwork - lwork
	* @param BWORK - output array
	* @param strideBWORK - stride length for `BWORK`
	* @returns result
	*/
	( order: Layout, jobvsl: string, jobvsr: string, sort: string, selctg: boolean, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, sdim: number, ALPHAR: Float64Array, strideALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, BETA: Float64Array, strideBETA: number, VSL: Float64Array, LDVSL: number, VSR: Float64Array, LDVSR: number, WORK: Float64Array, strideWORK: number, lwork: number, BWORK: Float64Array, strideBWORK: number ): Float64Array;

	/**
	* Computes generalized eigenvalues and real Schur form for a pair of real nonsymmetric matrices, using alternative indexing semantics.
	*
	* @param jobvsl - specifies the operation type
	* @param jobvsr - specifies the operation type
	* @param sort - specifies the operation type
	* @param selctg - selctg
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param sdim - sdim
	* @param ALPHAR - input array
	* @param strideALPHAR - stride length for `ALPHAR`
	* @param offsetALPHAR - starting index for `ALPHAR`
	* @param ALPHAI - input array
	* @param strideALPHAI - stride length for `ALPHAI`
	* @param offsetALPHAI - starting index for `ALPHAI`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param VSL - input matrix
	* @param strideVSL1 - stride of `VSL`
	* @param strideVSL2 - stride of `VSL`
	* @param offsetVSL - starting index for `VSL`
	* @param VSR - input matrix
	* @param strideVSR1 - stride of `VSR`
	* @param strideVSR2 - stride of `VSR`
	* @param offsetVSR - starting index for `VSR`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - lwork
	* @param BWORK - output array
	* @param strideBWORK - stride length for `BWORK`
	* @param offsetBWORK - starting index for `BWORK`
	* @returns result
	*/
	ndarray( jobvsl: string, jobvsr: string, sort: string, selctg: boolean, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, sdim: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, VSL: Float64Array, strideVSL1: number, strideVSL2: number, offsetVSL: number, VSR: Float64Array, strideVSR1: number, strideVSR2: number, offsetVSR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, BWORK: Float64Array, strideBWORK: number, offsetBWORK: number ): Float64Array;
}

/**
* Computes generalized eigenvalues and real Schur form for a pair of real nonsymmetric matrices
*/
declare var dgges: Routine;


// EXPORTS //

export = dgges;
