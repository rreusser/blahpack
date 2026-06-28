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

/* eslint-disable max-len, max-params */

// MODULES //

import dlamch from './../../dlamch/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dpttrs from './../../dpttrs/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );
var SAFE1 = 4.0 * SAFMIN;          // NZ = 4 (max nonzeros per row + 1)
var SAFE2 = SAFE1 / EPS;


// MAIN //

/**
* Improves the computed solution to a real symmetric positive definite.
* tridiagonal system A*X = B, and provides error bounds and backward
* error estimates for the solution.
*
* @private
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} d - original diagonal elements of A, length N
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - original off-diagonal elements of A, length N-1
* @param {integer} strideE - stride for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} DF - factored diagonal from dpttrf, length N
* @param {integer} strideDF - stride for `DF`
* @param {NonNegativeInteger} offsetDF - starting index for `DF`
* @param {Float64Array} EF - factored off-diagonal from dpttrf, length N-1
* @param {integer} strideEF - stride for `EF`
* @param {NonNegativeInteger} offsetEF - starting index for `EF`
* @param {Float64Array} B - right hand side matrix (N x NRHS)
* @param {integer} strideB1 - row stride of `B`
* @param {integer} strideB2 - column stride of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} X - solution matrix (N x NRHS), refined in-place
* @param {integer} strideX1 - row stride of `X`
* @param {integer} strideX2 - column stride of `X`
* @param {NonNegativeInteger} offsetX - starting index for `X`
* @param {Float64Array} FERR - forward error bound for each RHS, length NRHS
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - backward error for each RHS, length NRHS
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Float64Array} WORK - workspace of length 2*N
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} info - 0 on success
*/
function dptrfs( N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var lstres;
	var count;
	var idf;
	var ief;
	var iwr;
	var bi;
	var cx;
	var dx;
	var ex;
	var ix;
	var jf;
	var jb;
	var jx;
	var id;
	var ie;
	var iw;
	var s;
	var i;
	var j;

	// Quick return if possible:
	if ( N === 0 || nrhs === 0 ) {
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + j * strideFERR ] = 0.0;
			BERR[ offsetBERR + j * strideBERR ] = 0.0;
		}
		return 0;
	}

	// Do for each right hand side...
	for ( j = 0; j < nrhs; j++ ) {
		jf = offsetFERR + j * strideFERR;
		jb = offsetBERR + j * strideBERR;
		jx = offsetX + j * strideX2;

		count = 1;
		lstres = 3.0;

		// Iterative refinement loop:
		while ( true ) {
			// Compute residual R = B - A*X, and abs(A)*abs(X) + abs(B).
			// WORK[offsetWork .. offsetWork+N-1] = abs(A)*abs(X) + abs(B)
			// WORK[offsetWork+N .. offsetWork+2N-1] = residual R

			if ( N === 1 ) {
				bi = B[ offsetB + j * strideB2 ];
				dx = d[ offsetD ] * X[ jx ];
				WORK[ offsetWork + N * strideWork ] = bi - dx;                       // R(0)
				WORK[ offsetWork ] = Math.abs( bi ) + Math.abs( dx );                // |A|*|X|+|B| (0)
			} else {
				// First row (i=0):
				bi = B[ offsetB + j * strideB2 ];
				dx = d[ offsetD ] * X[ jx ];
				ex = e[ offsetE ] * X[ jx + strideX1 ];
				WORK[ offsetWork + N * strideWork ] = bi - dx - ex;
				WORK[ offsetWork ] = Math.abs( bi ) + Math.abs( dx ) + Math.abs( ex );

				// Interior rows (i=1..N-2):
				for ( i = 1; i < N - 1; i++ ) {
					id = offsetD + i * strideD;
					ie = offsetE + i * strideE;
					bi = B[ offsetB + i * strideB1 + j * strideB2 ];
					cx = e[ ie - strideE ] * X[ jx + ( i - 1 ) * strideX1 ];
					dx = d[ id ] * X[ jx + i * strideX1 ];
					ex = e[ ie ] * X[ jx + ( i + 1 ) * strideX1 ];
					WORK[ offsetWork + ( N + i ) * strideWork ] = bi - cx - dx - ex;
					WORK[ offsetWork + i * strideWork ] = Math.abs( bi ) + Math.abs( cx ) + Math.abs( dx ) + Math.abs( ex );
				}

				// Last row (i=N-1):
				bi = B[ offsetB + ( N - 1 ) * strideB1 + j * strideB2 ];
				cx = e[ offsetE + ( N - 2 ) * strideE ] * X[ jx + ( N - 2 ) * strideX1 ];
				dx = d[ offsetD + ( N - 1 ) * strideD ] * X[ jx + ( N - 1 ) * strideX1 ];
				WORK[ offsetWork + ( N + N - 1 ) * strideWork ] = bi - cx - dx;
				WORK[ offsetWork + ( N - 1 ) * strideWork ] = Math.abs( bi ) + Math.abs( cx ) + Math.abs( dx );
			}

			// Compute componentwise relative backward error:
			// BERR(j) = max_i |R(i)| / (|A|*|X|+|B|)(i)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				iw = offsetWork + i * strideWork;
				iwr = offsetWork + ( N + i ) * strideWork;
				if ( WORK[ iw ] > SAFE2 ) {
					s = Math.max( s, Math.abs( WORK[ iwr ] ) / WORK[ iw ] );
				} else {
					s = Math.max( s, ( Math.abs( WORK[ iwr ] ) + SAFE1 ) / ( WORK[ iw ] + SAFE1 ) );
				}
			}
			BERR[ jb ] = s;

			// Test stopping criterion:

			// Continue if BERR > eps, BERR decreased by factor 2, and count <= ITMAX
			if ( BERR[ jb ] > EPS && 2.0 * BERR[ jb ] <= lstres && count <= ITMAX ) {
				// Solve with factored system to get correction:
				// Dpttrs expects column-major 2D for the RHS. We pass a single
				// Column of WORK (the residual part) with stride=strideWork, column stride irrelevant for nrhs=1.
				dpttrs( N, 1, DF, strideDF, offsetDF, EF, strideEF, offsetEF, WORK, strideWork, 1, offsetWork + N * strideWork );

				// X(:,j) += correction
				daxpy( N, 1.0, WORK, strideWork, offsetWork + N * strideWork, X, strideX1, jx );

				lstres = BERR[ jb ];
				count += 1;
				continue;
			}
			break;
		}

		// Compute forward error bound:
		// Prepare WORK[0..N-1] = |R(i)| + NZ*EPS*(|A|*|X|+|B|)(i) [+ SAFE1 if small]
		for ( i = 0; i < N; i++ ) {
			iw = offsetWork + i * strideWork;
			iwr = offsetWork + ( N + i ) * strideWork;
			if ( WORK[ iw ] > SAFE2 ) {
				WORK[ iw ] = Math.abs( WORK[ iwr ] ) + 4.0 * EPS * WORK[ iw ];
			} else {
				WORK[ iw ] = Math.abs( WORK[ iwr ] ) + 4.0 * EPS * WORK[ iw ] + SAFE1;
			}
		}
		ix = idamax( N, WORK, strideWork, offsetWork );
		FERR[ jf ] = WORK[ offsetWork + ix * strideWork ];

		// Estimate norm(inv(A)):

		// Solve M(L) * x = e, where e = [1,1,...,1]^T
		WORK[ offsetWork ] = 1.0;
		for ( i = 1; i < N; i++ ) {
			ief = offsetEF + ( i - 1 ) * strideEF;
			WORK[ offsetWork + i * strideWork ] = 1.0 + WORK[ offsetWork + ( i - 1 ) * strideWork ] * Math.abs( EF[ ief ] );
		}

		// Solve D * M(L)^T * x = b:
		idf = offsetDF + ( N - 1 ) * strideDF;
		WORK[ offsetWork + ( N - 1 ) * strideWork ] = WORK[ offsetWork + ( N - 1 ) * strideWork ] / DF[ idf ];
		for ( i = N - 2; i >= 0; i-- ) {
			idf = offsetDF + i * strideDF;
			ief = offsetEF + i * strideEF;
			WORK[ offsetWork + i * strideWork ] = WORK[ offsetWork + i * strideWork ] / DF[ idf ] + WORK[ offsetWork + ( i + 1 ) * strideWork ] * Math.abs( EF[ ief ] );
		}

		// norm(inv(A)) = max(x(i))
		ix = idamax( N, WORK, strideWork, offsetWork );
		FERR[ jf ] = FERR[ jf ] * Math.abs( WORK[ offsetWork + ix * strideWork ] );

		// Normalize error by norm(X(:,j)):
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			lstres = Math.max( lstres, Math.abs( X[ jx + i * strideX1 ] ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ jf ] = FERR[ jf ] / lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default dptrfs;
