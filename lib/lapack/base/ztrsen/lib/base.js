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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlange from '../../zlange/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import ztrexc from '../../ztrexc/lib/base.js';
import ztrsyl from '../../ztrsyl/lib/base.js';
import zlacn2 from '../../zlacn2/lib/base.js';


// VARIABLES //

var ONE = 1.0;
var ZERO = 0.0;


// MAIN //

/**
* Reorders the Schur factorization of a complex matrix A = Q_T_Q**H so that a.
* selected cluster of eigenvalues appears in the leading positions on the
* diagonal of the upper triangular matrix T, and the leading columns of Q form
* an orthonormal basis of the corresponding right invariant subspace.
*
* Optionally computes the reciprocal condition numbers of the cluster of
* eigenvalues (S) and/or the invariant subspace (SEP).
*
* @private
* @param {string} job - `'none'`, `'eigenvalues'`, `'subspace'`, or `'both'`
* @param {string} compq - `'update'` or `'none'`
* @param {Uint8Array} SELECT - boolean array of length N
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - starting index for SELECT
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Complex128Array} T - N-by-N upper triangular matrix, modified in place
* @param {integer} strideT1 - stride of first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} Q - N-by-N unitary matrix, modified if compq=`'update'`
* @param {integer} strideQ1 - stride of first dimension of Q (in complex elements)
* @param {integer} strideQ2 - stride of second dimension of Q (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for Q (in complex elements)
* @param {Complex128Array} W - output: reordered eigenvalues
* @param {integer} strideW - stride for W (in complex elements)
* @param {NonNegativeInteger} offsetW - starting index for W (in complex elements)
* @param {Float64Array} M - output: M[0] = dimension of selected subspace
* @param {Float64Array} s - output: s[0] = reciprocal condition number for eigenvalues
* @param {Float64Array} sep - output: sep[0] = reciprocal condition for subspace
* @param {Complex128Array} WORK - workspace
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {integer} lwork - workspace length (in complex elements)
* @returns {integer} info (0 = success)
*/
function ztrsen( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, W, strideW, offsetW, M, s, sep, WORK, strideWork, offsetWork, lwork ) {
	var wantsp;
	var wantbh;
	var wants;
	var rnorm;
	var scale;
	var kase;
	var isave;
	var est;
	var rwork;
	var tv;
	var wv;
	var n1;
	var n2;
	var nn;
	var ks;
	var st1;
	var st2;
	var oT;
	var k;

	wantbh = ( job === 'both' );
	wants = ( job === 'eigenvalues' ) || wantbh;
	wantsp = ( job === 'subspace' ) || wantbh;

	// Count selected eigenvalues
	n1 = 0;
	for ( k = 0; k < N; k++ ) {
		if ( SELECT[ offsetSELECT + k * strideSELECT ] ) {
			n1 += 1;
		}
	}
	n2 = N - n1;
	nn = n1 * n2;

	M[ 0 ] = n1;

	// Quick return
	if ( n1 === N || n1 === 0 ) {
		if ( wants ) {
			s[ 0 ] = ONE;
		}
		if ( wantsp ) {
			rwork = new Float64Array( 1 );
			sep[ 0 ] = zlange( 'one-norm', N, N, T, strideT1, strideT2, offsetT, rwork, 1, 0 );
		}
		// Copy eigenvalues to W
		tv = reinterpret( T, 0 );
		wv = reinterpret( W, 0 );
		st1 = strideT1 * 2;
		st2 = strideT2 * 2;
		oT = offsetT * 2;
		for ( k = 0; k < N; k++ ) {
			wv[ ( offsetW + k * strideW ) * 2 ] = tv[ oT + k * st1 + k * st2 ];
			wv[ ( offsetW + k * strideW ) * 2 + 1 ] = tv[ oT + k * st1 + k * st2 + 1 ];
		}
		return 0;
	}

	// Collect the selected eigenvalues at the top left corner of T.
	ks = 0;
	for ( k = 0; k < N; k++ ) {
		if ( SELECT[ offsetSELECT + k * strideSELECT ] ) {
			ks += 1;

			// Swap the (k+1)-th eigenvalue to position ks (1-based)
			if ( k + 1 !== ks ) {
				ztrexc( compq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, k + 1, ks );
			}
		}
	}

	if ( wants ) {
		// Solve the Sylvester equation for R: T11*R - R*T22 = scale*T12
		// Copy T12 (n1 rows, n2 cols starting at column n1) to WORK
		zlacpy( 'full', n1, n2, T, strideT1, strideT2, offsetT + n1 * strideT2, WORK, 1, n1, offsetWork );

		scale = new Float64Array( 1 );
		ztrsyl( 'no-transpose', 'no-transpose', -1, n1, n2, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + n1 * strideT1 + n1 * strideT2, WORK, 1, n1, offsetWork, scale );

		// Estimate reciprocal condition number of the cluster
		rwork = new Float64Array( 1 );
		rnorm = zlange( 'frobenius', n1, n2, WORK, 1, n1, offsetWork, rwork, 1, 0 );
		if ( rnorm === ZERO ) {
			s[ 0 ] = ONE;
		} else {
			s[ 0 ] = scale[ 0 ] / ( Math.sqrt( scale[ 0 ] * scale[ 0 ] / rnorm + rnorm ) * Math.sqrt( rnorm ) );
		}
	}

	if ( wantsp ) {
		// Estimate sep(T11, T22)
		est = new Float64Array( 1 );
		est[ 0 ] = ZERO;
		kase = new Int32Array( 1 );
		kase[ 0 ] = 0;
		isave = new Int32Array( 3 );

		// Need 2*nn complex elements in WORK for zlacn2

		// WORK[0..nn-1] is used by zlacn2 as X, WORK[nn..2*nn-1] as V
		scale = new Float64Array( 1 );

		while ( true ) { // eslint-disable-line no-constant-condition
			zlacn2( nn, WORK, strideWork, offsetWork + nn * strideWork, WORK, strideWork, offsetWork, est, kase, isave, 1, 0 );
			if ( kase[ 0 ] === 0 ) {
				break;
			}
			if ( kase[ 0 ] === 1 ) {
				// Solve T11*R - R*T22 = scale*X
				ztrsyl( 'no-transpose', 'no-transpose', -1, n1, n2, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + n1 * strideT1 + n1 * strideT2, WORK, 1, n1, offsetWork, scale );
			} else {
				// Solve T11**H*R - R*T22**H = scale*X
				ztrsyl( 'conjugate-transpose', 'conjugate-transpose', -1, n1, n2, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + n1 * strideT1 + n1 * strideT2, WORK, 1, n1, offsetWork, scale );
			}
		}

		sep[ 0 ] = scale[ 0 ] / est[ 0 ];
	}

	// Copy reordered eigenvalues to W
	tv = reinterpret( T, 0 );
	wv = reinterpret( W, 0 );
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	oT = offsetT * 2;
	for ( k = 0; k < N; k++ ) {
		wv[ ( offsetW + k * strideW ) * 2 ] = tv[ oT + k * st1 + k * st2 ];
		wv[ ( offsetW + k * strideW ) * 2 + 1 ] = tv[ oT + k * st1 + k * st2 + 1 ];
	}

	return 0;
}


// EXPORTS //

export default ztrsen;
