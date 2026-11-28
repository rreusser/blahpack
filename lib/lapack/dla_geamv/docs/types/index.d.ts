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
* Interface describing `dla_geamv`.
*/
interface Routine {
	/**
	* Computes a matrix-vector product using a general matrix to calculate error bounds
	*
	* @param order - storage layout
	* @param trans - trans
	* @param M - number of rows
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param A - input matrix
	* @param LDA - leading dimension of `A`
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param beta - scalar constant
	* @param y - output array
	* @param strideY - stride length for `y`
	* @returns result
	*/
	( order: Layout, trans: TransposeOperation, M: number, N: number, alpha: number, A: Float64Array, LDA: number, x: Float64Array, strideX: number, beta: number, y: Float64Array, strideY: number ): Float64Array;

	/**
	* Computes a matrix-vector product using a general matrix to calculate error bounds, using alternative indexing semantics.
	*
	* @param trans - trans
	* @param M - number of rows
	* @param N - number of columns
	* @param alpha - scalar constant
	* @param A - input matrix
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `X`
	* @param beta - scalar constant
	* @param y - output array
	* @param strideY - stride length for `y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( trans: TransposeOperation, M: number, N: number, alpha: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, x: Float64Array, strideX: number, offsetX: number, beta: number, y: Float64Array, strideY: number, offsetY: number ): Float64Array;
}

/**
* Computes a matrix-vector product using a general matrix to calculate error bounds
*/
declare var dla_geamv: Routine;


// EXPORTS //

export = dla_geamv;
