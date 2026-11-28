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

import { Layout } from '@stdlib/types/blas';

/**
* Interface describing `zlarz`.
*/
interface Routine {
	/**
	* Applies a complex elementary reflector defined by RZ factorization
	*
	* @param order - storage layout
	* @param side - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param l - l
	* @param v - input array
	* @param strideV - stride length for `v`
	* @param tau - tau
	* @param C - input matrix
	* @param LDC - leading dimension of `C`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, side: string, M: number, N: number, l: number, v: Float64Array, strideV: number, tau: any, C: Float64Array, LDC: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Applies a complex elementary reflector defined by RZ factorization, using alternative indexing semantics.
	*
	* @param side - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param l - l
	* @param v - input array
	* @param strideV - stride length for `v`
	* @param offsetV - starting index for `V`
	* @param tau - tau
	* @param C - input matrix
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: string, M: number, N: number, l: number, v: Float64Array, strideV: number, offsetV: number, tau: any, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Applies a complex elementary reflector defined by RZ factorization
*/
declare var zlarz: Routine;


// EXPORTS //

export = zlarz;
