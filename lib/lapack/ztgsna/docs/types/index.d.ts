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
* Interface describing `ztgsna`.
*/
interface Routine {
	/**
	* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form
	*
	* @param order - storage layout
	* @param job - specifies the operation type
	* @param howmny - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param VL - input matrix
	* @param LDVL - leading dimension of `VL`
	* @param VR - input matrix
	* @param LDVR - leading dimension of `VR`
	* @param s - input array
	* @param strideS - stride length for `s`
	* @param DIF - input array
	* @param strideDIF - stride length for `DIF`
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param lwork - lwork
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, job: string, howmny: string, SELECT: Float64Array, strideSELECT: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, s: Float64Array, strideS: number, DIF: Float64Array, strideDIF: number, mm: number, M: number, WORK: Float64Array, strideWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form, using alternative indexing semantics.
	*
	* @param job - specifies the operation type
	* @param howmny - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param VL - input matrix
	* @param strideVL1 - stride of `VL`
	* @param strideVL2 - stride of `VL`
	* @param offsetVL - starting index for `VL`
	* @param VR - input matrix
	* @param strideVR1 - stride of `VR`
	* @param strideVR2 - stride of `VR`
	* @param offsetVR - starting index for `VR`
	* @param s - input array
	* @param strideS - stride length for `s`
	* @param offsetS - starting index for `S`
	* @param DIF - input array
	* @param strideDIF - stride length for `DIF`
	* @param offsetDIF - starting index for `DIF`
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - lwork
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( job: string, howmny: string, SELECT: Float64Array, strideSELECT: number, offsetSELECT: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, s: Float64Array, strideS: number, offsetS: number, DIF: Float64Array, strideDIF: number, offsetDIF: number, mm: number, M: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a complex generalized Schur form
*/
declare var ztgsna: Routine;


// EXPORTS //

export = ztgsna;
