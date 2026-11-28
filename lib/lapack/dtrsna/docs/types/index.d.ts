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
* Interface describing `dtrsna`.
*/
interface Routine {
	/**
	* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix
	*
	* @param order - storage layout
	* @param job - specifies the operation type
	* @param howmny - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param N - number of columns
	* @param T - input matrix
	* @param LDT - leading dimension of `T`
	* @param VL - input matrix
	* @param LDVL - leading dimension of `VL`
	* @param VR - input matrix
	* @param LDVR - leading dimension of `VR`
	* @param s - input array
	* @param strideS - stride length for `s`
	* @param SEP - input array
	* @param strideSEP - stride length for `SEP`
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - input matrix
	* @param LDWORK - leading dimension of `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, job: string, howmny: string, SELECT: Float64Array, strideSELECT: number, N: number, T: Float64Array, LDT: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, s: Float64Array, strideS: number, SEP: Float64Array, strideSEP: number, mm: number, M: number, WORK: Float64Array, LDWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix, using alternative indexing semantics.
	*
	* @param job - specifies the operation type
	* @param howmny - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param T - input matrix
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
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
	* @param SEP - input array
	* @param strideSEP - stride length for `SEP`
	* @param offsetSEP - starting index for `SEP`
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - input matrix
	* @param strideWORK1 - stride of `WORK`
	* @param strideWORK2 - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( job: string, howmny: string, SELECT: Float64Array, strideSELECT: number, offsetSELECT: number, N: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, s: Float64Array, strideS: number, offsetS: number, SEP: Float64Array, strideSEP: number, offsetSEP: number, mm: number, M: number, WORK: Float64Array, strideWORK1: number, strideWORK2: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimates reciprocal condition numbers of eigenvalues and/or eigenvectors of a real upper quasi-triangular matrix
*/
declare var dtrsna: Routine;


// EXPORTS //

export = dtrsna;
