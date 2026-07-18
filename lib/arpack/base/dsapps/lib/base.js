/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dlartg from './../../../../lapack/base/dlartg/lib/base.js';
import dlaset from './../../../../lapack/base/dlaset/lib/base.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// MAIN //

/**
* Applies `np` implicit shifts to the symmetric Arnoldi/Lanczos factorization via bulge chasing.
*
* ## Notes
*
* -   Given the Arnoldi factorization `A*V_{k} - V_{k}*H_{k} = r_{k+p}*e_{k+p}^T`, applies `np` shifts implicitly, producing the updated factorization `A*VNEW_{k} - VNEW_{k}*HNEW_{k} = rnew_{k}*e_{k}^T`, where the accumulated orthogonal transformation `Q` (order `kev+np`) is the product of the bulge-chasing rotations.
* -   `H` is stored in the ARPACK 2-column layout: the second column (index 1) holds the main diagonal, and the first column (index 0, rows 1..kev+np-1) holds the subdiagonal. The subdiagonal elements are assumed non-negative on input and are enforced non-negative on output.
* -   On exit, the updated Arnoldi vectors are in the first `kev` columns of `V`, the updated tridiagonal matrix is in the leading `kev` submatrix of `H`, and `resid` is the updated residual vector. `Q` and `workd` are workspace; `workd` must have at least `2*n` elements.
*
* @private
* @param {NonNegativeInteger} n - problem size (dimension of the matrix `A`)
* @param {NonNegativeInteger} kev - number of wanted eigenvalues; on exit, the order of the updated factorization
* @param {NonNegativeInteger} np - number of implicit shifts to apply
* @param {Float64Array} shift - shifts to apply (length `np`)
* @param {integer} strideShift - stride length for `shift`
* @param {NonNegativeInteger} offsetShift - starting index for `shift`
* @param {Float64Array} v - Arnoldi vectors, `n` by `kev+np`
* @param {integer} strideV1 - stride of the first (row) dimension of `v`
* @param {integer} strideV2 - stride of the second (column) dimension of `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {Float64Array} h - symmetric tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1), `kev+np` by 2
* @param {integer} strideH1 - stride of the first (row) dimension of `h`
* @param {integer} strideH2 - stride of the second (column) dimension of `h`
* @param {NonNegativeInteger} offsetH - starting index for `h`
* @param {Float64Array} resid - residual vector (length `n`); updated in place
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {Float64Array} q - workspace to accumulate the rotations, `kev+np` by `kev+np`
* @param {integer} strideQ1 - stride of the first (row) dimension of `q`
* @param {integer} strideQ2 - stride of the second (column) dimension of `q`
* @param {NonNegativeInteger} offsetQ - starting index for `q`
* @param {Float64Array} workd - workspace array (length >= `2*n`)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var n = 5;
* var kev = 2;
* var np = 1;
* var kplusp = kev + np;
*
* var v = new Float64Array( n * kplusp );
* var i;
* for ( i = 0; i < v.length; i++ ) {
*     v[ i ] = ( i + 1 ) * 0.1;
* }
*
* var h = new Float64Array( kplusp * 2 );
* h[ kplusp ] = 3.0; // diagonal entries
* h[ kplusp + 1 ] = 1.0;
* h[ kplusp + 2 ] = 2.0;
* h[ 1 ] = 1.0; // subdiagonal entries
* h[ 2 ] = 0.5;
*
* var resid = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0 ] );
* var shift = new Float64Array( [ 1.75 ] );
* var q = new Float64Array( kplusp * kplusp );
* var workd = new Float64Array( 2 * n );
*
* dsapps( n, kev, np, shift, 1, 0, v, 1, n, 0, h, 1, kplusp, 0, resid, 1, 0, q, 1, kplusp, 0, workd, 1, 0 );
*/
function dsapps( n, kev, np, shift, strideShift, offsetShift, v, strideV1, strideV2, offsetV, h, strideH1, strideH2, offsetH, resid, strideResid, offsetResid, q, strideQ1, strideQ2, offsetQ, workd, strideWorkd, offsetWorkd ) {
	let istart, itop, iend, big, a1, a2, a3, a4, jj, c, f, g, i, j, r, s;

	/**
	* Returns the flat index of `h(ii,col)` for 1-based row `ii` and 1-based column `col`.
	*
	* @private
	* @param {integer} ii - 1-based row index
	* @param {integer} col - 1-based column index (1 or 2)
	* @returns {integer} flat index
	*/
	function ih( ii, col ) {
		return offsetH + ( ( ii - 1 ) * strideH1 ) + ( ( col - 1 ) * strideH2 );
	}

	/**
	* Returns the flat index of `q(ii,jx)` for 1-based row `ii` and 1-based column `jx`.
	*
	* @private
	* @param {integer} ii - 1-based row index
	* @param {integer} jx - 1-based column index
	* @returns {integer} flat index
	*/
	function iq( ii, jx ) {
		return offsetQ + ( ( ii - 1 ) * strideQ1 ) + ( ( jx - 1 ) * strideQ2 );
	}

	/**
	* Returns the flat index of `v(ii,jx)` for 1-based row `ii` and 1-based column `jx`.
	*
	* @private
	* @param {integer} ii - 1-based row index
	* @param {integer} jx - 1-based column index
	* @returns {integer} flat index
	*/
	function iv( ii, jx ) {
		return offsetV + ( ( ii - 1 ) * strideV1 ) + ( ( jx - 1 ) * strideV2 );
	}

	const epsmch = dlamch( 'epsilon' );
	itop = 1;
	const rot = new Float64Array( 3 );

	const kplusp = kev + np;

	// Initialize Q to the identity matrix of order kplusp used to accumulate the rotations.
	dlaset( 'all', kplusp, kplusp, 0.0, 1.0, q, strideQ1, strideQ2, offsetQ );

	// Quick return if there are no shifts to apply.
	if ( np === 0 ) {
		return;
	}

	// Apply the np shifts implicitly. Apply each shift to the whole matrix and not just to the submatrix from which it comes.
	for ( jj = 1; jj <= np; jj++ ) {
		istart = itop;

		// Chase the bulge; the block may split into subblocks handled by successive passes of this loop.
		for ( ; ; ) {
			// The following scan exits early if we encounter a negligible off-diagonal element (deflation).
			iend = kplusp;
			for ( i = istart; i <= kplusp - 1; i++ ) {
				big = Math.abs( h[ ih( i, 2 ) ] ) + Math.abs( h[ ih( i + 1, 2 ) ] );
				if ( h[ ih( i + 1, 1 ) ] <= epsmch * big ) {
					h[ ih( i + 1, 1 ) ] = 0.0;
					iend = i;
					break;
				}
			}
			if ( istart < iend ) {
				// Construct the plane rotation that attempts to drive h(istart+1,1) to zero.
				f = h[ ih( istart, 2 ) ] - shift[ offsetShift + ( ( jj - 1 ) * strideShift ) ];
				g = h[ ih( istart + 1, 1 ) ];
				dlartg( f, g, rot );
				c = rot[ 0 ];
				s = rot[ 1 ];
				r = rot[ 2 ];

				// Apply the rotation to the left and right of H, creating a "bulge".
				a1 = ( c * h[ ih( istart, 2 ) ] ) + ( s * h[ ih( istart + 1, 1 ) ] );
				a2 = ( c * h[ ih( istart + 1, 1 ) ] ) + ( s * h[ ih( istart + 1, 2 ) ] );
				a4 = ( c * h[ ih( istart + 1, 2 ) ] ) - ( s * h[ ih( istart + 1, 1 ) ] );
				a3 = ( c * h[ ih( istart + 1, 1 ) ] ) - ( s * h[ ih( istart, 2 ) ] );
				h[ ih( istart, 2 ) ] = ( c * a1 ) + ( s * a2 );
				h[ ih( istart + 1, 2 ) ] = ( c * a4 ) - ( s * a3 );
				h[ ih( istart + 1, 1 ) ] = ( c * a3 ) + ( s * a4 );

				// Accumulate the rotation in the matrix Q; Q <- Q*G.
				for ( j = 1; j <= Math.min( istart + jj, kplusp ); j++ ) {
					a1 = ( c * q[ iq( j, istart ) ] ) + ( s * q[ iq( j, istart + 1 ) ] );
					q[ iq( j, istart + 1 ) ] = ( -s * q[ iq( j, istart ) ] ) + ( c * q[ iq( j, istart + 1 ) ] );
					q[ iq( j, istart ) ] = a1;
				}

				// Chase the bulge created above down the tridiagonal.
				for ( i = istart + 1; i <= iend - 1; i++ ) {
					// Construct the plane rotation that zeros the i-th bulge created by the previous rotation.
					f = h[ ih( i, 1 ) ];
					g = s * h[ ih( i + 1, 1 ) ];

					// Final update with the previous rotation.
					h[ ih( i + 1, 1 ) ] = c * h[ ih( i + 1, 1 ) ];
					dlartg( f, g, rot );
					c = rot[ 0 ];
					s = rot[ 1 ];
					r = rot[ 2 ];

					// Keep the first iend-2 off-diagonal elements of H non-negative.
					if ( r < 0.0 ) {
						r = -r;
						c = -c;
						s = -s;
					}

					// Apply the rotation to the left and right of H.
					h[ ih( i, 1 ) ] = r;

					a1 = ( c * h[ ih( i, 2 ) ] ) + ( s * h[ ih( i + 1, 1 ) ] );
					a2 = ( c * h[ ih( i + 1, 1 ) ] ) + ( s * h[ ih( i + 1, 2 ) ] );
					a3 = ( c * h[ ih( i + 1, 1 ) ] ) - ( s * h[ ih( i, 2 ) ] );
					a4 = ( c * h[ ih( i + 1, 2 ) ] ) - ( s * h[ ih( i + 1, 1 ) ] );

					h[ ih( i, 2 ) ] = ( c * a1 ) + ( s * a2 );
					h[ ih( i + 1, 2 ) ] = ( c * a4 ) - ( s * a3 );
					h[ ih( i + 1, 1 ) ] = ( c * a3 ) + ( s * a4 );

					// Accumulate the rotation in the matrix Q; Q <- Q*G.
					for ( j = 1; j <= Math.min( i + jj, kplusp ); j++ ) {
						a1 = ( c * q[ iq( j, i ) ] ) + ( s * q[ iq( j, i + 1 ) ] );
						q[ iq( j, i + 1 ) ] = ( -s * q[ iq( j, i ) ] ) + ( c * q[ iq( j, i + 1 ) ] );
						q[ iq( j, i ) ] = a1;
					}
				}
			}

			// Update the block pointer.
			istart = iend + 1;

			// Make sure that h(iend,1) is non-negative; if not, negate it and the last column of Q.
			if ( h[ ih( iend, 1 ) ] < 0.0 ) {
				h[ ih( iend, 1 ) ] = -h[ ih( iend, 1 ) ];
				dscal( kplusp, -1.0, q, strideQ1, iq( 1, iend ) );
			}

			// Apply the same shift to the next block if there is any.
			if ( iend < kplusp ) {
				continue;
			}
			break;
		}

		// Check if we can increase the start of the block.
		for ( i = itop; i <= kplusp - 1; i++ ) {
			if ( h[ ih( i + 1, 1 ) ] > 0.0 ) {
				break;
			}
			itop += 1;
		}
	}

	// All shifts have been applied. Check for more possible deflation that might occur after the last shift is applied.
	for ( i = itop; i <= kplusp - 1; i++ ) {
		big = Math.abs( h[ ih( i, 2 ) ] ) + Math.abs( h[ ih( i + 1, 2 ) ] );
		if ( h[ ih( i + 1, 1 ) ] <= epsmch * big ) {
			h[ ih( i + 1, 1 ) ] = 0.0;
		}
	}

	// Compute the (kev+1)-st column of (V*Q) and temporarily store the result in workd(n+1:2*n). Not necessary if h(kev+1,1) = 0.
	if ( h[ ih( kev + 1, 1 ) ] > 0.0 ) {
		dgemv( 'no-transpose', n, kplusp, 1.0, v, strideV1, strideV2, offsetV, q, strideQ1, iq( 1, kev + 1 ), 0.0, workd, strideWorkd, offsetWorkd + ( n * strideWorkd ) );
	}

	// Compute columns 1 to kev of (V*Q) in backward order, taking advantage that Q is upper triangular with lower bandwidth np. Place results in v(:,kplusp-kev+1:kplusp) temporarily.
	for ( i = 1; i <= kev; i++ ) {
		dgemv( 'no-transpose', n, kplusp - i + 1, 1.0, v, strideV1, strideV2, offsetV, q, strideQ1, iq( 1, kev - i + 1 ), 0.0, workd, strideWorkd, offsetWorkd );
		dcopy( n, workd, strideWorkd, offsetWorkd, v, strideV1, iv( 1, kplusp - i + 1 ) );
	}

	// Move v(:,kplusp-kev+1:kplusp) into v(:,1:kev).
	for ( i = 1; i <= kev; i++ ) {
		dcopy( n, v, strideV1, iv( 1, np + i ), v, strideV1, iv( 1, i ) );
	}

	// Copy the (kev+1)-st column of (V*Q) into the appropriate place if h(kev+1,1) != 0.
	if ( h[ ih( kev + 1, 1 ) ] > 0.0 ) {
		dcopy( n, workd, strideWorkd, offsetWorkd + ( n * strideWorkd ), v, strideV1, iv( 1, kev + 1 ) );
	}

	// Update the residual vector: r <- sigmak*r + betak*v(:,kev+1).
	dscal( n, q[ iq( kplusp, kev ) ], resid, strideResid, offsetResid );
	if ( h[ ih( kev + 1, 1 ) ] > 0.0 ) {
		daxpy( n, h[ ih( kev + 1, 1 ) ], v, strideV1, iv( 1, kev + 1 ), resid, strideResid, offsetResid );
	}
}


// EXPORTS //

export default dsapps;
