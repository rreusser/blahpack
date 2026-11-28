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
* Interface describing `zspmv`.
*/
interface Routine {
	/**
	* Perform the symmetric packed matrix-vector operation y := alpha*A*x + beta*y where A is a complex symmetric matrix stored in packed format.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param beta - scalar constant
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, alpha: number, AP: Float64Array, strideAP: number, x: Float64Array, strideX: number, beta: number, y: Float64Array, strideY: number ): Float64Array;

	/**
	* Perform the symmetric packed matrix-vector operation y := alpha*A*x + beta*y where A is a complex symmetric matrix stored in packed format using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param beta - scalar constant
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, alpha: number, AP: Float64Array, strideAP: number, offsetAP: number, x: Float64Array, strideX: number, offsetX: number, beta: number, y: Float64Array, strideY: number, offsetY: number ): Float64Array;
}

/**
* Perform the symmetric packed matrix-vector operation y := alpha*A*x + beta*y where A is a complex symmetric matrix stored in packed format.
*/
declare var zspmv: Routine;


// EXPORTS //

export = zspmv;
