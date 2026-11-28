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
* Interface describing `zgebd2`.
*/
interface Routine {
	/**
	* Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param TAUQ - `TAUQ`
	* @param strideTAUQ - stride of `TAUQ`
	* @param TAUP - `TAUP`
	* @param strideTAUP - stride of `TAUP`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, TAUQ: Float64Array, strideTAUQ: number, TAUP: Float64Array, strideTAUP: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param TAUQ - `TAUQ`
	* @param strideTAUQ - stride of `TAUQ`
	* @param offsetTAUQ - starting index for `TAUQ`
	* @param TAUP - `TAUP`
	* @param strideTAUP - stride of `TAUP`
	* @param offsetTAUP - starting index for `TAUP`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, TAUQ: Float64Array, strideTAUQ: number, offsetTAUQ: number, TAUP: Float64Array, strideTAUP: number, offsetTAUP: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Reduces a complex M-by-N matrix A to upper or lower real bidiagonal form B.
*/
declare var zgebd2: Routine;


// EXPORTS //

export = zgebd2;
