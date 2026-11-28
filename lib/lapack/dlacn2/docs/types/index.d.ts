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
* Interface describing `dlacn2`.
*/
interface Routine {
	/**
	* Estimates the 1-norm of a square matrix using reverse communication.
	*
	* @param N - number of columns
	* @param v - `v`
	* @param strideV - stride of `V`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param ISGN - `ISGN`
	* @param strideISGN - stride of `ISGN`
	* @param EST - `EST`
	* @param KASE - `KASE`
	* @param ISAVE - `ISAVE`
	* @param strideISAVE - stride of `ISAVE`
	* @returns result
	*/
	( N: number, v: Float64Array, strideV: number, x: Float64Array, strideX: number, ISGN: Float64Array, strideISGN: number, EST: number, KASE: number, ISAVE: Float64Array, strideISAVE: number ): Float64Array;

	/**
	* Estimates the 1-norm of a square matrix using reverse communication using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param v - `v`
	* @param strideV - stride of `V`
	* @param offsetV - starting index for `V`
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param ISGN - `ISGN`
	* @param strideISGN - stride of `ISGN`
	* @param offsetISGN - starting index for `ISGN`
	* @param EST - `EST`
	* @param KASE - `KASE`
	* @param ISAVE - `ISAVE`
	* @param strideISAVE - stride of `ISAVE`
	* @param offsetISAVE - starting index for `ISAVE`
	* @returns result
	*/
	ndarray( N: number, v: Float64Array, strideV: number, offsetV: number, x: Float64Array, strideX: number, offsetX: number, ISGN: Float64Array, strideISGN: number, offsetISGN: number, EST: number, KASE: number, ISAVE: Float64Array, strideISAVE: number, offsetISAVE: number ): Float64Array;
}

/**
* Estimates the 1-norm of a square matrix using reverse communication.
*/
declare var dlacn2: Routine;


// EXPORTS //

export = dlacn2;
