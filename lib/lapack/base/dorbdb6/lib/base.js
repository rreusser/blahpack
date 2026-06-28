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

/* eslint-disable max-params, max-len */

// MODULES //

import EPS from '@stdlib/constants/float64/eps/lib/index.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import dlassq from './../../dlassq/lib/base.js';


// VARIABLES //

// Reorthogonalization gate constant from Giraud/Langou/Rozložník (2002): if the second-pass norm is at least 0.83x the first-pass norm, accept it.
var ALPHA = 0.83;


// FUNCTIONS //

/**
* Computes the Euclidean norm of the concatenated vector `[X1; X2]` using `dlassq` for safe scaling.
*
* @private
* @param {NonNegativeInteger} m1 - length of `X1`
* @param {Float64Array} X1 - top vector
* @param {integer} strideX1 - stride for `X1`
* @param {NonNegativeInteger} offsetX1 - offset for `X1`
* @param {NonNegativeInteger} m2 - length of `X2`
* @param {Float64Array} X2 - bottom vector
* @param {integer} strideX2 - stride for `X2`
* @param {NonNegativeInteger} offsetX2 - offset for `X2`
* @returns {number} Euclidean norm of the concatenated vector `[X1; X2]`
*/
function norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 ) {
	var r;
	r = dlassq( m1, X1, strideX1, offsetX1, 0.0, 0.0 );
	r = dlassq( m2, X2, strideX2, offsetX2, r.scl, r.sumsq );
	return r.scl * Math.sqrt( r.sumsq );
}

/**
* Sets the first `M` strided entries of a vector to zero.
*
* @private
* @param {NonNegativeInteger} M - number of elements
* @param {Float64Array} X - vector
* @param {integer} stride - stride for `X`
* @param {NonNegativeInteger} offset - starting index for `X`
*/
function zero( M, X, stride, offset ) {
	var ix;
	var i;
	ix = offset;
	for ( i = 0; i < M; i++ ) {
		X[ ix ] = 0.0;
		ix += stride;
	}
}

/**
* Performs one classical Gram-Schmidt projection step `X <- X - Q * (Q^T * X)` for the partitioned vector `X = [X1; X2]` and matrix `Q = [Q1; Q2]`.
*
* @private
* @param {NonNegativeInteger} m1 - rows in `Q1` (= length of `X1`)
* @param {NonNegativeInteger} m2 - rows in `Q2` (= length of `X2`)
* @param {NonNegativeInteger} N - columns in `Q1`/`Q2` and length of `WORK`
* @param {Float64Array} X1 - top vector (in/out)
* @param {integer} strideX1 - stride for `X1`
* @param {NonNegativeInteger} offsetX1 - offset for `X1`
* @param {Float64Array} X2 - bottom vector (in/out)
* @param {integer} strideX2 - stride for `X2`
* @param {NonNegativeInteger} offsetX2 - offset for `X2`
* @param {Float64Array} Q1 - top basis matrix
* @param {integer} strideQ11 - first-dimension stride for `Q1`
* @param {integer} strideQ12 - second-dimension stride for `Q1`
* @param {NonNegativeInteger} offsetQ1 - offset for `Q1`
* @param {Float64Array} Q2 - bottom basis matrix
* @param {integer} strideQ21 - first-dimension stride for `Q2`
* @param {integer} strideQ22 - second-dimension stride for `Q2`
* @param {NonNegativeInteger} offsetQ2 - offset for `Q2`
* @param {Float64Array} WORK - workspace (in/out)
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - offset for `WORK`
*/
function project( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork ) {
	// WORK <- Q1^T * X1 (or zero, when m1 = 0; the m1=0 path keeps the math aligned with the Fortran reference, which special-cases this branch).
	if ( m1 === 0 ) {
		zero( N, WORK, strideWork, offsetWork );
	} else {
		dgemv( 'transpose', m1, N, 1.0, Q1, strideQ11, strideQ12, offsetQ1, X1, strideX1, offsetX1, 0.0, WORK, strideWork, offsetWork );
	}

	// WORK <- WORK + Q2^T * X2
	dgemv( 'transpose', m2, N, 1.0, Q2, strideQ21, strideQ22, offsetQ2, X2, strideX2, offsetX2, 1.0, WORK, strideWork, offsetWork );

	// X1 <- X1 - Q1 * WORK
	dgemv( 'no-transpose', m1, N, -1.0, Q1, strideQ11, strideQ12, offsetQ1, WORK, strideWork, offsetWork, 1.0, X1, strideX1, offsetX1 );

	// X2 <- X2 - Q2 * WORK
	dgemv( 'no-transpose', m2, N, -1.0, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork, 1.0, X2, strideX2, offsetX2 );
}


