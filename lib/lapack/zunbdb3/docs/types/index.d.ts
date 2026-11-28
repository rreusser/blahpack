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
import { Complex128Array } from '@stdlib/types/array';

/**
* Interface describing `zunbdb3`.
*/
interface Routine {
	/**
	* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (variant 3 — `M-P` is the minimum dimension).
	*
	* @param order - storage layout
	* @param M - total number of rows
	* @param P - number of rows in `X11`
	* @param Q - number of columns
	* @param X11 - top block (`P`-by-`Q`)
	* @param LDX11 - leading dimension of `X11`
	* @param X21 - bottom block (`(M-P)`-by-`Q`)
	* @param LDX21 - leading dimension of `X21`
	* @param THETA - output array of length at least `Q`
	* @param strideTHETA - stride length for `THETA`
	* @param PHI - output array of length at least `Q-1`
	* @param stridePHI - stride length for `PHI`
	* @param TAUP1 - output array of length at least `P`
	* @param strideTAUP1 - stride length for `TAUP1`
	* @param TAUP2 - output array of length at least `M-P`
	* @param strideTAUP2 - stride length for `TAUP2`
	* @param TAUQ1 - output array of length at least `Q`
	* @param strideTAUQ1 - stride length for `TAUQ1`
	* @param WORK - workspace
	* @param strideWORK - stride length for `WORK`
	* @returns `info` (0 = success)
	*/
	( order: Layout, M: number, P: number, Q: number, X11: Complex128Array, LDX11: number, X21: Complex128Array, LDX21: number, THETA: Float64Array, strideTHETA: number, PHI: Float64Array, stridePHI: number, TAUP1: Complex128Array, strideTAUP1: number, TAUP2: Complex128Array, strideTAUP2: number, TAUQ1: Complex128Array, strideTAUQ1: number, WORK: Complex128Array, strideWORK: number ): number;

	/**
	* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (variant 3), using alternative indexing semantics.
	*
	* @param M - total number of rows
	* @param P - number of rows in `X11`
	* @param Q - number of columns
	* @param X11 - top block
	* @param strideX111 - stride of the first dimension of `X11`
	* @param strideX112 - stride of the second dimension of `X11`
	* @param offsetX11 - starting index for `X11`
	* @param X21 - bottom block
	* @param strideX211 - stride of the first dimension of `X21`
	* @param strideX212 - stride of the second dimension of `X21`
	* @param offsetX21 - starting index for `X21`
	* @param THETA - output array
	* @param strideTHETA - stride length for `THETA`
	* @param offsetTHETA - starting index for `THETA`
	* @param PHI - output array
	* @param stridePHI - stride length for `PHI`
	* @param offsetPHI - starting index for `PHI`
	* @param TAUP1 - output array
	* @param strideTAUP1 - stride length for `TAUP1`
	* @param offsetTAUP1 - starting index for `TAUP1`
	* @param TAUP2 - output array
	* @param strideTAUP2 - stride length for `TAUP2`
	* @param offsetTAUP2 - starting index for `TAUP2`
	* @param TAUQ1 - output array
	* @param strideTAUQ1 - stride length for `TAUQ1`
	* @param offsetTAUQ1 - starting index for `TAUQ1`
	* @param WORK - workspace
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns `info` (0 = success)
	*/
	ndarray( M: number, P: number, Q: number, X11: Complex128Array, strideX111: number, strideX112: number, offsetX11: number, X21: Complex128Array, strideX211: number, strideX212: number, offsetX21: number, THETA: Float64Array, strideTHETA: number, offsetTHETA: number, PHI: Float64Array, stridePHI: number, offsetPHI: number, TAUP1: Complex128Array, strideTAUP1: number, offsetTAUP1: number, TAUP2: Complex128Array, strideTAUP2: number, offsetTAUP2: number, TAUQ1: Complex128Array, strideTAUQ1: number, offsetTAUQ1: number, WORK: Complex128Array, strideWORK: number, offsetWORK: number ): number;
}

/**
* Simultaneously bidiagonalizes the blocks of a tall and skinny complex matrix `[X11; X21]` with orthonormal columns (variant 3).
*/
declare var zunbdb3: Routine;


// EXPORTS //

export = zunbdb3;
