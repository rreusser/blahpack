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

import { MatrixTriangle, DiagonalType } from '@stdlib/types/blas';

/**
* Interface describing `dtpcon`.
*/
interface Routine {
	/**
	* Estimates the reciprocal of the condition number of a real triangular matrix in packed storage, in either the 1-norm or the infinity-norm.
	*
	* @param norm - `norm`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param AP - `AP`
	* @param rcond - `rcond`
	* @param WORK - `WORK`
	* @param IWORK - `IWORK`
	* @returns result
	*/
	( norm: string, uplo: MatrixTriangle, diag: DiagonalType, N: number, AP: Float64Array, rcond: number, WORK: Float64Array, IWORK: Int32Array ): Float64Array;

	/**
	* Estimates the reciprocal of the condition number of a real triangular matrix in packed storage, in either the 1-norm or the infinity-norm using alternative indexing semantics.
	*
	* @param norm - `norm`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param diag - specifies whether the matrix is unit triangular
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param RCOND - `RCOND`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( norm: string, uplo: MatrixTriangle, diag: DiagonalType, N: number, AP: Float64Array, strideAP: number, offsetAP: number, RCOND: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimates the reciprocal of the condition number of a real triangular matrix in packed storage, in either the 1-norm or the infinity-norm.
*/
declare var dtpcon: Routine;


// EXPORTS //

export = dtpcon;
