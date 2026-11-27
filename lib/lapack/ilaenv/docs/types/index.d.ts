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
* Interface describing `ilaenv`.
*/
interface Routine {
	/**
	* Returns problem-dependent parameters for the local environment.
	*
	* @param ispec - parameter to return: `1` (optimal block size), `2` (minimum block size), `3` (crossover point), `4` (number of shifts), `5` (minimum column dimension), `6` (SVD crossover point), `7` (number of processors), `8` (multishift QR crossover point), `9` (divide-and-conquer leaf size), `10`/`11` (NaN/infinity arithmetic is safe), `12`-`17` (multishift QR parameters, from `iparmq`); any other value returns `-1`
	* @param name - name of the calling routine (e.g. `'DGEQRF'`), in any case: as in the reference, its first six characters are upper-cased when the first is a lower-case letter
	* @param opts - character options of the calling routine, concatenated (not read)
	* @param n1 - first problem dimension
	* @param n2 - second problem dimension
	* @param n3 - third problem dimension
	* @param n4 - fourth problem dimension
	* @returns parameter value
	*
	* @example
	* var v = ilaenv( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
	* // returns 32
	*/
	( ispec: number, name: string, opts: string, n1: number, n2: number, n3: number, n4: number ): number;

	/**
	* Returns problem-dependent parameters for the local environment, using alternative indexing semantics.
	*
	* @param ispec - parameter to return: `1` (optimal block size), `2` (minimum block size), `3` (crossover point), `4` (number of shifts), `5` (minimum column dimension), `6` (SVD crossover point), `7` (number of processors), `8` (multishift QR crossover point), `9` (divide-and-conquer leaf size), `10`/`11` (NaN/infinity arithmetic is safe), `12`-`17` (multishift QR parameters, from `iparmq`); any other value returns `-1`
	* @param name - name of the calling routine (e.g. `'DGEQRF'`), in any case: as in the reference, its first six characters are upper-cased when the first is a lower-case letter
	* @param opts - character options of the calling routine, concatenated (not read)
	* @param n1 - first problem dimension
	* @param n2 - second problem dimension
	* @param n3 - third problem dimension
	* @param n4 - fourth problem dimension
	* @returns parameter value
	*
	* @example
	* var v = ilaenv.ndarray( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
	* // returns 32
	*/
	ndarray( ispec: number, name: string, opts: string, n1: number, n2: number, n3: number, n4: number ): number;
}

/**
* Returns problem-dependent parameters for the local environment.
*
* @param ispec - parameter to return: `1` (optimal block size), `2` (minimum block size), `3` (crossover point), `4` (number of shifts), `5` (minimum column dimension), `6` (SVD crossover point), `7` (number of processors), `8` (multishift QR crossover point), `9` (divide-and-conquer leaf size), `10`/`11` (NaN/infinity arithmetic is safe), `12`-`17` (multishift QR parameters, from `iparmq`); any other value returns `-1`
* @param name - name of the calling routine (e.g. `'DGEQRF'`), in any case: as in the reference, its first six characters are upper-cased when the first is a lower-case letter
* @param opts - character options of the calling routine, concatenated (not read)
* @param n1 - first problem dimension
* @param n2 - second problem dimension
* @param n3 - third problem dimension
* @param n4 - fourth problem dimension
* @returns parameter value
*
* @example
* var v = ilaenv( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
* // returns 32
*/
declare var ilaenv: Routine;


// EXPORTS //

export = ilaenv;
