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
* Interface describing `dppsvx`.
*/
interface Routine {
	/**
	* Solves a real symmetric positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.
	*
	* @param fact - `fact`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param AP - `AP`
	* @param AFP - `AFP`
	* @param equed - `equed`
	* @param S - `S`
	* @param strideS - stride of `S`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param rcond - `rcond`
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
	( fact: string, uplo: MatrixTriangle, N: number, nrhs: number, AP: Float64Array, AFP: Float64Array, equed: string, S: Float64Array, strideS: number, B: Float64Array, LDB: number, X: Float64Array, LDX: number, rcond: number, FERR: Float64Array, strideFERR: number, BERR: Float64Array, strideBERR: number, WORK: Float64Array, strideWork: number, IWORK: Int32Array, strideIWork: number ): number;

	/**
	* Solves a real symmetric positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds using alternative indexing semantics.
	*
	* @param fact - `fact`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param AFP - `AFP`
	* @param strideAFP - stride of `AFP`
	* @param offsetAFP - starting index for `AFP`
	* @param equed - `equed`
	* @param S - `S`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
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
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( fact: string, uplo: MatrixTriangle, N: number, nrhs: number, AP: Float64Array, strideAP: number, offsetAP: number, AFP: Float64Array, strideAFP: number, offsetAFP: number, equed: string, S: Float64Array, strideS: number, offsetS: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, rcond: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* Solves a real symmetric positive definite system A*X = B where A is in packed storage, with optional equilibration, condition estimation, and error bounds.
*/
declare var dppsvx: Routine;


// EXPORTS //

export = dppsvx;
