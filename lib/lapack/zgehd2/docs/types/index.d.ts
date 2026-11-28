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
* Interface describing `zgehd2`.
*/
interface Routine {
	/**
	* Reduces a complex general matrix to upper Hessenberg form using unblocked algorithm.
	*
	* @param order - storage layout (`'row-major'` or `'column-major'`)
	* @param N - order of the matrix `A`
	* @param ilo - lower index of the balanced matrix (1-based)
	* @param ihi - upper index of the balanced matrix (1-based)
	* @param A - input/output matrix; on exit, the upper Hessenberg matrix and the reflectors
	* @param LDA - leading dimension of `A`
	* @param TAU - output array of scalar factors of the elementary reflectors (length `N-1`)
	* @param strideTAU - stride length for `TAU`
	* @param WORK - workspace (or `null` to allocate one internally)
	* @returns status code
	*/
	( order: Layout, N: number, ilo: number, ihi: number, A: Complex128Array, LDA: number, TAU: Complex128Array, strideTAU: number, WORK: Complex128Array | null ): number;

	/**
	* Reduces a complex general matrix to upper Hessenberg form using unblocked algorithm using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	strided( N: number, ilo: number, ihi: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Reduces a complex general matrix to upper Hessenberg form using unblocked algorithm.
*/
declare var zgehd2: Routine;


// EXPORTS //

export = zgehd2;
