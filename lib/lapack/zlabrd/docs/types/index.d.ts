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
* Interface describing `zlabrd`.
*/
interface Routine {
	/**
	* Reduces the first NB rows and columns of a complex general M-by-N matrix A.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param nb - `nb`
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
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param Y - `Y`
	* @param LDY - leading dimension of `Y`
	* @returns result
	*/
	( order: Layout, M: number, N: number, nb: number, A: Float64Array, LDA: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, TAUQ: Float64Array, strideTAUQ: number, TAUP: Float64Array, strideTAUP: number, X: Float64Array, LDX: number, Y: Float64Array, LDY: number ): Float64Array;

	/**
	* Reduces the first NB rows and columns of a complex general M-by-N matrix A using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param nb - `nb`
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
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param Y - `Y`
	* @param strideY1 - stride of `Y`
	* @param strideY2 - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( M: number, N: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, TAUQ: Float64Array, strideTAUQ: number, offsetTAUQ: number, TAUP: Float64Array, strideTAUP: number, offsetTAUP: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number ): Float64Array;
}

/**
* Reduces the first NB rows and columns of a complex general M-by-N matrix A.
*/
declare var zlabrd: Routine;


// EXPORTS //

export = zlabrd;
