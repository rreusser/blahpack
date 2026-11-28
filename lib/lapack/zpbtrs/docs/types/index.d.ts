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
* Interface describing `zpbtrs`.
*/
interface Routine {
	/**
	* Solves a complex Hermitian positive definite banded system of equations.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param nrhs - number of right-hand sides
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, N: number, kd: number, nrhs: number, AB: Float64Array, LDAB: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solves a complex Hermitian positive definite banded system of equations using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param nrhs - number of right-hand sides
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, kd: number, nrhs: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solves a complex Hermitian positive definite banded system of equations.
*/
declare var zpbtrs: Routine;


// EXPORTS //

export = zpbtrs;
