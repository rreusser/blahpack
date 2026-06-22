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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zcopy from '../../../../blas/base/zcopy/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';
import dzasum from '../../../../blas/base/dzasum/lib/base.js';
import zgecon from '../../zgecon/lib/base.js';
import zgesc2 from '../../zgesc2/lib/base.js';
import zlassq from '../../zlassq/lib/base.js';
import zlaswp from '../../zlaswp/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;


// MAIN //

/**
* Uses the LU factorization of the n-by-n matrix Z computed by zgetc2.
* and computes a contribution to the reciprocal Dif-estimate.
*
* The factorization of Z returned by zgetc2 has the form `Z = P*L*U*Q`,
* where P and Q are permutation matrices.
*
* When IJOB = 2, the routine uses the LU factorization and zgecon to
* estimate a lower bound on the reciprocal Dif.
*
* When IJOB != 2, a local look-ahead strategy is used to grow a
* solution vector that is large enough to make the reciprocal Dif small.
*
* IPIV and JPIV are 0-based pivot indices from zgetc2.
*
* @private
* @param {integer} ijob - method flag: 2 uses zgecon approximation; otherwise local look-ahead
* @param {NonNegativeInteger} N - order of the matrix Z
* @param {Complex128Array} Z - LU-factored N-by-N matrix from zgetc2
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
* @param {Complex128Array} RHS - right-hand side vector (overwritten with solution)
* @param {integer} strideRHS - stride for `RHS` (in complex elements)
* @param {NonNegativeInteger} offsetRHS - starting index for `RHS` (in complex elements)
* @param {number} rdsum - input sum of squares contribution
* @param {number} rdscal - input scaling factor
* @param {Int32Array} IPIV - row pivot indices from zgetc2, 0-based
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Int32Array} JPIV - column pivot indices from zgetc2, 0-based
* @param {integer} strideJPIV - stride for `JPIV`
* @param {NonNegativeInteger} offsetJPIV - starting index for `JPIV`
* @returns {Object} object with `rdsum` and `rdscal` properties
*/
function zlatdf( ijob, N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, rdsum, rdscal, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV ) {
	var MCONE;
	var rtemp;
	var scale;
	var rwork;
	var splus;
	var sminu;
	var rcond;
	var CONE;
	var work;
	var temp;
	var dotR;
	var res;
	var bpR;
	var bpI;
	var bmR;
	var bmI;
	var pmR;
	var pmI;
	var sZ1;
	var sZ2;
	var xm;
	var xp;
	var Zv;
	var Rv;
	var wv;
	var tR;
	var dR;
	var dI;
	var rR;
	var rI;
	var ix;
	var i;
	var j;
	var k;

	CONE = new Complex128( ONE, ZERO );
	MCONE = new Complex128( -ONE, ZERO );

	xp = new Complex128Array( N );
	xm = new Complex128Array( N );
	work = new Complex128Array( 4 * N );
	rwork = new Float64Array( 2 * N );
	rcond = new Float64Array( 1 );
	scale = new Float64Array( 1 );

	Zv = reinterpret( Z, 0 );
	Rv = reinterpret( RHS, 0 );
	sZ1 = strideZ1 * 2;
	sZ2 = strideZ2 * 2;

	if ( ijob === 2 ) {
		// IJOB = 2: Compute approximate nullvector XM of Z

		// CALL ZGECON( 'I', N, Z, LDZ, ONE, RTEMP, WORK, RWORK, INFO )
		zgecon( 'inf-norm', N, Z, strideZ1, strideZ2, offsetZ, ONE, rcond, work, 1, 0, rwork, 1, 0 );

		// Copy WORK(N:2N-1) to XM
		zcopy( N, work, 1, N, xm, 1, 0 );

		// Apply inverse permutations IPIV to XM (reverse direction)

		// Fortran: CALL ZLASWP( 1, XM, LDZ, 1, N-1, IPIV, -1 )

		// For incx=-1, swap k1/k2 so k1 > k2 (JS convention)
		zlaswp( 1, xm, 1, 1, 0, N - 2, 0, IPIV, strideIPIV, offsetIPIV, -1 );

		// TEMP = CONE / SQRT( ZDOTC(N, XM, 1, XM, 1) )
		temp = zdotc( N, xm, 1, 0, xm, 1, 0 );
		rR = real( temp );

		// ZDOTC(N, XM, 1, XM, 1) = sum conj(xm_i)*xm_i = sum |xm_i|^2,

		// Which is always real and non-negative. So sqrt is just real sqrt.
		dR = Math.sqrt( rR );

		// TEMP = CONE / SQRT(ZDOTC) = 1/dR.

		// Note: dR === 0 requires a zero nullvector from zgecon, which is unreachable

		// In practice (zgecon always produces a non-trivial estimate).
		if ( dR === ZERO ) {
			tR = ONE;
		} else {
			tR = ONE / dR;
		}

		temp = new Complex128( tR, ZERO );
		zscal( N, temp, xm, 1, 0 );

		// Copy XM to XP
		zcopy( N, xm, 1, 0, xp, 1, 0 );

		// XP = XP + RHS
		zaxpy( N, CONE, RHS, strideRHS, offsetRHS, xp, 1, 0 );

		// RHS = RHS - XM
		zaxpy( N, MCONE, xm, 1, 0, RHS, strideRHS, offsetRHS );

		// CALL ZGESC2( N, Z, LDZ, RHS, IPIV, JPIV, SCALE )
		zgesc2( N, Z, strideZ1, strideZ2, offsetZ, RHS, strideRHS, offsetRHS, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale );

		// CALL ZGESC2( N, Z, LDZ, XP, IPIV, JPIV, SCALE )
		zgesc2( N, Z, strideZ1, strideZ2, offsetZ, xp, 1, 0, IPIV, strideIPIV, offsetIPIV, JPIV, strideJPIV, offsetJPIV, scale );

		// If |XP|_1 > |RHS|_1, copy XP to RHS
		if ( dzasum( N, xp, 1, 0 ) > dzasum( N, RHS, strideRHS, offsetRHS ) ) {
			zcopy( N, xp, 1, 0, RHS, strideRHS, offsetRHS );
		}

		// Compute the sum of squares
		res = zlassq( N, RHS, strideRHS, offsetRHS, rdscal, rdsum );
		rdscal = res.scl;
		rdsum = res.sumsq;
	} else {
		// IJOB != 2: local look-ahead strategy

		// Apply permutations IPIV to RHS (forward: k1=0..N-2)
		// Fortran: CALL ZLASWP( 1, RHS, LDZ, 1, N-1, IPIV, 1 )
		// RHS is treated as a single-column matrix: strideA1=strideRHS, strideA2 irrelevant
		zlaswp( 1, RHS, strideRHS, strideRHS, offsetRHS, 0, N - 2, IPIV, strideIPIV, offsetIPIV, 1 );

		// Solve for L-part choosing RHS either to +1 or -1.
		pmR = -ONE;
		pmI = ZERO;

		for ( j = 0; j < N - 1; j++ ) {
			ix = ( offsetRHS + ( j * strideRHS ) ) * 2;

			// BP = RHS(J) + CONE
			bpR = Rv[ ix ] + ONE;
			bpI = Rv[ ix + 1 ];

			// BM = RHS(J) - CONE
			bmR = Rv[ ix ] - ONE;
			bmI = Rv[ ix + 1 ];

			splus = ONE;

			// SPLUS = SPLUS + DBLE( ZDOTC( N-J-1, Z(J+1,J), 1, Z(J+1,J), 1 ) )
			temp = zdotc( N - j - 1, Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ), Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ) );
			splus += real( temp );

			// SMINU = DBLE( ZDOTC( N-J-1, Z(J+1,J), 1, RHS(J+1), 1 ) )
			temp = zdotc( N - j - 1, Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ), RHS, strideRHS, offsetRHS + ( ( j + 1 ) * strideRHS ) );
			sminu = real( temp );

			// SPLUS = SPLUS * DBLE( RHS(J) )
			splus *= Rv[ ix ];

			if ( splus > sminu ) {
				Rv[ ix ] = bpR;
				Rv[ ix + 1 ] = bpI;
			} else if ( sminu > splus ) {
				Rv[ ix ] = bmR;
				Rv[ ix + 1 ] = bmI;
			} else {
				// Updating sums are equal; choose PMONE, then flip
				Rv[ ix ] += pmR;
				Rv[ ix + 1 ] += pmI;
				pmR = ONE;
				pmI = ZERO;
			}

			// Compute the remaining r.h.s.: TEMP = -RHS(J)
			temp = new Complex128( -Rv[ ix ], -Rv[ ix + 1 ] );
			zaxpy( N - j - 1, temp, Z, strideZ1, offsetZ + ( ( j + 1 ) * strideZ1 ) + ( j * strideZ2 ), RHS, strideRHS, offsetRHS + ( ( j + 1 ) * strideRHS ) );
		}

		// Solve for U-part, look-ahead for RHS(N-1) = +-1.
		// Copy RHS(0:N-2) to WORK(0:N-2), set WORK(N-1) = RHS(N-1) + 1, RHS(N-1) -= 1
		zcopy( N - 1, RHS, strideRHS, offsetRHS, work, 1, 0 );
		wv = reinterpret( work, 0 );

		ix = ( offsetRHS + ( ( N - 1 ) * strideRHS ) ) * 2;
		wv[ ( N - 1 ) * 2 ] = Rv[ ix ] + ONE;
		wv[ ( ( N - 1 ) * 2 ) + 1 ] = Rv[ ix + 1 ];
		Rv[ ix ] -= ONE;

		splus = ZERO;
		sminu = ZERO;

		for ( i = N - 1; i >= 0; i-- ) {
			// TEMP = CONE / Z(I,I) - complex division
			ix = ( offsetZ * 2 ) + ( i * sZ1 ) + ( i * sZ2 );
			dR = Zv[ ix ];
			dI = Zv[ ix + 1 ];

			// Compute 1/Z(I,I) = conj(Z(I,I)) / |Z(I,I)|^2
			rtemp = ( dR * dR ) + ( dI * dI );
			tR = dR / rtemp;
			rR = -dI / rtemp;

			// WORK(I) = WORK(I) * TEMP
			rI = wv[ i * 2 ];
			dR = wv[ ( i * 2 ) + 1 ];
			wv[ i * 2 ] = ( rI * tR ) - ( dR * rR );
			wv[ ( i * 2 ) + 1 ] = ( rI * rR ) + ( dR * tR );

			// RHS(I) = RHS(I) * TEMP
			ix = ( offsetRHS + ( i * strideRHS ) ) * 2;
			rI = Rv[ ix ];
			dR = Rv[ ix + 1 ];
			Rv[ ix ] = ( rI * tR ) - ( dR * rR );
			Rv[ ix + 1 ] = ( rI * rR ) + ( dR * tR );

			for ( k = i + 1; k < N; k++ ) {
				// Z(I,K) * TEMP
				dotR = ( offsetZ * 2 ) + ( i * sZ1 ) + ( k * sZ2 );
				dR = ( Zv[ dotR ] * tR ) - ( Zv[ dotR + 1 ] * rR );
				dI = ( Zv[ dotR ] * rR ) + ( Zv[ dotR + 1 ] * tR );

				// WORK(I) = WORK(I) - WORK(K) * (Z(I,K)*TEMP)
				wv[ i * 2 ] -= ( wv[ k * 2 ] * dR ) - ( wv[ ( k * 2 ) + 1 ] * dI );
				wv[ ( i * 2 ) + 1 ] -= ( wv[ k * 2 ] * dI ) + ( wv[ ( k * 2 ) + 1 ] * dR );

				// RHS(I) = RHS(I) - RHS(K) * (Z(I,K)*TEMP)
				ix = ( offsetRHS + ( i * strideRHS ) ) * 2;
				rI = ( offsetRHS + ( k * strideRHS ) ) * 2;
				Rv[ ix ] -= ( Rv[ rI ] * dR ) - ( Rv[ rI + 1 ] * dI );
				Rv[ ix + 1 ] -= ( Rv[ rI ] * dI ) + ( Rv[ rI + 1 ] * dR );
			}

			// SPLUS = SPLUS + ABS( WORK(I) ) - complex absolute value
			splus += cmplx.absAt( wv, i * 2 );

			// SMINU = SMINU + ABS( RHS(I) ) - complex absolute value
			sminu += cmplx.absAt( Rv, ( offsetRHS + ( i * strideRHS ) ) * 2 );
		}

		if ( splus > sminu ) {
			// Copy WORK to RHS
			zcopy( N, work, 1, 0, RHS, strideRHS, offsetRHS );
		}

		// Apply the permutations JPIV to the computed solution (RHS) in reverse
		// Fortran: CALL ZLASWP( 1, RHS, LDZ, 1, N-1, JPIV, -1 )
		// For incx=-1, swap k1/k2 so k1 > k2 (JS convention)
		zlaswp( 1, RHS, strideRHS, strideRHS, offsetRHS, N - 2, 0, JPIV, strideJPIV, offsetJPIV, -1 );

		// Compute the sum of squares
		res = zlassq( N, RHS, strideRHS, offsetRHS, rdscal, rdsum );
		rdscal = res.scl;
		rdsum = res.sumsq;
	}

	return {
		'rdsum': rdsum,
		'rdscal': rdscal
	};
}


// EXPORTS //

export default zlatdf;
