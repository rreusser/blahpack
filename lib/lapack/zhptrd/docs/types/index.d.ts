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
* Interface describing `zhptrd`.
*/
interface Routine {
	/**
	* Reduces a complex Hermitian matrix stored in packed form to real symmetric tridiagonal form.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param d - `d`
	* @param e - `e`
	* @param TAU - `TAU`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, AP: Float64Array, d: Float64Array, e: Float64Array, TAU: Float64Array ): Float64Array;

	/**
	* Reduces a complex Hermitian matrix stored in packed form to real symmetric tridiagonal form using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, TAU: Float64Array, strideTAU: number, offsetTAU: number ): Float64Array;
}

/**
* Reduces a complex Hermitian matrix stored in packed form to real symmetric tridiagonal form.
*/
declare var zhptrd: Routine;


// EXPORTS //

export = zhptrd;
