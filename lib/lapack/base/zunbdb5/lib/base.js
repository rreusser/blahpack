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

/* eslint-disable max-params, max-len */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import EPS from '@stdlib/constants/float64/eps/lib/index.js';
import zlassq from './../../zlassq/lib/base.js';
import dznrm2 from './../../../../blas/base/dznrm2/lib/base.js';
import zscal from './../../../../blas/base/zscal/lib/base.js';
import zunbdb6 from './../../zunbdb6/lib/base.js';


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


// MAIN //

/**
* Orthogonalizes the complex column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`, where the columns of `Q` are assumed to be orthonormal.
*
* If the projection is zero according to Kahan's "twice is enough" criterion, then some other vector from the orthogonal complement is returned. The chosen vector is one of the standard basis vectors `e_1, ..., e_(m1+m2)` (searched in order, X1 partition first), making the choice deterministic but otherwise arbitrary.
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
function zunbdb5( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork ) {
	var scale;
	var norm;
	var X1v;
	var X2v;
	var sx1;
	var sx2;
	var ox1;
	var ox2;
	var i;

	// Float64 views of the complex X arrays for cheap zeroing and unit-basis writes.
	X1v = reinterpret( X1, 0 );
	X2v = reinterpret( X2, 0 );

	// Cache double-based strides/offsets for the Float64 views.
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	ox1 = offsetX1 * 2;
	ox2 = offsetX2 * 2;

	// Project X onto the orthogonal complement of Q if X is sufficiently nonzero.
	norm = norm2( m1, X1, strideX1, offsetX1, m2, X2, strideX2, offsetX2 );

	if ( norm > N * EPS ) {
		// Scale vector to unit norm to avoid problems in the caller code. Computing the reciprocal is undesirable, but xLASCL cannot be used because of the vector increments and the round-off error has a negligible impact on orthogonalization.
		scale = new Complex128( 1.0 / norm, 0.0 );
		zscal( m1, scale, X1, strideX1, offsetX1 );
		zscal( m2, scale, X2, strideX2, offsetX2 );
		zunbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork );

		// If the projection is nonzero, then return.
		if ( dznrm2( m1, X1, strideX1, offsetX1 ) !== 0.0 || dznrm2( m2, X2, strideX2, offsetX2 ) !== 0.0 ) {
			return 0;
		}
	}

	// Project each standard basis vector e_1, ..., e_M1 in turn, stopping when a nonzero projection is found.
	for ( i = 0; i < m1; i++ ) {
		zero( m1, X1v, sx1, ox1 );
		X1v[ ox1 + ( i * sx1 ) ] = 1.0;
		X1v[ ox1 + ( i * sx1 ) + 1 ] = 0.0;
		zero( m2, X2v, sx2, ox2 );
		zunbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork );
		if ( dznrm2( m1, X1, strideX1, offsetX1 ) !== 0.0 || dznrm2( m2, X2, strideX2, offsetX2 ) !== 0.0 ) {
			return 0;
		}
	}

	// Project each standard basis vector e_(M1+1), ..., e_(M1+M2) in turn, stopping when a nonzero projection is found.
	for ( i = 0; i < m2; i++ ) {
		zero( m1, X1v, sx1, ox1 );
		zero( m2, X2v, sx2, ox2 );
		X2v[ ox2 + ( i * sx2 ) ] = 1.0;
		X2v[ ox2 + ( i * sx2 ) + 1 ] = 0.0;
		zunbdb6( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWork, offsetWork );
		if ( dznrm2( m1, X1, strideX1, offsetX1 ) !== 0.0 || dznrm2( m2, X2, strideX2, offsetX2 ) !== 0.0 ) {
			return 0;
		}
	}

	return 0;
}


// EXPORTS //

export default zunbdb5;
