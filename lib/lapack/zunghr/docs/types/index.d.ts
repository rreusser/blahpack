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

/**
* Interface describing `zunghr`.
*/
interface Routine {
	/**
	* Generates the complex unitary matrix Q which is defined as the product.
	*
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param lwork - workspace size
	* @returns result
	*/
	( N: number, ilo: number, ihi: number, A: Float64Array, LDA: number, TAU: Float64Array, strideTAU: number, WORK: Float64Array, strideWORK: number, lwork: number ): Float64Array;

	/**
	* Generates the complex unitary matrix Q which is defined as the product using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param ilo - lower index
	* @param ihi - upper index
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param TAU - `TAU`
	* @param strideTAU - stride of `TAU`
	* @param offsetTAU - starting index for `TAU`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param lwork - workspace size
	* @returns result
	*/
	ndarray( N: number, ilo: number, ihi: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, TAU: Float64Array, strideTAU: number, offsetTAU: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, lwork: number ): Float64Array;
}

/**
* Generates the complex unitary matrix Q which is defined as the product.
*/
declare var zunghr: Routine;


// EXPORTS //

export = zunghr;
