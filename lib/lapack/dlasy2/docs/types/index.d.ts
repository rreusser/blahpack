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
* Interface describing `dlasy2`.
*/
interface Routine {
	/**
	* Solves for the N1-by-N2 matrix X in:.
	*
	* @param ltranl - `ltranl`
	* @param ltranr - `ltranr`
	* @param isgn - `isgn`
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param TL - `TL`
	* @param LDTL - leading dimension of `TL`
	* @param TR - `TR`
	* @param LDTR - leading dimension of `TR`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param scale - `scale`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param xnorm - `xnorm`
	* @returns result
	*/
	( ltranl: boolean, ltranr: boolean, isgn: string, n1: number, n2: number, TL: Float64Array, LDTL: number, TR: Float64Array, LDTR: number, B: Float64Array, LDB: number, scale: number, X: Float64Array, LDX: number, xnorm: number ): Float64Array;

	/**
	* Solves for the N1-by-N2 matrix X in: using alternative indexing semantics.
	*
	* @param ltranl - `ltranl`
	* @param ltranr - `ltranr`
	* @param isgn - `isgn`
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param TL - `TL`
	* @param strideTL1 - stride of `TL`
	* @param strideTL2 - stride of `TL`
	* @param offsetTL - starting index for `TL`
	* @param TR - `TR`
	* @param strideTR1 - stride of `TR`
	* @param strideTR2 - stride of `TR`
	* @param offsetTR - starting index for `TR`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param scale - `scale`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param xnorm - `xnorm`
	* @returns result
	*/
	ndarray( ltranl: boolean, ltranr: boolean, isgn: string, n1: number, n2: number, TL: Float64Array, strideTL1: number, strideTL2: number, offsetTL: number, TR: Float64Array, strideTR1: number, strideTR2: number, offsetTR: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, scale: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, xnorm: number ): Float64Array;
}

/**
* Solves for the N1-by-N2 matrix X in:.
*/
declare var dlasy2: Routine;


// EXPORTS //

export = dlasy2;
