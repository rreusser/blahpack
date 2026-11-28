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
* Interface describing `dlasyf_rook`.
*/
interface Routine {
	/**
	* Compute a partial factorization of a real symmetric matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param nb - nb
	* @param kb - kb
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param W - output matrix
	* @param LDW - leading dimension of `W`
	* @returns result
	*/
	( order: Layout, uplo: string, N: number, nb: number, kb: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, W: Float64Array, LDW: number ): Float64Array;

	/**
	* Compute a partial factorization of a real symmetric matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method, using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param nb - nb
	* @param kb - kb
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param W - output matrix
	* @param strideW1 - stride of `W`
	* @param strideW2 - stride of `W`
	* @param offsetW - starting index for `W`
	* @returns result
	*/
	ndarray( uplo: string, N: number, nb: number, kb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, W: Float64Array, strideW1: number, strideW2: number, offsetW: number ): Float64Array;
}

/**
* Compute a partial factorization of a real symmetric matrix using the bounded Bunch-Kaufman (rook) diagonal pivoting method
*/
declare var dlasyf_rook: Routine;


// EXPORTS //

export = dlasyf_rook;
