/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from './../../dlamch/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zpttrs from './../../zpttrs/lib/base.js';


// VARIABLES //

var ITMAX = 5;
var ONE = new Complex128( 1.0, 0.0 );
var EPS = dlamch( 'epsilon' );
var SAFMIN = dlamch( 'safe-minimum' );
var SAFE1 = 4.0 * SAFMIN;          // NZ = 4 (max nonzeros per row + 1)
var SAFE2 = SAFE1 / EPS;


// MAIN //

/**
* Improves the computed solution to a complex Hermitian positive definite.
* tridiagonal system A*X = B, and provides error bounds and backward
* error estimates for the solution.
*
* ## Notes
*
* -   D, DF, FERR, BERR, RWORK are real (Float64Array). Strides/offsets are in real elements.
* -   E, EF, B, X, WORK are complex (Complex128Array). Strides/offsets are in complex elements.
* -   UPLO = 'U': E stores the superdiagonal of A, so A(i,i+1)=E(i), A(i+1,i)=conj(E(i)).
*     UPLO = 'L': E stores the subdiagonal of A, so A(i+1,i)=E(i), A(i,i+1)=conj(E(i)).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`: which triangle of A is stored in E
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Float64Array} d - original diagonal elements of A (real), length N
* @param {integer} strideD - stride for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - original off-diagonal elements of A (complex), length N-1
* @param {integer} strideE - stride for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Float64Array} DF - factored diagonal from zpttrf (real), length N
* @param {integer} strideDF - stride for `DF`
* @param {NonNegativeInteger} offsetDF - starting index for `DF`
* @param {Complex128Array} EF - factored off-diagonal from zpttrf (complex), length N-1
* @param {integer} strideEF - stride for `EF` (in complex elements)
* @param {NonNegativeInteger} offsetEF - starting index for `EF` (in complex elements)
* @param {Complex128Array} B - right hand side matrix (N x NRHS), complex
* @param {integer} strideB1 - row stride of `B` (in complex elements)
* @param {integer} strideB2 - column stride of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {Complex128Array} X - solution matrix (N x NRHS), refined in-place, complex
* @param {integer} strideX1 - row stride of `X` (in complex elements)
* @param {integer} strideX2 - column stride of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @param {Float64Array} FERR - forward error bound for each RHS (real), length NRHS
* @param {integer} strideFERR - stride for `FERR`
* @param {NonNegativeInteger} offsetFERR - starting index for `FERR`
* @param {Float64Array} BERR - backward error for each RHS (real), length NRHS
* @param {integer} strideBERR - stride for `BERR`
* @param {NonNegativeInteger} offsetBERR - starting index for `BERR`
* @param {Complex128Array} WORK - complex workspace, length N
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace, length N
* @param {integer} strideRWork - stride for `RWORK`
* @param {NonNegativeInteger} offsetRWork - starting index for `RWORK`
* @returns {integer} info - 0 on success
*/
function zptrfs( uplo, N, nrhs, d, strideD, offsetD, e, strideE, offsetE, DF, strideDF, offsetDF, EF, strideEF, offsetEF, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) { // eslint-disable-line max-len, max-params
	var lstres;
	var upper;
	var count;
	var wv;
	var ev;
	var bv;
	var xv;
	var efv;
	var sw;
	var se;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var sef;
	var iw;
	var ie;
	var ix;
	var ief;
	var jf;
	var jb;
	var jx;
	var jb2;
	var ir;
	var bi_r;
	var bi_i;
	var dx_r;
	var dx_i;
	var ex_r;
	var ex_i;
	var cx_r;
	var cx_i;
	var er;
	var ei;
	var xr;
	var xi;
	var s;
	var v;
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

	upper = ( uplo === 'upper' );

	// Get Float64 views of complex arrays:
	ev = reinterpret( e, 0 );
	bv = reinterpret( B, 0 );
	xv = reinterpret( X, 0 );
	wv = reinterpret( WORK, 0 );
	efv = reinterpret( EF, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	se = strideE * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sw = strideWork * 2;
	sef = strideEF * 2;

	// Do for each right hand side...
	for ( j = 0; j < nrhs; j++ ) {
		jf = offsetFERR + j * strideFERR;
		jb = offsetBERR + j * strideBERR;
		jx = offsetX * 2 + j * sx2;        // Float64 index into xv for column j
		jb2 = offsetB * 2 + j * sb2;       // Float64 index into bv for column j

		count = 1;
		lstres = 3.0;

		// Iterative refinement loop:
		while ( true ) { // eslint-disable-line no-constant-condition
			// Compute residual R = B - A*X, stored in WORK (complex)
			// And |A|*|X| + |B|, stored in RWORK (real)
			ie = offsetE * 2;  // Float64 index into ev

			if ( upper ) {
				if ( N === 1 ) {
					// Bi = B(1,j)
					bi_r = bv[ jb2 ];
					bi_i = bv[ jb2 + 1 ];

					// Dx = D(1)*X(1,j) (real * complex)
					dx_r = d[ offsetD ] * xv[ jx ];
					dx_i = d[ offsetD ] * xv[ jx + 1 ];

					// WORK(1) = bi - dx
					wv[ offsetWork * 2 ] = bi_r - dx_r;
					wv[ offsetWork * 2 + 1 ] = bi_i - dx_i;

					// RWORK(1) = CABS1(bi) + CABS1(dx)
					RWORK[ offsetRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) );
				} else {
					// First row (i=0): A(0,0)*X(0) + E(0)*X(1)
					bi_r = bv[ jb2 ];
					bi_i = bv[ jb2 + 1 ];
					dx_r = d[ offsetD ] * xv[ jx ];
					dx_i = d[ offsetD ] * xv[ jx + 1 ];

					// Ex = E(0)*X(1) (complex * complex)
					er = ev[ ie ];
					ei = ev[ ie + 1 ];
					xr = xv[ jx + sx1 ];
					xi = xv[ jx + sx1 + 1 ];
					ex_r = er * xr - ei * xi;
					ex_i = er * xi + ei * xr;
					wv[ offsetWork * 2 ] = bi_r - dx_r - ex_r;
					wv[ offsetWork * 2 + 1 ] = bi_i - dx_i - ex_i;

					// RWORK(0) = CABS1(bi) + CABS1(dx) + CABS1(E(0))*CABS1(X(1))
					RWORK[ offsetRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) ) + ( Math.abs( er ) + Math.abs( ei ) ) * ( Math.abs( xr ) + Math.abs( xi ) );

					// Interior rows (i=1..N-2): conj(E(i-1))*X(i-1) + D(i)*X(i) + E(i)*X(i+1)
					for ( i = 1; i < N - 1; i++ ) {
						bi_r = bv[ jb2 + i * sb1 ];
						bi_i = bv[ jb2 + i * sb1 + 1 ];

						// Cx = conj(E(i-1))*X(i-1)
						er = ev[ ie + ( i - 1 ) * se ];
						ei = ev[ ie + ( i - 1 ) * se + 1 ];
						xr = xv[ jx + ( i - 1 ) * sx1 ];
						xi = xv[ jx + ( i - 1 ) * sx1 + 1 ];

						// conj(e) * x = (er - ei*i) * (xr + xi*i) = (er*xr + ei*xi) + (er*xi - ei*xr)*i
						cx_r = er * xr + ei * xi;
						cx_i = er * xi - ei * xr;

						// Dx = D(i)*X(i)
						dx_r = d[ offsetD + i * strideD ] * xv[ jx + i * sx1 ];
						dx_i = d[ offsetD + i * strideD ] * xv[ jx + i * sx1 + 1 ];

						// Ex = E(i)*X(i+1)
						er = ev[ ie + i * se ];
						ei = ev[ ie + i * se + 1 ];
						xr = xv[ jx + ( i + 1 ) * sx1 ];
						xi = xv[ jx + ( i + 1 ) * sx1 + 1 ];
						ex_r = er * xr - ei * xi;
						ex_i = er * xi + ei * xr;

						wv[ offsetWork * 2 + i * sw ] = bi_r - cx_r - dx_r - ex_r;
						wv[ offsetWork * 2 + i * sw + 1 ] = bi_i - cx_i - dx_i - ex_i;

						// For RWORK, use CABS1 of E * CABS1 of X (not CABS1 of the product)
						er = ev[ ie + ( i - 1 ) * se ];
						ei = ev[ ie + ( i - 1 ) * se + 1 ];
						xr = xv[ jx + ( i - 1 ) * sx1 ];
						xi = xv[ jx + ( i - 1 ) * sx1 + 1 ];
						RWORK[ offsetRWork + i * strideRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( er ) + Math.abs( ei ) ) * ( Math.abs( xr ) + Math.abs( xi ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) ) + ( Math.abs( ev[ ie + i * se ] ) + Math.abs( ev[ ie + i * se + 1 ] ) ) * ( Math.abs( xv[ jx + ( i + 1 ) * sx1 ] ) + Math.abs( xv[ jx + ( i + 1 ) * sx1 + 1 ] ) );
					}

					// Last row (i=N-1): conj(E(N-2))*X(N-2) + D(N-1)*X(N-1)
					bi_r = bv[ jb2 + ( N - 1 ) * sb1 ];
					bi_i = bv[ jb2 + ( N - 1 ) * sb1 + 1 ];

					er = ev[ ie + ( N - 2 ) * se ];
					ei = ev[ ie + ( N - 2 ) * se + 1 ];
					xr = xv[ jx + ( N - 2 ) * sx1 ];
					xi = xv[ jx + ( N - 2 ) * sx1 + 1 ];
					cx_r = er * xr + ei * xi;
					cx_i = er * xi - ei * xr;

					dx_r = d[ offsetD + ( N - 1 ) * strideD ] * xv[ jx + ( N - 1 ) * sx1 ];
					dx_i = d[ offsetD + ( N - 1 ) * strideD ] * xv[ jx + ( N - 1 ) * sx1 + 1 ];

					wv[ offsetWork * 2 + ( N - 1 ) * sw ] = bi_r - cx_r - dx_r;
					wv[ offsetWork * 2 + ( N - 1 ) * sw + 1 ] = bi_i - cx_i - dx_i;

					RWORK[ offsetRWork + ( N - 1 ) * strideRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( er ) + Math.abs( ei ) ) * ( Math.abs( xr ) + Math.abs( xi ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) );
				}
			} else {
				// UPLO = 'L': E stores subdiagonal
				// A(i,i+1) = conj(E(i)), A(i+1,i) = E(i)
				if ( N === 1 ) {
					bi_r = bv[ jb2 ];
					bi_i = bv[ jb2 + 1 ];
					dx_r = d[ offsetD ] * xv[ jx ];
					dx_i = d[ offsetD ] * xv[ jx + 1 ];
					wv[ offsetWork * 2 ] = bi_r - dx_r;
					wv[ offsetWork * 2 + 1 ] = bi_i - dx_i;
					RWORK[ offsetRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) );
				} else {
					// First row (i=0): D(0)*X(0) + conj(E(0))*X(1)
					bi_r = bv[ jb2 ];
					bi_i = bv[ jb2 + 1 ];
					dx_r = d[ offsetD ] * xv[ jx ];
					dx_i = d[ offsetD ] * xv[ jx + 1 ];

					// Ex = conj(E(0))*X(1)
					er = ev[ ie ];
					ei = ev[ ie + 1 ];
					xr = xv[ jx + sx1 ];
					xi = xv[ jx + sx1 + 1 ];
					ex_r = er * xr + ei * xi;
					ex_i = er * xi - ei * xr;
					wv[ offsetWork * 2 ] = bi_r - dx_r - ex_r;
					wv[ offsetWork * 2 + 1 ] = bi_i - dx_i - ex_i;
					RWORK[ offsetRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) ) + ( Math.abs( er ) + Math.abs( ei ) ) * ( Math.abs( xr ) + Math.abs( xi ) );

					// Interior rows (i=1..N-2): E(i-1)*X(i-1) + D(i)*X(i) + conj(E(i))*X(i+1)
					for ( i = 1; i < N - 1; i++ ) {
						bi_r = bv[ jb2 + i * sb1 ];
						bi_i = bv[ jb2 + i * sb1 + 1 ];

						// Cx = E(i-1)*X(i-1)
						er = ev[ ie + ( i - 1 ) * se ];
						ei = ev[ ie + ( i - 1 ) * se + 1 ];
						xr = xv[ jx + ( i - 1 ) * sx1 ];
						xi = xv[ jx + ( i - 1 ) * sx1 + 1 ];
						cx_r = er * xr - ei * xi;
						cx_i = er * xi + ei * xr;

						// Dx = D(i)*X(i)
						dx_r = d[ offsetD + i * strideD ] * xv[ jx + i * sx1 ];
						dx_i = d[ offsetD + i * strideD ] * xv[ jx + i * sx1 + 1 ];

						// Ex = conj(E(i))*X(i+1)
						er = ev[ ie + i * se ];
						ei = ev[ ie + i * se + 1 ];
						xr = xv[ jx + ( i + 1 ) * sx1 ];
						xi = xv[ jx + ( i + 1 ) * sx1 + 1 ];
						ex_r = er * xr + ei * xi;
						ex_i = er * xi - ei * xr;

						wv[ offsetWork * 2 + i * sw ] = bi_r - cx_r - dx_r - ex_r;
						wv[ offsetWork * 2 + i * sw + 1 ] = bi_i - cx_i - dx_i - ex_i;

						er = ev[ ie + ( i - 1 ) * se ];
						ei = ev[ ie + ( i - 1 ) * se + 1 ];
						xr = xv[ jx + ( i - 1 ) * sx1 ];
						xi = xv[ jx + ( i - 1 ) * sx1 + 1 ];
						RWORK[ offsetRWork + i * strideRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( er ) + Math.abs( ei ) ) * ( Math.abs( xr ) + Math.abs( xi ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) ) + ( Math.abs( ev[ ie + i * se ] ) + Math.abs( ev[ ie + i * se + 1 ] ) ) * ( Math.abs( xv[ jx + ( i + 1 ) * sx1 ] ) + Math.abs( xv[ jx + ( i + 1 ) * sx1 + 1 ] ) );
					}

					// Last row (i=N-1): E(N-2)*X(N-2) + D(N-1)*X(N-1)
					bi_r = bv[ jb2 + ( N - 1 ) * sb1 ];
					bi_i = bv[ jb2 + ( N - 1 ) * sb1 + 1 ];

					er = ev[ ie + ( N - 2 ) * se ];
					ei = ev[ ie + ( N - 2 ) * se + 1 ];
					xr = xv[ jx + ( N - 2 ) * sx1 ];
					xi = xv[ jx + ( N - 2 ) * sx1 + 1 ];
					cx_r = er * xr - ei * xi;
					cx_i = er * xi + ei * xr;

					dx_r = d[ offsetD + ( N - 1 ) * strideD ] * xv[ jx + ( N - 1 ) * sx1 ];
					dx_i = d[ offsetD + ( N - 1 ) * strideD ] * xv[ jx + ( N - 1 ) * sx1 + 1 ];

					wv[ offsetWork * 2 + ( N - 1 ) * sw ] = bi_r - cx_r - dx_r;
					wv[ offsetWork * 2 + ( N - 1 ) * sw + 1 ] = bi_i - cx_i - dx_i;

					RWORK[ offsetRWork + ( N - 1 ) * strideRWork ] = ( Math.abs( bi_r ) + Math.abs( bi_i ) ) + ( Math.abs( er ) + Math.abs( ei ) ) * ( Math.abs( xr ) + Math.abs( xi ) ) + ( Math.abs( dx_r ) + Math.abs( dx_i ) );
				}
			}

			// Compute componentwise relative backward error:
			// BERR(j) = max_i CABS1(R(i)) / (|A|*|X|+|B|)(i)
			s = 0.0;
			for ( i = 0; i < N; i++ ) {
				ir = offsetRWork + i * strideRWork;
				iw = offsetWork * 2 + i * sw;
				v = Math.abs( wv[ iw ] ) + Math.abs( wv[ iw + 1 ] ); // CABS1(WORK(i))
				if ( RWORK[ ir ] > SAFE2 ) {
					s = Math.max( s, v / RWORK[ ir ] );
				} else {
					s = Math.max( s, ( v + SAFE1 ) / ( RWORK[ ir ] + SAFE1 ) );
				}
			}
			BERR[ jb ] = s;

			// Test stopping criterion:
			if ( BERR[ jb ] > EPS && 2.0 * BERR[ jb ] <= lstres && count <= ITMAX ) {
				// Solve with factored system to get correction:
				// Zpttrs expects complex-element strides. WORK has stride=strideWork,
				// And we pass nrhs=1 column starting at offsetWork.
				zpttrs( uplo, N, 1, DF, strideDF, offsetDF, EF, strideEF, offsetEF, WORK, strideWork, 1, offsetWork );

				// X(:,j) += WORK (correction)

				// Zaxpy expects complex-element strides/offsets
				zaxpy( N, ONE, WORK, strideWork, offsetWork, X, strideX1, offsetX + j * strideX2 );

				lstres = BERR[ jb ];
				count += 1;
				continue;
			}
			break;
		}

		// Compute forward error bound:
		// RWORK(i) = CABS1(WORK(i)) + NZ*EPS*RWORK(i) [+ SAFE1 if small]
		for ( i = 0; i < N; i++ ) {
			ir = offsetRWork + i * strideRWork;
			iw = offsetWork * 2 + i * sw;
			v = Math.abs( wv[ iw ] ) + Math.abs( wv[ iw + 1 ] ); // CABS1(WORK(i))
			if ( RWORK[ ir ] > SAFE2 ) {
				RWORK[ ir ] = v + 4.0 * EPS * RWORK[ ir ];
			} else {
				RWORK[ ir ] = v + 4.0 * EPS * RWORK[ ir ] + SAFE1;
			}
		}
		ix = idamax( N, RWORK, strideRWork, offsetRWork );
		FERR[ jf ] = RWORK[ offsetRWork + ix * strideRWork ];

		// Estimate norm(inv(A)):

		// Solve M(L) * x = e, where e = [1,1,...,1]^T

		// EF contains complex values but we only use ABS(EF(i)) here
		RWORK[ offsetRWork ] = 1.0;
		for ( i = 1; i < N; i++ ) {
			ief = offsetEF * 2 + ( i - 1 ) * sef;
			RWORK[ offsetRWork + i * strideRWork ] = 1.0 + RWORK[ offsetRWork + ( i - 1 ) * strideRWork ] * Math.sqrt( efv[ ief ] * efv[ ief ] + efv[ ief + 1 ] * efv[ ief + 1 ] );
		}

		// Solve D * M(L)^T * x = b:
		RWORK[ offsetRWork + ( N - 1 ) * strideRWork ] = RWORK[ offsetRWork + ( N - 1 ) * strideRWork ] / DF[ offsetDF + ( N - 1 ) * strideDF ];
		for ( i = N - 2; i >= 0; i-- ) {
			ief = offsetEF * 2 + i * sef;
			RWORK[ offsetRWork + i * strideRWork ] = RWORK[ offsetRWork + i * strideRWork ] / DF[ offsetDF + i * strideDF ] + RWORK[ offsetRWork + ( i + 1 ) * strideRWork ] * Math.sqrt( efv[ ief ] * efv[ ief ] + efv[ ief + 1 ] * efv[ ief + 1 ] );
		}

		// norm(inv(A)) = max(x(i))
		ix = idamax( N, RWORK, strideRWork, offsetRWork );
		FERR[ jf ] = FERR[ jf ] * Math.abs( RWORK[ offsetRWork + ix * strideRWork ] );

		// Normalize error by norm(X(:,j)):

		// Fortran uses ABS(X(I,J)) = complex modulus sqrt(re^2 + im^2)
		lstres = 0.0;
		for ( i = 0; i < N; i++ ) {
			xr = xv[ jx + i * sx1 ];
			xi = xv[ jx + i * sx1 + 1 ];
			lstres = Math.max( lstres, Math.sqrt( xr * xr + xi * xi ) );
		}
		if ( lstres !== 0.0 ) {
			FERR[ jf ] = FERR[ jf ] / lstres;
		}
	}

	return 0;
}


// EXPORTS //

export default zptrfs;
