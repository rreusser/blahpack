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

import { Layout, OperationSide, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dorm22`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param side - specifies the side of the operation
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, side: OperationSide, trans: TransposeOperation, M: number, N: number, n1: number, n2: number, Q: Float64Array, LDQ: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWork: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param n1 - `n1`
	* @param n2 - `n2`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( side: OperationSide, trans: TransposeOperation, M: number, N: number, n1: number, n2: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* @license MIT.
*/
declare var dorm22: Routine;


// EXPORTS //

export = dorm22;
