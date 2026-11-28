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
* Interface describing `dggevx`.
*/
interface Routine {
	/**
	* Computes generalized eigenvalues, eigenvectors, and reciprocal condition numbers for a pair of real matrices
	*
	* @param order - storage layout
	* @param balanc - specifies the operation type
	* @param jobvl - specifies the operation type
	* @param jobvr - specifies the operation type
	* @param sense - specifies the operation type
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
	* @param ilo - ilo
	* @param ihi - ihi
	* @param LSCALE - input array
	* @param strideLSCALE - stride length for `LSCALE`
	* @param RSCALE - input array
	* @param strideRSCALE - stride length for `RSCALE`
	* @param abnrm - abnrm
	* @param bbnrm - bbnrm
	* @param RCONDE - input array
	* @param strideRCONDE - stride length for `RCONDE`
	* @param RCONDV - input array
	* @param strideRCONDV - stride length for `RCONDV`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param lwork - lwork
	* @param IWORK - input array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param BWORK - output array
	* @param strideBWORK - stride length for `BWORK`
	* @returns result
	*/
	( order: Layout, balanc: string, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, ALPHAR: Float64Array, strideALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, BETA: Float64Array, strideBETA: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, ilo: number, ihi: number, LSCALE: Float64Array, strideLSCALE: number, RSCALE: Float64Array, strideRSCALE: number, abnrm: number, bbnrm: number, RCONDE: Float64Array, strideRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, WORK: Float64Array, strideWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, BWORK: Float64Array, strideBWORK: number ): Float64Array;

	/**
	* Computes generalized eigenvalues, eigenvectors, and reciprocal condition numbers for a pair of real matrices, using alternative indexing semantics.
	*
	* @param balanc - specifies the operation type
	* @param jobvl - specifies the operation type
	* @param jobvr - specifies the operation type
	* @param sense - specifies the operation type
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
	* @param ilo - ilo
	* @param ihi - ihi
	* @param LSCALE - input array
	* @param strideLSCALE - stride length for `LSCALE`
	* @param offsetLSCALE - starting index for `LSCALE`
	* @param RSCALE - input array
	* @param strideRSCALE - stride length for `RSCALE`
	* @param offsetRSCALE - starting index for `RSCALE`
	* @param abnrm - abnrm
	* @param bbnrm - bbnrm
	* @param RCONDE - input array
	* @param strideRCONDE - stride length for `RCONDE`
	* @param offsetRCONDE - starting index for `RCONDE`
	* @param RCONDV - input array
	* @param strideRCONDV - stride length for `RCONDV`
	* @param offsetRCONDV - starting index for `RCONDV`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - lwork
	* @param IWORK - input array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param BWORK - output array
	* @param strideBWORK - stride length for `BWORK`
	* @param offsetBWORK - starting index for `BWORK`
	* @returns result
	*/
	ndarray( balanc: string, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, ALPHAR: Float64Array, strideALPHAR: number, offsetALPHAR: number, ALPHAI: Float64Array, strideALPHAI: number, offsetALPHAI: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, ilo: number, ihi: number, LSCALE: Float64Array, strideLSCALE: number, offsetLSCALE: number, RSCALE: Float64Array, strideRSCALE: number, offsetRSCALE: number, abnrm: number, bbnrm: number, RCONDE: Float64Array, strideRCONDE: number, offsetRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, offsetRCONDV: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, BWORK: Float64Array, strideBWORK: number, offsetBWORK: number ): Float64Array;
}

/**
* Computes generalized eigenvalues, eigenvectors, and reciprocal condition numbers for a pair of real matrices
*/
declare var dggevx: Routine;


// EXPORTS //

export = dggevx;
