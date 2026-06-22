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
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlarnv from '../../dlarnv/lib/base.js';
import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
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
* Computes the eigenvectors of a real symmetric tridiagonal matrix T
* corresponding to specified eigenvalues, using inverse iteration.
* The output is stored in a complex array (imaginary parts are zero).
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
* @param {Complex128Array} Z - output eigenvectors (N x M column-major), strides in complex elements
* @param {integer} strideZ1 - first dimension stride for Z (complex elements)
* @param {integer} strideZ2 - second dimension stride for Z (complex elements)
* @param {NonNegativeInteger} offsetZ - offset for Z (complex elements)
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
function zstein( N, d, strideD, offsetD, e, strideE, offsetE, M, w, strideW, offsetW, IBLOCK, strideIBLOCK, offsetIBLOCK, ISPLIT, strideISPLIT, offsetISPLIT, Z, strideZ1, strideZ2, offsetZ, WORK, strideWORK, offsetWORK, IWORK, strideIWORK, offsetIWORK, IFAIL, strideIFAIL, offsetIFAIL ) { // eslint-disable-line max-len, max-params
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
	var sz1;
	var sz2;
	var oz;
	var zv;
	var b1;
	var bn;
	var j1;
	var jr;
	var j;
	var i;

	// Reinterpret Complex128Array to Float64Array for element access
	zv = reinterpret( Z, 0 );
	sz1 = strideZ1 * 2; // convert complex strides to Float64 strides
	sz2 = strideZ2 * 2;
	oz = offsetZ * 2;

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

	// Validate ordering
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
		// Z(1,1) = CONE = (1.0, 0.0)
		zv[ oz ] = 1.0;
		zv[ oz + 1 ] = 0.0;
		return 0;
	}

	// Initialize seed
	iseed = new Int32Array( [ 1, 1, 1, 1 ] );

	// Initialize pointers into WORK
	indrv1 = offsetWORK;
	indrv2 = indrv1 + N * strideWORK;
	indrv3 = indrv2 + N * strideWORK;
	indrv4 = indrv3 + N * strideWORK;
	indrv5 = indrv4 + N * strideWORK;

	j1 = 0;

	for ( nblk = 1; nblk <= IBLOCK[ offsetIBLOCK + ( M - 1 ) * strideIBLOCK ]; nblk++ ) {
		if ( nblk === 1 ) {
			b1 = 0;
		} else {
			b1 = ISPLIT[ offsetISPLIT + ( nblk - 2 ) * strideISPLIT ];
		}
		bn = ISPLIT[ offsetISPLIT + ( nblk - 1 ) * strideISPLIT ] - 1;
		blksiz = bn - b1 + 1;

		if ( blksiz !== 1 ) {
			gpind = j1;

			onenrm = Math.abs( d[ offsetD + b1 * strideD ] ) + Math.abs( e[ offsetE + b1 * strideE ] );
			onenrm = Math.max( onenrm, Math.abs( d[ offsetD + bn * strideD ] ) + Math.abs( e[ offsetE + ( bn - 1 ) * strideE ] ) );
			for ( i = b1 + 1; i <= bn - 1; i++ ) {
				onenrm = Math.max( onenrm, Math.abs( d[ offsetD + i * strideD ] ) + Math.abs( e[ offsetE + ( i - 1 ) * strideE ] ) + Math.abs( e[ offsetE + i * strideE ] ) );
			}
			ortol = ODM3 * onenrm;
			dtpcrt = Math.sqrt( ODM1 / blksiz );
		}

		jblk = 0;

		for ( j = j1; j < M; j++ ) {
			if ( IBLOCK[ offsetIBLOCK + j * strideIBLOCK ] !== nblk ) {
				j1 = j;
				break;
			}
			jblk++;
			xj = w[ offsetW + j * strideW ];

			if ( blksiz === 1 ) {
				WORK[ indrv1 ] = 1.0;
				_storeEigenvectorComplex( N, zv, sz1, sz2, oz, WORK, strideWORK, indrv1, b1, blksiz, j );
				xjm = xj;
				if ( j === M - 1 ) {
					j1 = M;
				}
				continue;
			}

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

			dlarnv( 2, iseed, 1, 0, blksiz, WORK, strideWORK, indrv1 );

			dcopy( blksiz, d, strideD, offsetD + b1 * strideD, WORK, strideWORK, indrv4 );
			dcopy( blksiz - 1, e, strideE, offsetE + b1 * strideE, WORK, strideWORK, indrv2 + strideWORK );
			dcopy( blksiz - 1, e, strideE, offsetE + b1 * strideE, WORK, strideWORK, indrv3 );

			tol = 0.0;
			dlagtf( blksiz, WORK, strideWORK, indrv4, xj, WORK, strideWORK, indrv2 + strideWORK, WORK, strideWORK, indrv3, tol, WORK, strideWORK, indrv5, IWORK, strideIWORK, offsetIWORK );

			while ( true ) { // eslint-disable-line no-constant-condition
				its++;
				if ( its > MAXITS ) {
					info++;
					IFAIL[ offsetIFAIL + ( info - 1 ) * strideIFAIL ] = j + 1;
					break;
				}

				jmax = idamax( blksiz, WORK, strideWORK, indrv1 );
				scl = blksiz * onenrm * Math.max( EPS, Math.abs( WORK[ indrv4 + ( blksiz - 1 ) * strideWORK ] ) ) / Math.abs( WORK[ indrv1 + jmax * strideWORK ] );
				dscal( blksiz, scl, WORK, strideWORK, indrv1 );

				dlagts( -1, blksiz, WORK, strideWORK, indrv4, WORK, strideWORK, indrv2 + strideWORK, WORK, strideWORK, indrv3, WORK, strideWORK, indrv5, IWORK, strideIWORK, offsetIWORK, WORK, strideWORK, indrv1, tol );

				// Reorthogonalize: use real parts of Z columns (since eigenvectors are real)
				if ( jblk !== 1 ) {
					if ( Math.abs( xj - xjm ) > ortol ) {
						gpind = j;
					}
					if ( gpind !== j ) {
						for ( i = gpind; i < j; i++ ) {
							// Dot product of WORK[indrv1..] with real parts of Z(b1:bn, i)
							ztr = 0.0;
							for ( jr = 0; jr < blksiz; jr++ ) {
								ztr += WORK[ indrv1 + jr * strideWORK ] * zv[ oz + ( b1 + jr ) * sz1 + i * sz2 ]; // real part of Z(b1+jr, i)
							}
							// Subtract ztr * real(Z(:,i)) from WORK
							for ( jr = 0; jr < blksiz; jr++ ) {
								WORK[ indrv1 + jr * strideWORK ] -= ztr * zv[ oz + ( b1 + jr ) * sz1 + i * sz2 ];
							}
						}
					}
				}

				jmax = idamax( blksiz, WORK, strideWORK, indrv1 );
				nrm = Math.abs( WORK[ indrv1 + jmax * strideWORK ] );

				if ( nrm < dtpcrt ) {
					continue;
				}
				nrmchk++;
				if ( nrmchk < EXTRA + 1 ) {
					continue;
				}
				break;
			}

			scl = 1.0 / dnrm2( blksiz, WORK, strideWORK, indrv1 );
			jmax = idamax( blksiz, WORK, strideWORK, indrv1 );
			if ( WORK[ indrv1 + jmax * strideWORK ] < 0.0 ) {
				scl = -scl;
			}
			dscal( blksiz, scl, WORK, strideWORK, indrv1 );

			_storeEigenvectorComplex( N, zv, sz1, sz2, oz, WORK, strideWORK, indrv1, b1, blksiz, j );

			xjm = xj;

			if ( j === M - 1 ) {
				j1 = M;
			}
		}
	}

	return info;
}

