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
* Interface describing `zgeevx`.
*/
interface Routine {
	/**
	* Computes eigenvalues and, optionally, eigenvectors with optional balancing and reciprocal condition numbers for a complex nonsymmetric matrix, using alternative indexing semantics.
	*
	* @param order - storage layout
	* @param balanc - `balanc`
	* @param jobvl - `jobvl`
	* @param jobvr - `jobvr`
	* @param sense - `sense`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param VL - `VL`
	* @param LDVL - leading dimension of `VL`
	* @param VR - `VR`
	* @param LDVR - leading dimension of `VR`
	* @param ilo - lower index
	* @param ihi - upper index
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param abnrm - `abnrm`
	* @param RCONDE - `RCONDE`
	* @param strideRCONDE - stride of `RCONDE`
	* @param RCONDV - `RCONDV`
	* @param strideRCONDV - stride of `RCONDV`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( order: Layout, balanc: number, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, LDA: number, w: Float64Array, strideW: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, abnrm: number, RCONDE: Float64Array, strideRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): Record<string, unknown>;

	/**
	* Computes eigenvalues and, optionally, eigenvectors with optional balancing and reciprocal condition numbers for a complex nonsymmetric matrix, using alternative indexing semantics using alternative indexing semantics.
	*
	* @param balanc - `balanc`
	* @param jobvl - `jobvl`
	* @param jobvr - `jobvr`
	* @param sense - `sense`
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
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
	* @param ilo - lower index
	* @param ihi - upper index
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param offsetSCALE - starting index for `SCALE`
	* @param abnrm - `abnrm`
	* @param RCONDE - `RCONDE`
	* @param strideRCONDE - stride of `RCONDE`
	* @param offsetRCONDE - starting index for `RCONDE`
	* @param RCONDV - `RCONDV`
	* @param strideRCONDV - stride of `RCONDV`
	* @param offsetRCONDV - starting index for `RCONDV`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( balanc: number, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, w: Float64Array, strideW: number, offsetW: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, offsetSCALE: number, abnrm: number, RCONDE: Float64Array, strideRCONDE: number, offsetRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, offsetRCONDV: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): Record<string, unknown>;
}

/**
* Computes eigenvalues and, optionally, eigenvectors with optional balancing and reciprocal condition numbers for a complex nonsymmetric matrix, using alternative indexing semantics.
*/
declare var zgeevx: Routine;


// EXPORTS //

export = zgeevx;
