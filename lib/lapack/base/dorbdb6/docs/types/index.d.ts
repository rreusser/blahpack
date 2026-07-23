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
* Interface describing `dorbdb6`.
*/
interface Routine {
	/**
	* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`.
	*
	* @param order - storage layout
	* @param m1 - `m1`
	* @param m2 - `m2`
	* @param N - number of columns
	* @param X1 - `X1`
	* @param strideX1 - stride of `X`
	* @param X2 - `X2`
	* @param strideX2 - stride of `X`
	* @param Q1 - `Q1`
	* @param LDQ1 - `LDQ1`
	* @param Q2 - `Q2`
	* @param LDQ2 - `LDQ2`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, m1: number, m2: number, N: number, X1: number, strideX1: number, X2: number, strideX2: number, Q1: Float64Array, LDQ1: number, Q2: Float64Array, LDQ2: number, WORK: Float64Array, strideWork: number ): number;

	/**
	* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]` using alternative indexing semantics.
	*
	* @param m1 - `m1`
	* @param m2 - `m2`
	* @param N - number of columns
	* @param X1 - `X1`
	* @param strideX1 - stride of `X`
	* @param offsetX1 - starting index for `X1`
	* @param X2 - `X2`
	* @param strideX2 - stride of `X`
	* @param offsetX2 - starting index for `X2`
	* @param Q1 - `Q1`
	* @param strideQ11 - stride of `Q1`
	* @param strideQ12 - stride of `Q1`
	* @param offsetQ1 - starting index for `Q1`
	* @param Q2 - `Q2`
	* @param strideQ21 - stride of `Q2`
	* @param strideQ22 - stride of `Q2`
	* @param offsetQ2 - starting index for `Q2`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( m1: number, m2: number, N: number, X1: number, strideX1: number, offsetX1: number, X2: number, strideX2: number, offsetX2: number, Q1: Float64Array, strideQ11: number, strideQ12: number, offsetQ1: number, Q2: Float64Array, strideQ21: number, strideQ22: number, offsetQ2: number, WORK: Float64Array, strideWork: number, offsetWork: number ): number;
}

/**
* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`.
*/
declare var dorbdb6: Routine;


// EXPORTS //

export = dorbdb6;
