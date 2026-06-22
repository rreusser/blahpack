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

/* eslint-disable max-len, max-params, no-var, max-lines, max-depth */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlarnv from '../../dlarnv/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import dlagtf from '../../dlagtf/lib/base.js';
import dlagts from '../../dlagts/lib/base.js';


// VARIABLES //

var MAXITS = 5;
var EXTRA = 2;
var ODM3 = 1.0e-3;
var ODM1 = 1.0e-1;
var TEN = 10.0;
var EPS = dlamch( 'Precision' );


// MAIN //

/**
* Computes the eigenvectors of a real symmetric tridiagonal matrix T.
* corresponding to specified eigenvalues, using inverse iteration.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of T, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Float64Array} e - subdiagonal elements of T, length N-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - offset for e
* @param {NonNegativeInteger} M - number of eigenvectors to compute
* @param {Float64Array} w - eigenvalues (first M elements), grouped by block
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - offset for w
* @param {Int32Array} IBLOCK - block indices for eigenvalues
* @param {integer} strideIBLOCK - stride for IBLOCK
* @param {NonNegativeInteger} offsetIBLOCK - offset for IBLOCK
* @param {Int32Array} ISPLIT - splitting points
* @param {integer} strideISPLIT - stride for ISPLIT
* @param {NonNegativeInteger} offsetISPLIT - offset for ISPLIT
* @param {Float64Array} Z - output eigenvectors (N x M column-major)
* @param {integer} strideZ1 - first dimension stride for Z
* @param {integer} strideZ2 - second dimension stride for Z
* @param {NonNegativeInteger} offsetZ - offset for Z
* @param {Float64Array} WORK - workspace of length 5*N
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - offset for WORK
* @param {Int32Array} IWORK - integer workspace of length N
* @param {integer} strideIWORK - stride for IWORK
* @param {NonNegativeInteger} offsetIWORK - offset for IWORK
* @param {Int32Array} IFAIL - output, indices of non-converged eigenvectors
* @param {integer} strideIFAIL - stride for IFAIL
* @param {NonNegativeInteger} offsetIFAIL - offset for IFAIL
* @returns {integer} info: 0 = success, >0 = number of non-converged eigenvectors
*/
function dstein( N, d, strideD, offsetD, e, strideE, offsetE, M, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
	var nrmchk;
	var dtpcrt;
	var indrv1;
	var indrv2;
	var indrv3;
	var indrv4;
	var indrv5;
	var onenrm;
	var blksiz;
	var pertol;
	var iseed;
	var gpind;
	var ortol;
	var iinfo;
	var jblk;
	var jmax;
	var info;
	var nblk;
	var eps1;
	var its;
	var scl;
	var sep;
	var tol;
	var nrm;
	var xjm;
	var ztr;
	var xj;
	var b1;
	var bn;
	var j1;
	var j;
	var i;

	// Initialize IFAIL
	info = 0;
	for ( i = 0; i < M; i++ ) {
		IFAIL[ offsetIFAIL + i * strideIFAIL ] = 0;
	}

	// Parameter validation
	if ( N < 0 ) {
		return -1;
	}
	if ( M < 0 || M > N ) {
		return -4;
	}

	// Validate ordering of eigenvalues
	for ( j = 1; j < M; j++ ) {
		if ( IBLOCK[ offsetIBLOCK + j * strideIBLOCK ] < IBLOCK[ offsetIBLOCK + ( j - 1 ) * strideIBLOCK ] ) {
			return -6;
		}
		if ( IBLOCK[ offsetIBLOCK + j * strideIBLOCK ] === IBLOCK[ offsetIBLOCK + ( j - 1 ) * strideIBLOCK ] && w[ offsetW + j * strideW ] < w[ offsetW + ( j - 1 ) * strideW ] ) {
			return -5;
		}
	}

	// Quick return
	if ( N === 0 || M === 0 ) {
		return 0;
	}
	if ( N === 1 ) {
		Z[ offsetZ ] = 1.0;
		return 0;
	}

	// Initialize seed for random number generator
	iseed = new Int32Array( [ 1, 1, 1, 1 ] );

	// Initialize pointers into WORK (these are 0-based offsets in terms of strideWORK)
	indrv1 = offsetWORK;
	indrv2 = indrv1 + N * strideWORK;
	indrv3 = indrv2 + N * strideWORK;
	indrv4 = indrv3 + N * strideWORK;
	indrv5 = indrv4 + N * strideWORK;

	// Compute eigenvectors of matrix blocks
	j1 = 0; // 0-based index into eigenvalue list

	for ( nblk = 1; nblk <= IBLOCK[ offsetIBLOCK + ( M - 1 ) * strideIBLOCK ]; nblk++ ) {
		// Find starting and ending indices of block nblk (0-based)
		if ( nblk === 1 ) {
			b1 = 0;
		} else {
			b1 = ISPLIT[ offsetISPLIT + ( nblk - 2 ) * strideISPLIT ]; // ISPLIT is 1-based end index
		}
		bn = ISPLIT[ offsetISPLIT + ( nblk - 1 ) * strideISPLIT ] - 1; // convert to 0-based end
		blksiz = bn - b1 + 1;

		if ( blksiz !== 1 ) {
			gpind = j1;

			// Compute reorthogonalization criterion and stopping criterion
			onenrm = Math.abs( d[ offsetD + b1 * strideD ] ) + Math.abs( e[ offsetE + b1 * strideE ] );
			onenrm = Math.max( onenrm, Math.abs( d[ offsetD + bn * strideD ] ) + Math.abs( e[ offsetE + ( bn - 1 ) * strideE ] ) );
			for ( i = b1 + 1; i <= bn - 1; i++ ) {
				onenrm = Math.max( onenrm, Math.abs( d[ offsetD + i * strideD ] ) + Math.abs( e[ offsetE + ( i - 1 ) * strideE ] ) + Math.abs( e[ offsetE + i * strideE ] ) );
			}
			ortol = ODM3 * onenrm;
			dtpcrt = Math.sqrt( ODM1 / blksiz );
		}

		// Loop through eigenvalues of block nblk
		jblk = 0;

		for ( j = j1; j < M; j++ ) {
			if ( IBLOCK[ offsetIBLOCK + j * strideIBLOCK ] !== nblk ) {
				j1 = j;
				break;
			}
			jblk++;
			xj = w[ offsetW + j * strideW ];

			// Skip all the work if the block size is one
			if ( blksiz === 1 ) {
				WORK[ indrv1 ] = 1.0;

				// Jump to store eigenvector
				_storeEigenvector( N, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indrv1, b1, blksiz, j );
				xjm = xj;
				if ( j === M - 1 ) {
					j1 = M;
				}
				continue;
			}

			// If eigenvalues j and j-1 are too close, add perturbation
			if ( jblk > 1 ) {
				eps1 = Math.abs( EPS * xj );
				pertol = TEN * eps1;
				sep = xj - xjm;
				if ( sep < pertol ) {
					xj = xjm + pertol;
				}
			}

			its = 0;
			nrmchk = 0;

			// Get random starting vector
			dlarnv( 2, iseed, 1, 0, blksiz, WORK, strideWORK, indrv1 );

			// Copy the matrix T so it won't be destroyed in factorization
			dcopy( blksiz, d, strideD, offsetD + b1 * strideD, WORK, strideWORK, indrv4 );
			dcopy( blksiz - 1, e, strideE, offsetE + b1 * strideE, WORK, strideWORK, indrv2 + strideWORK );
			dcopy( blksiz - 1, e, strideE, offsetE + b1 * strideE, WORK, strideWORK, indrv3 );

			// Compute LU factors with partial pivoting (PT = LU)
			tol = 0.0;
			dlagtf( blksiz, WORK, strideWORK, indrv4, xj, WORK, strideWORK, indrv2 + strideWORK, WORK, strideWORK, indrv3, tol, WORK, strideWORK, indrv5, IWORK, strideIWORK, offsetIWORK );

			// Inverse iteration loop
			while ( true ) { // eslint-disable-line no-constant-condition
				its++;
				if ( its > MAXITS ) {
					// Did not converge
					info++;
					IFAIL[ offsetIFAIL + ( info - 1 ) * strideIFAIL ] = j + 1; // 1-based
					break;
				}

				// Normalize and scale the righthand side vector
				jmax = idamax( blksiz, WORK, strideWORK, indrv1 );

				// jmax is 0-based
				scl = blksiz * onenrm * Math.max( EPS, Math.abs( WORK[ indrv4 + ( blksiz - 1 ) * strideWORK ] ) ) / Math.abs( WORK[ indrv1 + jmax * strideWORK ] );
				dscal( blksiz, scl, WORK, strideWORK, indrv1 );

				// Solve the system LU = Pb
				dlagts( -1, blksiz, WORK, strideWORK, indrv4, WORK, strideWORK, indrv2 + strideWORK, WORK, strideWORK, indrv3, WORK, strideWORK, indrv5, IWORK, strideIWORK, offsetIWORK, WORK, strideWORK, indrv1, tol );

				// Reorthogonalize by modified Gram-Schmidt
				if ( jblk !== 1 ) {
					if ( Math.abs( xj - xjm ) > ortol ) {
						gpind = j;
					}
					if ( gpind !== j ) {
						for ( i = gpind; i < j; i++ ) {
							ztr = -ddot( blksiz, WORK, strideWORK, indrv1, Z, strideZ1, offsetZ + b1 * strideZ1 + i * strideZ2 );
							daxpy( blksiz, ztr, Z, strideZ1, offsetZ + b1 * strideZ1 + i * strideZ2, WORK, strideWORK, indrv1 );
						}
					}
				}

				// Check the infinity norm of the iterate
				jmax = idamax( blksiz, WORK, strideWORK, indrv1 );
				nrm = Math.abs( WORK[ indrv1 + jmax * strideWORK ] );

				// Continue for additional iterations after norm reaches stopping criterion
				if ( nrm < dtpcrt ) {
					continue;
				}
				nrmchk++;
				if ( nrmchk < EXTRA + 1 ) {
					continue;
				}

				// Converged
				break;
			}

			// Accept iterate as jth eigenvector: normalize, fix sign, store
			scl = 1.0 / dnrm2( blksiz, WORK, strideWORK, indrv1 );
			jmax = idamax( blksiz, WORK, strideWORK, indrv1 );
			if ( WORK[ indrv1 + jmax * strideWORK ] < 0.0 ) {
				scl = -scl;
			}
			dscal( blksiz, scl, WORK, strideWORK, indrv1 );

			_storeEigenvector( N, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indrv1, b1, blksiz, j );

			// Save the shift to check eigenvalue spacing at next iteration
			xjm = xj;

			if ( j === M - 1 ) {
				j1 = M;
			}
		}
	}

	return info;
}

/**
* Store eigenvector from WORK into column j of Z. Zero out entire column first.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} Z - eigenvector matrix
* @param {integer} strideZ1 - row stride for Z
* @param {integer} strideZ2 - column stride for Z
* @param {NonNegativeInteger} offsetZ - base offset for Z
* @param {Float64Array} WORK - workspace containing eigenvector
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} indrv1 - offset in WORK for eigenvector data
* @param {NonNegativeInteger} b1 - 0-based start row of block
* @param {NonNegativeInteger} blksiz - block size
* @param {NonNegativeInteger} j - 0-based column index
*/
function _storeEigenvector( N, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, indrv1, b1, blksiz, j ) {
	var i;
	for ( i = 0; i < N; i++ ) {
		Z[ offsetZ + i * strideZ1 + j * strideZ2 ] = 0.0;
	}
	for ( i = 0; i < blksiz; i++ ) {
		Z[ offsetZ + ( b1 + i ) * strideZ1 + j * strideZ2 ] = WORK[ indrv1 + i * strideWORK ];
	}
}


// EXPORTS //

export default dstein;
