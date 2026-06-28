/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import abs from '@stdlib/math/base/special/abs/lib/index.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a symmetric positive-definite matrix.
*
* The "max absolute element" norm is used. If this is much less than 1, the
* stability of the Cholesky factorization of the (equilibrated) matrix A
* could be poor.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} ncols - number of columns of the matrix A
* @param {Float64Array} A - input matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - triangular factor U or L from the Cholesky factorization
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Float64Array} WORK - workspace array of length at least `2*ncols`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {number} reciprocal pivot growth factor
*/
function dla_porpvgrw( uplo, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, offsetWork ) {
	var rpvgrw;
	var upper;
	var amax;
	var umax;
	var iw;
	var ia;
	var v;
	var i;
	var j;

	upper = ( uplo === 'upper' );
	rpvgrw = 1.0;

	// Initialize WORK to zero...
	for ( i = 0; i < 2 * ncols; i += 1 ) {
		WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
	}

	// Find the max magnitude entry of each column of A...
	if ( upper ) {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( ( ncols + j ) * strideWork );
			for ( i = 0; i <= j; i += 1 ) {
				ia = offsetA + ( i * strideA1 ) + ( j * strideA2 );
				v = abs( A[ ia ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	} else {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( ( ncols + j ) * strideWork );
			for ( i = j; i < ncols; i += 1 ) {
				ia = offsetA + ( i * strideA1 ) + ( j * strideA2 );
				v = abs( A[ ia ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	}

	// Find the max magnitude entry of each column of AF...
	if ( upper ) {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( j * strideWork );
			for ( i = 0; i <= j; i += 1 ) {
				ia = offsetAF + ( i * strideAF1 ) + ( j * strideAF2 );
				v = abs( AF[ ia ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	} else {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( j * strideWork );
			for ( i = j; i < ncols; i += 1 ) {
				ia = offsetAF + ( i * strideAF1 ) + ( j * strideAF2 );
				v = abs( AF[ ia ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	}

	// Compute the inverse of the max element growth factor...
	for ( i = 0; i < ncols; i += 1 ) {
		umax = WORK[ offsetWork + ( i * strideWork ) ];
		amax = WORK[ offsetWork + ( ( ncols + i ) * strideWork ) ];
		if ( umax !== 0.0 ) {
			rpvgrw = Math.min( amax / umax, rpvgrw );
		}
	}
	return rpvgrw;
}


// EXPORTS //

export default dla_porpvgrw;
