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
* Interface describing `dtgsna`.
*/
interface Routine {
	/**
	* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form.
	*
	* @param order - storage layout
	* @param job - `job`
	* @param howmny - `howmny`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param VL - `VL`
	* @param LDVL - leading dimension of `VL`
	* @param VR - `VR`
	* @param LDVR - leading dimension of `VR`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param DIF - `DIF`
	* @param strideDIF - stride of `DIF`
	* @param mm - `mm`
	* @param M - number of rows
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	( order: Layout, job: string, howmny: string, SELECT: Int32Array, strideSELECT: number, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, s: Float64Array, strideS: number, DIF: Float64Array, strideDIF: number, mm: number, M: number, WORK: Float64Array, strideWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;

	/**
	* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form using alternative indexing semantics.
	*
	* @param job - `job`
	* @param howmny - `howmny`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param VL - `VL`
	* @param strideVL1 - stride of `VL`
	* @param strideVL2 - stride of `VL`
	* @param offsetVL - starting index for `VL`
	* @param VR - `VR`
	* @param strideVR1 - stride of `VR`
	* @param strideVR2 - stride of `VR`
	* @param offsetVR - starting index for `VR`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @param DIF - `DIF`
	* @param strideDIF - stride of `DIF`
	* @param offsetDIF - starting index for `DIF`
	* @param mm - `mm`
	* @param M - number of rows
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( job: string, howmny: string, SELECT: Int32Array, strideSELECT: number, offsetSELECT: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, s: Float64Array, strideS: number, offsetS: number, DIF: Float64Array, strideDIF: number, offsetDIF: number, mm: number, M: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form.
*/
declare var dtgsna: Routine;


// EXPORTS //

export = dtgsna;
