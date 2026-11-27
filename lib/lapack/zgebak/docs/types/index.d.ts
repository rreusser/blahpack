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
* Interface describing `zgebak`.
*/
interface Routine {
	/**
	* Back-transforms eigenvectors after balancing by zgebal.
	*
	* @param job - `job`
	* @param side - specifies the side of the operation
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param M - number of rows
	* @param V - `V`
	* @param LDV - leading dimension of `V`
	* @returns result
	*/
	( job: string, side: OperationSide, N: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, M: number, V: Float64Array, LDV: number ): Float64Array;

	/**
	* Back-transforms eigenvectors after balancing by zgebal using alternative indexing semantics.
	*
	* @param job - `job`
	* @param side - specifies the side of the operation
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param offsetSCALE - starting index for `SCALE`
	* @param M - number of rows
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @returns result
	*/
	ndarray( job: string, side: OperationSide, N: number, ilo: number, ihi: number, SCALE: Float64Array, strideSCALE: number, offsetSCALE: number, M: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number ): Float64Array;
}

/**
* Back-transforms eigenvectors after balancing by zgebal.
*/
declare var zgebak: Routine;


// EXPORTS //

export = zgebak;
