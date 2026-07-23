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
	* @license MIT.
	*
	* @param order - storage layout
	* @param job - `job`
	* @param howmny - `howmny`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param N - number of columns
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param VL - `VL`
	* @param LDVL - leading dimension of `VL`
	* @param VR - `VR`
	* @param LDVR - leading dimension of `VR`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param SEP - `SEP`
	* @param strideSEP - stride of `SEP`
	* @param mm - `mm`
	* @param WORK - `WORK`
	* @param LDWORK - leading dimension of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	( order: Layout, job: string, howmny: string, SELECT: Int32Array, strideSELECT: number, N: number, T: Float64Array, LDT: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, s: Float64Array, strideS: number, SEP: Float64Array, strideSEP: number, mm: number, WORK: Float64Array, LDWORK: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param job - `job`
	* @param howmny - `howmny`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
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
	* @param SEP - `SEP`
	* @param strideSEP - stride of `SEP`
	* @param offsetSEP - starting index for `SEP`
	* @param mm - `mm`
	* @param WORK - `WORK`
	* @param strideWork1 - stride of `Work`
	* @param strideWork2 - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( job: string, howmny: string, SELECT: Int32Array, strideSELECT: number, offsetSELECT: number, N: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, s: Float64Array, strideS: number, offsetS: number, SEP: Float64Array, strideSEP: number, offsetSEP: number, mm: number, WORK: Float64Array, strideWork1: number, strideWork2: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* @license MIT.
*/
declare var dtrsna: Routine;


// EXPORTS //

export = dtrsna;
