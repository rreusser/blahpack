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
* Interface describing `dlaqr1`.
*/
interface Routine {
	/**
	* Sets a scalar multiple of the first column of the product.
	*
	* @param N - number of columns
	* @param H - `H`
	* @param LDH - leading dimension of `H`
	* @param sr1 - `sr1`
	* @param si1 - `si1`
	* @param sr2 - `sr2`
	* @param si2 - `si2`
	* @param v - `v`
	* @param strideV - stride of `V`
	* @returns result
	*/
	( N: number, H: Float64Array, LDH: number, sr1: number, si1: number, sr2: number, si2: number, v: Float64Array, strideV: number ): Float64Array;

	/**
	* Sets a scalar multiple of the first column of the product using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param H - `H`
	* @param strideH1 - stride of `H`
	* @param strideH2 - stride of `H`
	* @param offsetH - starting index for `H`
	* @param sr1 - `sr1`
	* @param si1 - `si1`
	* @param sr2 - `sr2`
	* @param si2 - `si2`
	* @param v - `v`
	* @param strideV - stride of `V`
	* @param offsetV - starting index for `V`
	* @returns result
	*/
	ndarray( N: number, H: Float64Array, strideH1: number, strideH2: number, offsetH: number, sr1: number, si1: number, sr2: number, si2: number, v: Float64Array, strideV: number, offsetV: number ): Float64Array;
}

/**
* Sets a scalar multiple of the first column of the product.
*/
declare var dlaqr1: Routine;


// EXPORTS //

export = dlaqr1;
