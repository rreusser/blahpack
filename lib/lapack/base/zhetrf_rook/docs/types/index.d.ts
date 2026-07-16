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
* Interface describing `zhetrf_rook`.
*/
interface Routine {
	/**
	* Computes the factorization of a complex Hermitian matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm).
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part of `A` is stored
	* @param N - order of the matrix `A`
	* @param A - input/output matrix
	* @param LDA - leading dimension of `A`
	* @param IPIV - output pivot index array
	* @param strideIPIV - stride length for `IPIV`
	* @param WORK - caller-owned workspace (length `>= N*NB` with `NB = 32` when `N > NB`); `null` requests internal allocation
	* @param strideWork - stride length for `WORK`
	* @returns `info` integer (0 on success; k>0 if D(k,k) is exactly zero)
	*/
	( order: Layout, uplo: string, N: number, A: Complex128Array, LDA: number, IPIV: Int32Array, strideIPIV: number, WORK: Complex128Array | null, strideWork: number ): number;

	/**
	* Computes the factorization of a complex Hermitian matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm), using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part of `A` is stored
	* @param N - order of the matrix `A`
	* @param A - input/output matrix
	* @param strideA1 - stride of the first dimension of `A`
	* @param strideA2 - stride of the second dimension of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - output pivot index array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param WORK - caller-owned workspace (length `>= N*NB` with `NB = 32` when `N > NB`; unused otherwise)
	* @param strideWork - stride length for `WORK`
	* @param offsetWork - starting index for `WORK`
	* @returns `info` integer (0 on success; k>0 if D(k,k) is exactly zero)
	*/
	ndarray( uplo: string, N: number, A: Complex128Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, WORK: Complex128Array, strideWork: number, offsetWork: number ): number;
}

/**
* Computes the factorization of a complex Hermitian matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method (blocked algorithm).
*/
declare var zhetrf_rook: Routine;


// EXPORTS //

export = zhetrf_rook;
