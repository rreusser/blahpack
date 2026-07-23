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

import { DiagonalType, MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `ztbcon`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param norm - `norm`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param RCOND - `RCOND`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( norm: string, uplo: MatrixTriangle, diag: DiagonalType, N: number, kd: number, AB: Float64Array, LDAB: number, RCOND: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param norm - `norm`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param RCOND - `RCOND`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( norm: string, uplo: MatrixTriangle, diag: DiagonalType, N: number, kd: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, RCOND: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): number;
}

/**
* @license MIT.
*/
declare var ztbcon: Routine;


// EXPORTS //

export = ztbcon;
