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

import { MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `dsyrfs`.
*/
interface Routine {
	/**
	* Improves the computed solution to a system of linear equations when the.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param AF - `AF`
	* @param LDAF - leading dimension of `AF`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, nrhs: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, IPIV: Int32Array, strideIPIV: number, B: Float64Array, LDB: number, X: Float64Array, LDX: number, FERR: Float64Array, strideFERR: number, BERR: Float64Array, strideBERR: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Improves the computed solution to a system of linear equations when the using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
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
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
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
	ndarray( uplo: MatrixTriangle, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Improves the computed solution to a system of linear equations when the.
*/
declare var dsyrfs: Routine;


// EXPORTS //

export = dsyrfs;
