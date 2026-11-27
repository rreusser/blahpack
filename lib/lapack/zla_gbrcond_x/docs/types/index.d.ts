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
* Interface describing `zla_gbrcond_x`.
*/
interface Routine {
	/**
	* Estimates the infinity norm condition number for a complex general banded matrix with x scaling
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
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @returns result
	*/
	( order: Layout, trans: TransposeOperation, N: number, kl: number, ku: number, AB: Float64Array, LDAB: number, AFB: Float64Array, LDAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, x: Float64Array, strideX: number, WORK: Float64Array, strideWORK: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

	/**
	* Estimates the infinity norm condition number for a complex general banded matrix with x scaling, using alternative indexing semantics.
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
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `X`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( trans: TransposeOperation, N: number, kl: number, ku: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, AFB: Float64Array, strideAFB1: number, strideAFB2: number, offsetAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, x: Float64Array, strideX: number, offsetX: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Estimates the infinity norm condition number for a complex general banded matrix with x scaling
*/
declare var zla_gbrcond_x: Routine;


// EXPORTS //

export = zla_gbrcond_x;
