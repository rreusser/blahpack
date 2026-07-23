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
	* Reduces a complex general band matrix to real upper bidiagonal form.
	*
	* @param order - storage layout
	* @param vect - `vect`
	* @param M - number of rows
	* @param N - number of columns
	* @param ncc - `ncc`
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param PT - `PT`
	* @param LDPT - leading dimension of `PT`
	* @param C - `C`
	* @param LDC - leading dimension of `C`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @returns result
	*/
	( order: Layout, vect: string, M: number, N: number, ncc: number, kl: number, ku: number, AB: Float64Array, LDAB: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, Q: Float64Array, LDQ: number, PT: Float64Array, LDPT: number, C: Float64Array, LDC: number, WORK: Float64Array, strideWork: number, RWORK: Float64Array, strideRWork: number ): number;

	/**
	* Reduces a complex general band matrix to real upper bidiagonal form using alternative indexing semantics.
	*
	* @param vect - `vect`
	* @param M - number of rows
	* @param N - number of columns
	* @param ncc - `ncc`
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param PT - `PT`
	* @param stridePT1 - stride of `PT`
	* @param stridePT2 - stride of `PT`
	* @param offsetPT - starting index for `PT`
	* @param C - `C`
	* @param strideC1 - stride of `C`
	* @param strideC2 - stride of `C`
	* @param offsetC - starting index for `C`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @param RWORK - `RWORK`
	* @param strideRWork - stride of `RWork`
	* @param offsetRWork - starting index for `RWork`
	* @returns result
	*/
	ndarray( vect: string, M: number, N: number, ncc: number, kl: number, ku: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, PT: Float64Array, stridePT1: number, stridePT2: number, offsetPT: number, C: Float64Array, strideC1: number, strideC2: number, offsetC: number, WORK: Float64Array, strideWork: number, offsetWork: number, RWORK: Float64Array, strideRWork: number, offsetRWork: number ): number;
}

/**
* Reduces a complex general band matrix to real upper bidiagonal form.
*/
declare var zgbbrd: Routine;


// EXPORTS //

export = zgbbrd;
