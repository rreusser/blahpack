/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex Hermitian positive-definite matrix.
*
* The "max absolute element" norm is used. If this is much less than 1, the
* stability of the Cholesky factorization of the (equilibrated) matrix A
* could be poor.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is stored (`upper` or `lower`)
* @param {NonNegativeInteger} ncols - number of columns of the matrix A
* @param {Complex128Array} A - input matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - triangular factor U or L from the Cholesky factorization
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Float64Array} WORK - workspace array of length at least `2*ncols`
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {number} reciprocal pivot growth factor
*/
function zla_porpvgrw( uplo, ncols, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, WORK, strideWork, offsetWork ) {
	var rpvgrw;
	var upper;
	var amax;
	var umax;
	var sa1;
	var sa2;
	var sf1;
	var sf2;
	var oA;
	var oF;
	var Av;
	var Fv;
	var iw;
	var ia;
	var v;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	Fv = reinterpret( AF, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	sf1 = strideAF1 * 2;
	sf2 = strideAF2 * 2;
	oF = offsetAF * 2;

	upper = ( uplo === 'upper' );
	rpvgrw = 1.0;

	// Initialize WORK to zero...
	for ( i = 0; i < 2 * ncols; i += 1 ) {
		WORK[ offsetWork + ( i * strideWork ) ] = 0.0;
	}

	// Find the max magnitude entry of each column of A using CABS1...
	if ( upper ) {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( ( ncols + j ) * strideWork );
			for ( i = 0; i <= j; i += 1 ) {
				ia = oA + ( i * sa1 ) + ( j * sa2 );

				// CABS1(z) = |re| + |im|
				v = abs( Av[ ia ] ) + abs( Av[ ia + 1 ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	} else {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( ( ncols + j ) * strideWork );
			for ( i = j; i < ncols; i += 1 ) {
				ia = oA + ( i * sa1 ) + ( j * sa2 );

				// CABS1(z) = |re| + |im|
				v = abs( Av[ ia ] ) + abs( Av[ ia + 1 ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	}

	// Find the max magnitude entry of each column of AF using CABS1...
	if ( upper ) {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( j * strideWork );
			for ( i = 0; i <= j; i += 1 ) {
				ia = oF + ( i * sf1 ) + ( j * sf2 );

				// CABS1(z) = |re| + |im|
				v = abs( Fv[ ia ] ) + abs( Fv[ ia + 1 ] );
				if ( v > WORK[ iw ] ) {
					WORK[ iw ] = v;
				}
			}
		}
	} else {
		for ( j = 0; j < ncols; j += 1 ) {
			iw = offsetWork + ( j * strideWork );
			for ( i = j; i < ncols; i += 1 ) {
				ia = oF + ( i * sf1 ) + ( j * sf2 );

				// CABS1(z) = |re| + |im|
				v = abs( Fv[ ia ] ) + abs( Fv[ ia + 1 ] );
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

export default zla_porpvgrw;
