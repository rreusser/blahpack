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
* Interface describing `dspgv`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param order - storage layout
	* @param itype - `itype`
	* @param jobz - `jobz`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param BP - `BP`
	* @param w - `w`
	* @param Z - `Z`
	* @param LDZ - leading dimension of `Z`
	* @param WORK - `WORK`
	* @returns result
	*/
	( order: Layout, itype: number, jobz: string, uplo: MatrixTriangle, N: number, AP: Float64Array, BP: Float64Array, w: Float64Array, Z: Float64Array, LDZ: number, WORK: Float64Array ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param itype - `itype`
	* @param jobz - `jobz`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param AP - `AP`
	* @param strideAP - stride of `AP`
	* @param offsetAP - starting index for `AP`
	* @param BP - `BP`
	* @param strideBP - stride of `BP`
	* @param offsetBP - starting index for `BP`
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
	* @returns result
	*/
	ndarray( itype: number, jobz: string, uplo: MatrixTriangle, N: number, AP: Float64Array, strideAP: number, offsetAP: number, BP: Float64Array, strideBP: number, offsetBP: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var dspgv: Routine;


// EXPORTS //

export = dspgv;
