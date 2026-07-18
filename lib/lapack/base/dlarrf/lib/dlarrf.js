/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Finds a new relatively robust representation (RRR) for a tridiagonal cluster.
*
* @param {NonNegativeInteger} N - order of the tridiagonal matrix
* @param {Float64Array} d - diagonal of the parent representation
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} l - subdiagonal of the unit bidiagonal factor
* @param {integer} strideL - stride length for `l`
* @param {Float64Array} ld - elementwise product L*D
* @param {integer} strideLD - stride length for `ld`
* @param {integer} clstrt - first index of the cluster (1-based)
* @param {integer} clend - last index of the cluster (1-based)
* @param {Float64Array} w - approximate eigenvalues of the parent
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} wgap - approximate gaps between eigenvalues
* @param {integer} strideWGAP - stride length for `wgap`
* @param {Float64Array} werr - errors in the approximate eigenvalues
* @param {integer} strideWERR - stride length for `werr`
* @param {number} spdiam - estimate of the spectral diameter
* @param {number} clgapl - left gap of the cluster
* @param {number} clgapr - right gap of the cluster
* @param {number} pivmin - minimum pivot allowed in the Sturm sequence
* @param {Float64Array} sigma - output (length 1): `sigma[0]` receives the chosen shift
* @param {Float64Array} dplus - output: diagonal of the new RRR
* @param {integer} strideDPLUS - stride length for `dplus`
* @param {Float64Array} lplus - output: subdiagonal of the new RRR
* @param {integer} strideLPLUS - stride length for `lplus`
* @param {Float64Array} work - workspace of length 2*N
* @param {integer} strideWork - stride length for `work`
* @throws {RangeError} `N` must be a nonnegative integer
* @returns {integer} info - status code (0 = success, 1 = no acceptable shift found)
*/
function dlarrf( N, d, strideD, l, strideL, ld, strideLD, clstrt, clend, w, strideW, wgap, strideWGAP, werr, strideWERR, spdiam, clgapl, clgapr, pivmin, sigma, dplus, strideDPLUS, lplus, strideLPLUS, work, strideWork ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const od = stride2offset( N, strideD );
	const ol = stride2offset( N, strideL );
	const oLD = stride2offset( N, strideLD );
	const ow = stride2offset( N, strideW );
	const oWGAP = stride2offset( N, strideWGAP );
	const oWERR = stride2offset( N, strideWERR );
	const oDPLUS = stride2offset( N, strideDPLUS );
	const oLPLUS = stride2offset( N, strideLPLUS );
	if ( work === null || work === void 0 ) {
		const minWork = Math.max( 1, 2 * N );
		work = new Float64Array( minWork );
		strideWork = 1;
	}
	const oWORK = stride2offset( 2 * N, strideWork );
	return base( N, d, strideD, od, l, strideL, ol, ld, strideLD, oLD, clstrt, clend, w, strideW, ow, wgap, strideWGAP, oWGAP, werr, strideWERR, oWERR, spdiam, clgapl, clgapr, pivmin, sigma, dplus, strideDPLUS, oDPLUS, lplus, strideLPLUS, oLPLUS, work, strideWork, oWORK );
}


// EXPORTS //

export default dlarrf;
