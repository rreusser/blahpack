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

import { Layout } from '@stdlib/types/blas';

/**
* Interface describing `dlaein`.
*/
interface Routine {
	/**
	* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix
	*
	* @param order - storage layout
	* @param rightv - rightv
	* @param noinit - noinit
	* @param N - number of columns
	* @param H - input matrix
	* @param LDH - leading dimension of `H`
	* @param wr - wr
	* @param wi - wi
	* @param VR - input array
	* @param strideVR - stride length for `VR`
	* @param VI - input array
	* @param strideVI - stride length for `VI`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param WORK - output array
	* @param eps3 - eps3
	* @param smlnum - smlnum
	* @param bignum - bignum
	* @returns result
	*/
	( order: Layout, rightv: boolean, noinit: boolean, N: number, H: Float64Array, LDH: number, wr: number, wi: number, VR: Float64Array, strideVR: number, VI: Float64Array, strideVI: number, B: Float64Array, LDB: number, WORK: Float64Array, eps3: number, smlnum: number, bignum: number ): Float64Array;

	/**
	* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix, using alternative indexing semantics.
	*
	* @param rightv - rightv
	* @param noinit - noinit
	* @param N - number of columns
	* @param H - input matrix
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param wr - wr
	* @param wi - wi
	* @param VR - input array
	* @param strideVR - stride length for `VR`
	* @param offsetVR - starting index for `VR`
	* @param VI - input array
	* @param strideVI - stride length for `VI`
	* @param offsetVI - starting index for `VI`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param WORK - output array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param eps3 - eps3
	* @param smlnum - smlnum
	* @param bignum - bignum
	* @returns result
	*/
	ndarray( rightv: boolean, noinit: boolean, N: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, wr: number, wi: number, VR: Float64Array, strideVR: number, offsetVR: number, VI: Float64Array, strideVI: number, offsetVI: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, eps3: number, smlnum: number, bignum: number ): Float64Array;
}

/**
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix
*/
declare var dlaein: Routine;


// EXPORTS //

export = dlaein;
