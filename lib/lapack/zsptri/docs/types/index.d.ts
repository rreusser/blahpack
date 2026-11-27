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
* Interface describing `zsptri`.
*/
interface Routine {
	/**
	* Computes the inverse of a complex symmetric matrix in packed storage using the factorization `A = U * D * U^T` or `A = L * D * L^T` computed by `zsptrf`.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param IPIV - `IPIV`
	* @param WORK - `WORK`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, AP: Float64Array, IPIV: Int32Array, WORK: Float64Array ): Float64Array;

	/**
	* Computes the inverse of a complex symmetric matrix in packed storage using the factorization `A = U * D * U^T` or `A = L * D * L^T` computed by `zsptrf` using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Computes the inverse of a complex symmetric matrix in packed storage using the factorization `A = U * D * U^T` or `A = L * D * L^T` computed by `zsptrf`.
*/
declare var zsptri: Routine;


// EXPORTS //

export = zsptri;
