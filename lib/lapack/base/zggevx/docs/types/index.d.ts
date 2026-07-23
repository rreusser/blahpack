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
* Interface describing `zggevx`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param balanc - `balanc`
	* @param jobvl - `jobvl`
	* @param jobvr - `jobvr`
	* @param sense - `sense`
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param ALPHA - `ALPHA`
	* @param strideALPHA - stride of `ALPHA`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param VL - `VL`
	* @param LDVL - leading dimension of `VL`
	* @param VR - `VR`
	* @param LDVR - leading dimension of `VR`
	* @param LSCALE - `LSCALE`
	* @param strideLSCALE - stride of `LSCALE`
	* @param RSCALE - `RSCALE`
	* @param strideRSCALE - stride of `RSCALE`
	* @param RCONDE - `RCONDE`
	* @param strideRCONDE - stride of `RCONDE`
	* @param RCONDV - `RCONDV`
	* @param strideRCONDV - stride of `RCONDV`
	* @returns result
	*/
	( order: Layout, balanc: number, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, ALPHA: Float64Array, strideALPHA: number, BETA: Float64Array, strideBETA: number, VL: Float64Array, LDVL: number, VR: Float64Array, LDVR: number, LSCALE: Float64Array, strideLSCALE: number, RSCALE: Float64Array, strideRSCALE: number, RCONDE: Float64Array, strideRCONDE: number, RCONDV: Float64Array, strideRCONDV: number ): { ilo: number; ihi: number; abnrm: number; bbnrm: number };

	/**
	* @license MIT using alternative indexing semantics.
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
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param ALPHA - `ALPHA`
	* @param strideALPHA - stride of `ALPHA`
	* @param offsetALPHA - starting index for `ALPHA`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param VL - `VL`
	* @param strideVL1 - stride of `VL`
	* @param strideVL2 - stride of `VL`
	* @param offsetVL - starting index for `VL`
	* @param VR - `VR`
	* @param strideVR1 - stride of `VR`
	* @param strideVR2 - stride of `VR`
	* @param offsetVR - starting index for `VR`
	* @param LSCALE - `LSCALE`
	* @param strideLSCALE - stride of `LSCALE`
	* @param offsetLSCALE - starting index for `LSCALE`
	* @param RSCALE - `RSCALE`
	* @param strideRSCALE - stride of `RSCALE`
	* @param offsetRSCALE - starting index for `RSCALE`
	* @param RCONDE - `RCONDE`
	* @param strideRCONDE - stride of `RCONDE`
	* @param offsetRCONDE - starting index for `RCONDE`
	* @param RCONDV - `RCONDV`
	* @param strideRCONDV - stride of `RCONDV`
	* @param offsetRCONDV - starting index for `RCONDV`
	* @returns result
	*/
	ndarray( balanc: number, jobvl: string, jobvr: string, sense: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, ALPHA: Float64Array, strideALPHA: number, offsetALPHA: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, VL: Float64Array, strideVL1: number, strideVL2: number, offsetVL: number, VR: Float64Array, strideVR1: number, strideVR2: number, offsetVR: number, LSCALE: Float64Array, strideLSCALE: number, offsetLSCALE: number, RSCALE: Float64Array, strideRSCALE: number, offsetRSCALE: number, RCONDE: Float64Array, strideRCONDE: number, offsetRCONDE: number, RCONDV: Float64Array, strideRCONDV: number, offsetRCONDV: number ): { ilo: number; ihi: number; abnrm: number; bbnrm: number };
}

/**
* @license MIT.
*/
declare var zggevx: Routine;


// EXPORTS //

export = zggevx;
