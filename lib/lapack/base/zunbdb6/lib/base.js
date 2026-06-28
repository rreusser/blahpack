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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import EPS from '@stdlib/constants/float64/eps/lib/index.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zlassq from './../../zlassq/lib/base.js';


// VARIABLES //

// Reorthogonalization gate constant from Giraud/Langou/Rozložník (2002): if the second-pass norm is at least 0.83x the first-pass norm, accept it.
var ALPHA = 0.83;

// Complex constants reused across zgemv calls.
var CZERO = new Complex128( 0.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );
var CNEGONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* Computes the Euclidean norm of the concatenated complex vector `[X1; X2]` using `zlassq` for safe scaling.
*
* @private
* @param {NonNegativeInteger} m1 - length of `X1` (in complex elements)
* @param {Complex128Array} X1 - top vector
* @param {integer} strideX1 - stride for `X1` (in complex elements)
* @param {NonNegativeInteger} offsetX1 - offset for `X1` (in complex elements)
* @param {NonNegativeInteger} m2 - length of `X2` (in complex elements)
* @param {Complex128Array} X2 - bottom vector
* @param {integer} strideX2 - stride for `X2` (in complex elements)
* @param {NonNegativeInteger} offsetX2 - offset for `X2` (in complex elements)
* @returns {number} Euclidean norm of the concatenated vector `[X1; X2]`
*/
function norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 ) {
	var r;
	r = zlassq( m1, X1, strideX1, offsetX1, 0.0, 0.0 );
	r = zlassq( m2, X2, strideX2, offsetX2, r.scl, r.sumsq );
	return r.scl * Math.sqrt( r.sumsq );
}

/**
* Sets the first `M` strided complex entries of a vector to zero.
*
* @private
* @param {NonNegativeInteger} M - number of complex elements
* @param {Float64Array} buf - reinterpreted Float64 view of the complex vector
* @param {integer} stride - stride for `buf` (in Float64 doubles, = `2 * complex stride`)
* @param {NonNegativeInteger} offset - starting Float64 index (= `2 * complex offset`)
*/
function zero( M, buf, stride, offset ) {
	var ix;
	var i;
	ix = offset;
	for ( i = 0; i < M; i++ ) {
		buf[ ix ] = 0.0;
		buf[ ix + 1 ] = 0.0;
		ix += stride;
	}
}

/**
* Performs one classical Gram-Schmidt projection step `X <- X - Q * (Q^H * X)` for the partitioned complex vector `X = [X1; X2]` and matrix `Q = [Q1; Q2]`.
*
* @private
* @param {NonNegativeInteger} m1 - rows in `Q1` (= length of `X1`)
* @param {NonNegativeInteger} m2 - rows in `Q2` (= length of `X2`)
* @param {NonNegativeInteger} N - columns in `Q1`/`Q2` and length of `WORK`
* @param {Complex128Array} X1 - top vector (in/out)
* @param {integer} strideX1 - stride for `X1` (in complex elements)
* @param {NonNegativeInteger} offsetX1 - offset for `X1` (in complex elements)
* @param {Complex128Array} X2 - bottom vector (in/out)
* @param {integer} strideX2 - stride for `X2` (in complex elements)
* @param {NonNegativeInteger} offsetX2 - offset for `X2` (in complex elements)
* @param {Complex128Array} Q1 - top basis matrix
* @param {integer} strideQ11 - first-dimension stride for `Q1` (in complex elements)
* @param {integer} strideQ12 - second-dimension stride for `Q1` (in complex elements)
* @param {NonNegativeInteger} offsetQ1 - offset for `Q1` (in complex elements)
* @param {Complex128Array} Q2 - bottom basis matrix
* @param {integer} strideQ21 - first-dimension stride for `Q2` (in complex elements)
* @param {integer} strideQ22 - second-dimension stride for `Q2` (in complex elements)
* @param {NonNegativeInteger} offsetQ2 - offset for `Q2` (in complex elements)
* @param {Complex128Array} WORK - workspace (in/out)
* @param {integer} strideWork - stride for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - offset for `WORK` (in complex elements)
* @param {Float64Array} WORKv - reinterpreted Float64 view of `WORK` (used for the M1=0 zero pre-fill)
*/
function project( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork, WORKv ) {
	// WORK <- Q1^H * X1 (or zero, when m1 = 0; the m1=0 path keeps the math aligned with the Fortran reference, which special-cases this branch).
	if ( m1 === 0 ) {
		zero( N, WORKv, strideWork * 2, offsetWork * 2 );
	} else {
		zgemv( 'conjugate-transpose', m1, N, CONE, Q1, strideQ11, strideQ12, offsetQ1, X1, strideX1, offsetX1, CZERO, WORK, strideWork, offsetWork );
	}

	// WORK <- WORK + Q2^H * X2
	zgemv( 'conjugate-transpose', m2, N, CONE, Q2, strideQ21, strideQ22, offsetQ2, X2, strideX2, offsetX2, CONE, WORK, strideWork, offsetWork );

	// X1 <- X1 - Q1 * WORK
	zgemv( 'no-transpose', m1, N, CNEGONE, Q1, strideQ11, strideQ12, offsetQ1, WORK, strideWork, offsetWork, CONE, X1, strideX1, offsetX1 );

	// X2 <- X2 - Q2 * WORK
	zgemv( 'no-transpose', m2, N, CNEGONE, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork, CONE, X2, strideX2, offsetX2 );
}


