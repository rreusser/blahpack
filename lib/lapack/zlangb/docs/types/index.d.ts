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
* Interface describing `zlangb`.
*/
interface Routine {
	/**
	* Returns the norm of a complex general band matrix.
	*
	* @param norm - `norm`
	* @param N - number of columns
	* @param KL - `KL`
	* @param KU - `KU`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @returns result
	*/
	( norm: string, N: number, KL: number, KU: number, AB: Float64Array, LDAB: number, WORK: Float64Array, strideWORK: number ): Float64Array;

	/**
	* Returns the norm of a complex general band matrix using alternative indexing semantics.
	*
	* @param norm - `norm`
	* @param N - number of columns
	* @param KL - `KL`
	* @param KU - `KU`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @returns result
	*/
	ndarray( norm: string, N: number, KL: number, KU: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, WORK: Float64Array, strideWORK: number, offsetWORK: number ): Float64Array;
}

/**
* Returns the norm of a complex general band matrix.
*/
declare var zlangb: Routine;


// EXPORTS //

export = zlangb;
