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
* Interface describing `zlaqhb`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param KD - `KD`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param S - `S`
	* @param strideS - stride of `S`
	* @param scond - `scond`
	* @param amax - `amax`
	* @returns result
	*/
	( uplo: MatrixTriangle, N: number, KD: number, AB: Float64Array, LDAB: number, S: Float64Array, strideS: number, scond: number, amax: number ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param S - `S`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @param scond - `scond`
	* @param amax - `amax`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, N: number, kd: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, S: Float64Array, strideS: number, offsetS: number, scond: number, amax: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var zlaqhb: Routine;


// EXPORTS //

export = zlaqhb;
