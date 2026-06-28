/**
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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-mixed-operators */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import dzasum from './../../../../blas/base/dzasum/lib/base.js';
import dznrm2 from './../../../../blas/base/dznrm2/lib/base.js';
import izamax from './../../../../blas/base/izamax/lib/base.js';
import zdscal from './../../../../blas/base/zdscal/lib/base.js';
import zlatrs from './../../zlatrs/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TENTH = 1.0e-1;


// MAIN //

/**
* Uses inverse iteration to find a right or left eigenvector of a complex upper Hessenberg matrix H corresponding to a specified eigenvalue W.
*
* ## Notes
*
* -   On entry, if NOINIT is true, the initial eigenvector is generated internally as EPS3; otherwise V is used as the initial vector. On exit, V contains the normalized eigenvector.
* -   B is a complex workspace matrix of order N (leading dimension at least N).
* -   RWORK is a real workspace of length N used by ZLATRS.
* -   Returns 0 on success, 1 if inverse iteration failed to converge.
*
* @private
* @param {boolean} rightv - if true, compute a right eigenvector; if false, a left eigenvector
* @param {boolean} noinit - if true, generate the initial vector internally; if false, use V as supplied
* @param {NonNegativeInteger} N - order of the matrix H
* @param {Complex128Array} H - upper Hessenberg matrix of order N
* @param {integer} strideH1 - stride of the first dimension of `H` (complex elements)
* @param {integer} strideH2 - stride of the second dimension of `H` (complex elements)
* @param {NonNegativeInteger} offsetH - starting index for `H` (complex elements)
* @param {Complex128} w - complex eigenvalue
* @param {Complex128Array} v - on entry, initial eigenvector (if noinit is false); on exit, normalized computed eigenvector
* @param {integer} strideV - stride length for `v` (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for `v` (complex elements)
* @param {Complex128Array} B - workspace matrix of order N
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Float64Array} RWORK - real workspace of length N
* @param {integer} strideRWork - stride length for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @param {number} eps3 - small machine-dependent value used to perturb close eigenvalues
* @param {number} smlnum - a machine-dependent lower bound
* @returns {integer} info - 0 on success, 1 if inverse iteration failed to converge
*/
function zlaein( rightv, noinit, N, H, strideH1, strideH2, offsetH, w, v, strideV, offsetV, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork, eps3, smlnum ) {
	var bi1jIdx;
	var bij1Idx;
	var scratch;
	var nrmsml;
	var growto;
	var normin;
	var biiIdx;
	var bjjIdx;
	var bijIdx;
	var absBii;
	var absBjj;
	var vnorm;
	var rootn;
	var trans;
	var scale;
	var rtemp;
	var eiIdx;
	var ejIdx;
	var absEi;
	var absEj;
	var info;
	var sH1;
	var sH2;
	var sB1;
	var sB2;
	var its;
	var eiR;
	var eiI;
	var idx;
	var sV;
	var oH;
	var oB;
	var oV;
	var wr;
	var wi;
	var xR;
	var xI;
	var tR;
	var tI;
	var hv;
	var bv;
	var vv;
	var i;
	var j;

	info = 0;

	if ( N <= 0 ) {
		return info;
	}

	// Complex-element strides/offsets converted to Float64:
	sH1 = strideH1 * 2;
	sH2 = strideH2 * 2;
	sB1 = strideB1 * 2;
	sB2 = strideB2 * 2;
	sV = strideV * 2;
	oH = offsetH * 2;
	oB = offsetB * 2;
	oV = offsetV * 2;

	hv = reinterpret( H, 0 );
	bv = reinterpret( B, 0 );
	vv = reinterpret( v, 0 );

	wr = real( w );
	wi = imag( w );

	// ZLATRS scale is returned via length-1 array:
	scale = new Float64Array( 1 );

	// Scratch buffer for complex divisions (avoids clobbering v):
	scratch = new Float64Array( 2 );

	rootn = Math.sqrt( N );
	growto = TENTH / rootn;
	nrmsml = Math.max( ONE, eps3 * rootn ) * smlnum;

	// Form B = H - w*I (copy upper triangle of H into B and subtract w on diagonal):
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			idx = oB + ( i * sB1 ) + ( j * sB2 );
			bv[ idx ] = hv[ oH + ( i * sH1 ) + ( j * sH2 ) ];
			bv[ idx + 1 ] = hv[ oH + ( i * sH1 ) + ( j * sH2 ) + 1 ];
		}
		idx = oB + ( j * sB1 ) + ( j * sB2 );
		bv[ idx ] = hv[ oH + ( j * sH1 ) + ( j * sH2 ) ] - wr;
		bv[ idx + 1 ] = hv[ oH + ( j * sH1 ) + ( j * sH2 ) + 1 ] - wi;
	}

	if ( noinit ) {
		// Initial vector := eps3.
		for ( i = 0; i < N; i++ ) {
			vv[ oV + ( i * sV ) ] = eps3;
			vv[ oV + ( i * sV ) + 1 ] = ZERO;
		}
	} else {
		// Scale supplied initial vector.
		vnorm = dznrm2( N, v, strideV, offsetV );
		zdscal( N, ( eps3 * rootn ) / Math.max( vnorm, nrmsml ), v, strideV, offsetV );
	}

	if ( rightv ) {
		// Reduce B to upper triangular by row operations from below (eliminate sub-diagonal).
		for ( i = 0; i < N - 1; i++ ) {
			biiIdx = oB + ( i * sB1 ) + ( i * sB2 );
			eiIdx = oH + ( ( i + 1 ) * sH1 ) + ( i * sH2 );
			eiR = hv[ eiIdx ];
			eiI = hv[ eiIdx + 1 ];
			absBii = Math.abs( bv[ biiIdx ] ) + Math.abs( bv[ biiIdx + 1 ] );
			absEi = Math.abs( eiR ) + Math.abs( eiI );
			if ( absBii < absEi ) {
				// Interchange rows i and i+1, and eliminate.
				// X = B(i,i) / EI:
				cmplx.divAt( scratch, 0, bv, biiIdx, hv, eiIdx );
				xR = scratch[ 0 ];
				xI = scratch[ 1 ];

				// B(i,i) := EI
				bv[ biiIdx ] = eiR;
				bv[ biiIdx + 1 ] = eiI;
				for ( j = i + 1; j < N; j++ ) {
					bi1jIdx = oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 );
					bijIdx = oB + ( i * sB1 ) + ( j * sB2 );
					tR = bv[ bi1jIdx ];
					tI = bv[ bi1jIdx + 1 ];

					// B(i+1,j) := B(i,j) - X*temp
					bv[ bi1jIdx ] = bv[ bijIdx ] - ( xR * tR - xI * tI );
					bv[ bi1jIdx + 1 ] = bv[ bijIdx + 1 ] - ( xR * tI + xI * tR );

					// B(i,j) := temp
					bv[ bijIdx ] = tR;
					bv[ bijIdx + 1 ] = tI;
				}
			} else {
				if ( bv[ biiIdx ] === ZERO && bv[ biiIdx + 1 ] === ZERO ) {
					bv[ biiIdx ] = eps3;
					bv[ biiIdx + 1 ] = ZERO;
				}
				// X = EI / B(i,i):
				cmplx.divAt( scratch, 0, hv, eiIdx, bv, biiIdx );
				xR = scratch[ 0 ];
				xI = scratch[ 1 ];
				if ( xR !== ZERO || xI !== ZERO ) {
					for ( j = i + 1; j < N; j++ ) {
						bi1jIdx = oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 );
						bijIdx = oB + ( i * sB1 ) + ( j * sB2 );

						// B(i+1,j) -= X * B(i,j)
						bv[ bi1jIdx ] -= ( xR * bv[ bijIdx ] ) - ( xI * bv[ bijIdx + 1 ] );
						bv[ bi1jIdx + 1 ] -= ( xR * bv[ bijIdx + 1 ] ) + ( xI * bv[ bijIdx ] );
					}
				}
			}
		}
		idx = oB + ( ( N - 1 ) * sB1 ) + ( ( N - 1 ) * sB2 );
		if ( bv[ idx ] === ZERO && bv[ idx + 1 ] === ZERO ) {
			bv[ idx ] = eps3;
			bv[ idx + 1 ] = ZERO;
		}
		trans = 'no-transpose';
	} else {
		// Reduce B to lower triangular by column operations from the right.
		for ( j = N - 1; j >= 1; j-- ) {
			bjjIdx = oB + ( j * sB1 ) + ( j * sB2 );
			ejIdx = oH + ( j * sH1 ) + ( ( j - 1 ) * sH2 );
			eiR = hv[ ejIdx ];
			eiI = hv[ ejIdx + 1 ];
			absBjj = Math.abs( bv[ bjjIdx ] ) + Math.abs( bv[ bjjIdx + 1 ] );
			absEj = Math.abs( eiR ) + Math.abs( eiI );
			if ( absBjj < absEj ) {
				// X = B(j,j) / EJ:
				cmplx.divAt( scratch, 0, bv, bjjIdx, hv, ejIdx );
				xR = scratch[ 0 ];
				xI = scratch[ 1 ];
				bv[ bjjIdx ] = eiR;
				bv[ bjjIdx + 1 ] = eiI;
				for ( i = 0; i < j; i++ ) {
					bij1Idx = oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 );
					bijIdx = oB + ( i * sB1 ) + ( j * sB2 );
					tR = bv[ bij1Idx ];
					tI = bv[ bij1Idx + 1 ];

					// B(i,j-1) := B(i,j) - X*temp
					bv[ bij1Idx ] = bv[ bijIdx ] - ( xR * tR - xI * tI );
					bv[ bij1Idx + 1 ] = bv[ bijIdx + 1 ] - ( xR * tI + xI * tR );

					// B(i,j) := temp
					bv[ bijIdx ] = tR;
					bv[ bijIdx + 1 ] = tI;
				}
			} else {
				if ( bv[ bjjIdx ] === ZERO && bv[ bjjIdx + 1 ] === ZERO ) {
					bv[ bjjIdx ] = eps3;
					bv[ bjjIdx + 1 ] = ZERO;
				}
				// X = EJ / B(j,j):
				cmplx.divAt( scratch, 0, hv, ejIdx, bv, bjjIdx );
				xR = scratch[ 0 ];
				xI = scratch[ 1 ];
				if ( xR !== ZERO || xI !== ZERO ) {
					for ( i = 0; i < j; i++ ) {
						bij1Idx = oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 );
						bijIdx = oB + ( i * sB1 ) + ( j * sB2 );

						// B(i,j-1) -= X * B(i,j)
						bv[ bij1Idx ] -= ( xR * bv[ bijIdx ] ) - ( xI * bv[ bijIdx + 1 ] );
						bv[ bij1Idx + 1 ] -= ( xR * bv[ bijIdx + 1 ] ) + ( xI * bv[ bijIdx ] );
					}
				}
			}
		}
		if ( bv[ oB ] === ZERO && bv[ oB + 1 ] === ZERO ) {
			bv[ oB ] = eps3;
			bv[ oB + 1 ] = ZERO;
		}
		trans = 'conjugate-transpose';
	}

	normin = 'no';
	for ( its = 0; its < N; its++ ) {
		zlatrs( 'upper', trans, 'non-unit', normin, N, B, strideB1, strideB2, offsetB, v, strideV, offsetV, scale, RWORK, strideRWork, offsetRWork );
		normin = 'yes';

		vnorm = dzasum( N, v, strideV, offsetV );
		if ( vnorm >= growto * scale[ 0 ] ) {
			// Converged.
			break;
		}

		// Choose new orthogonal starting vector and try again.
		rtemp = eps3 / ( rootn + ONE );
		vv[ oV ] = eps3;
		vv[ oV + 1 ] = ZERO;
		for ( i = 1; i < N; i++ ) {
			vv[ oV + ( i * sV ) ] = rtemp;
			vv[ oV + ( i * sV ) + 1 ] = ZERO;
		}
		// V(N-its) -= eps3*rootn  (Fortran V(N-ITS+1), 1-based, so JS index N-1-its)
		vv[ oV + ( ( N - 1 - its ) * sV ) ] -= eps3 * rootn;
	}
	if ( its >= N ) {
		info = 1;
	}

	// Normalize eigenvector so that its component of largest magnitude is 1.
	i = izamax( N, v, strideV, offsetV );
	zdscal( N, ONE / ( Math.abs( vv[ oV + ( i * sV ) ] ) + Math.abs( vv[ oV + ( i * sV ) + 1 ] ) ), v, strideV, offsetV );

	return info;
}


// EXPORTS //

export default zlaein;
