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
* Interface describing `dppcon`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param anorm - `anorm`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param IWORK - `IWORK`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, AP: Float64Array, anorm: number, rcond: number, WORK: Float64Array, IWORK: Int32Array ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param anorm - `anorm`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param IWORK - `IWORK`
	* @param strideIWork - stride of `IWork`
	* @param offsetIWork - starting index for `IWork`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, anorm: number, rcond: number, WORK: Float64Array, strideWork: number, offsetWork: number, IWORK: Int32Array, strideIWork: number, offsetIWork: number ): number;
}

/**
* @license MIT.
*/
declare var dppcon: Routine;


// EXPORTS //

export = dppcon;
