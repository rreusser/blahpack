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
* Interface describing `dlaqtr`.
*/
interface Routine {
	/**
	* Solves a real quasi-triangular system of equations.
	*
	* @param order - storage layout
	* @param ltran - `ltran`
	* @param lreal - `lreal`
	* @param N - number of columns
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param b - `b`
	* @param strideB - stride of `B`
	* @param w - `w`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @returns result
	*/
	( order: Layout, ltran: number, lreal: number, N: number, T: Float64Array, LDT: number, b: Float64Array, strideB: number, w: number, x: Float64Array, strideX: number, WORK: Float64Array, strideWork: number ): { scale: number };

	/**
	* Solves a real quasi-triangular system of equations using alternative indexing semantics.
	*
	* @param ltran - `ltran`
	* @param lreal - `lreal`
	* @param N - number of columns
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param b - `b`
	* @param strideB - stride of `B`
	* @param offsetB - starting index for `B`
	* @param w - `w`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param WORK - `WORK`
	* @param strideWork - stride of `Work`
	* @param offsetWork - starting index for `Work`
	* @returns result
	*/
	ndarray( ltran: number, lreal: number, N: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, b: Float64Array, strideB: number, offsetB: number, w: number, x: Float64Array, strideX: number, offsetX: number, WORK: Float64Array, strideWork: number, offsetWork: number ): { scale: number };
}

/**
* Solves a real quasi-triangular system of equations.
*/
declare var dlaqtr: Routine;


// EXPORTS //

export = dlaqtr;
