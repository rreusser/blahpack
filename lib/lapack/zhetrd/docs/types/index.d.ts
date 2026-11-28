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

import { MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zhetrd`.
*/
interface Routine {
	/**
	* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, TAU: Float64Array, strideTAU: number ): Float64Array;

	/**
	* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
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
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, TAU: Float64Array, strideTAU: number, offsetTAU: number ): Float64Array;
}

/**
* Reduces a complex Hermitian matrix A to real symmetric tridiagonal form T.
*/
declare var zhetrd: Routine;


// EXPORTS //

export = zhetrd;
