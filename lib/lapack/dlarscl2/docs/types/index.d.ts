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
* Interface describing `dlarscl2`.
*/
interface Routine {
	/**
	* Performs reciprocal diagonal scaling on a matrix: `X = D^{-1} * X` where `D` is a diagonal matrix stored as a vector.
	*
	* @param order - storage layout
	* @param M - number of rows
	* @param N - number of columns
	* @param d - `d`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @returns result
	*/
	( order: Layout, M: number, N: number, d: Float64Array, X: Float64Array, LDX: number ): Float64Array;

	/**
	* Performs reciprocal diagonal scaling on a matrix: `X = D^{-1} * X` where `D` is a diagonal matrix stored as a vector using alternative indexing semantics.
	*
	* @param M - number of rows
	* @param N - number of columns
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @returns result
	*/
	ndarray( M: number, N: number, d: Float64Array, strideD: number, offsetD: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number ): Float64Array;
}

/**
* Performs reciprocal diagonal scaling on a matrix: `X = D^{-1} * X` where `D` is a diagonal matrix stored as a vector.
*/
declare var dlarscl2: Routine;


// EXPORTS //

export = dlarscl2;
