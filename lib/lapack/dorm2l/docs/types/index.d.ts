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

import { OperationSide, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dorm2l`.
*/
interface Routine {
	/**
	* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
	*
	* @param side - specifies the side of the operation
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param K - inner dimension
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( side: OperationSide, trans: TransposeOperation, M: number, N: number, K: number, A: Float64Array, LDA: number, TAU: Float64Array, strideTAU: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T, using alternative indexing semantics.
	*
	* @param side - specifies the side of the operation
	* @param trans - specifies whether the matrix should be transposed
	* @param M - number of rows
	* @param N - number of columns
	* @param K - inner dimension
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( side: OperationSide, trans: TransposeOperation, M: number, N: number, K: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Overwrites the M-by-N matrix C with Q_C, Q^T_C, C_Q, or C_Q^T.
*/
declare var dorm2l: Routine;


// EXPORTS //

export = dorm2l;
