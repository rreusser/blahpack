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
* Interface describing `dla_gbrcond`.
*/
interface Routine {
	/**
	* Estimates the Skeel condition number for a general banded matrix
	*
	* @param order - storage layout
	* @param trans - specifies the operation type
	* @param N - number of columns
	* @param kl - kl
	* @param ku - ku
	* @param AB - input matrix
	* @param LDAB - leading dimension of `AB`
	* @param AFB - input matrix
	* @param LDAFB - leading dimension of `AFB`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param cmode - cmode
	* @param c - input array
	* @param strideC - stride length for `c`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	( order: Layout, trans: TransposeOperation, N: number, kl: number, ku: number, AB: Float64Array, LDAB: number, AFB: Float64Array, LDAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, cmode: number, c: Float64Array, strideC: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;

	/**
	* Estimates the Skeel condition number for a general banded matrix, using alternative indexing semantics.
	*
	* @param trans - specifies the operation type
	* @param N - number of columns
	* @param kl - kl
	* @param ku - ku
	* @param AB - input matrix
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param AFB - input matrix
	* @param strideAFB1 - stride of `AFB`
	* @param strideAFB2 - stride of `AFB`
	* @param offsetAFB - starting index for `AFB`
	* @param IPIV - input array
	* @param strideIPIV - stride length for `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param cmode - cmode
	* @param c - input array
	* @param strideC - stride length for `c`
	* @param offsetC - starting index for `C`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - output array
	* @param strideIWORK - stride length for `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( trans: TransposeOperation, N: number, kl: number, ku: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, AFB: Float64Array, strideAFB1: number, strideAFB2: number, offsetAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, cmode: number, c: Float64Array, strideC: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Estimates the Skeel condition number for a general banded matrix
*/
declare var dla_gbrcond: Routine;


// EXPORTS //

export = dla_gbrcond;
