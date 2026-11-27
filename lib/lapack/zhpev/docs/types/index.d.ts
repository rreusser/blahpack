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

import { MatrixTriangle, Layout } from '@stdlib/types/blas';

/**
* Interface describing `zhpev`.
*/
interface Routine {
	/**
	* Computes all eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage.
	*
	* @param order - storage layout
	* @param jobz - `jobz`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param w - `w`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param WORK - `WORK`
	* @param RWORK - `RWORK`
	* @returns result
	*/
	( order: Layout, jobz: string, uplo: MatrixTriangle, N: number, AP: Float64Array, w: Float64Array, Z: Float64Array, LDZ: number, WORK: Float64Array, RWORK: Float64Array ): Float64Array;

	/**
	* Computes all eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage using alternative indexing semantics.
	*
	* @param jobz - `jobz`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param w - `w`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param Z - `Z`
	* @param strideZ1 - stride of `Z`
	* @param strideZ2 - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( jobz: string, uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Computes all eigenvalues and optionally eigenvectors of a complex Hermitian matrix in packed storage.
*/
declare var zhpev: Routine;


// EXPORTS //

export = zhpev;
