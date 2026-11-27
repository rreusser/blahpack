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
* Interface describing `dpbcon`.
*/
interface Routine {
	/**
	* Estimates the reciprocal of the condition number of a symmetric positive.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param anorm - `anorm`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, LDAB: number, anorm: number, rcond: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Estimates the reciprocal of the condition number of a symmetric positive using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param anorm - `anorm`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, anorm: number, rcond: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimates the reciprocal of the condition number of a symmetric positive.
*/
declare var dpbcon: Routine;


// EXPORTS //

export = dpbcon;
