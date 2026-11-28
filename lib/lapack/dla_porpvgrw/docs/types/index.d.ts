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
* Interface describing `dla_porpvgrw`.
*/
interface Routine {
	/**
	* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric positive-definite matrix.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param ncols - `ncols`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param AF - `AF`
	* @param LDAF - leading dimension of `AF`
	* @param WORK - `WORK`
	* @returns result
	*/
	( uplo: MatrixTriangle, ncols: number, A: Float64Array, LDA: number, AF: Float64Array, LDAF: number, WORK: Float64Array ): Float64Array;

	/**
	* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric positive-definite matrix using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param ncols - `ncols`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param AF - `AF`
	* @param strideAF1 - stride of `AF`
	* @param strideAF2 - stride of `AF`
	* @param offsetAF - starting index for `AF`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, ncols: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, AF: Float64Array, strideAF1: number, strideAF2: number, offsetAF: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric positive-definite matrix.
*/
declare var dla_porpvgrw: Routine;


// EXPORTS //

export = dla_porpvgrw;
