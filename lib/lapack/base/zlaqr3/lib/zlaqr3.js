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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs aggressive early deflation for the complex QR algorithm (recursive).
*
* @param {boolean} wantt - whether the full Schur form `T` is required
* @param {boolean} wantz - whether the matrix of Schur vectors `Z` is required
* @param {NonNegativeInteger} N - order of `H` and `Z`
* @param {integer} ktop - first index in the active block of `H`
* @param {integer} kbot - last index in the active block of `H`
* @param {integer} nw - deflation window size
* @param {Complex128Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {integer} iloz - first row of `Z` to which transformations are applied
* @param {integer} ihiz - last row of `Z` to which transformations are applied
* @param {Complex128Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {integer} ns - number of unconverged eigenvalues
* @param {integer} nd - number of deflated eigenvalues
* @param {Complex128Array} SH - approximate eigenvalues
* @param {integer} strideSH - stride length for `SH`
* @param {Complex128Array} V - workspace matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {integer} nhp - number of columns of `T` and `WV`
* @param {Complex128Array} T - workspace matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {integer} nvp - number of rows of `WV`
* @param {Complex128Array} WV - workspace matrix
* @param {PositiveInteger} LDWV - leading dimension of `WV`
* @param {Float64Array} WORK - real workspace array
* @param {integer} strideWORK - stride length for `WORK`
* @param {integer} lwork - length of `WORK`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} `{ ns, nd }`
*/
function zlaqr3( wantt, wantz, N, ktop, kbot, nw, H, LDH, iloz, ihiz, Z, LDZ, ns, nd, SH, strideSH, V, LDV, nhp, T, LDT, nvp, WV, LDWV, WORK, strideWORK, lwork ) {
	var owork;
	var swv1;
	var swv2;
	var osh;
	var sh1;
	var sh2;
	var st1;
	var st2;
	var sv1;
	var sv2;
	var sz1;
	var sz2;

	sh1 = 1;
	sh2 = LDH;
	sz1 = 1;
	sz2 = LDZ;
	sv1 = 1;
	sv2 = LDV;
	st1 = 1;
	st2 = LDT;
	swv1 = 1;
	swv2 = LDWV;
	osh = stride2offset( N, strideSH );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, LWORK );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( LDV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Eighteenth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDV ) );
	}
	if ( LDT < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument must be greater than or equal to max(1,nw). Value: `%d`.', LDT ) );
	}
	if ( LDWV < max( 1, nw ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fourth argument must be greater than or equal to max(1,nw). Value: `%d`.', LDWV ) );
	}
	return base( wantt, wantz, N, ktop, kbot, nw, H, sh1, sh2, 0, iloz, ihiz, Z, sz1, sz2, 0, ns, nd, SH, strideSH, osh, V, sv1, sv2, 0, nhp, T, st1, st2, 0, nvp, WV, swv1, swv2, 0, WORK, strideWORK, owork, lwork );
}


// EXPORTS //

export default zlaqr3;
