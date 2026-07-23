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

import { DiagonalType, Layout, MatrixTriangle, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `dlatrs3`.
*/
interface Routine {
	/**
	* Solves a triangular system of equations with the scale factors set to prevent overflow.
	*
	* @param order - storage layout
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param normin - `normin`
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param CNORM - `CNORM`
	* @param strideCNORM - stride of `CNORM`
	* @param work - `work`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, normin: string, N: number, nrhs: number, A: Float64Array, LDA: number, X: Float64Array, LDX: number, SCALE: Float64Array, strideSCALE: number, CNORM: Float64Array, strideCNORM: number, work: Float64Array, strideWork: number ): number;

	/**
	* Solves a triangular system of equations with the scale factors set to prevent overflow using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param normin - `normin`
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param SCALE - `SCALE`
	* @param strideSCALE - stride of `SCALE`
	* @param offsetSCALE - starting index for `SCALE`
	* @param CNORM - `CNORM`
	* @param strideCNORM - stride of `CNORM`
	* @param offsetCNORM - starting index for `CNORM`
	* @param work - `work`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, normin: string, N: number, nrhs: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, SCALE: Float64Array, strideSCALE: number, offsetSCALE: number, CNORM: Float64Array, strideCNORM: number, offsetCNORM: number, work: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* Solves a triangular system of equations with the scale factors set to prevent overflow.
*/
declare var dlatrs3: Routine;


// EXPORTS //

export = dlatrs3;
