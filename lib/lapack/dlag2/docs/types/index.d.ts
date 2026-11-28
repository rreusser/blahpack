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
* Interface describing `dlag2`.
*/
interface Routine {
	/**
	* Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.
	*
	* @param order - storage layout
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param safmin - `safmin`
	* @returns result
	*/
	( order: Layout, A: Float64Array, LDA: number, B: Float64Array, LDB: number, safmin: number ): Float64Array;

	/**
	* Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow using alternative indexing semantics.
	*
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param safmin - `safmin`
	* @returns result
	*/
	ndarray( A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, safmin: number ): Float64Array;
}

/**
* Computes the eigenvalues of a 2-by-2 generalized eigenvalue problem `A - w B`, with scaling as necessary to avoid over-/underflow.
*/
declare var dlag2: Routine;


// EXPORTS //

export = dlag2;
