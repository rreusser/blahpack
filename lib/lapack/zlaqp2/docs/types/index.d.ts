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
* Interface describing `zlaqp2`.
*/
interface Routine {
	/**
	* Computes a QR factorization with column pivoting of the M-by-N matrix A.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param offset - starting index for ``
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
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( order: Layout, M: number, N: number, offset: number, A: Float64Array, LDA: number, JPVT: Float64Array, strideJPVT: number, TAU: Float64Array, strideTAU: number, VN1: number, strideVN1: number, VN2: number, strideVN2: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Computes a QR factorization with column pivoting of the M-by-N matrix A using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param offset - starting index for ``
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
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( M: number, N: number, offset: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, JPVT: Float64Array, strideJPVT: number, offsetJPVT: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, VN1: number, strideVN1: number, offsetVN1: number, VN2: number, strideVN2: number, offsetVN2: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes a QR factorization with column pivoting of the M-by-N matrix A.
*/
declare var zlaqp2: Routine;


// EXPORTS //

export = zlaqp2;
