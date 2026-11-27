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

import { MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zpbtf2`.
*/
interface Routine {
	/**
	* Computes the Cholesky factorization of a complex Hermitian positive definite.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, LDAB: number ): Float64Array;

	/**
	* Computes the Cholesky factorization of a complex Hermitian positive definite using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number ): Float64Array;
}

/**
* Computes the Cholesky factorization of a complex Hermitian positive definite.
*/
declare var zpbtf2: Routine;


// EXPORTS //

export = zpbtf2;
