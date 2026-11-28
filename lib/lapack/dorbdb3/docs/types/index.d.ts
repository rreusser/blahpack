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
* Interface describing `dorbdb3`.
*/
interface Routine {
	/**
	* Simultaneously bidiagonalize the blocks of a tall and skinny matrix with orthonormal columns (M-P minimum dimension variant)
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param p - p
	* @param q - q
	* @param X11 - input matrix
	* @param LDX11 - leading dimension of `X11`
	* @param X21 - input matrix
	* @param LDX21 - leading dimension of `X21`
	* @param THETA - input array
	* @param strideTHETA - stride length for `THETA`
	* @param PHI - input array
	* @param stridePHI - stride length for `PHI`
	* @param TAUP1 - input array
	* @param strideTAUP1 - stride length for `TAUP1`
	* @param TAUP2 - input array
	* @param strideTAUP2 - stride length for `TAUP2`
	* @param TAUQ1 - input array
	* @param strideTAUQ1 - stride length for `TAUQ1`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, M: number, p: number, q: number, X11: Float64Array, LDX11: number, X21: Float64Array, LDX21: number, THETA: Float64Array, strideTHETA: number, PHI: Float64Array, stridePHI: number, TAUP1: Float64Array, strideTAUP1: number, TAUP2: Float64Array, strideTAUP2: number, TAUQ1: Float64Array, strideTAUQ1: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Simultaneously bidiagonalize the blocks of a tall and skinny matrix with orthonormal columns (M-P minimum dimension variant), using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param p - p
	* @param q - q
	* @param X11 - input matrix
	* @param strideX111 - stride of `X11`
	* @param strideX112 - stride of `X11`
	* @param offsetX11 - starting index for `X11`
	* @param X21 - input matrix
	* @param strideX211 - stride of `X21`
	* @param strideX212 - stride of `X21`
	* @param offsetX21 - starting index for `X21`
	* @param THETA - input array
	* @param strideTHETA - stride length for `THETA`
	* @param offsetTHETA - starting index for `THETA`
	* @param PHI - input array
	* @param stridePHI - stride length for `PHI`
	* @param offsetPHI - starting index for `PHI`
	* @param TAUP1 - input array
	* @param strideTAUP1 - stride of `TAUP`
	* @param offsetTAUP1 - starting index for `TAUP1`
	* @param TAUP2 - input array
	* @param strideTAUP2 - stride of `TAUP`
	* @param offsetTAUP2 - starting index for `TAUP2`
	* @param TAUQ1 - input array
	* @param strideTAUQ1 - stride of `TAUQ`
	* @param offsetTAUQ1 - starting index for `TAUQ1`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( M: number, p: number, q: number, X11: Float64Array, strideX111: number, strideX112: number, offsetX11: number, X21: Float64Array, strideX211: number, strideX212: number, offsetX21: number, THETA: Float64Array, strideTHETA: number, offsetTHETA: number, PHI: Float64Array, stridePHI: number, offsetPHI: number, TAUP1: Float64Array, strideTAUP1: number, offsetTAUP1: number, TAUP2: Float64Array, strideTAUP2: number, offsetTAUP2: number, TAUQ1: Float64Array, strideTAUQ1: number, offsetTAUQ1: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Simultaneously bidiagonalize the blocks of a tall and skinny matrix with orthonormal columns (M-P minimum dimension variant)
*/
declare var dorbdb3: Routine;


// EXPORTS //

export = dorbdb3;
