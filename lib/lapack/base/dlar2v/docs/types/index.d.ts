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
* Interface describing `dlar2v`.
*/
interface Routine {
	/**
	* Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param y - `y`
	* @param z - `z`
	* @param strideXYZ - stride of `XYZ`
	* @param c - `c`
	* @param s - `s`
	* @param strideCS - stride of `CS`
	* @returns result
	*/
	( N: number, x: Float64Array, y: Float64Array, z: Float64Array, strideXYZ: number, c: Float64Array, s: Float64Array, strideCS: number ): void;

	/**
	* Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices using alternative indexing semantics.
	*
	* @param N - number of columns
	* @param x - `x`
	* @param strideX - stride of `X`
	* @param offsetX - starting index for `X`
	* @param y - `y`
	* @param strideY - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param z - `z`
	* @param strideZ - stride of `Z`
	* @param offsetZ - starting index for `Z`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param s - `s`
	* @param strideS - stride of `S`
	* @param offsetS - starting index for `S`
	* @returns result
	*/
	ndarray( N: number, x: Float64Array, strideX: number, offsetX: number, y: Float64Array, strideY: number, offsetY: number, z: Float64Array, strideZ: number, offsetZ: number, c: Float64Array, strideC: number, offsetC: number, s: Float64Array, strideS: number, offsetS: number ): void;
}

/**
* Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices.
*/
declare var dlar2v: Routine;


// EXPORTS //

export = dlar2v;
