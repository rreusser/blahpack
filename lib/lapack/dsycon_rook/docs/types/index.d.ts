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
* Interface describing `dsycon_rook`.
*/
interface Routine {
	/**
	* Estimate reciprocal condition number of a real symmetric matrix using rook-pivoted factorization
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param anorm - anorm
	* @param rcond - rcond
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, uplo: string, N: number, A: Float64Array, LDA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, anorm: number, rcond: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Estimate reciprocal condition number of a real symmetric matrix using rook-pivoted factorization, using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param anorm - anorm
	* @param rcond - rcond
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( uplo: string, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, anorm: number, rcond: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimate reciprocal condition number of a real symmetric matrix using rook-pivoted factorization
*/
declare var dsycon_rook: Routine;


// EXPORTS //

export = dsycon_rook;