// MAIN //

/**
* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`, where the columns of `Q` are assumed to be orthonormal.
*
* The orthogonalized vector is returned in `X1`/`X2` and equals zero if and only if `X` lies entirely in the range of `Q`. The projection uses at most two iterations of classical Gram-Schmidt with reorthogonalization (Giraud, Langou & Rozložník, 2002): project once via `X <- X - Q * (Q^T * X)`; if the new norm is at least `0.83 * ||X||`, return; if it is at most `N * eps * ||X||`, set `X <- 0`; otherwise project a second time, and if that second pass also shrinks the norm by more than the gate factor, set `X <- 0`.
*
* @private
* @param {NonNegativeInteger} m1 - dimension of `X1` and number of rows in `Q1`
* @param {NonNegativeInteger} m2 - dimension of `X2` and number of rows in `Q2`
* @param {NonNegativeInteger} N - number of columns in `Q1` and `Q2`
* @param {Float64Array} X1 - top part of the vector (length at least `m1`)
* @param {integer} strideX1 - `X1` stride length
* @param {NonNegativeInteger} offsetX1 - starting index for `X1`
* @param {Float64Array} X2 - bottom part of the vector (length at least `m2`)
* @param {integer} strideX2 - `X2` stride length
* @param {NonNegativeInteger} offsetX2 - starting index for `X2`
* @param {Float64Array} Q1 - top part of the orthonormal basis matrix
* @param {integer} strideQ11 - stride of the first dimension of `Q1`
* @param {integer} strideQ12 - stride of the second dimension of `Q1`
* @param {NonNegativeInteger} offsetQ1 - starting index for `Q1`
* @param {Float64Array} Q2 - bottom part of the orthonormal basis matrix
* @param {integer} strideQ21 - stride of the first dimension of `Q2`
* @param {integer} strideQ22 - stride of the second dimension of `Q2`
* @param {NonNegativeInteger} offsetQ2 - starting index for `Q2`
* @param {Float64Array} WORK - workspace array (length at least `N`)
* @param {integer} strideWork - `WORK` stride length
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} `info` (0 = success)
*/
function dorbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork ) {
	var nrmNew;
	var nrm;

	// Compute initial Euclidean norm of X
	nrm = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	// First Gram-Schmidt projection
	project( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork );

	nrmNew = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	// If projection retained sufficient norm, accept it
	if ( nrmNew >= ALPHA * nrm ) {
		return 0;
	}

	// If projection collapsed essentially to zero, truncate
	if ( nrmNew <= N * EPS * nrm ) {
		zero( m1, X1, strideX1, offsetX1 );
		zero( m2, X2, strideX2, offsetX2 );
		return 0;
	}

	// Reorthogonalize: second Gram-Schmidt projection
	nrm = nrmNew;

	project( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork );

	nrmNew = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	// If second projection also shrank significantly, truncate to zero. NOTE: this branch is the "reorthogonalization failed" safety net; with truly orthonormal Q, the Giraud/Langou/Rozložník theorem guarantees the second pass succeeds (so this branch is unreachable when the precondition holds, and is intentionally left uncovered).
	if ( nrmNew < ALPHA * nrm ) {
		zero( m1, X1, strideX1, offsetX1 );
		zero( m2, X2, strideX2, offsetX2 );
	}
	return 0;
}


// EXPORTS //

export default dorbdb6;
