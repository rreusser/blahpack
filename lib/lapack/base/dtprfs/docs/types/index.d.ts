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

import { DiagonalType, MatrixTriangle, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dtprfs`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param AP - `AP`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @returns result
	*/
	( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, N: number, nrhs: number, AP: Float64Array, B: Float64Array, LDB: number, X: Float64Array, LDX: number, FERR: Float64Array, strideFERR: number, BERR: Float64Array, strideBERR: number, WORK: Float64Array, strideWork: number, IWORK: Int32Array, strideIWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
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
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, N: number, nrhs: number, AP: Float64Array, strideAP: number, offsetAP: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* @license MIT.
*/
declare var dtprfs: Routine;


// EXPORTS //

export = dtprfs;
