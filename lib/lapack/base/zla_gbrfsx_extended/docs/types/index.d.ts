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

/// <reference types="@stdlib/types"/>

import { Layout, TransposeOperation } from '@stdlib/types/blas';

/**
* Interface describing `zla_gbrfsx_extended`.
*/
interface Routine {
	/**
	* @license MIT.
	*
	* @param order - storage layout
	* @param prec_type - `prec_type`
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param nrhs - number of right-hand sides
	* @param AB - `AB`
	* @param LDAB - leading dimension of `AB`
	* @param AFB - `AFB`
	* @param LDAFB - leading dimension of `AFB`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param colequ - `colequ`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param B - `B`
	* @param LDB - leading dimension of `B`
	* @param Y - `Y`
	* @param LDY - leading dimension of `Y`
	* @param BERR_OUT - `BERR_OUT`
	* @param strideBERR_OUT - stride of `BERR_OUT`
	* @param n_norms - `n_norms`
	* @param ERR_BNDS_NORM - `ERR_BNDS_NORM`
	* @param LDERR_BNDS_NORM - `LDERR_BNDS_NORM`
	* @param ERR_BNDS_COMP - `ERR_BNDS_COMP`
	* @param LDERR_BNDS_COMP - `LDERR_BNDS_COMP`
	* @param RES - `RES`
	* @param strideRES - stride of `RES`
	* @param AYB - `AYB`
	* @param strideAYB - stride of `AYB`
	* @param DY - `DY`
	* @param strideDY - stride of `DY`
	* @param Y_TAIL - `Y_TAIL`
	* @param strideY_TAIL - stride of `Y_TAIL`
	* @param rcond - `rcond`
	* @param ithresh - `ithresh`
	* @param rthresh - `rthresh`
	* @param dz_ub - `dz_ub`
	* @param ignore_cwise - `ignore_cwise`
	* @returns result
	*/
	( order: Layout, prec_type: number, trans: TransposeOperation, N: number, kl: number, ku: number, nrhs: number, AB: Float64Array, LDAB: number, AFB: Float64Array, LDAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: number, c: Float64Array, strideC: number, B: Float64Array, LDB: number, Y: Float64Array, LDY: number, BERR_OUT: Float64Array, strideBERR_OUT: number, n_norms: number, ERR_BNDS_NORM: Float64Array, LDERR_BNDS_NORM: number, ERR_BNDS_COMP: Float64Array, LDERR_BNDS_COMP: number, RES: Float64Array, strideRES: number, AYB: Float64Array, strideAYB: number, DY: Float64Array, strideDY: number, Y_TAIL: Float64Array, strideY_TAIL: number, rcond: number, ithresh: number, rthresh: number, dz_ub: number, ignore_cwise: number ): number;

	/**
	* @license MIT using alternative indexing semantics.
	*
	* @param prec_type - `prec_type`
	* @param trans - specifies whether the matrix should be transposed
	* @param N - number of columns
	* @param kl - number of subdiagonals
	* @param ku - number of superdiagonals
	* @param nrhs - number of right-hand sides
	* @param AB - `AB`
	* @param strideAB1 - stride of `AB`
	* @param strideAB2 - stride of `AB`
	* @param offsetAB - starting index for `AB`
	* @param AFB - `AFB`
	* @param strideAFB1 - stride of `AFB`
	* @param strideAFB2 - stride of `AFB`
	* @param offsetAFB - starting index for `AFB`
	* @param IPIV - `IPIV`
	* @param strideIPIV - stride of `IPIV`
	* @param offsetIPIV - starting index for `IPIV`
	* @param colequ - `colequ`
	* @param c - `c`
	* @param strideC - stride of `C`
	* @param offsetC - starting index for `C`
	* @param B - `B`
	* @param strideB1 - stride of `B`
	* @param strideB2 - stride of `B`
	* @param offsetB - starting index for `B`
	* @param Y - `Y`
	* @param strideY1 - stride of `Y`
	* @param strideY2 - stride of `Y`
	* @param offsetY - starting index for `Y`
	* @param BERR_OUT - `BERR_OUT`
	* @param strideBERR_OUT - stride of `BERR_OUT`
	* @param offsetBERR_OUT - starting index for `BERR_OUT`
	* @param n_norms - `n_norms`
	* @param ERR_BNDS_NORM - `ERR_BNDS_NORM`
	* @param strideERR_BNDS_NORM1 - stride of `ERR_BNDS_NORM`
	* @param strideERR_BNDS_NORM2 - stride of `ERR_BNDS_NORM`
	* @param offsetERR_BNDS_NORM - starting index for `ERR_BNDS_NORM`
	* @param ERR_BNDS_COMP - `ERR_BNDS_COMP`
	* @param strideERR_BNDS_COMP1 - stride of `ERR_BNDS_COMP`
	* @param strideERR_BNDS_COMP2 - stride of `ERR_BNDS_COMP`
	* @param offsetERR_BNDS_COMP - starting index for `ERR_BNDS_COMP`
	* @param RES - `RES`
	* @param strideRES - stride of `RES`
	* @param offsetRES - starting index for `RES`
	* @param AYB - `AYB`
	* @param strideAYB - stride of `AYB`
	* @param offsetAYB - starting index for `AYB`
	* @param DY - `DY`
	* @param strideDY - stride of `DY`
	* @param offsetDY - starting index for `DY`
	* @param Y_TAIL - `Y_TAIL`
	* @param strideY_TAIL - stride of `Y_TAIL`
	* @param offsetY_TAIL - starting index for `Y_TAIL`
	* @param rcond - `rcond`
	* @param ithresh - `ithresh`
	* @param rthresh - `rthresh`
	* @param dz_ub - `dz_ub`
	* @param ignore_cwise - `ignore_cwise`
	* @returns result
	*/
	ndarray( prec_type: number, trans: TransposeOperation, N: number, kl: number, ku: number, nrhs: number, AB: Float64Array, strideAB1: number, strideAB2: number, offsetAB: number, AFB: Float64Array, strideAFB1: number, strideAFB2: number, offsetAFB: number, IPIV: Int32Array, strideIPIV: number, offsetIPIV: number, colequ: number, c: Float64Array, strideC: number, offsetC: number, B: Float64Array, strideB1: number, strideB2: number, offsetB: number, Y: Float64Array, strideY1: number, strideY2: number, offsetY: number, BERR_OUT: Float64Array, strideBERR_OUT: number, offsetBERR_OUT: number, n_norms: number, ERR_BNDS_NORM: Float64Array, strideERR_BNDS_NORM1: number, strideERR_BNDS_NORM2: number, offsetERR_BNDS_NORM: number, ERR_BNDS_COMP: Float64Array, strideERR_BNDS_COMP1: number, strideERR_BNDS_COMP2: number, offsetERR_BNDS_COMP: number, RES: Float64Array, strideRES: number, offsetRES: number, AYB: Float64Array, strideAYB: number, offsetAYB: number, DY: Float64Array, strideDY: number, offsetDY: number, Y_TAIL: Float64Array, strideY_TAIL: number, offsetY_TAIL: number, rcond: number, ithresh: number, rthresh: number, dz_ub: number, ignore_cwise: number ): number;
}

/**
* @license MIT.
*/
declare var zla_gbrfsx_extended: Routine;


// EXPORTS //

export = zla_gbrfsx_extended;
