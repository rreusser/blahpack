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

import { TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dgesvx`.
*/
interface Routine {
	/**
	* Expert driver for solving a real system of linear equations A*X = B.
	*
	* @param fact - `fact`
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param AF - `AF`
	* @param LDAF - leading dimension of `AF`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param equed - `equed`
	* @param r - `r`
	* @param strideR - stride of `R`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @returns result
	*/
	( fact: string, trans: TransposeOperation, N: number, nrhs: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, IPIV: Int32Array, strideIPIV: number, equed: string, r: Float64Array, strideR: number, c: Float64Array, strideC: number, B: Float64Array, LDB: number, X: Float64Array, LDX: number, FERR: Float64Array, strideFERR: number, BERR: Float64Array, strideBERR: number ): Float64Array;

	/**
	* Expert driver for solving a real system of linear equations A*X = B, using alternative indexing semantics.
	*
	* @param fact - `fact`
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - `AF`
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param equed - `equed`
	* @param r - `r`
	* @param strideR - stride of `R`
	* @param offsetR - starting index for `R`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param rcond - `rcond`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param offsetFERR - starting index for `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @param offsetBERR - starting index for `BERR`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( fact: string, trans: TransposeOperation, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, equed: string, r: Float64Array, strideR: number, offsetR: number, c: Float64Array, strideC: number, offsetC: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, rcond: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Expert driver for solving a real system of linear equations A*X = B.
*/
declare var dgesvx: Routine;


// EXPORTS //

export = dgesvx;
