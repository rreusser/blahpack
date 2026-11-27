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
* Interface describing `zlasyf_aa`.
*/
interface Routine {
	/**
	* Factorize a panel of a complex symmetric matrix using Aasen's algorithm.
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param j1 - j1
	* @param M - number of rows
	* @param nb - nb
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param H - input matrix
	* @param LDH - leading dimension of `H`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, uplo: string, j1: number, M: number, nb: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, H: Float64Array, LDH: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Factorize a panel of a complex symmetric matrix using Aasen's algorithm., using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param j1 - j1
	* @param M - number of rows
	* @param nb - nb
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param H - input matrix
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( uplo: string, j1: number, M: number, nb: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Factorize a panel of a complex symmetric matrix using Aasen's algorithm.
*/
declare var zlasyf_aa: Routine;


// EXPORTS //

export = zlasyf_aa;
