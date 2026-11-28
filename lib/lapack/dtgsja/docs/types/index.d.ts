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
* Interface describing `dtgsja`.
*/
interface Routine {
	/**
	* Computes the generalized singular value decomposition (GSVD) of two real.
	*
	* @param jobu - `jobu`
	* @param jobv - `jobv`
	* @param jobq - `jobq`
	* @param M - number of rows
	* @param p - `p`
	* @param N - number of columns
	* @param K - inner dimension
	* @param l - `l`
	* @param A - `A`
	* @param LDA - leading dimension of `A`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param tola - `tola`
	* @param tolb - `tolb`
	* @param ALPHA - `ALPHA`
	* @param strideALPHA - stride of `ALPHA`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param U - `U`
	* @param LDU - leading dimension of `U`
	* @param V - `V`
	* @param LDV - leading dimension of `V`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param ncycle - `ncycle`
	* @returns result
	*/
	( jobu: string, jobv: string, jobq: string, M: number, p: number, N: number, K: number, l: number, A: Float64Array, LDA: number, B: Float64Array, LDB: number, tola: number, tolb: number, ALPHA: Float64Array, strideALPHA: number, BETA: Float64Array, strideBETA: number, U: Float64Array, LDU: number, V: Float64Array, LDV: number, Q: Float64Array, LDQ: number, WORK: Float64Array, strideWORK: number, ncycle: number ): Float64Array;

	/**
	* Computes the generalized singular value decomposition (GSVD) of two real using alternative indexing semantics.
	*
	* @param jobu - `jobu`
	* @param jobv - `jobv`
	* @param jobq - `jobq`
	* @param M - number of rows
	* @param p - `p`
	* @param N - number of columns
	* @param K - inner dimension
	* @param l - `l`
	* @param A - `A`
	* @param strideA1 - stride of `A`
	* @param strideA2 - stride of `A`
	* @param offsetA - starting index for `A`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param tola - `tola`
	* @param tolb - `tolb`
	* @param ALPHA - `ALPHA`
	* @param strideALPHA - stride of `ALPHA`
	* @param offsetALPHA - starting index for `ALPHA`
	* @param BETA - `BETA`
	* @param strideBETA - stride of `BETA`
	* @param offsetBETA - starting index for `BETA`
	* @param U - `U`
	* @param strideU1 - stride of `U`
	* @param strideU2 - stride of `U`
	* @param offsetU - starting index for `U`
	* @param V - `V`
	* @param strideV1 - stride of `V`
	* @param strideV2 - stride of `V`
	* @param offsetV - starting index for `V`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param ncycle - `ncycle`
	* @returns result
	*/
	ndarray( jobu: string, jobv: string, jobq: string, M: number, p: number, N: number, K: number, l: number, A: Float64Array, strideA1: number, strideA2: number, offsetA: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, tola: number, tolb: number, ALPHA: Float64Array, strideALPHA: number, offsetALPHA: number, BETA: Float64Array, strideBETA: number, offsetBETA: number, U: Float64Array, strideU1: number, strideU2: number, offsetU: number, V: Float64Array, strideV1: number, strideV2: number, offsetV: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, ncycle: number ): Float64Array;
}

/**
* Computes the generalized singular value decomposition (GSVD) of two real.
*/
declare var dtgsja: Routine;


// EXPORTS //

export = dtgsja;
