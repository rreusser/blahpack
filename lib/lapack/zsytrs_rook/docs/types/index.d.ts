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
* Interface describing `zsytrs_rook`.
*/
interface Routine {
	/**
	* Solve A*X=B with complex symmetric A using factorization from zsytrf_rook
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param nrhs - nrhs
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param B - output matrix
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( order: Layout, uplo: string, N: number, nrhs: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solve A*X=B with complex symmetric A using factorization from zsytrf_rook, using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param nrhs - nrhs
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param B - output matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( uplo: string, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solve A*X=B with complex symmetric A using factorization from zsytrf_rook
*/
declare var zsytrs_rook: Routine;


// EXPORTS //

export = zsytrs_rook;
