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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlangb from '../../zlangb/lib/base.js';
import zlantb from '../../zlantb/lib/base.js';
import zlaqgb from '../../zlaqgb/lib/base.js';
import zgbequ from '../../zgbequ/lib/base.js';
import zgbcon from '../../zgbcon/lib/base.js';
import zgbrfs from '../../zgbrfs/lib/base.js';
import zgbtrf from '../../zgbtrf/lib/base.js';
import zgbtrs from '../../zgbtrs/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var EPS = dlamch( 'epsilon' );


// MAIN //

/**
* Expert driver for solving a complex system of linear equations A*X = B.
* where A is a general band matrix with KL subdiagonals and KU superdiagonals.
*
* Provides equilibration (zgbequ/zlaqgb), LU factorization (zgbtrf),
* condition estimation (zgbcon), solution (zgbtrs), iterative refinement
* and error bounds (zgbrfs).
*
* FACT controls whether to factor, equilibrate+factor, or use pre-factored:
*   'not-factored' - factor A, no equilibration
*   'equilibrate'  - equilibrate if needed, then factor
*   'factored'     - use pre-factored AFB and IPIV (and pre-computed R,C if equilibrated)
*
* TRANS specifies the system:
*   'no-transpose'         - A _ X = B
_   'transpose'            - A^T _ X = B
*   'conjugate-transpose'  - A^H * X = B
*
* EQUED (input if FACT='factored', output otherwise):
*   'none'   - no equilibration
*   'row'    - row equilibration (A premultiplied by diag(R))
*   'column' - column equilibration (A postmultiplied by diag(C))
*   'both'   - both row and column equilibration
*
* Returns { info, equed, rcond, rpvgrw } where:
*   info: 0=success, i (1-based)=U(i,i) is zero, N+1=singular to working precision
*   equed: equilibration type applied
*   rcond: reciprocal condition number estimate
*   rpvgrw: reciprocal pivot growth factor
*
* @private
* @param {string} fact - 'not-factored', 'equilibrate', or 'factored'
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - band matrix in band storage ((KL+KU+1) x N)
* @param {integer} strideAB1 - stride of first dimension of AB (complex elements)
* @param {integer} strideAB2 - stride of second dimension of AB (complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for AB (complex elements)
* @param {Complex128Array} AFB - factored band matrix ((2*KL+KU+1) x N, output)
* @param {integer} strideAFB1 - stride of first dimension of AFB (complex elements)
* @param {integer} strideAFB2 - stride of second dimension of AFB (complex elements)
* @param {NonNegativeInteger} offsetAFB - index offset for AFB (complex elements)
* @param {Int32Array} IPIV - pivot indices (0-based, output)
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {string} equed - equilibration type (input if FACT='factored')
* @param {Float64Array} r - row scale factors
* @param {integer} strideR - stride for r
* @param {NonNegativeInteger} offsetR - index offset for r
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - index offset for c
* @param {Complex128Array} B - N-by-NRHS right-hand side (may be scaled on exit)
* @param {integer} strideB1 - stride of first dimension of B (complex elements)
* @param {integer} strideB2 - stride of second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (complex elements)
* @param {Complex128Array} X - N-by-NRHS solution matrix (output)
* @param {integer} strideX1 - stride of first dimension of X (complex elements)
* @param {integer} strideX2 - stride of second dimension of X (complex elements)
* @param {NonNegativeInteger} offsetX - index offset for X (complex elements)
* @param {Float64Array} FERR - forward error bounds (output, length nrhs)
* @param {integer} strideFERR - stride for FERR
* @param {NonNegativeInteger} offsetFERR - index offset for FERR
* @param {Float64Array} BERR - backward error bounds (output, length nrhs)
* @param {integer} strideBERR - stride for BERR
* @param {NonNegativeInteger} offsetBERR - index offset for BERR
* @param {Complex128Array} WORK - complex workspace (length >= 2*N)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - index offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace (length >= N)
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - index offset for RWORK
* @returns {Object} result with info, equed, rcond, rpvgrw
*/
function zgbsvx( fact, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, equed, r, strideR, offsetR, c, strideC, offsetC, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	var rpvgrw;
	var rowequ;
	var colequ;
	var nofact;
	var notran;
	var colcnd;
	var rowcnd;
	var equil;
	var rcond;
	var anorm;
	var RCOND;
	var norm;
	var info;
	var sb1;
	var sb2;
	var sx1;
	var sx2;
	var Bv;
	var Xv;
	var oB;
	var oX;
	var ri;
	var ci;
	var ia;
	var eq;
	var j1;
	var j2;
	var i;
	var j;

	nofact = ( fact === 'not-factored' );
	equil = ( fact === 'equilibrate' );
	notran = ( trans === 'no-transpose' );

	if ( nofact || equil ) {
		equed = 'none';
		rowequ = false;
		colequ = false;
	} else {
		rowequ = ( equed === 'row' || equed === 'both' );
		colequ = ( equed === 'column' || equed === 'both' );
	}

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return {
			'info': 0,
			'equed': equed,
			'rcond': 1.0,
			'rpvgrw': 1.0
		};
	}

	// Equilibrate if requested
	if ( equil ) {
		eq = zgbequ( N, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC );
		rowcnd = eq.rowcnd;
		colcnd = eq.colcnd;

		if ( eq.info === 0 ) {
			// Equilibrate the matrix
			equed = zlaqgb( N, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, eq.amax );
			rowequ = ( equed === 'row' || equed === 'both' );
			colequ = ( equed === 'column' || equed === 'both' );
		}
	}

	// Get Float64 views for element-level scaling
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oB = offsetB * 2;
	oX = offsetX * 2;

	// Scale the right-hand side
	if ( notran ) {
		if ( rowequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < N; i++ ) {
					ri = r[ offsetR + ( i * strideR ) ];
					ia = oB + ( i * sb1 ) + ( j * sb2 );
					Bv[ ia ] = ri * Bv[ ia ];         // real part
					Bv[ ia + 1 ] = ri * Bv[ ia + 1 ]; // imag part
				}
			}
		}
	} else if ( colequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				ci = c[ offsetC + ( i * strideC ) ];
				ia = oB + ( i * sb1 ) + ( j * sb2 );
				Bv[ ia ] = ci * Bv[ ia ];         // real part
				Bv[ ia + 1 ] = ci * Bv[ ia + 1 ]; // imag part
			}
		}
	}

	if ( nofact || equil ) {
		// Copy AB to AFB: for each column j, copy the band entries
		// Fortran: DO 70 J = 1, N; J1 = MAX(J-KU, 1); J2 = MIN(J+KL, N)
		//   CALL ZCOPY(J2-J1+1, AB(KU+1-J+J1, J), 1, AFB(KL+KU+1-J+J1, J), 1)
		for ( j = 0; j < N; j++ ) {
			j1 = ( j - ku > 0 ) ? j - ku : 0;         // 0-based MAX(J-KU, 1)-1
			j2 = ( j + kl < N - 1 ) ? j + kl : N - 1; // 0-based MIN(J+KL, N)-1
			zcopy(j2 - j1 + 1, AB, strideAB1, offsetAB + ( ( ku - j + j1 ) * strideAB1 ) + ( j * strideAB2 ), AFB, strideAFB1, offsetAFB + ( ( kl + ku - j + j1 ) * strideAFB1 ) + ( j * strideAFB2 ));
		}

		// Compute the LU factorization
		info = zgbtrf( N, N, kl, ku, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV );

		if ( info > 0 ) {
			// Compute the reciprocal pivot growth factor of leading rank-deficient columns
			// Fortran computes max abs element over first INFO columns of AB
			anorm = computeSingularAnorm( AB, strideAB1, strideAB2, offsetAB, N, kl, ku, info );

			rpvgrw = zlantb( 'max', 'upper', 'non-unit', info, Math.min( info - 1, kl + ku ), AFB, strideAFB1, strideAFB2, offsetAFB + ( Math.max( 0, kl + ku + 1 - info ) * strideAFB1 ), RWORK, strideRWork, offsetRWork );
			if ( rpvgrw === 0.0 ) {
				rpvgrw = 1.0;
			} else {
				rpvgrw = anorm / rpvgrw;
			}
			RWORK[ offsetRWork ] = rpvgrw;
			return {
				'info': info,
				'equed': equed,
				'rcond': 0.0,
				'rpvgrw': rpvgrw
			};
		}
	}

	// Compute the norm of A and the reciprocal pivot growth factor
	if ( notran ) {
		norm = 'one-norm';
	} else {
		norm = 'inf-norm';
	}
	anorm = zlangb( norm, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, offsetRWork );
	rpvgrw = zlantb( 'max', 'upper', 'non-unit', N, kl + ku, AFB, strideAFB1, strideAFB2, offsetAFB, RWORK, strideRWork, offsetRWork );
	if ( rpvgrw === 0.0 ) {
		rpvgrw = 1.0;
	} else {
		rpvgrw = zlangb( 'max', N, kl, ku, AB, strideAB1, strideAB2, offsetAB, RWORK, strideRWork, offsetRWork ) / rpvgrw;
	}

	// Compute the reciprocal of the condition number
	RCOND = new Float64Array( 1 );
	zgbcon( norm, N, kl, ku, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, anorm, RCOND, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
	rcond = RCOND[ 0 ];

	// Compute the solution matrix X
	zlacpy( 'full', N, nrhs, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX );
	zgbtrs( trans, N, kl, ku, nrhs, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, X, strideX1, strideX2, offsetX );

	// Use iterative refinement to improve the solution
	zgbrfs( trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB, X, strideX1, strideX2, offsetX, FERR, strideFERR, offsetFERR, BERR, strideBERR, offsetBERR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );

	// Transform the solution matrix X to a solution of the original system
	if ( notran ) {
		if ( colequ ) {
			for ( j = 0; j < nrhs; j++ ) {
				for ( i = 0; i < N; i++ ) {
					ci = c[ offsetC + ( i * strideC ) ];
					ia = oX + ( i * sx1 ) + ( j * sx2 );
					Xv[ ia ] = ci * Xv[ ia ];         // real part
					Xv[ ia + 1 ] = ci * Xv[ ia + 1 ]; // imag part
				}
			}
			for ( j = 0; j < nrhs; j++ ) {
				FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / colcnd;
			}
		}
	} else if ( rowequ ) {
		for ( j = 0; j < nrhs; j++ ) {
			for ( i = 0; i < N; i++ ) {
				ri = r[ offsetR + ( i * strideR ) ];
				ia = oX + ( i * sx1 ) + ( j * sx2 );
				Xv[ ia ] = ri * Xv[ ia ];         // real part
				Xv[ ia + 1 ] = ri * Xv[ ia + 1 ]; // imag part
			}
		}
		for ( j = 0; j < nrhs; j++ ) {
			FERR[ offsetFERR + ( j * strideFERR ) ] = FERR[ offsetFERR + ( j * strideFERR ) ] / rowcnd;
		}
	}

	// Set INFO = N+1 if the matrix is singular to working precision
	info = 0;
	if ( rcond < EPS ) {
		info = N + 1;
	}

	RWORK[ offsetRWork ] = rpvgrw;
	return {
		'info': info,
		'equed': equed,
		'rcond': rcond,
		'rpvgrw': rpvgrw
	};
}

