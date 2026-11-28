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
* Interface describing `zhbtrd`.
*/
interface Routine {
	/**
	* Reduces a complex Hermitian band matrix to real tridiagonal form by unitary similarity transformation.
	*
	* @param order - storage layout
	* @param vect - `vect`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param d - `d`
	* @param e - `e`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param WORK - `WORK`
	* @returns result
	*/
	( order: Layout, vect: string, uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, LDAB: number, d: Float64Array, e: Float64Array, Q: Float64Array, LDQ: number, WORK: Float64Array ): Float64Array;

	/**
	* Reduces a complex Hermitian band matrix to real tridiagonal form by unitary similarity transformation using alternative indexing semantics.
	*
	* @param vect - `vect`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( vect: string, uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Reduces a complex Hermitian band matrix to real tridiagonal form by unitary similarity transformation.
*/
declare var zhbtrd: Routine;


// EXPORTS //

export = zhbtrd;
