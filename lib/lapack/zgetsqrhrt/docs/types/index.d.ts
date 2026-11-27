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
* Interface describing `zgetsqrhrt`.
*/
interface Routine {
	/**
	* Computes a column-blocked QR factorization of a complex M-by-N matrix using TSQR followed by Householder reconstruction.
	*
	* @param order - storage layout (`'row-major'` or `'column-major'`)
	* @param M - number of rows of `A` (`M >= N`)
	* @param N - number of columns of `A`
	* @param mb1 - row block size for the internal TSQR (`mb1 > N`)
	* @param nb1 - column block size for the internal TSQR
	* @param nb2 - block size for the output blocked QR
	* @param A - input/output matrix `A`
	* @param LDA - leading dimension of `A`
	* @param T - output block reflector factors
	* @param LDT - leading dimension of `T`
	* @param WORK - workspace of length at least `lwt + N*N + lw2` (see `zgetsqrhrt` for `lwt`, `lw2`); if `null`, a workspace is allocated internally
	* @param RWORK - workspace of length at least `N`; if `null`, a workspace is allocated internally
	* @returns status code
	*/
	( order: Layout, M: number, N: number, mb1: number, nb1: number, nb2: number, A: Complex128Array, LDA: number, T: Complex128Array, LDT: number, WORK: Complex128Array | null, RWORK: Float64Array | null ): number;

	/**
	* Computes a column-blocked QR factorization of a complex M-by-N matrix using TSQR followed by Householder reconstruction., using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param mb1 - mb1
	* @param nb1 - nb1
	* @param nb2 - nb2
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param T - input matrix
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( M: number, N: number, mb1: number, nb1: number, nb2: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes a column-blocked QR factorization of a complex M-by-N matrix using TSQR followed by Householder reconstruction.
*/
declare var zgetsqrhrt: Routine;


// EXPORTS //

export = zgetsqrhrt;
