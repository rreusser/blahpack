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
* Interface describing `zhpgst`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param itype - `itype`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param BP - `BP`
	* @returns result
	*/
	( itype: number, uplo: MatrixTriangle, N: number, AP: Float64Array, BP: Float64Array ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param itype - `itype`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param BP - `BP`
	* @param strideBP - stride of `BP`
	* @param offsetBP - starting index for `BP`
	* @returns result
	*/
	ndarray( itype: number, uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, BP: Float64Array, strideBP: number, offsetBP: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var zhpgst: Routine;


// EXPORTS //

export = zhpgst;
