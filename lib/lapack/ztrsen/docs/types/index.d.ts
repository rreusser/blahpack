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
* Interface describing `ztrsen`.
*/
interface Routine {
	/**
	* Reorders the Schur factorization of a complex matrix A = Q*T*Q**H so that a.
	*
	* @param job - `job`
	* @param compq - `compq`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param N - number of columns
	* @param T - `T`
	* @param LDT - leading dimension of `T`
	* @param Q - `Q`
	* @param LDQ - leading dimension of `Q`
	* @param W - `W`
	* @param strideW - stride of `W`
	* @param M - number of rows
	* @param s - `s`
	* @param sep - `sep`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( job: string, compq: string, SELECT: Int32Array, strideSELECT: number, N: number, T: Float64Array, LDT: number, Q: Float64Array, LDQ: number, W: Float64Array, strideW: number, M: number, s: number, sep: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Reorders the Schur factorization of a complex matrix A = Q*T*Q**H so that a using alternative indexing semantics.
	*
	* @param job - `job`
	* @param compq - `compq`
	* @param SELECT - `SELECT`
	* @param strideSELECT - stride of `SELECT`
	* @param offsetSELECT - starting index for `SELECT`
	* @param N - number of columns
	* @param T - `T`
	* @param strideT1 - stride of `T`
	* @param strideT2 - stride of `T`
	* @param offsetT - starting index for `T`
	* @param Q - `Q`
	* @param strideQ1 - stride of `Q`
	* @param strideQ2 - stride of `Q`
	* @param offsetQ - starting index for `Q`
	* @param W - `W`
	* @param strideW - stride of `W`
	* @param offsetW - starting index for `W`
	* @param M - number of rows
	* @param s - `s`
	* @param sep - `sep`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( job: string, compq: string, SELECT: Int32Array, strideSELECT: number, offsetSELECT: number, N: number, T: Float64Array, strideT1: number, strideT2: number, offsetT: number, Q: Float64Array, strideQ1: number, strideQ2: number, offsetQ: number, W: Float64Array, strideW: number, offsetW: number, M: number, s: number, sep: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Reorders the Schur factorization of a complex matrix A = Q*T*Q**H so that a.
*/
declare var ztrsen: Routine;


// EXPORTS //

export = ztrsen;
