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
* Interface describing `dpprfs`.
*/
interface Routine {
	/**
	* Improves the computed solution to a real system A * X = B where A is symmetric positive definite in packed storage and provides error bounds.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param AP - `AP`
	* @param AFP - `AFP`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param FERR - `FERR`
	* @param BERR - `BERR`
	* @param WORK - `WORK`
	* @param IWORK - `IWORK`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, nrhs: number, AP: Float64Array, AFP: Float64Array, B: Float64Array, LDB: number, X: Float64Array, LDX: number, FERR: Float64Array, BERR: Float64Array, WORK: Float64Array, IWORK: Int32Array ): Float64Array;

	/**
	* Improves the computed solution to a real system A * X = B where A is symmetric positive definite in packed storage and provides error bounds using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param AFP - `AFP`
	* @param strideAFP - stride of `AFP`
	* @param offsetAFP - starting index for `AFP`
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
	ndarray( uplo: MatrixTriangle, N: number, nrhs: number, AP: Float64Array, strideAP: number, offsetAP: number, AFP: Float64Array, strideAFP: number, offsetAFP: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Improves the computed solution to a real system A * X = B where A is symmetric positive definite in packed storage and provides error bounds.
*/
declare var dpprfs: Routine;


// EXPORTS //

export = dpprfs;
