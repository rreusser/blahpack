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

import { MatrixTriangle, TransposeOperation, DiagonalType } from '@stdlib/types/blas';

/**
* Interface describing `dlatbs`.
*/
interface Routine {
	/**
	* Solves a triangular banded system with scaling to prevent overflow.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param normin - `normin`
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param scale - `scale`
	* @param CNORM - `CNORM`
	* @param strideCNORM - stride of `CNORM`
	* @returns result
	*/
	( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, normin: string, N: number, kd: number, AB: Float64Array, LDAB: number, x: Float64Array, strideX: number, scale: number, CNORM: Float64Array, strideCNORM: number ): Float64Array;

	/**
	* Solves a triangular banded system with scaling to prevent overflow using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param normin - `normin`
	* @param N - number of columns
	* @param kd - `kd`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param scale - `scale`
	* @param CNORM - `CNORM`
	* @param strideCNORM - stride of `CNORM`
	* @param offsetCNORM - starting index for `CNORM`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, normin: string, N: number, kd: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, x: Float64Array, strideX: number, offsetX: number, scale: number, CNORM: Float64Array, strideCNORM: number, offsetCNORM: number ): Float64Array;
}

/**
* Solves a triangular banded system with scaling to prevent overflow.
*/
declare var dlatbs: Routine;


// EXPORTS //

export = dlatbs;
