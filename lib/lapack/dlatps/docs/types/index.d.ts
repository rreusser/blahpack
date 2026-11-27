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
* Interface describing `dlatps`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param normin - `normin`
	* @param N - number of columns
	* @param AP - `AP`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param scale - `scale`
	* @param CNORM - `CNORM`
	* @param strideCNORM - stride of `CNORM`
	* @returns result
	*/
	( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, normin: string, N: number, AP: Float64Array, x: Float64Array, strideX: number, scale: number, CNORM: Float64Array, strideCNORM: number ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param trans - specifies whether the matrix should be transposed
	* @param diag - specifies whether the matrix is unit triangular
	* @param normin - `normin`
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param scale - `scale`
	* @param CNORM - `CNORM`
	* @param strideCNORM - stride of `CNORM`
	* @param offsetCNORM - starting index for `CNORM`
	* @returns result
	*/
	ndarray( uplo: MatrixTriangle, trans: TransposeOperation, diag: DiagonalType, normin: string, N: number, AP: Float64Array, strideAP: number, offsetAP: number, x: Float64Array, strideX: number, offsetX: number, scale: number, CNORM: Float64Array, strideCNORM: number, offsetCNORM: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var dlatps: Routine;


// EXPORTS //

export = dlatps;
