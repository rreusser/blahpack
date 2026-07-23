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

import { OperationSide } from '@stdlib/types/blas';

/**
* Interface describing `ztrevc3`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param side - specifies the side of the operation
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
	* @param mm - `mm`
	* @param M - number of rows
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( side: OperationSide, howmny: string, SELECT: Int32Array, strideSELECT: number, N: number, T: Float64Array, LDT: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, mm: number, M: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
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
	* @param mm - `mm`
	* @param M - number of rows
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( side: OperationSide, howmny: string, SELECT: Int32Array, strideSELECT: number, offsetSELECT: number, N: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, mm: number, M: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): number;
}

/**
* @license MIT.
*/
declare var ztrevc3: Routine;


// EXPORTS //

export = ztrevc3;
