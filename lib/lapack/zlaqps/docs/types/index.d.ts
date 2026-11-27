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
* Interface describing `zlaqps`.
*/
interface Routine {
	/**
	* Computes a step of QR factorization with column pivoting using a.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param offset - starting index for ``
	* @param nb - `nb`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param JPVT - `JPVT`
	* @param strideJPVT - stride of `JPVT`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param VN1 - `VN1`
	* @param strideVN1 - stride of `VN`
	* @param VN2 - `VN2`
	* @param strideVN2 - stride of `VN`
	* @param AUXV - `AUXV`
	* @param strideAUXV - stride of `AUXV`
	* @param F - `F`
	* @param LDF - leading dimension of `F`
	* @returns result
	*/
	( order: Layout, M: number, N: number, offset: number, nb: number, A: Float64Array, LDA: number, JPVT: Float64Array, strideJPVT: number, TAU: Float64Array, strideTAU: number, VN1: number, strideVN1: number, VN2: number, strideVN2: number, AUXV: Float64Array, strideAUXV: number, F: Float64Array, LDF: number ): Float64Array;

	/**
	* Computes a step of QR factorization with column pivoting using a using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param offset - starting index for ``
	* @param nb - `nb`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param JPVT - `JPVT`
	* @param strideJPVT - stride of `JPVT`
	* @param offsetJPVT - starting index for `JPVT`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param VN1 - `VN1`
	* @param strideVN1 - stride of `VN`
	* @param offsetVN1 - starting index for `VN1`
	* @param VN2 - `VN2`
	* @param strideVN2 - stride of `VN`
	* @param offsetVN2 - starting index for `VN2`
	* @param AUXV - `AUXV`
	* @param strideAUXV - stride of `AUXV`
	* @param offsetAUXV - starting index for `AUXV`
	* @param F - `F`
	* @param strideF1 - stride of `F`
	* @param strideF2 - stride of `F`
	* @param offsetF - starting index for `F`
	* @returns result
	*/
	ndarray( M: number, N: number, offset: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, JPVT: Float64Array, strideJPVT: number, offsetJPVT: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, VN1: number, strideVN1: number, offsetVN1: number, VN2: number, strideVN2: number, offsetVN2: number, AUXV: Float64Array, strideAUXV: number, offsetAUXV: number, F: Float64Array, strideF1: number, strideF2: number, offsetF: number ): Float64Array;
}

/**
* Computes a step of QR factorization with column pivoting using a.
*/
declare var zlaqps: Routine;


// EXPORTS //

export = zlaqps;
