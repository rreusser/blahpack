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

import { MatrixTriangle } from '@stdlib/types/blas';

/**
* Interface describing `zheevr`.
*/
interface Routine {
	/**
	* Computes selected eigenvalues and, optionally, eigenvectors of a complex.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param out - `out`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param ISUPPZ - `ISUPPZ`
	* @param strideISUPPZ - stride of `ISUPPZ`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param lrwork - `lrwork`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param liwork - `liwork`
	* @returns result
	*/
	( jobz: string, range: string, uplo: MatrixTriangle, N: number, A: Float64Array, LDA: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, Z: Float64Array, LDZ: number, ISUPPZ: Int32Array, strideISUPPZ: number, WORK: Float64Array, strideWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number, lrwork: number, IWORK: Int32Array, strideIWORK: number, liwork: number ): Float64Array;

	/**
	* Computes selected eigenvalues and, optionally, eigenvectors of a complex using alternative indexing semantics.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param vl - `vl`
	* @param vu - `vu`
	* @param il - `il`
	* @param iu - `iu`
	* @param abstol - `abstol`
	* @param out - `out`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param ISUPPZ - `ISUPPZ`
	* @param strideISUPPZ - stride of `ISUPPZ`
	* @param offsetISUPPZ - starting index for `ISUPPZ`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @param lrwork - `lrwork`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param liwork - `liwork`
	* @returns result
	*/
	ndarray( jobz: string, range: string, uplo: MatrixTriangle, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, ISUPPZ: Int32Array, strideISUPPZ: number, offsetISUPPZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number, lrwork: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, liwork: number ): Float64Array;
}

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex.
*/
declare var zheevr: Routine;


// EXPORTS //

export = zheevr;
