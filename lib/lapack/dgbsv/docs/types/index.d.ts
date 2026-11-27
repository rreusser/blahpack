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
* Interface describing `dgbsv`.
*/
interface Routine {
	/**
	* Solves a system of linear equations A * X = B where A is an N-by-N band.
	*
	* @param order - storage layout
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param nrhs - number of right-hand sides
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @returns result
	*/
	( order: Layout, N: number, kl: number, ku: number, nrhs: number, AB: Float64Array, LDAB: number, IPIV: Int32Array, strideIPIV: number, B: Float64Array, LDB: number ): Float64Array;

	/**
	* Solves a system of linear equations A * X = B where A is an N-by-N band using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param nrhs - number of right-hand sides
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @returns result
	*/
	ndarray( N: number, kl: number, ku: number, nrhs: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number ): Float64Array;
}

/**
* Solves a system of linear equations A * X = B where A is an N-by-N band.
*/
declare var dgbsv: Routine;


// EXPORTS //

export = dgbsv;
