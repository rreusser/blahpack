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

import { TransposeOperation, Layout } from '@stdlib/types/blas';

/**
* Interface describing `dorm22`.
*/
interface Routine {
	/**
	* Multiplies a general matrix by a banded orthogonal matrix
	*
	* @param order - storage layout
	* @param side - specifies the operation type
	* @param trans - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param n1 - n1
	* @param n2 - n2
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param C - input matrix
	* @param LDC - leading dimension of `C`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @returns result
	*/
	( order: Layout, side: string, trans: TransposeOperation, M: number, N: number, n1: number, n2: number, Q: Float64Array, LDQ: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Multiplies a general matrix by a banded orthogonal matrix, using alternative indexing semantics.
	*
	* @param side - specifies the operation type
	* @param trans - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param n1 - n1
	* @param n2 - n2
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param C - input matrix
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: string, trans: TransposeOperation, M: number, N: number, n1: number, n2: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Multiplies a general matrix by a banded orthogonal matrix
*/
declare var dorm22: Routine;


// EXPORTS //

export = dorm22;
