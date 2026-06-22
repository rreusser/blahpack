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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import dtrexc from '../../dtrexc/lib/base.js';
import dtrsyl from '../../dtrsyl/lib/base.js';
import dlacn2 from '../../dlacn2/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlange from '../../dlange/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;


// MAIN //

/**
* Reorders the real Schur factorization of a real matrix A = Q_T_Q**T.
* so that a selected cluster of eigenvalues appears in the leading diagonal
* blocks of the upper quasi-triangular matrix T, and the leading columns
* of Q form an orthonormal basis of the corresponding right invariant subspace.
*
* Optionally computes the reciprocal condition numbers of the cluster (S)
* and of the invariant subspace (SEP).
*
* @private
* @param {string} job - `'none'`, `'eigenvalues'`, `'subspace'`, or `'both'`
* @param {string} compq - `'update'` or `'none'`
* @param {Uint8Array|Array} SELECT - boolean array of length N indicating selected eigenvalues
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - starting index for SELECT
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} T - N-by-N upper quasi-triangular matrix (Schur form)
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} Q - N-by-N orthogonal matrix of Schur vectors
* @param {integer} strideQ1 - stride of the first dimension of Q
* @param {integer} strideQ2 - stride of the second dimension of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} WR - output: real parts of eigenvalues
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - starting index for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - starting index for WI
* @param {Float64Array} M - output: M[0] = dimension of selected subspace
* @param {Float64Array} s - output: s[0] = reciprocal condition number of selected cluster
* @param {Float64Array} sep - output: sep[0] = reciprocal condition number of subspace
* @param {Float64Array} WORK - workspace of length lwork
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @param {integer} lwork - length of WORK (-1 for query)
* @param {Int32Array} IWORK - integer workspace of length liwork
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - starting index for IWORK
* @param {integer} liwork - length of IWORK (-1 for query)
* @returns {integer} info (0 = success, 1 = reordering failed)
*/
function dtrsen( job, compq, SELECT, strideSELECT, offsetSELECT, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, WR, strideWR, offsetWR, WI, strideWI, offsetWI, M, s, sep, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK, liwork ) {
	var scalArr;
	var wantbh;
	var wantsp;
	var lquery;
	var liwmin;
	var lwmin;
	var wants;
	var wantq;
	var rnorm;
	var scale;
	var isave;
	var ierr;
	var pair;
	var swap;
	var info;
	var kase;
	var est;
	var n1;
	var n2;
	var nn;
	var ks;
	var kk;
	var k;

	wantbh = ( job === 'both' );
	wants = ( job === 'eigenvalues' ) || wantbh;
	wantsp = ( job === 'subspace' ) || wantbh;
	wantq = ( compq === 'update' );

	info = 0;
	lquery = ( lwork === -1 );

	// Count the selected eigenvalues
	M[ 0 ] = 0;
	pair = false;
	for ( k = 0; k < N; k++ ) {
		if ( pair ) {
			pair = false;
		} else if ( k < N - 1 ) {
			if ( T[ offsetT + (k + 1) * strideT1 + k * strideT2 ] === ZERO ) {
				if ( SELECT[ offsetSELECT + k * strideSELECT ] ) {
					M[ 0 ] += 1;
				}
			} else {
				pair = true;
				if ( SELECT[ offsetSELECT + k * strideSELECT ] || SELECT[ offsetSELECT + (k + 1) * strideSELECT ] ) {
					M[ 0 ] += 2;
				}
			}
		} else if ( SELECT[ offsetSELECT + (N - 1) * strideSELECT ] ) {
			M[ 0 ] += 1;
		}
	}

	n1 = M[ 0 ];
	n2 = N - M[ 0 ];
	nn = n1 * n2;

	if ( wantsp ) {
		lwmin = Math.max( 1, 2 * nn );
		liwmin = Math.max( 1, nn );
	} else if ( job === 'none' ) {
		lwmin = Math.max( 1, N );
		liwmin = 1;
	} else { // job === 'E'
		lwmin = Math.max( 1, nn );
		liwmin = 1;
	}

	if ( info === 0 ) {
		WORK[ offsetWORK ] = lwmin;
		IWORK[ offsetIWORK ] = liwmin;
	}

	if ( lquery ) {
		return info;
	}

	// Quick return if possible
	if ( M[ 0 ] === N || M[ 0 ] === 0 ) {
		if ( wants ) {
			s[ 0 ] = ONE;
		}
		if ( wantsp ) {
			sep[ 0 ] = dlange( 'one-norm', N, N, T, strideT1, strideT2, offsetT, WORK, strideWORK, offsetWORK );
		}
		// Extract eigenvalues and return
		extractEigenvalues( N, T, strideT1, strideT2, offsetT, WR, strideWR, offsetWR, WI, strideWI, offsetWI );
		WORK[ offsetWORK ] = lwmin;
		IWORK[ offsetIWORK ] = liwmin;
		return info;
	}

	// Reorder eigenvalues using dtrexc
	ks = 0;
	pair = false;
	for ( k = 0; k < N; k++ ) {
		if ( pair ) {
			pair = false;
		} else {
			swap = !!SELECT[ offsetSELECT + k * strideSELECT ];
			if ( k < N - 1 ) {
				if ( T[ offsetT + (k + 1) * strideT1 + k * strideT2 ] !== ZERO ) {
					pair = true;
					swap = swap || !!SELECT[ offsetSELECT + (k + 1) * strideSELECT ];
				}
			}
			if ( swap ) {
				ks += 1;

				// Dtrexc uses 1-based ifst, ilst
				ierr = 0;
				kk = k + 1; // Convert 0-based k to 1-based
				if ( kk !== ks ) {
					var res = dtrexc( compq, N, T, strideT1, strideT2, offsetT, Q, strideQ1, strideQ2, offsetQ, kk, ks, WORK, strideWORK, offsetWORK );
					ierr = res.info;
				}
				if ( ierr === 1 || ierr === 2 ) {
					// Reordering failed
					info = 1;
					if ( wants ) {
						s[ 0 ] = ZERO;
					}
					if ( wantsp ) {
						sep[ 0 ] = ZERO;
					}
					// Still extract eigenvalues from partially reordered T
					extractEigenvalues( N, T, strideT1, strideT2, offsetT, WR, strideWR, offsetWR, WI, strideWI, offsetWI );
					WORK[ offsetWORK ] = lwmin;
					IWORK[ offsetIWORK ] = liwmin;
					return info;
				}
				if ( pair ) {
					ks += 1;
				}
			}
		}
	}

	if ( wants ) {
		// Solve Sylvester equation: T11*X - X*T22 = scale*T12
		// Copy T12 into WORK
		dlacpy( 'full', n1, n2, T, strideT1, strideT2, offsetT + n1 * strideT2, WORK, 1, n1, offsetWORK );

		scalArr = new Float64Array( 1 );
		ierr = dtrsyl( 'no-transpose', 'no-transpose', -1, n1, n2, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + n1 * strideT1 + n1 * strideT2, WORK, 1, n1, offsetWORK, scalArr );
		scale = scalArr[ 0 ];

		// Compute S = scale / (sqrt(scale^2 / rnorm + rnorm) * sqrt(rnorm))
		rnorm = dlange( 'frobenius', n1, n2, WORK, 1, n1, offsetWORK, WORK, 1, offsetWORK );
		if ( rnorm === ZERO ) {
			s[ 0 ] = ONE;
		} else {
			s[ 0 ] = scale / ( Math.sqrt( scale * scale / rnorm + rnorm ) * Math.sqrt( rnorm ) );
		}
	}

	if ( wantsp ) {
		// Estimate the reciprocal condition number of the invariant subspace
		est = new Float64Array( 1 );
		est[ 0 ] = ZERO;
		kase = new Int32Array( 1 );
		kase[ 0 ] = 0;
		isave = new Int32Array( 3 );

		scalArr = new Float64Array( 1 );

		while ( true ) { // eslint-disable-line no-constant-condition
			dlacn2( nn, WORK, 1, offsetWORK + nn, WORK, 1, offsetWORK, IWORK, strideIWORK, offsetIWORK, est, kase, isave, 1, 0 );
			if ( kase[ 0 ] === 0 ) {
				break;
			}
			if ( kase[ 0 ] === 1 ) {
				// Solve T11*X - X*T22 = scale*WORK
				dtrsyl( 'no-transpose', 'no-transpose', -1, n1, n2, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + n1 * strideT1 + n1 * strideT2, WORK, 1, n1, offsetWORK, scalArr );
			} else {
				// Solve T11^T*X - X*T22^T = scale*WORK
				dtrsyl( 'transpose', 'transpose', -1, n1, n2, T, strideT1, strideT2, offsetT, T, strideT1, strideT2, offsetT + n1 * strideT1 + n1 * strideT2, WORK, 1, n1, offsetWORK, scalArr );
			}
		}

		sep[ 0 ] = scalArr[ 0 ] / est[ 0 ];
	}

	// Extract eigenvalues from the reordered Schur form
	extractEigenvalues( N, T, strideT1, strideT2, offsetT, WR, strideWR, offsetWR, WI, strideWI, offsetWI );

	WORK[ offsetWORK ] = lwmin;
	IWORK[ offsetIWORK ] = liwmin;

	return info;
}

/**
* Extracts eigenvalues from a quasi-triangular matrix.
*
* @private
*/
function extractEigenvalues( N, T, strideT1, strideT2, offsetT, WR, strideWR, offsetWR, WI, strideWI, offsetWI ) {
	var k;
	for ( k = 0; k < N; k++ ) {
		WR[ offsetWR + k * strideWR ] = T[ offsetT + k * strideT1 + k * strideT2 ];
		WI[ offsetWI + k * strideWI ] = ZERO;
	}
	for ( k = 0; k < N - 1; k++ ) {
		if ( T[ offsetT + (k + 1) * strideT1 + k * strideT2 ] !== ZERO ) {
			WI[ offsetWI + k * strideWI ] = Math.sqrt( Math.abs( T[ offsetT + k * strideT1 + (k + 1) * strideT2 ] ) ) * Math.sqrt( Math.abs( T[ offsetT + (k + 1) * strideT1 + k * strideT2 ] ) );
			WI[ offsetWI + (k + 1) * strideWI ] = -WI[ offsetWI + k * strideWI ];
		}
	}
}


// EXPORTS //

export default dtrsen;
