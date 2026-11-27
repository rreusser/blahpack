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
* Interface describing `dtgevc`.
*/
interface Routine {
	/**
	* Computes some or all of the right and/or left eigenvectors of a pair of real matrices.
	*
	* @param order - storage layout
	* @param side - specifies the operation type
	* @param howmny - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param N - number of columns
	* @param S - input matrix
	* @param LDS - leading dimension of `S`
	* @param P - input matrix
	* @param LDP - leading dimension of `P`
	* @param VL - input matrix
	* @param LDVL - leading dimension of `VL`
	* @param VR - input matrix
	* @param LDVR - leading dimension of `VR`
	* @param mm - mm
	* @param M - number of rows
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, side: string, howmny: string, SELECT: Float64Array, strideSELECT: number, N: number, S: Float64Array, LDS: number, P: Float64Array, LDP: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, mm: number, M: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Computes some or all of the right and/or left eigenvectors of a pair of real matrices., using alternative indexing semantics.
	*
	* @param side - specifies the operation type
	* @param howmny - specifies the operation type
	* @param SELECT - input array
	* @param strideSELECT - stride length for `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param S - input matrix
	* @param strideS1 - stride of `S`
	* @param strideS2 - stride of `S`
	* @param offsetS - starting index for `S`
	* @param P - input matrix
	* @param strideP1 - stride of `P`
	* @param strideP2 - stride of `P`
	* @param offsetP - starting index for `P`
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
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: string, howmny: string, SELECT: Float64Array, strideSELECT: number, offsetSELECT: number, N: number, S: Float64Array, strideS1: number, strideS2: number, offsetS: number, P: Float64Array, strideP1: number, strideP2: number, offsetP: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, mm: number, M: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes some or all of the right and/or left eigenvectors of a pair of real matrices.
*/
declare var dtgevc: Routine;


// EXPORTS //

export = dtgevc;
