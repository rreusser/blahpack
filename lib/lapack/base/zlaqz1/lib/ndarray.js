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

/* eslint-disable max-len, max-params */

// MODULES //

import base from './base.js';


// MAIN //

/**
* Chases a 1-by-1 shift bulge in a complex matrix pencil `(A,B)` down a single position.
*
* @param {boolean} ilq - whether to update the matrix `Q`
* @param {boolean} ilz - whether to update the matrix `Z`
* @param {NonNegativeInteger} k - 0-based bulge position
* @param {NonNegativeInteger} istartm - 0-based start index for column updates
* @param {NonNegativeInteger} istopm - 0-based end index for column updates
* @param {NonNegativeInteger} ihi - 0-based upper index of the active submatrix
* @param {Complex128Array} A - input/output matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} B - input/output matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B` (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (in complex elements)
* @param {NonNegativeInteger} nq - order of the matrix `Q`
* @param {NonNegativeInteger} qstart - 0-based start index of the matrix `Q`
* @param {Complex128Array} Q - input/output matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q` (in complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (in complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (in complex elements)
* @param {NonNegativeInteger} nz - order of the matrix `Z`
* @param {NonNegativeInteger} zstart - 0-based start index of the matrix `Z`
* @param {Complex128Array} Z - input/output matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z` (in complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (in complex elements)
*/
function zlaqz1( ilq, ilz, k, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ ) {
	base( ilq, ilz, k, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ );
}


// EXPORTS //

export default zlaqz1;
