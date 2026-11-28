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
* Interface describing `dggev`.
*/
interface Routine {
	/**
	* Computes generalized eigenvalues and eigenvectors for a pair of real nonsymmetric matrices
	*
	* @param order - storage layout
	* @param jobvl - specifies the operation type
	* @param jobvr - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param ALPHAR - input array
	* @param strideALPHAR - stride length for `ALPHAR`
	* @param ALPHAI - input array
	* @param strideALPHAI - stride length for `ALPHAI`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param VL - input matrix
	* @param LDVL - leading dimension of `VL`
	* @param VR - input matrix
	* @param LDVR - leading dimension of `VR`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param lwork - lwork
	* @returns result
	*/
	( order: Layout, jobvl: string, jobvr: string, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, ALPHAR: Float64Array, strideALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, BETA: Float64Array, strideBETA: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, WORK: Float64Array, strideWORK: number, lwork: number ): Float64Array;

	/**
	* Computes generalized eigenvalues and eigenvectors for a pair of real nonsymmetric matrices, using alternative indexing semantics.
	*
	* @param jobvl - specifies the operation type
	* @param jobvr - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param ALPHAR - input array
	* @param strideALPHAR - stride length for `ALPHAR`
	* @param offsetALPHAR - starting index for `ALPHAR`
	* @param ALPHAI - input array
	* @param strideALPHAI - stride length for `ALPHAI`
	* @param offsetALPHAI - starting index for `ALPHAI`
	* @param BETA - input array
	* @param strideBETA - stride length for `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param VL - input matrix
	* @param strideVL1 - stride of `VL`
	* @param strideVL2 - stride of `VL`
	* @param offsetVL - starting index for `VL`
	* @param VR - input matrix
	* @param strideVR1 - stride of `VR`
	* @param strideVR2 - stride of `VR`
	* @param offsetVR - starting index for `VR`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - lwork
	* @returns result
	*/
	ndarray( jobvl: string, jobvr: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number ): Float64Array;
}

/**
* Computes generalized eigenvalues and eigenvectors for a pair of real nonsymmetric matrices
*/
declare var dggev: Routine;


// EXPORTS //

export = dggev;
