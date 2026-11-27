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
* Interface describing `zgbbrd`.
*/
interface Routine {
	/**
	* Reduces a complex general band matrix to real upper bidiagonal form
	*
	* @param order - storage layout
	* @param vect - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param ncc - ncc
	* @param kl - kl
	* @param ku - ku
	* @param AB - input matrix
	* @param LDAB - leading dimension of `AB`
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param e - input array
	* @param strideE - stride length for `e`
	* @param Q - input matrix
	* @param LDQ - leading dimension of `Q`
	* @param PT - input matrix
	* @param LDPT - leading dimension of `PT`
	* @param C - input matrix
	* @param LDC - leading dimension of `C`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @returns result
	*/
	( order: Layout, vect: string, M: number, N: number, ncc: number, kl: number, ku: number, AB: Float64Array, LDAB: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, Q: Float64Array, LDQ: number, PT: Float64Array, LDPT: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWORK: number, RWORK: Float64Array, strideRWORK: number ): Float64Array;

	/**
	* Reduces a complex general band matrix to real upper bidiagonal form, using alternative indexing semantics.
	*
	* @param vect - specifies the operation type
	* @param M - number of rows
	* @param N - number of columns
	* @param ncc - ncc
	* @param kl - kl
	* @param ku - ku
	* @param AB - input matrix
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param d - input array
	* @param strideD - stride length for `d`
	* @param offsetD - starting index for `D`
	* @param e - input array
	* @param strideE - stride length for `e`
	* @param offsetE - starting index for `E`
	* @param Q - input matrix
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param PT - input matrix
	* @param stridePT1 - stride of `PT`
	* @param stridePT2 - stride of `PT`
	* @param offsetPT - starting index for `PT`
	* @param C - input matrix
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - input array
	* @param strideWORK - stride length for `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - output array
	* @param strideRWORK - stride length for `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( vect: string, M: number, N: number, ncc: number, kl: number, ku: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, PT: Float64Array, stridePT1: number, stridePT2: number, offsetPT: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* Reduces a complex general band matrix to real upper bidiagonal form
*/
declare var zgbbrd: Routine;


// EXPORTS //

export = zgbbrd;
