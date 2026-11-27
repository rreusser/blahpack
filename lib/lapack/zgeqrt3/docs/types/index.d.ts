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
* Interface describing `zgeqrt3`.
*/
interface Routine {
	/**
	* recursively computes a QR factorization of a complex M-by-N matrix using the compact WY representation of Q
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param T - output matrix
	* @param LDT - leading dimension of `T`
	* @returns result
	*/
	( order: Layout, M: number, N: number, A: Float64Array, LDA: number, T: Float64Array, LDT: number ): Float64Array;

	/**
	* recursively computes a QR factorization of a complex M-by-N matrix using the compact WY representation of Q, using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param T - output matrix
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @returns result
	*/
	ndarray( M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number ): Float64Array;
}

/**
* recursively computes a QR factorization of a complex M-by-N matrix using the compact WY representation of Q
*/
declare var zgeqrt3: Routine;


// EXPORTS //

export = zgeqrt3;
