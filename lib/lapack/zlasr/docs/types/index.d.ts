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

import { OperationSide, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zlasr`.
*/
interface Routine {
	/**
	* Applies a sequence of real plane rotations to a complex general matrix.
	*
	* @param order - storage layout
	* @param side - specifies the side of the operation
	* @param pivot - `pivot`
	* @param direct - `direct`
	* @param M - number of rows
	* @param N - number of columns
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @returns result
	*/
	( order: Layout, side: OperationSide, pivot: boolean, direct: string, M: number, N: number, c: Float64Array, strideC: number, s: Float64Array, strideS: number, A: Float64Array, LDA: number ): Float64Array;

	/**
	* Applies a sequence of real plane rotations to a complex general matrix using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param pivot - `pivot`
	* @param direct - `direct`
	* @param M - number of rows
	* @param N - number of columns
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @returns result
	*/
	ndarray( side: OperationSide, pivot: boolean, direct: string, M: number, N: number, c: Float64Array, strideC: number, offsetC: number, s: Float64Array, strideS: number, offsetS: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number ): Float64Array;
}

/**
* Applies a sequence of real plane rotations to a complex general matrix.
*/
declare var zlasr: Routine;


// EXPORTS //

export = zlasr;
