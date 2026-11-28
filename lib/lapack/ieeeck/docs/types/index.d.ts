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
* Interface describing `ieeeck`.
*/
interface Routine {
	/**
	* Checks whether infinity and NaN arithmetic is safe.
	*
	* @param ispec - `0` checks infinity arithmetic only; any other value also checks NaN arithmetic
	* @param zero - the value `0.0` (rounded to single precision, as the reference's `REAL` argument)
	* @param one - the value `1.0` (rounded to single precision)
	* @returns `1` if the arithmetic is safe, `0` otherwise
	*
	* @example
	* var v = ieeeck( 1, 0.0, 1.0 );
	* // returns 1
	*/
	( ispec: number, zero: number, one: number ): number;

	/**
	* Checks whether infinity and NaN arithmetic is safe, using alternative indexing semantics.
	*
	* @param ispec - `0` checks infinity arithmetic only; any other value also checks NaN arithmetic
	* @param zero - the value `0.0` (rounded to single precision, as the reference's `REAL` argument)
	* @param one - the value `1.0` (rounded to single precision)
	* @returns `1` if the arithmetic is safe, `0` otherwise
	*
	* @example
	* var v = ieeeck.strided( 1, 0.0, 1.0 );
	* // returns 1
	*/
	strided( ispec: number, zero: number, one: number ): number;
}

/**
* Checks whether infinity and NaN arithmetic is safe.
*
* @param ispec - `0` checks infinity arithmetic only; any other value also checks NaN arithmetic
* @param zero - the value `0.0` (rounded to single precision, as the reference's `REAL` argument)
* @param one - the value `1.0` (rounded to single precision)
* @returns `1` if the arithmetic is safe, `0` otherwise
*
* @example
* var v = ieeeck( 1, 0.0, 1.0 );
* // returns 1
*/
declare var ieeeck: Routine;


// EXPORTS //

export = ieeeck;
