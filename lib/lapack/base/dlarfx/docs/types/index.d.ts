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

import { OperationSide } from '@stdlib/types/blas';

/**
* Interface describing `dlarfx`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param side - specifies the side of the operation
	* @param M - number of rows
	* @param N - number of columns
	* @param v - `v`
	* @param strideV - stride of `V`
	* @param tau - `tau`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( side: OperationSide, M: number, N: number, v: Float64Array, strideV: number, tau: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWork: number ): void;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param M - number of rows
	* @param N - number of columns
	* @param v - `v`
	* @param strideV - stride of `V`
	* @param offsetV - starting index for `V`
	* @param tau - `tau`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( side: OperationSide, M: number, N: number, v: Float64Array, strideV: number, offsetV: number, tau: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWork: number, offsetWork: number ): void;
}

/**
* @license MIT.
*/
declare var dlarfx: Routine;


// EXPORTS //

export = dlarfx;
