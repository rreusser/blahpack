/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

const SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` using a symmetric indefinite matrix to calculate error bounds.
*
* ## Notes
*
* -   To protect against underflow during evaluation, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components (all multiplications involved in computing an entry have at least one zero multiplicand) are not perturbed.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dla_syamv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	let symbZero, temp, yiy, iy, jx, ia, i, j;

	// Quick return if possible...
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}
	const upper = ( uplo === 'upper' );
	const sa1 = strideA1;
	const sa2 = strideA2;

	// Set the safe1 perturbation guard...
	const safe1 = ( N + 1 ) * SAFMIN;

	iy = offsetY;
	if ( upper ) {
		// Form y := alpha*|A|*|x| + beta*|y| using the upper triangle of A...
		for ( i = 0; i < N; i++ ) {
			if ( beta === 0.0 ) {
				symbZero = true;
				y[ iy ] = 0.0;
			} else if ( y[ iy ] === 0.0 ) {
				symbZero = true;
			} else {
				symbZero = false;
				y[ iy ] = beta * Math.abs( y[ iy ] );
			}
			if ( alpha !== 0.0 ) {
				jx = offsetX;

				// j = 0..i: access A(j,i) -- upper triangle column i, rows 0..i
				ia = offsetA + ( i * sa2 );
				for ( j = 0; j <= i; j++ ) {
					temp = Math.abs( A[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
					ia += sa1;
				}

				// j = i+1..N-1: access A(i,j) -- mirror via symmetry (upper row i, columns i+1..N-1)
				ia = offsetA + ( i * sa1 ) + ( ( i + 1 ) * sa2 );
				for ( j = i + 1; j < N; j++ ) {
					temp = Math.abs( A[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
					ia += sa2;
				}
			}
			if ( !symbZero ) {
				yiy = y[ iy ];
				y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
			}
			iy += strideY;
		}
	} else {
		// Form y := alpha*|A|*|x| + beta*|y| using the lower triangle of A...
		for ( i = 0; i < N; i++ ) {
			if ( beta === 0.0 ) {
				symbZero = true;
				y[ iy ] = 0.0;
			} else if ( y[ iy ] === 0.0 ) {
				symbZero = true;
			} else {
				symbZero = false;
				y[ iy ] = beta * Math.abs( y[ iy ] );
			}
			if ( alpha !== 0.0 ) {
				jx = offsetX;

				// j = 0..i: access A(i,j) -- lower triangle row i, columns 0..i
				ia = offsetA + ( i * sa1 );
				for ( j = 0; j <= i; j++ ) {
					temp = Math.abs( A[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
					ia += sa2;
				}

				// j = i+1..N-1: access A(j,i) -- mirror via symmetry (lower column i, rows i+1..N-1)
				ia = offsetA + ( ( i + 1 ) * sa1 ) + ( i * sa2 );
				for ( j = i + 1; j < N; j++ ) {
					temp = Math.abs( A[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
					ia += sa1;
				}
			}
			if ( !symbZero ) {
				yiy = y[ iy ];
				y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
			}
			iy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default dla_syamv;
