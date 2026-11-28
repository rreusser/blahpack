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
* Interface describing `dorbdb5`.
*/
interface Routine {
	/**
	* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`; if the projection collapses to zero, returns a deterministic standard-basis vector from the orthogonal complement.
	*
	* @param order - storage layout
	* @param m1 - dimension of `X1` and rows of `Q1`
	* @param m2 - dimension of `X2` and rows of `Q2`
	* @param N - number of columns in `Q1` and `Q2`
	* @param X1 - top part of the vector
	* @param strideX1 - `X1` stride length
	* @param X2 - bottom part of the vector
	* @param strideX2 - `X2` stride length
	* @param Q1 - top part of the orthonormal basis matrix
	* @param LDQ1 - leading dimension of `Q1`
	* @param Q2 - bottom part of the orthonormal basis matrix
	* @param LDQ2 - leading dimension of `Q2`
	* @param WORK - workspace array (length at least `N`)
	* @param strideWORK - `WORK` stride length
	* @returns status code (0 = success)
	*/
	( order: Layout, m1: number, m2: number, N: number, X1: Float64Array, strideX1: number, X2: Float64Array, strideX2: number, Q1: Float64Array, LDQ1: number, Q2: Float64Array, LDQ2: number, WORK: Float64Array, strideWORK: number ): number;

	/**
	* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`, using alternative indexing semantics.
	*
	* @param m1 - dimension of `X1` and rows of `Q1`
	* @param m2 - dimension of `X2` and rows of `Q2`
	* @param N - number of columns in `Q1` and `Q2`
	* @param X1 - top part of the vector
	* @param strideX1 - `X1` stride length
	* @param offsetX1 - starting index for `X1`
	* @param X2 - bottom part of the vector
	* @param strideX2 - `X2` stride length
	* @param offsetX2 - starting index for `X2`
	* @param Q1 - top part of the orthonormal basis matrix
	* @param strideQ11 - stride of dimension 1 of `Q1`
	* @param strideQ12 - stride of dimension 2 of `Q1`
	* @param offsetQ1 - starting index for `Q1`
	* @param Q2 - bottom part of the orthonormal basis matrix
	* @param strideQ21 - stride of dimension 1 of `Q2`
	* @param strideQ22 - stride of dimension 2 of `Q2`
	* @param offsetQ2 - starting index for `Q2`
	* @param WORK - workspace array (length at least `N`)
	* @param strideWORK - `WORK` stride length
	* @param offsetWORK - starting index for `WORK`
	* @returns status code (0 = success)
	*/
	ndarray( m1: number, m2: number, N: number, X1: Float64Array, strideX1: number, offsetX1: number, X2: Float64Array, strideX2: number, offsetX2: number, Q1: Float64Array, strideQ11: number, strideQ12: number, offsetQ1: number, Q2: Float64Array, strideQ21: number, strideQ22: number, offsetQ2: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): number;
}

/**
* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`.
*/
declare var dorbdb5: Routine;


// EXPORTS //

export = dorbdb5;
