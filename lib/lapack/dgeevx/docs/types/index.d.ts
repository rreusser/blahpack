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
* Interface describing `dgeevx`.
*/
interface Routine {
	/**
	* Computes eigenvalues, eigenvectors, and reciprocal condition numbers for a real nonsymmetric matrix
	*
	* @param order - storage layout
	* @param balanc - specifies the operation type
	* @param jobvl - specifies the operation type
	* @param jobvr - specifies the operation type
	* @param sense - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param WR - input array
	* @param strideWR - stride length for `WR`
	* @param WI - input array
	* @param strideWI - stride length for `WI`
	* @param VL - input matrix
	* @param LDVL - leading dimension of `VL`
	* @param VR - input matrix
	* @param LDVR - leading dimension of `VR`
	* @param ilo - ilo
	* @param ihi - ihi
	* @param SCALE - input array
	* @param strideSCALE - stride length for `SCALE`
	* @param abnrm - abnrm
	* @param RCONDE - input array
	* @param strideRCONDE - stride length for `RCONDE`
	* @param RCONDV - input array
	* @param strideRCONDV - stride length for `RCONDV`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param lwork - lwork
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, balanc: string, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, LDA: number, WR: Float64Array, strideWR: number, WI: Float64Array, strideWI: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, abnrm: number, RCONDE: Float64Array, strideRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, WORK: Float64Array, strideWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Computes eigenvalues, eigenvectors, and reciprocal condition numbers for a real nonsymmetric matrix, using alternative indexing semantics.
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
	* @param WR - input array
	* @param strideWR - stride length for `WR`
	* @param offsetWR - starting index for `WR`
	* @param WI - input array
	* @param strideWI - stride length for `WI`
	* @param offsetWI - starting index for `WI`
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
	* @param SCALE - input array
	* @param strideSCALE - stride length for `SCALE`
	* @param offsetSCALE - starting index for `SCALE`
	* @param abnrm - abnrm
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
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( balanc: string, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, WR: Float64Array, strideWR: number, offsetWR: number, WI: Float64Array, strideWI: number, offsetWI: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, offsetSCALE: number, abnrm: number, RCONDE: Float64Array, strideRCONDE: number, offsetRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, offsetRCONDV: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Computes eigenvalues, eigenvectors, and reciprocal condition numbers for a real nonsymmetric matrix
*/
declare var dgeevx: Routine;


// EXPORTS //

export = dgeevx;
