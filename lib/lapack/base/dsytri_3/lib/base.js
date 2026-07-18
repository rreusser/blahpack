/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import dsytri3x from './../../../../lapack/base/dsytri_3x/lib/base.js';


// VARIABLES //

// Block size. Reference LAPACK calls ILAENV(1,'DSYTRI_3',...), which has no entry for SY/TRI and returns the default NB = 1; we hardcode the same value to match the reference workspace-query result bit-for-bit. (`dsytri_3x` accepts any valid block size.)
const NB = 1;


// MAIN //

/**
* Computes the inverse of a real symmetric indefinite matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` as computed by `dsytrf_rk`. This is the blocked driver; it picks a block size and forwards to `dsytri_3x`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output symmetric matrix (factored form on entry; inverse on exit)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - index offset for `A`
* @param {Float64Array} e - super/sub-diagonal of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - index offset for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - index offset for `IPIV`
* @param {Float64Array} WORK - workspace of length `(N+NB+1)*(NB+3)`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - index offset for `WORK`
* @returns {integer} status code (`0` = success; `-i` = illegal argument; `> 0` = singular diagonal block)
*/
function dsytri3( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params

	// Determine the block size (see the NB comment above).
	const lwkopt = ( N + NB + 1 ) * ( NB + 3 );

	// Argument validation.
	if ( uplo !== 'upper' && uplo !== 'lower' ) {
		return -1;
	}
	if ( N < 0 ) {
		return -2;
	}

	// Quick return.
	if ( N === 0 ) {
		return 0;
	}

	const info = dsytri3x( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, NB ); // eslint-disable-line max-len

	WORK[ offsetWork ] = lwkopt;
	return info;
}


// EXPORTS //

export default dsytri3;
