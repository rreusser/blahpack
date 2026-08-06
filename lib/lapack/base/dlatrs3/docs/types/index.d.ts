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
* Interface describing `dlatrs3`.
*/
interface Routine {
	/**
	* solves a triangular system of equations with the scale factors set to prevent overflow.
	*
	* @param order - storage layout
	* @param uplo - specifies the operation type
	* @param trans - specifies the operation type
	* @param diag - specifies the operation type
	* @param normin - specifies the operation type
	* @param N - number of columns
	* @param nrhs - nrhs
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param X - input matrix
	* @param LDX - leading dimension of `X`
	* @param SCALE - input array
	* @param strideSCALE - stride length for `SCALE`
	* @param CNORM - input array
	* @param strideCNORM - stride length for `CNORM`
	* @param WORK - output array
	* @returns result
	*/
	( order: Layout, uplo: string, trans: TransposeOperation, diag: string, normin: string, N: number, nrhs: number, A: Float64Array, LDA: number, X: Float64Array, LDX: number, SCALE: Float64Array, strideSCALE: number, CNORM: Float64Array, strideCNORM: number, WORK: Float64Array ): Float64Array;

	/**
	* solves a triangular system of equations with the scale factors set to prevent overflow., using alternative indexing semantics.
	*
	* @param uplo - specifies the operation type
	* @param trans - specifies the operation type
	* @param diag - specifies the operation type
	* @param normin - specifies the operation type
	* @param N - number of columns
	* @param nrhs - nrhs
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param X - input matrix
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param SCALE - input array
	* @param strideSCALE - stride length for `SCALE`
	* @param offsetSCALE - starting index for `SCALE`
	* @param CNORM - input array
	* @param strideCNORM - stride length for `CNORM`
	* @param offsetCNORM - starting index for `CNORM`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( uplo: string, trans: TransposeOperation, diag: string, normin: string, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, SCALE: Float64Array, strideSCALE: number, offsetSCALE: number, CNORM: Float64Array, strideCNORM: number, offsetCNORM: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* solves a triangular system of equations with the scale factors set to prevent overflow.
*/
declare var dlatrs3: Routine;


// EXPORTS //

export = dlatrs3;
