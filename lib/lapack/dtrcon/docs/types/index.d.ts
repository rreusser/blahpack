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

import { MatrixTriangle, DiagonalType } from '@stdlib/types/blas';

/**
* Interface describing `dtrcon`.
*/
interface Routine {
	/**
	* Estimates the reciprocal of the condition number of a triangular matrix A.
	*
	* @param norm - `norm`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param RCOND - `RCOND`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( norm: string, uplo: MatrixTriangle, diag: DiagonalType, N: number, A: Float64Array, LDA: number, RCOND: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Estimates the reciprocal of the condition number of a triangular matrix A, using alternative indexing semantics.
	*
	* @param norm - `norm`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param RCOND - `RCOND`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( norm: string, uplo: MatrixTriangle, diag: DiagonalType, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, RCOND: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimates the reciprocal of the condition number of a triangular matrix A.
*/
declare var dtrcon: Routine;


// EXPORTS //

export = dtrcon;
