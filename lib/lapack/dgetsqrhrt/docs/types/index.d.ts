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
* Interface describing `dgetsqrhrt`.
*/
interface Routine {
	/**
	* Computes a column-blocked QR factorization of a real `M`-by-`N` matrix `A` (with `M >= N`) via TSQR followed by Householder reconstruction.
	*
	* @param order - storage layout
	* @param M - number of rows of `A` (`M >= N`)
	* @param N - number of columns of `A`
	* @param mb1 - TSQR row block size (`mb1 > N`)
	* @param nb1 - TSQR column block size (`nb1 >= 1`)
	* @param nb2 - HRT (output) block size (`nb2 >= 1`)
	* @param A - input/output matrix
	* @param LDA - leading dimension of `A`
	* @param T - output matrix of upper triangular block reflectors
	* @param LDT - leading dimension of `T`
	* @param WORK - workspace array
	* @returns status code (`0` = success)
	*/
	( order: Layout, M: number, N: number, mb1: number, nb1: number, nb2: number, A: Float64Array, LDA: number, T: Float64Array, LDT: number, WORK: Float64Array ): number;

	/**
	* Computes a column-blocked QR factorization of a real `M`-by-`N` matrix `A` (with `M >= N`) via TSQR followed by Householder reconstruction, using alternative indexing semantics.
	*
	* @param M - number of rows of `A` (`M >= N`)
	* @param N - number of columns of `A`
	* @param mb1 - TSQR row block size (`mb1 > N`)
	* @param nb1 - TSQR column block size (`nb1 >= 1`)
	* @param nb2 - HRT (output) block size (`nb2 >= 1`)
	* @param A - input/output matrix
	* @param strideA1 - stride of the first dimension of `A`
	* @param strideA2 - stride of the second dimension of `A`
	* @param offsetA - starting index for `A`
	* @param T - output matrix of upper triangular block reflectors
	* @param strideT1 - stride of the first dimension of `T`
	* @param strideT2 - stride of the second dimension of `T`
	* @param offsetT - starting index for `T`
	* @param WORK - workspace array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns status code (`0` = success)
	*/
	ndarray( M: number, N: number, mb1: number, nb1: number, nb2: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): number;
}

/**
* Computes a column-blocked QR factorization of a real `M`-by-`N` matrix `A` (with `M >= N`) via TSQR followed by Householder reconstruction.
*/
declare var dgetsqrhrt: Routine;


// EXPORTS //

export = dgetsqrhrt;
