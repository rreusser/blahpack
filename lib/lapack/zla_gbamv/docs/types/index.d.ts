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
* Interface describing `zla_gbamv`.
*/
interface Routine {
	/**
	* Performs a matrix-vector operation to calculate error bounds on complex banded matrices
	*
	* @param order - storage layout
	* @param trans - trans
	* @param M - number of rows
	* @param N - number of columns
	* @param kl - kl
	* @param ku - ku
	* @param alpha - scalar constant
	* @param AB - input matrix
	* @param LDAB - leading dimension of `AB`
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param beta - scalar constant
	* @param y - output array
	* @param strideY - stride length for `y`
	* @returns result
	*/
	( order: Layout, trans: TransposeOperation, M: number, N: number, kl: number, ku: number, alpha: number, AB: Float64Array, LDAB: number, x: Float64Array, strideX: number, beta: number, y: Float64Array, strideY: number ): Float64Array;

	/**
	* Performs a matrix-vector operation to calculate error bounds on complex banded matrices, using alternative indexing semantics.
	*
	* @param trans - trans
	* @param M - number of rows
	* @param N - number of columns
	* @param kl - kl
	* @param ku - ku
	* @param alpha - scalar constant
	* @param AB - input matrix
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param x - input array
	* @param strideX - stride length for `x`
	* @param offsetX - starting index for `X`
	* @param beta - scalar constant
	* @param y - output array
	* @param strideY - stride length for `y`
	* @param offsetY - starting index for `Y`
	* @returns result
	*/
	ndarray( trans: TransposeOperation, M: number, N: number, kl: number, ku: number, alpha: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, x: Float64Array, strideX: number, offsetX: number, beta: number, y: Float64Array, strideY: number, offsetY: number ): Float64Array;
}

/**
* Performs a matrix-vector operation to calculate error bounds on complex banded matrices
*/
declare var zla_gbamv: Routine;


// EXPORTS //

export = zla_gbamv;
