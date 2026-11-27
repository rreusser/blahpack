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
* Interface describing `dhsein`.
*/
interface Routine {
	/**
	* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix
	*
	* @param order - storage layout
	* @param side - specifies the operation type
	* @param eigsrc - specifies the operation type
	* @param initv - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param N - number of columns
	* @param H - input matrix
	* @param LDH - leading dimension of `H`
	* @param WR - input array
	* @param strideWR - stride length for `WR`
	* @param WI - input array
	* @param strideWI - stride length for `WI`
	* @param VL - input matrix
	* @param LDVL - leading dimension of `VL`
	* @param VR - input matrix
	* @param LDVR - leading dimension of `VR`
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param IFAILL - input array
	* @param strideIFAILL - stride length for `IFAILL`
	* @param offsetIFAILL - starting index for `IFAILL`
	* @param IFAILR - output array
	* @param strideIFAILR - stride length for `IFAILR`
	* @param offsetIFAILR - starting index for `IFAILR`
	* @returns result
	*/
	( order: Layout, side: string, eigsrc: string, initv: string, SELECT: Float64Array, strideSELECT: number, N: number, H: Float64Array, LDH: number, WR: Float64Array, strideWR: number, WI: Float64Array, strideWI: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, mm: number, M: number, WORK: Float64Array, strideWORK: number, IFAILL: Int32Array, strideIFAILL: number, offsetIFAILL: number, IFAILR: Int32Array, strideIFAILR: number, offsetIFAILR: number ): Float64Array;

	/**
	* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix, using alternative indexing semantics.
	*
	* @param side - specifies the operation type
	* @param eigsrc - specifies the operation type
	* @param initv - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param H - input matrix
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
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
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IFAILL - input array
	* @param strideIFAILL - stride length for `IFAILL`
	* @param offsetIFAILL - starting index for `IFAILL`
	* @param IFAILR - output array
	* @param strideIFAILR - stride length for `IFAILR`
	* @param offsetIFAILR - starting index for `IFAILR`
	* @returns result
	*/
	ndarray( side: string, eigsrc: string, initv: string, SELECT: Float64Array, strideSELECT: number, offsetSELECT: number, N: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, WR: Float64Array, strideWR: number, offsetWR: number, WI: Float64Array, strideWI: number, offsetWI: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, mm: number, M: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IFAILL: Int32Array, strideIFAILL: number, offsetIFAILL: number, IFAILR: Int32Array, strideIFAILR: number, offsetIFAILR: number ): Float64Array;
}

/**
* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix
*/
declare var dhsein: Routine;


// EXPORTS //

export = dhsein;
