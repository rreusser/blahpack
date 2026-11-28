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
* Interface describing `dsytrfRk`.
*/
interface Routine {
	/**
	* Computes the bounded Bunch-Kaufman (rook) factorization of a real symmetric indefinite matrix in `_rk` storage format.
	*
	* @param order - storage layout
	* @param uplo - specifies which triangle of `A` is referenced
	* @param N - order of the matrix `A`
	* @param A - input/output symmetric matrix
	* @param LDA - leading dimension of `A`
	* @param e - output vector containing the off-diagonal entries of `D`
	* @param strideE - stride length for `e`
	* @param IPIV - output pivot index array
	* @param strideIPIV - stride length for `IPIV`
	* @returns `info` integer (0 on success; k>0 if D(k,k) is exactly zero)
	*/
	( order: Layout, uplo: string, N: number, A: Float64Array, LDA: number, e: Float64Array, strideE: number, IPIV: Int32Array, strideIPIV: number, WORK: Float64Array | null, strideWork: number ): number;

	/**
	* Computes the bounded Bunch-Kaufman (rook) factorization of a real symmetric indefinite matrix in `_rk` storage format, using alternative indexing semantics.
	*
	* @param uplo - specifies which triangle of `A` is referenced
	* @param N - order of the matrix `A`
	* @param A - input/output symmetric matrix
	* @param strideA1 - stride of dimension 1 of `A`
	* @param strideA2 - stride of dimension 2 of `A`
	* @param offsetA - starting index for `A`
	* @param e - output vector containing the off-diagonal entries of `D`
	* @param strideE - stride length for `e`
	* @param offsetE - starting index for `e`
	* @param IPIV - output pivot index array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @returns `info` integer (0 on success; k>0 if D(k,k) is exactly zero)
	*/
	ndarray( uplo: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, e: Float64Array, strideE: number, offsetE: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* Computes the bounded Bunch-Kaufman (rook) factorization of a real symmetric indefinite matrix in `_rk` storage format (blocked algorithm).
*/
declare var dsytrfRk: Routine;


// EXPORTS //

export = dsytrfRk;
