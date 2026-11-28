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
* Interface describing `zlaein`.
*/
interface Routine {
	/**
	* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix
	*
	* @param order - storage layout
	* @param rightv - rightv
	* @param noinit - noinit
	* @param N - number of columns
	* @param H - input matrix
	* @param LDH - leading dimension of `H`
	* @param w - w
	* @param v - input array
	* @param strideV - stride length for `v`
	* @param B - input matrix
	* @param LDB - leading dimension of `B`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @param eps3 - eps3
	* @param smlnum - smlnum
	* @returns result
	*/
	( order: Layout, rightv: boolean, noinit: boolean, N: number, H: Float64Array, LDH: number, w: any, v: Float64Array, strideV: number, B: Float64Array, LDB: number, RWORK: Float64Array, strideRWORK: number, eps3: number, smlnum: number ): Float64Array;

	/**
	* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix, using alternative indexing semantics.
	*
	* @param rightv - rightv
	* @param noinit - noinit
	* @param N - number of columns
	* @param H - input matrix
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param w - w
	* @param v - input array
	* @param strideV - stride length for `v`
	* @param offsetV - starting index for `V`
	* @param B - input matrix
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @param eps3 - eps3
	* @param smlnum - smlnum
	* @returns result
	*/
	ndarray( rightv: boolean, noinit: boolean, N: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, w: any, v: Float64Array, strideV: number, offsetV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number, eps3: number, smlnum: number ): Float64Array;
}

/**
* Uses inverse iteration to find an eigenvector of a complex upper Hessenberg matrix
*/
declare var zlaein: Routine;


// EXPORTS //

export = zlaein;