/**
* Computes max abs element over the first `ncols` columns of band matrix AB.
*
* Fortran: DO 90 J = 1, INFO; DO 80 I = MAX(KU+2-J,1), MIN(N+KU+1-J, KL+KU+1)
*   ANORM = MAX(ANORM, ABS(AB(I,J)))
*
* @private
* @param {Complex128Array} AB - band matrix
* @param {integer} strideAB1 - first dim stride (complex)
* @param {integer} strideAB2 - second dim stride (complex)
* @param {NonNegativeInteger} offsetAB - offset (complex)
* @param {NonNegativeInteger} N - matrix order
* @param {NonNegativeInteger} kl - subdiagonals
* @param {NonNegativeInteger} ku - superdiagonals
* @param {NonNegativeInteger} ncols - number of columns to scan
* @returns {number} max abs element
*/
function computeSingularAnorm( AB, strideAB1, strideAB2, offsetAB, N, kl, ku, ncols ) {
	var anorm = 0.0;
	var temp;
	var ABv = reinterpret( AB, 0 );
	var sa1 = strideAB1 * 2;
	var sa2 = strideAB2 * 2;
	var oAB = offsetAB * 2;
	var ai;
	var lo;
	var hi;
	var i;
	var j;

	for ( j = 0; j < ncols; j++ ) {
		// Fortran 1-based: I from MAX(KU+2-J,1) to MIN(N+KU+1-J, KL+KU+1)
		// 0-based: i from max(ku+1-j, 1)-1 to min(N+ku-j, kl+ku+1)-1
		lo = ( ( ku + 1 - j > 1 ) ? ku + 1 - j : 1 ) - 1;
		hi = ( ( N + ku - j < kl + ku + 1 ) ? N + ku - j : kl + ku + 1 );
		for ( i = lo; i < hi; i++ ) {
			ai = oAB + ( i * sa1 ) + ( j * sa2 );
			temp = cmplx.absAt( ABv, ai );
			if ( temp > anorm || temp !== temp ) {
				anorm = temp;
			}
		}
	}
	return anorm;
}


// EXPORTS //

export default zgbsvx;
