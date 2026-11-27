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
* Interface describing `zhbgvx`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param ka - `ka`
	* @param kb - `kb`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param BB - `BB`
	* @param LDBB - leading dimension of `BB`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
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
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param IFAIL - `IFAIL`
	* @param strideIFAIL - stride of `IFAIL`
	* @returns result
	*/
	( jobz: string, range: string, uplo: MatrixTriangle, N: number, ka: number, kb: number, AB: Float64Array, LDAB: number, BB: Float64Array, LDBB: number, Q: Float64Array, LDQ: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, Z: Float64Array, LDZ: number, WORK: Float64Array, strideWORK: number, RWORK: Float64Array, strideRWORK: number, IWORK: Int32Array, strideIWORK: number, IFAIL: Float64Array, strideIFAIL: number ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param jobz - `jobz`
	* @param range - `range`
	* @param uplo - specifies whether the upper or lower triangular part is referenced
	* @param N - number of columns
	* @param ka - `ka`
	* @param kb - `kb`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param BB - `BB`
	* @param strideBB1 - stride of `BB`
	* @param strideBB2 - stride of `BB`
	* @param offsetBB - starting index for `BB`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
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
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @param IFAIL - `IFAIL`
	* @param strideIFAIL - stride of `IFAIL`
	* @param offsetIFAIL - starting index for `IFAIL`
	* @returns result
	*/
	ndarray( jobz: string, range: string, uplo: MatrixTriangle, N: number, ka: number, kb: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, BB: Float64Array, strideBB1: number, strideBB2: number, offsetBB: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, vl: number, vu: number, il: number, iu: number, abstol: number, out: number, w: Float64Array, strideW: number, offsetW: number, Z: Float64Array, strideZ1: number, strideZ2: number, offsetZ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number, IFAIL: Float64Array, strideIFAIL: number, offsetIFAIL: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var zhbgvx: Routine;


// EXPORTS //

export = zhbgvx;
