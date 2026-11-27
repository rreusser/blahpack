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

/**
* Interface describing `dgeev`.
*/
interface Routine {
	/**
	* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
	*
	* @param jobvl - `jobvl`
	* @param jobvr - `jobvr`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param WR - `WR`
	* @param strideWR - stride of `WR`
	* @param WI - `WI`
	* @param strideWI - stride of `WI`
	* @param VL - `VL`
	* @param LDVL - leading dimension of `VL`
	* @param VR - `VR`
	* @param LDVR - leading dimension of `VR`
	* @returns result
	*/
	( jobvl: string, jobvr: string, N: number, A: Float64Array, LDA: number, WR: Float64Array, strideWR: number, WI: Float64Array, strideWI: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number ): Float64Array;

	/**
	* Computes the eigenvalues and, optionally, the left and/or right eigenvectors using alternative indexing semantics.
	*
	* @param jobvl - `jobvl`
	* @param jobvr - `jobvr`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param WR - `WR`
	* @param strideWR - stride of `WR`
	* @param offsetWR - starting index for `WR`
	* @param WI - `WI`
	* @param strideWI - stride of `WI`
	* @param offsetWI - starting index for `WI`
	* @param VL - `VL`
	* @param strideVL1 - stride of `VL`
	* @param strideVL2 - stride of `VL`
	* @param offsetVL - starting index for `VL`
	* @param VR - `VR`
	* @param strideVR1 - stride of `VR`
	* @param strideVR2 - stride of `VR`
	* @param offsetVR - starting index for `VR`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @returns result
	*/
	ndarray( jobvl: string, jobvr: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, WR: Float64Array, strideWR: number, offsetWR: number, WI: Float64Array, strideWI: number, offsetWI: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number ): Float64Array;
}

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
*/
declare var dgeev: Routine;


// EXPORTS //

export = dgeev;
