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

import { Layout, TransposeOperation } from '@stdlib/types/blas';
import { Complex128Array } from '@stdlib/types/array';

/**
* Interface describing `zgels`.
*/
interface Routine {
	/**
	* Solves overdetermined or underdetermined complex linear systems involving an M-by-N matrix `A`, or its conjugate transpose, using a QR or LQ factorization of `A`.
	*
	* @param order - storage layout (`'row-major'` or `'column-major'`)
	* @param trans - specifies whether to solve with `A` (`'no-transpose'`) or its conjugate transpose (`'conjugate-transpose'`)
	* @param M - number of rows of `A`
	* @param N - number of columns of `A`
	* @param nrhs - number of right-hand sides
	* @param A - input matrix `A`; overwritten with its factorization
	* @param LDA - leading dimension of `A`
	* @param B - `max(M,N)`-by-`nrhs` matrix: the right-hand sides on entry, the solution on exit
	* @param LDB - leading dimension of `B` (column-major: `>= max(1,M,N)`; row-major: `>= max(1,nrhs)`)
	* @param WORK - workspace; if `null`, a workspace is allocated internally
	* @returns info status code
	*/
	( order: Layout, trans: TransposeOperation, M: number, N: number, nrhs: number, A: Complex128Array, LDA: number, B: Complex128Array, LDB: number, WORK: Complex128Array | null ): number;

	/**
	* Solves overdetermined or underdetermined complex linear systems involving an using alternative indexing semantics.
	*
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @returns result
	*/
	ndarray( trans: TransposeOperation, M: number, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number ): Float64Array;
}

/**
* Solves overdetermined or underdetermined complex linear systems involving an.
*/
declare var zgels: Routine;

// EXPORTS //

export = zgels;
