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

import { Layout, OperationSide } from '@stdlib/types/blas';

/**
* Interface describing `zhsein`.
*/
interface Routine {
	/**
	* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix.
	*
	* @param order - storage layout
	* @param side - specifies the side of the operation
	* @param eigsrc - `eigsrc`
	* @param initv - `initv`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param N - number of columns
	* @param H - `H`
	* @param LDH - leading dimension of `H`
	* @param w - `w`
	* @param strideW - stride of `W`
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
	* @param IFAILL - `IFAILL`
	* @param strideIFAILL - stride of `IFAILL`
	* @param offsetIFAILL - starting index for `IFAILL`
	* @param IFAILR - `IFAILR`
	* @param strideIFAILR - stride of `IFAILR`
	* @param offsetIFAILR - starting index for `IFAILR`
	* @returns result
	*/
	( order: Layout, side: OperationSide, eigsrc: number, initv: number, SELECT: Int32Array, strideSELECT: number, N: number, H: Float64Array, LDH: number, w: Float64Array, strideW: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, mm: number, M: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number, IFAILL: Float64Array, strideIFAILL: number, offsetIFAILL: number, IFAILR: Float64Array, strideIFAILR: number, offsetIFAILR: number ): number;

	/**
	* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param eigsrc - `eigsrc`
	* @param initv - `initv`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param H - `H`
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
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
	* @param IFAILL - `IFAILL`
	* @param strideIFAILL - stride of `IFAILL`
	* @param offsetIFAILL - starting index for `IFAILL`
	* @param IFAILR - `IFAILR`
	* @param strideIFAILR - stride of `IFAILR`
	* @param offsetIFAILR - starting index for `IFAILR`
	* @returns result
	*/
	ndarray( side: OperationSide, eigsrc: number, initv: number, SELECT: Int32Array, strideSELECT: number, offsetSELECT: number, N: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, w: Float64Array, strideW: number, offsetW: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, mm: number, M: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number, IFAILL: Float64Array, strideIFAILL: number, offsetIFAILL: number, IFAILR: Float64Array, strideIFAILR: number, offsetIFAILR: number ): number;
}

/**
* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix.
*/
declare var zhsein: Routine;


// EXPORTS //

export = zhsein;