/**
* Store eigenvector from WORK into column j of Z (complex, imaginary parts = 0).
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @param {Float64Array} zv - Float64 view of Z
* @param {integer} sz1 - Float64 row stride
* @param {integer} sz2 - Float64 column stride
* @param {NonNegativeInteger} oz - Float64 base offset
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} indrv1 - offset in WORK
* @param {NonNegativeInteger} b1 - 0-based start row
* @param {NonNegativeInteger} blksiz - block size
* @param {NonNegativeInteger} j - 0-based column index
*/
function _storeEigenvectorComplex( N, zv, sz1, sz2, oz, WORK, strideWORK, indrv1, b1, blksiz, j ) {
	var idx;
	var i;
	// Zero entire column
	for ( i = 0; i < N; i++ ) {
		idx = oz + i * sz1 + j * sz2;
		zv[ idx ] = 0.0;     // real part
		zv[ idx + 1 ] = 0.0; // imag part
	}
	// Store eigenvector (real values, imag = 0)
	for ( i = 0; i < blksiz; i++ ) {
		idx = oz + ( b1 + i ) * sz1 + j * sz2;
		zv[ idx ] = WORK[ indrv1 + i * strideWORK ];
		zv[ idx + 1 ] = 0.0;
	}
}


// EXPORTS //

export default zstein;