// MAIN //

/**
* Orthogonalizes the complex column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`, where the columns of `Q` are assumed to be orthonormal.
*
* The orthogonalized vector is returned in `X1`/`X2` and equals zero if and only if `X` lies entirely in the range of `Q`. The projection uses at most two iterations of classical Gram-Schmidt with reorthogonalization (Giraud, Langou & Rozložník, 2002): project once via `X <- X - Q * (Q^H * X)`; if the new norm is at least `0.83 * ||X||`, return; if it is at most `N * eps * ||X||`, set `X <- 0`; otherwise project a second time, and if that second pass also shrinks the norm by more than the gate factor, set `X <- 0`.
*
* The complex variant uses the conjugate-transpose `Q^H` (rather than `Q^T`) for the projection coefficient computation.
*
* @private
* @param {NonNegativeInteger} m1 - dimension of `X1` and number of rows in `Q1`
* @param {NonNegativeInteger} m2 - dimension of `X2` and number of rows in `Q2`
* @param {NonNegativeInteger} N - number of columns in `Q1` and `Q2`
* @param {Complex128Array} X1 - top part of the vector (length at least `m1`)
* @param {integer} strideX1 - `X1` stride length (in complex elements)
* @param {NonNegativeInteger} offsetX1 - starting index for `X1` (in complex elements)
* @param {Complex128Array} X2 - bottom part of the vector (length at least `m2`)
* @param {integer} strideX2 - `X2` stride length (in complex elements)
* @param {NonNegativeInteger} offsetX2 - starting index for `X2` (in complex elements)
* @param {Complex128Array} Q1 - top part of the orthonormal basis matrix
* @param {integer} strideQ11 - stride of the first dimension of `Q1` (in complex elements)
* @param {integer} strideQ12 - stride of the second dimension of `Q1` (in complex elements)
* @param {NonNegativeInteger} offsetQ1 - starting index for `Q1` (in complex elements)
* @param {Complex128Array} Q2 - bottom part of the orthonormal basis matrix
* @param {integer} strideQ21 - stride of the first dimension of `Q2` (in complex elements)
* @param {integer} strideQ22 - stride of the second dimension of `Q2` (in complex elements)
* @param {NonNegativeInteger} offsetQ2 - starting index for `Q2` (in complex elements)
* @param {Complex128Array} WORK - workspace array (length at least `N`)
* @param {integer} strideWork - `WORK` stride length (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @returns {integer} `info` (0 = success)
*/
function zunbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork ) {
	var nrmNew;
	var WORKv;
	var X1v;
	var X2v;
	var nrm;

	// Float64 views of the complex arrays for cheap zeroing of in/out buffers.
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );
	WORKv = reinterpret( WORK, 0 );

	// Compute initial Euclidean norm of X
	nrm = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	// First Gram-Schmidt projection
	project( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork, WORKv );

	nrmNew = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	// If projection retained sufficient norm, accept it
	if ( nrmNew >= ALPHA * nrm ) {
		return 0;
	}

	// If projection collapsed essentially to zero, truncate
	if ( nrmNew <= N * EPS * nrm ) {
		zero( m1, X1v, strideX1 * 2, offsetX1 * 2 );
		zero( m2, X2v, strideX2 * 2, offsetX2 * 2 );
		return 0;
	}

	// Reorthogonalize: second Gram-Schmidt projection
	nrm = nrmNew;

	project( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork, WORKv );

	nrmNew = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	// If second projection also shrank significantly, truncate to zero. NOTE: this branch is the "reorthogonalization failed" safety net; with truly orthonormal Q, the Giraud/Langou/Rozložník theorem guarantees the second pass succeeds (so this branch is unreachable when the precondition holds, and is intentionally left uncovered).
	if ( nrmNew < ALPHA * nrm ) {
		zero( m1, X1v, strideX1 * 2, offsetX1 * 2 );
		zero( m2, X2v, strideX2 * 2, offsetX2 * 2 );
	}
	return 0;
}


// EXPORTS //

export default zunbdb6;
