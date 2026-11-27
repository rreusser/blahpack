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
* Interface describing `dlaebz`.
*/
interface Routine {
	/**
	* Computes the number of eigenvalues of a symmetric tridiagonal matrix T.
	*
	* @param ijob - `ijob`
	* @param nitmax - `nitmax`
	* @param N - number of columns
	* @param mmax - `mmax`
	* @param minp - `minp`
	* @param nbmin - `nbmin`
	* @param abstol - `abstol`
	* @param reltol - `reltol`
	* @param pivmin - `pivmin`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param NVAL - `NVAL`
	* @param strideNVAL - stride of `NVAL`
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param mout - `mout`
	* @param NAB - `NAB`
	* @param LDNAB - leading dimension of `NAB`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @returns result
	*/
	( ijob: number, nitmax: number, N: number, mmax: number, minp: number, nbmin: number, abstol: number, reltol: number, pivmin: number, d: Float64Array, strideD: number, e: Float64Array, strideE: number, E2: number, strideE2: number, NVAL: Float64Array, strideNVAL: number, AB: Float64Array, LDAB: number, c: Float64Array, strideC: number, mout: number, NAB: Float64Array, LDNAB: number, WORK: Float64Array, strideWORK: number, IWORK: Int32Array, strideIWORK: number ): Float64Array;

	/**
	* Computes the number of eigenvalues of a symmetric tridiagonal matrix T using alternative indexing semantics.
	*
	* @param ijob - `ijob`
	* @param nitmax - `nitmax`
	* @param N - number of columns
	* @param mmax - `mmax`
	* @param minp - `minp`
	* @param nbmin - `nbmin`
	* @param abstol - `abstol`
	* @param reltol - `reltol`
	* @param pivmin - `pivmin`
	* @param d - `d`
	* @param strideD - stride of `D`
	* @param offsetD - starting index for `D`
	* @param e - `e`
	* @param strideE - stride of `E`
	* @param offsetE - starting index for `E`
	* @param E2 - `E2`
	* @param strideE2 - stride of `E`
	* @param offsetE2 - starting index for `E2`
	* @param NVAL - `NVAL`
	* @param strideNVAL - stride of `NVAL`
	* @param offsetNVAL - starting index for `NVAL`
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param mout - `mout`
	* @param NAB - `NAB`
	* @param strideNAB1 - stride of `NAB`
	* @param strideNAB2 - stride of `NAB`
	* @param offsetNAB - starting index for `NAB`
	* @param WORK - `WORK`
	* @param strideWORK - stride of `WORK`
	* @param offsetWORK - starting index for `WORK`
	* @param IWORK - `IWORK`
	* @param strideIWORK - stride of `IWORK`
	* @param offsetIWORK - starting index for `IWORK`
	* @returns result
	*/
	ndarray( ijob: number, nitmax: number, N: number, mmax: number, minp: number, nbmin: number, abstol: number, reltol: number, pivmin: number, d: Float64Array, strideD: number, offsetD: number, e: Float64Array, strideE: number, offsetE: number, E2: number, strideE2: number, offsetE2: number, NVAL: Float64Array, strideNVAL: number, offsetNVAL: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, c: Float64Array, strideC: number, offsetC: number, mout: number, NAB: Float64Array, strideNAB1: number, strideNAB2: number, offsetNAB: number, WORK: Float64Array, strideWORK: number, offsetWORK: number, IWORK: Int32Array, strideIWORK: number, offsetIWORK: number ): Float64Array;
}

/**
* Computes the number of eigenvalues of a symmetric tridiagonal matrix T.
*/
declare var dlaebz: Routine;


// EXPORTS //

export = dlaebz;
