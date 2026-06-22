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
* Finds a new relatively robust representation (RRR) for a tridiagonal cluster.
*
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal of the parent representation
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} l - subdiagonal of the unit bidiagonal factor
* @param {integer} strideL - stride length for `l`
* @param {NonNegativeInteger} offsetL - starting index for `l`
* @param {Float64Array} ld - elementwise product L*D
* @param {integer} strideLD - stride length for `ld`
* @param {NonNegativeInteger} offsetLD - starting index for `ld`
* @param {integer} clstrt - first index of the cluster (1-based)
* @param {integer} clend - last index of the cluster (1-based)
* @param {Float64Array} w - approximate eigenvalues of the parent
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {Float64Array} wgap - approximate gaps between eigenvalues
* @param {integer} strideWGAP - stride length for `wgap`
* @param {NonNegativeInteger} offsetWGAP - starting index for `wgap`
* @param {Float64Array} werr - errors in the approximate eigenvalues
* @param {integer} strideWERR - stride length for `werr`
* @param {NonNegativeInteger} offsetWERR - starting index for `werr`
* @param {number} spdiam - estimate of the spectral diameter
* @param {number} clgapl - left gap of the cluster
* @param {number} clgapr - right gap of the cluster
* @param {number} pivmin - minimum pivot allowed in the Sturm sequence
* @param {Float64Array} sigma - output (length 1): `sigma[0]` receives the chosen shift
* @param {Float64Array} dplus - output: diagonal of the new RRR
* @param {integer} strideDPLUS - stride length for `dplus`
* @param {NonNegativeInteger} offsetDPLUS - starting index for `dplus`
* @param {Float64Array} lplus - output: subdiagonal of the new RRR
* @param {integer} strideLPLUS - stride length for `lplus`
* @param {NonNegativeInteger} offsetLPLUS - starting index for `lplus`
* @param {Float64Array} work - workspace of length 2*N
* @param {integer} strideWORK - stride length for `work`
* @param {NonNegativeInteger} offsetWORK - starting index for `work`
* @returns {integer} info - status code (0 = success, 1 = no acceptable shift found)
*/
function dlarrf( N, d, strideD, offsetD, l, strideL, offsetL, ld, strideLD, offsetLD, clstrt, clend, w, strideW, offsetW, wgap, strideWGAP, offsetWGAP, werr, strideWERR, offsetWERR, spdiam, clgapl, clgapr, pivmin, sigma, dplus, strideDPLUS, offsetDPLUS, lplus, strideLPLUS, offsetLPLUS, work, strideWORK, offsetWORK ) {
	return base( N, d, strideD, offsetD, l, strideL, offsetL, ld, strideLD, offsetLD, clstrt, clend, w, strideW, offsetW, wgap, strideWGAP, offsetWGAP, werr, strideWERR, offsetWERR, spdiam, clgapl, clgapr, pivmin, sigma, dplus, strideDPLUS, offsetDPLUS, lplus, strideLPLUS, offsetLPLUS, work, strideWORK, offsetWORK );
}


// EXPORTS //

export default dlarrf;
