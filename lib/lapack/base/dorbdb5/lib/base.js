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
import dlassq from './../../dlassq/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dorbdb6 from './../../dorbdb6/lib/base.js';


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


// MAIN //

/**
* Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`, where the columns of `Q` are assumed to be orthonormal.
*
* If the projection is zero according to Kahan's "twice is enough" criterion, then some other vector from the orthogonal complement is returned. The chosen vector is one of the standard basis vectors `e_1, ..., e_(m1+m2)` (searched in order, X1 partition first), making the choice deterministic but otherwise arbitrary.
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
* @param {integer} strideWORK - `WORK` stride length
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} `info` (0 = success)
*/
function dorbdb5( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWORK, offsetWORK ) {
	var norm;
	var i;

	// Project X onto the orthogonal complement of Q if X is sufficiently nonzero.
	norm = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	if ( norm > N * EPS ) {
		// Scale vector to unit norm to avoid problems in the caller code. Computing the reciprocal is undesirable, but xLASCL cannot be used because of the vector increments and the round-off error has a negligible impact on orthogonalization.
		dscal( m1, 1.0 / norm, X1, strideX1, offsetX1 );
		dscal( m2, 1.0 / norm, X2, strideX2, offsetX2 );
		dorbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWORK, offsetWORK );

		// If the projection is nonzero, then return.
		if ( dnrm2( m1, X1, strideX1, offsetX1 ) !== 0.0 || dnrm2( m2, X2, strideX2, offsetX2 ) !== 0.0 ) {
			return 0;
		}
	}

	// Project each standard basis vector e_1, ..., e_M1 in turn, stopping when a nonzero projection is found.
	for ( i = 0; i < m1; i++ ) {
		zero( m1, X1, strideX1, offsetX1 );
		X1[ offsetX1 + ( i * strideX1 ) ] = 1.0;
		zero( m2, X2, strideX2, offsetX2 );
		dorbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWORK, offsetWORK );
		if ( dnrm2( m1, X1, strideX1, offsetX1 ) !== 0.0 || dnrm2( m2, X2, strideX2, offsetX2 ) !== 0.0 ) {
			return 0;
		}
	}

	// Project each standard basis vector e_(M1+1), ..., e_(M1+M2) in turn, stopping when a nonzero projection is found.
	for ( i = 0; i < m2; i++ ) {
		zero( m1, X1, strideX1, offsetX1 );
		zero( m2, X2, strideX2, offsetX2 );
		X2[ offsetX2 + ( i * strideX2 ) ] = 1.0;
		dorbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWORK, offsetWORK );
		if ( dnrm2( m1, X1, strideX1, offsetX1 ) !== 0.0 || dnrm2( m2, X2, strideX2, offsetX2 ) !== 0.0 ) {
			return 0;
		}
	}

	return 0;
}


// EXPORTS //

export default dorbdb5;
