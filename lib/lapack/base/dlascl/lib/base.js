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

import dlamch from '../../dlamch/lib/base.js';


// MAIN //

/**
* Multiplies a real M-by-N matrix A by the real scalar CTO/CFROM, doing.
* the multiplication safely with respect to overflow and underflow via
* iterative scaling.
*
* TYPE specifies which matrix elements are accessed:
* 'G' - general full matrix
* 'L' - lower triangular
* 'U' - upper triangular
* 'H' - upper Hessenberg
* 'B' - lower half of symmetric band (kl+1 rows, N cols)
* 'Q' - upper half of symmetric band (ku+1 rows, N cols)
* 'Z' - band matrix (2*kl+ku+1 rows, N cols)
*
* @private
* @param {string} type - `'general'`, `'lower'`, `'upper'`, `'upper-hessenberg'`, `'lower-band'`, `'upper-band'`, or `'band'`
* @param {integer} kl - lower bandwidth (for banded types)
* @param {integer} ku - upper bandwidth (for banded types)
* @param {number} cfrom - scale denominator (must be nonzero)
* @param {number} cto - scale numerator
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Float64Array} A - matrix
* @param {integer} strideA1 - first dimension stride
* @param {integer} strideA2 - second dimension stride
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {integer} 0 on success
*/
function dlascl( type, kl, ku, cfrom, cto, M, N, A, strideA1, strideA2, offsetA ) {
	var smlnum;
	var bignum;
	var cfromc;
	var cfrom1;
	var itype;
	var ctoc;
	var cto1;
	var done;
	var iMax;
	var iMin;
	var mul;
	var k1;
	var k2;
	var k3;
	var k4;
	var ai;
	var i;
	var j;

	// Determine itype
	if ( type === 'general' ) {
		itype = 0;
	} else if ( type === 'lower' ) {
		itype = 1;
	} else if ( type === 'upper' ) {
		itype = 2;
	} else if ( type === 'upper-hessenberg' ) {
		itype = 3;
	} else if ( type === 'lower-band' ) {
		itype = 4;
	} else if ( type === 'upper-band' ) {
		itype = 5;
	} else if ( type === 'band' ) {
		itype = 6;
	} else {
		return -1;
	}

	// Quick return
	if ( N === 0 || M === 0 ) {
		return 0;
	}

	// Get machine parameters
	smlnum = dlamch( 'safe-minimum' );
	bignum = 1.0 / smlnum;

	cfromc = cfrom;
	ctoc = cto;

	// Iterative scaling loop (while-loop pattern from GO TO 10)
	done = false;
	while ( !done ) {
		cfrom1 = cfromc * smlnum;
		if ( cfrom1 === cfromc ) {
			// cfromc is an inf
			mul = ctoc / cfromc;
			done = true;
		} else {
			cto1 = ctoc / bignum;
			if ( cto1 === ctoc ) {
				// ctoc is either 0 or an inf
				mul = ctoc;
				done = true;
				cfromc = 1.0;
			} else if ( Math.abs( cfrom1 ) > Math.abs( ctoc ) && ctoc !== 0.0 ) {
				mul = smlnum;
				done = false;
				cfromc = cfrom1;
			} else if ( Math.abs( cto1 ) > Math.abs( cfromc ) ) {
				mul = bignum;
				done = false;
				ctoc = cto1;
			} else {
				mul = ctoc / cfromc;
				done = true;
				if ( mul === 1.0 ) {
					return 0;
				}
			}
		}

		if ( itype === 0 ) {
			// Full matrix
			for ( j = 0; j < N; j++ ) {
				for ( i = 0; i < M; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		} else if ( itype === 1 ) {
			// Lower triangular
			for ( j = 0; j < N; j++ ) {
				for ( i = j; i < M; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		} else if ( itype === 2 ) {
			// Upper triangular
			for ( j = 0; j < N; j++ ) {
				iMax = Math.min( j + 1, M );
				for ( i = 0; i < iMax; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		} else if ( itype === 3 ) {
			// Upper Hessenberg
			for ( j = 0; j < N; j++ ) {
				iMax = Math.min( j + 2, M );
				for ( i = 0; i < iMax; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		} else if ( itype === 4 ) {
			// Lower half of a symmetric band matrix
			k3 = kl + 1;
			k4 = N + 1;
			for ( j = 0; j < N; j++ ) {
				iMax = Math.min( k3, k4 - j - 1 );
				for ( i = 0; i < iMax; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		} else if ( itype === 5 ) {
			// Upper half of a symmetric band matrix
			k1 = ku + 2;
			k3 = ku + 1;
			for ( j = 0; j < N; j++ ) {
				iMin = Math.max( k1 - j - 2, 0 );
				for ( i = iMin; i < k3; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		} else if ( itype === 6 ) {
			// Band matrix
			k1 = kl + ku + 2;
			k2 = kl + 1;
			k3 = (2 * kl) + ku + 1;
			k4 = kl + ku + 1 + M;
			for ( j = 0; j < N; j++ ) {
				iMin = Math.max( k1 - j - 2, k2 - 1 );
				iMax = Math.min( k3, k4 - j - 1 );
				for ( i = iMin; i < iMax; i++ ) {
					ai = offsetA + (i * strideA1) + (j * strideA2);
					A[ ai ] *= mul;
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dlascl;
