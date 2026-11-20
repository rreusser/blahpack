/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a single small-bulge multi-shift QR sweep on an upper Hessenberg.
* matrix, chasing a chain of bulges from left to right. Called by dlaqr0.
*
* @param {boolean} wantt - whether the quasi-triangular Schur factor is being computed
* @param {boolean} wantz - whether the orthogonal Schur factor is being computed
* @param {integer} kacc22 - computation mode (0, 1, or 2) for far-from-diagonal updates
* @param {NonNegativeInteger} N - order of the Hessenberg matrix H
* @param {integer} ktop - 0-based index of first row/col of active block
* @param {integer} kbot - 0-based index of last row/col of active block
* @param {NonNegativeInteger} nshfts - number of shifts (must be positive and even)
* @param {Float64Array} SR - real parts of shifts, length nshfts
* @param {integer} strideSR - stride for SR
* @param {NonNegativeInteger} offsetSR - offset for SR
* @param {Float64Array} SI - imaginary parts of shifts, length nshfts
* @param {integer} strideSI - stride for SI
* @param {NonNegativeInteger} offsetSI - offset for SI
* @param {Float64Array} H - Hessenberg matrix (N-by-N), modified in-place
* @param {integer} strideH1 - row stride for H
* @param {integer} strideH2 - column stride for H
* @param {NonNegativeInteger} offsetH - offset for H
* @param {integer} iloz - 0-based first row of Z to update
* @param {NonNegativeInteger} ihiz - 0-based last row of Z to update
* @param {Float64Array} Z - orthogonal matrix, updated if wantz
* @param {integer} strideZ1 - row stride for Z
* @param {integer} strideZ2 - column stride for Z
* @param {NonNegativeInteger} offsetZ - offset for Z
* @param {Float64Array} V - scratch matrix for reflectors (3-by-nshfts/2)
* @param {integer} strideV1 - row stride for V
* @param {integer} strideV2 - column stride for V
* @param {NonNegativeInteger} offsetV - offset for V
* @param {Float64Array} U - scratch matrix for accumulated reflections
* @param {integer} strideU1 - row stride for U
* @param {integer} strideU2 - column stride for U
* @param {NonNegativeInteger} offsetU - offset for U
* @param {integer} nv - number of rows available in WV
* @param {Float64Array} WV - workspace matrix
* @param {integer} strideWV1 - row stride for WV
* @param {integer} strideWV2 - column stride for WV
* @param {NonNegativeInteger} offsetWV - offset for WV
* @param {NonNegativeInteger} nh - number of columns available in WH
* @param {Float64Array} WH - workspace matrix
* @param {integer} strideWH1 - row stride for WH
* @param {integer} strideWH2 - column stride for WH
* @param {NonNegativeInteger} offsetWH - offset for WH
* @returns {Float64Array} `WH`
*/
function dlaqr5( wantt, wantz, kacc22, N, ktop, kbot, nshfts, SR, strideSR, offsetSR, SI, strideSI, offsetSI, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( wantt, wantz, kacc22, N, ktop, kbot, nshfts, SR, strideSR, offsetSR, SI, strideSI, offsetSI, H, strideH1, strideH2, offsetH, iloz, ihiz, Z, strideZ1, strideZ2, offsetZ, V, strideV1, strideV2, offsetV, U, strideU1, strideU2, offsetU, nv, WV, strideWV1, strideWV2, offsetWV, nh, WH, strideWH1, strideWH2, offsetWH ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqr5;
