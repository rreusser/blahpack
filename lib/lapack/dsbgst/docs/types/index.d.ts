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
* Interface describing `dsbgst`.
*/
interface Routine {
	/**
	* Reduces a real symmetric-definite banded generalized eigenproblem to standard form.
	*
	* @param vect - `vect`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param ka - `ka`
	* @param kb - `kb`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param BB - `BB`
	* @param LDBB - leading dimension of `BB`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param WORK - `WORK`
	* @returns result
	*/
	( vect: string, uplo: MatrixTriangle, N: number, ka: number, kb: number, AB: Float64Array, LDAB: number, BB: Float64Array, LDBB: number, X: Float64Array, LDX: number, WORK: Float64Array ): Float64Array;

	/**
	* Reduces a real symmetric-definite banded generalized eigenproblem to standard form using alternative indexing semantics.
	*
	* @param vect - `vect`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param ka - `ka`
	* @param kb - `kb`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param BB - `BB`
	* @param strideBB1 - stride of `BB`
	* @param strideBB2 - stride of `BB`
	* @param offsetBB - starting index for `BB`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( vect: string, uplo: MatrixTriangle, N: number, ka: number, kb: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, BB: Float64Array, strideBB1: number, strideBB2: number, offsetBB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Reduces a real symmetric-definite banded generalized eigenproblem to standard form.
*/
declare var dsbgst: Routine;


// EXPORTS //

export = dsbgst;
