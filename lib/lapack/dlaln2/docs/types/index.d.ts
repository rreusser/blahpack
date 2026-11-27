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
* Interface describing `dlaln2`.
*/
interface Routine {
	/**
	* Solves a 1-by-1 or 2-by-2 linear system of the form:.
	*
	* @param ltrans - `ltrans`
	* @param na - `na`
	* @param nw - `nw`
	* @param smin - `smin`
	* @param ca - `ca`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param d1 - `d1`
	* @param d2 - `d2`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param wr - `wr`
	* @param wi - `wi`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @returns result
	*/
	( ltrans: boolean, na: number, nw: number, smin: number, ca: number, A: Float64Array, LDA: number, d1: number, d2: number, B: Float64Array, LDB: number, wr: number, wi: number, X: Float64Array, LDX: number ): Float64Array;

	/**
	* Solves a 1-by-1 or 2-by-2 linear system of the form: using alternative indexing semantics.
	*
	* @param ltrans - `ltrans`
	* @param na - `na`
	* @param nw - `nw`
	* @param smin - `smin`
	* @param ca - `ca`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param d1 - `d1`
	* @param d2 - `d2`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param wr - `wr`
	* @param wi - `wi`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param scale - `scale`
	* @param xnorm - `xnorm`
	* @returns result
	*/
	ndarray( ltrans: boolean, na: number, nw: number, smin: number, ca: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, d1: number, d2: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, wr: number, wi: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, scale: number, xnorm: number ): Float64Array;
}

/**
* Solves a 1-by-1 or 2-by-2 linear system of the form:.
*/
declare var dlaln2: Routine;


// EXPORTS //

export = dlaln2;
