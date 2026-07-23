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
* Interface describing `dlascl`.
*/
interface Routine {
	/**
	* Multiplies a real M-by-N matrix by the real scalar CTO/CFROM, doing the multiplication safely with respect to overflow and underflow via iterative scaling.
	*
	* @param order - storage layout
	* @param type - `type`
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param cfrom - `cfrom`
	* @param cto - `cto`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @returns result
	*/
	( order: Layout, type: number, kl: number, ku: number, cfrom: number, cto: number, M: number, N: number, A: Float64Array, LDA: number ): number;

	/**
	* Multiplies a real M-by-N matrix by the real scalar CTO/CFROM, doing the multiplication safely with respect to overflow and underflow via iterative scaling using alternative indexing semantics.
	*
	* @param type - `type`
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param cfrom - `cfrom`
	* @param cto - `cto`
	* @param M - number of rows
	* @param N - number of columns
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @returns result
	*/
	ndarray( type: number, kl: number, ku: number, cfrom: number, cto: number, M: number, N: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number ): number;
}

/**
* Multiplies a real M-by-N matrix by the real scalar CTO/CFROM, doing the multiplication safely with respect to overflow and underflow via iterative scaling.
*/
declare var dlascl: Routine;


// EXPORTS //

export = dlascl;
