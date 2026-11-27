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
* Interface describing `zptsvx`.
*/
interface Routine {
	/**
	* @license Apache-2.0.
	*
	* @param fact - `fact`
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param d - `d`
	* @param e - `e`
	* @param DF - `DF`
	* @param EF - `EF`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param X - `X`
	* @param LDX - leading dimension of `X`
	* @param rcond - `rcond`
	* @param FERR - `FERR`
	* @param BERR - `BERR`
	* @param WORK - `WORK`
	* @param RWORK - `RWORK`
	* @returns result
	*/
	( fact: string, N: number, nrhs: number, d: Float64Array, e: Float64Array, DF: Float64Array, EF: Float64Array, B: Float64Array, LDB: number, X: Float64Array, LDX: number, rcond: number, FERR: Float64Array, BERR: Float64Array, WORK: Float64Array, RWORK: Float64Array ): Float64Array;

	/**
	* @license Apache-2.0 using alternative indexing semantics.
	*
	* @param fact - `fact`
	* @param N - number of columns
	* @param nrhs - number of right-hand sides
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param DF - `DF`
	* @param strideDF - stride of `DF`
	* @param offsetDF - starting index for `DF`
	* @param EF - `EF`
	* @param strideEF - stride of `EF`
	* @param offsetEF - starting index for `EF`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param X - `X`
	* @param strideX1 - stride of `X`
	* @param strideX2 - stride of `X`
	* @param offsetX - starting index for `X`
	* @param rcond - `rcond`
	* @param FERR - `FERR`
	* @param strideFERR - stride of `FERR`
	* @param offsetFERR - starting index for `FERR`
	* @param BERR - `BERR`
	* @param strideBERR - stride of `BERR`
	* @param offsetBERR - starting index for `BERR`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param RWORK - `RWORK`
	* @param strideRWORK - stride of `RWORK`
	* @param offsetRWORK - starting index for `RWORK`
	* @returns result
	*/
	ndarray( fact: string, N: number, nrhs: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, DF: Float64Array, strideDF: number, offsetDF: number, EF: Float64Array, strideEF: number, offsetEF: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, X: Float64Array, strideX1: number, strideX2: number, offsetX: number, rcond: number, FERR: Float64Array, strideFERR: number, offsetFERR: number, BERR: Float64Array, strideBERR: number, offsetBERR: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, RWORK: Float64Array, strideRWORK: number, offsetRWORK: number ): Float64Array;
}

/**
* @license Apache-2.0.
*/
declare var zptsvx: Routine;


// EXPORTS //

export = zptsvx;
