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

import { OperationSide, MatrixTriangle, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dopmtr`.
*/
interface Routine {
	/**
	* Overwrites a general matrix with a transformation from the orthogonal matrix Q returned by dsptrd.
	*
	* @param side - specifies the side of the operation
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param AP - `AP`
	* @param TAU - `TAU`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param WORK - `WORK`
	* @returns result
	*/
	( side: OperationSide, uplo: MatrixTriangle, trans: TransposeOperation, M: number, N: number, AP: Float64Array, TAU: Float64Array, C: Float64Array, LDC: number, WORK: Float64Array ): Float64Array;

	/**
	* Overwrites a general matrix with a transformation from the orthogonal matrix Q returned by dsptrd using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: OperationSide, uplo: MatrixTriangle, trans: TransposeOperation, M: number, N: number, AP: Float64Array, strideAP: number, offsetAP: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Overwrites a general matrix with a transformation from the orthogonal matrix Q returned by dsptrd.
*/
declare var dopmtr: Routine;


// EXPORTS //

export = dopmtr;
