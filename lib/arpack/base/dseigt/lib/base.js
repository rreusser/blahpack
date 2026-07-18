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

/* eslint-disable max-len, max-params */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dstqrb from './../../dstqrb/lib/base.js';


// MAIN //

/**
* Computes the eigenvalues of the current symmetric tridiagonal matrix `H` and the corresponding Ritz estimates.
*
* ## Notes
*
* -   `H` is stored in the ARPACK 2-column layout: the second column (index 1) holds the main diagonal, and the first column (index 0, rows 1..N-1) holds the subdiagonal.
* -   On exit, `eig` holds the eigenvalues in ascending order and `bounds` holds the Ritz estimates `rnorm * |z|`, where `z` is the last component of each eigenvector.
* -   `workl` must have at least `3*N` elements: the first `N-1` receive the subdiagonal, and `dstqrb`'s workspace occupies indices `N` onward.
*
* @private
* @param {number} rnorm - residual norm of the Lanczos/Arnoldi factorization
* @param {NonNegativeInteger} N - order of the matrix `H`
* @param {Float64Array} H - symmetric tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1)
* @param {integer} strideH1 - stride of the first (row) dimension of `H`
* @param {integer} strideH2 - stride of the second (column) dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} eig - output array for the eigenvalues (length N)
* @param {integer} strideEig - stride length for `eig`
* @param {NonNegativeInteger} offsetEig - starting index for `eig`
* @param {Float64Array} bounds - output array for the Ritz estimates (length N)
* @param {integer} strideBounds - stride length for `bounds`
* @param {NonNegativeInteger} offsetBounds - starting index for `bounds`
* @param {Float64Array} workl - workspace array (length >= 3*N)
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} offsetWorkl - starting index for `workl`
* @returns {integer} IERR - 0 if successful, otherwise the `dstqrb` error code
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] ); // 4x2, column-major
* var eig = new Float64Array( 4 );
* var bounds = new Float64Array( 4 );
* var workl = new Float64Array( 12 );
*
* var ierr = dseigt( 0.5, 4, H, 1, 4, 0, eig, 1, 0, bounds, 1, 0, workl, 1, 0 );
* // returns 0
*/
function dseigt( rnorm, N, H, strideH1, strideH2, offsetH, eig, strideEig, offsetEig, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl ) {
	let ib, k;

	// Copy the main diagonal (H column 1) into eig and the subdiagonal (H column 0, rows 1..N-1) into the front of workl.
	dcopy( N, H, strideH1, offsetH + strideH2, eig, strideEig, offsetEig );
	dcopy( N - 1, H, strideH1, offsetH + strideH1, workl, strideWorkl, offsetWorkl );

	// Eigenvalues of H (into eig) and the last row of its eigenvector matrix (into bounds); dstqrb's workspace starts at workl[N].
	const ierr = dstqrb( N, eig, strideEig, offsetEig, workl, strideWorkl, offsetWorkl, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl + (N * strideWorkl) );
	if ( ierr !== 0 ) {
		return ierr;
	}

	// Ritz estimates: rnorm times the magnitude of the last eigenvector component.
	ib = offsetBounds;
	for ( k = 0; k < N; k++ ) {
		bounds[ ib ] = rnorm * Math.abs( bounds[ ib ] );
		ib += strideBounds;
	}
	return ierr;
}


// EXPORTS //

export default dseigt;
