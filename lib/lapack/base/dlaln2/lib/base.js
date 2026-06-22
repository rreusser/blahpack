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

/* eslint-disable max-len, max-params, no-var */

// MODULES //

import dladiv from '../../dladiv/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;

// Machine constants (hoisted to module scope for performance)
var SMLNUM = TWO * dlamch( 'safe-minimum' );
var BIGNUM = ONE / SMLNUM;

// Lookup tables from Fortran DATA statements

// ZSWAP: whether to swap output rows after pivoting
var ZSWAP = [ false, false, true, true ];

// RSWAP: whether to swap RHS rows
var RSWAP = [ false, true, false, true ];

// IPIVOT(4,4) stored column-major (0-based indices)

// Fortran 1-based: 1,2,3,4 / 2,1,4,3 / 3,4,1,2 / 4,3,2,1

// JS 0-based:      0,1,2,3 / 1,0,3,2 / 2,3,0,1 / 3,2,1,0
var IPIVOT = [
	0,
	1,
	2,
	3,
	1,
	0,
	3,
	2,
	2,
	3,
	0,
	1,
	3,
	2,
	1,
	0
];

// Scratch array for dladiv output
var DIVOUT = new Float64Array( 2 );


// MAIN //

/**
* Solves a 1-by-1 or 2-by-2 linear system of the form:.
*
*   (ca_A    - w_D) _ X = scale _ B  (if ltrans = false)
*   (ca_A__T - w_D) _ X = scale _ B  (if ltrans = true)
*
* where A is NA-by-NA (NA = 1 or 2), w = (wr, wi), D is an NA-by-NA
* diagonal matrix, and scale is chosen (0 < scale <= 1) to prevent overflow.
*
* @private
* @param {boolean} ltrans - if true, solve transposed system
* @param {integer} na - order of A (1 or 2)
* @param {integer} nw - 1 for real, 2 for complex system
* @param {number} smin - lower bound on singular values; clamped to machine threshold
* @param {number} ca - scalar multiplier for A
* @param {Float64Array} A - matrix A
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {number} d1 - D(1,1) diagonal element
* @param {number} d2 - D(2,2) diagonal element
* @param {Float64Array} B - right-hand side matrix
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {number} wr - real part of the scalar w
* @param {number} wi - imaginary part of the scalar w
* @param {Float64Array} X - output matrix (solution)
* @param {integer} strideX1 - first dimension stride of X
* @param {integer} strideX2 - second dimension stride of X
* @param {NonNegativeInteger} offsetX - starting index for X
* @returns {Object} result with properties: info (0=exact, 1=perturbed), scale, xnorm
*/
function dlaln2( ltrans, na, nw, smin, ca, A, strideA1, strideA2, offsetA, d1, d2, B, strideB1, strideB2, offsetB, wr, wi, X, strideX1, strideX2, offsetX ) {
	var u22abs;
	var ur11r;
	var ui11r;
	var scale;
	var xnorm;
	var smini;
	var icmax;
	var cnorm;
	var bnorm;
	var ur12s;
	var ui12s;
	var info;
	var temp;
	var bbnd;
	var cmax;
	var ur11;
	var ur12;
	var ur22;
	var ui11;
	var ui12;
	var ui22;
	var cr21;
	var cr22;
	var ci21;
	var ci22;
	var lr21;
	var li21;
	var br1;
	var br2;
	var bi1;
	var bi2;
	var xr1;
	var xr2;
	var xi1;
	var xi2;
	var csr;
	var csi;
	var cr;
	var ci;
	var j;

	smini = Math.max( smin, SMLNUM );
	info = 0;
	scale = ONE;

	if ( na === 1 ) {
		// 1x1 system

		if ( nw === 1 ) {
			// Real 1x1: (ca*A(1,1) - wr*d1) * x = scale * b
			csr = ca * A[ offsetA ] - wr * d1;
			cnorm = Math.abs( csr );

			if ( cnorm < smini ) {
				csr = smini;
				cnorm = smini;
				info = 1;
			}

			bnorm = Math.abs( B[ offsetB ] );
			if ( cnorm < ONE && bnorm > ONE ) {
				if ( bnorm > BIGNUM * cnorm ) {
					scale = ONE / bnorm;
				}
			}

			X[ offsetX ] = ( B[ offsetB ] * scale ) / csr;
			xnorm = Math.abs( X[ offsetX ] );
		} else {
			// Complex 1x1: (ca*A(1,1) - (wr + i*wi)*d1) * x = scale * b
			csr = ca * A[ offsetA ] - wr * d1;
			csi = -wi * d1;
			cnorm = Math.abs( csr ) + Math.abs( csi );

			if ( cnorm < smini ) {
				csr = smini;
				csi = ZERO;
				cnorm = smini;
				info = 1;
			}

			bnorm = Math.abs( B[ offsetB ] ) + Math.abs( B[ offsetB + strideB2 ] );
			if ( cnorm < ONE && bnorm > ONE ) {
				if ( bnorm > BIGNUM * cnorm ) {
					scale = ONE / bnorm;
				}
			}

			dladiv( scale * B[ offsetB ], scale * B[ offsetB + strideB2 ], csr, csi, DIVOUT );
			X[ offsetX ] = DIVOUT[ 0 ];
			X[ offsetX + strideX2 ] = DIVOUT[ 1 ];
			xnorm = Math.abs( X[ offsetX ] ) + Math.abs( X[ offsetX + strideX2 ] );
		}
	} else {
		// 2x2 system

		// Build 2x2 coefficient matrix CR (real part), column-major: [cr11, cr21, cr12, cr22]
		cr = new Float64Array( 4 );
		cr[ 0 ] = ca * A[ offsetA ] - wr * d1;                              // CR(1,1)
		cr[ 3 ] = ca * A[ offsetA + strideA1 + strideA2 ] - wr * d2;        // CR(2,2)
		if ( ltrans ) {
			cr[ 2 ] = ca * A[ offsetA + strideA1 ];                          // CR(1,2) = ca*A(2,1)
			cr[ 1 ] = ca * A[ offsetA + strideA2 ];                          // CR(2,1) = ca*A(1,2)
		} else {
			cr[ 1 ] = ca * A[ offsetA + strideA1 ];                          // CR(2,1) = ca*A(2,1)
			cr[ 2 ] = ca * A[ offsetA + strideA2 ];                          // CR(1,2) = ca*A(1,2)
		}

		if ( nw === 1 ) {
			// Real 2x2 system

			cmax = ZERO;
			icmax = -1;

			for ( j = 0; j < 4; j++ ) {
				if ( Math.abs( cr[ j ] ) > cmax ) {
					cmax = Math.abs( cr[ j ] );
					icmax = j;
				}
			}

			// If all small, perturb and return
			if ( cmax < smini ) {
				bnorm = Math.max( Math.abs( B[ offsetB ] ), Math.abs( B[ offsetB + strideB1 ] ) );
				if ( smini < ONE && bnorm > ONE ) {
					if ( bnorm > BIGNUM * smini ) {
						scale = ONE / bnorm;
					}
				}
				temp = scale / smini;
				X[ offsetX ] = temp * B[ offsetB ];
				X[ offsetX + strideX1 ] = temp * B[ offsetB + strideB1 ];
				xnorm = temp * bnorm;
				info = 1;
				return {
					'info': info,
					'scale': scale,
					'xnorm': xnorm
				};
			}

			// Gaussian elimination with complete pivoting
			ur11 = cr[ icmax ];
			cr21 = cr[ IPIVOT[ 1 + icmax * 4 ] ];
			ur12 = cr[ IPIVOT[ 2 + icmax * 4 ] ];
			cr22 = cr[ IPIVOT[ 3 + icmax * 4 ] ];
			ur11r = ONE / ur11;
			lr21 = ur11r * cr21;
			ur22 = cr22 - ur12 * lr21;

			if ( Math.abs( ur22 ) < smini ) {
				ur22 = smini;
				info = 1;
			}
			if ( RSWAP[ icmax ] ) {
				br1 = B[ offsetB + strideB1 ];
				br2 = B[ offsetB ];
			} else {
				br1 = B[ offsetB ];
				br2 = B[ offsetB + strideB1 ];
			}
			br2 -= lr21 * br1;
			bbnd = Math.max( Math.abs( br1 * ( ur22 * ur11r ) ), Math.abs( br2 ) );
			if ( bbnd > ONE && Math.abs( ur22 ) < ONE ) {
				if ( bbnd >= BIGNUM * Math.abs( ur22 ) ) {
					scale = ONE / bbnd;
				}
			}

			xr2 = ( br2 * scale ) / ur22;
			xr1 = ( scale * br1 ) * ur11r - xr2 * ( ur11r * ur12 );
			if ( ZSWAP[ icmax ] ) {
				X[ offsetX ] = xr2;
				X[ offsetX + strideX1 ] = xr1;
			} else {
				X[ offsetX ] = xr1;
				X[ offsetX + strideX1 ] = xr2;
			}
			xnorm = Math.max( Math.abs( xr1 ), Math.abs( xr2 ) );

			// Further scaling if needed
			if ( xnorm > ONE && cmax > ONE ) {
				if ( xnorm > BIGNUM / cmax ) {
					temp = cmax / BIGNUM;
					X[ offsetX ] = temp * X[ offsetX ];
					X[ offsetX + strideX1 ] = temp * X[ offsetX + strideX1 ];
					xnorm = temp * xnorm;
					scale = temp * scale;
				}
			}
		} else {
			// Complex 2x2 system

			ci = new Float64Array( 4 );
			ci[ 0 ] = -wi * d1;   // CI(1,1)
			ci[ 1 ] = ZERO;       // CI(2,1)
			ci[ 2 ] = ZERO;       // CI(1,2)
			ci[ 3 ] = -wi * d2;   // CI(2,2)

			cmax = ZERO;
			icmax = -1;

			for ( j = 0; j < 4; j++ ) {
				if ( Math.abs( cr[ j ] ) + Math.abs( ci[ j ] ) > cmax ) {
					cmax = Math.abs( cr[ j ] ) + Math.abs( ci[ j ] );
					icmax = j;
				}
			}

			// If all small, perturb and return
			if ( cmax < smini ) {
				bnorm = Math.max(Math.abs( B[ offsetB ] ) + Math.abs( B[ offsetB + strideB2 ] ), Math.abs( B[ offsetB + strideB1 ] ) + Math.abs( B[ offsetB + strideB1 + strideB2 ] ));
				if ( smini < ONE && bnorm > ONE ) {
					if ( bnorm > BIGNUM * smini ) {
						scale = ONE / bnorm;
					}
				}
				temp = scale / smini;
				X[ offsetX ] = temp * B[ offsetB ];
				X[ offsetX + strideX1 ] = temp * B[ offsetB + strideB1 ];
				X[ offsetX + strideX2 ] = temp * B[ offsetB + strideB2 ];
				X[ offsetX + strideX1 + strideX2 ] = temp * B[ offsetB + strideB1 + strideB2 ];
				xnorm = temp * bnorm;
				info = 1;
				return {
					'info': info,
					'scale': scale,
					'xnorm': xnorm
				};
			}

			// Gaussian elimination with complete pivoting (complex)
			ur11 = cr[ icmax ];
			ui11 = ci[ icmax ];
			cr21 = cr[ IPIVOT[ 1 + icmax * 4 ] ];
			ci21 = ci[ IPIVOT[ 1 + icmax * 4 ] ];
			ur12 = cr[ IPIVOT[ 2 + icmax * 4 ] ];
			ui12 = ci[ IPIVOT[ 2 + icmax * 4 ] ];
			cr22 = cr[ IPIVOT[ 3 + icmax * 4 ] ];
			ci22 = ci[ IPIVOT[ 3 + icmax * 4 ] ];

			if ( icmax === 0 || icmax === 3 ) {
				// Off-diag of D is real
				if ( Math.abs( ur11 ) > Math.abs( ui11 ) ) {
					temp = ui11 / ur11;
					ur11r = ONE / ( ur11 * ( ONE + temp * temp ) );
					ui11r = -temp * ur11r;
				} else {
					temp = ur11 / ui11;
					ui11r = -ONE / ( ui11 * ( ONE + temp * temp ) );
					ur11r = -temp * ui11r;
				}
				lr21 = cr21 * ur11r;
				li21 = cr21 * ui11r;
				ur12s = ur12 * ur11r;
				ui12s = ur12 * ui11r;
				ur22 = cr22 - ur12 * lr21;
				ui22 = ci22 - ur12 * li21;
			} else {
				// Off-diag of D is pure imaginary
				ur11r = ONE / ur11;
				ui11r = ZERO;
				lr21 = cr21 * ur11r;
				li21 = ci21 * ur11r;
				ur12s = ur12 * ur11r;
				ui12s = ui12 * ur11r;
				ur22 = cr22 - ur12 * lr21 + ui12 * li21;
				ui22 = -ur12 * li21 - ui12 * lr21;
			}

			u22abs = Math.abs( ur22 ) + Math.abs( ui22 );

			if ( u22abs < smini ) {
				ur22 = smini;
				ui22 = ZERO;
				info = 1;
			}
			if ( RSWAP[ icmax ] ) {
				br2 = B[ offsetB ];
				br1 = B[ offsetB + strideB1 ];
				bi2 = B[ offsetB + strideB2 ];
				bi1 = B[ offsetB + strideB1 + strideB2 ];
			} else {
				br1 = B[ offsetB ];
				br2 = B[ offsetB + strideB1 ];
				bi1 = B[ offsetB + strideB2 ];
				bi2 = B[ offsetB + strideB1 + strideB2 ];
			}
			br2 = br2 - lr21 * br1 + li21 * bi1;
			bi2 = bi2 - li21 * br1 - lr21 * bi1;
			bbnd = Math.max(( Math.abs( br1 ) + Math.abs( bi1 ) ) * ( u22abs * ( Math.abs( ur11r ) + Math.abs( ui11r ) ) ), Math.abs( br2 ) + Math.abs( bi2 ));
			if ( bbnd > ONE && u22abs < ONE ) {
				if ( bbnd >= BIGNUM * u22abs ) {
					scale = ONE / bbnd;
					br1 = scale * br1;
					bi1 = scale * bi1;
					br2 = scale * br2;
					bi2 = scale * bi2;
				}
			}

			dladiv( br2, bi2, ur22, ui22, DIVOUT );
			xr2 = DIVOUT[ 0 ];
			xi2 = DIVOUT[ 1 ];
			xr1 = ur11r * br1 - ui11r * bi1 - ur12s * xr2 + ui12s * xi2;
			xi1 = ui11r * br1 + ur11r * bi1 - ui12s * xr2 - ur12s * xi2;
			if ( ZSWAP[ icmax ] ) {
				X[ offsetX ] = xr2;
				X[ offsetX + strideX1 ] = xr1;
				X[ offsetX + strideX2 ] = xi2;
				X[ offsetX + strideX1 + strideX2 ] = xi1;
			} else {
				X[ offsetX ] = xr1;
				X[ offsetX + strideX1 ] = xr2;
				X[ offsetX + strideX2 ] = xi1;
				X[ offsetX + strideX1 + strideX2 ] = xi2;
			}
			xnorm = Math.max( Math.abs( xr1 ) + Math.abs( xi1 ), Math.abs( xr2 ) + Math.abs( xi2 ) );

			// Further scaling if needed
			if ( xnorm > ONE && cmax > ONE ) {
				if ( xnorm > BIGNUM / cmax ) {
					temp = cmax / BIGNUM;
					X[ offsetX ] = temp * X[ offsetX ];
					X[ offsetX + strideX1 ] = temp * X[ offsetX + strideX1 ];
					X[ offsetX + strideX2 ] = temp * X[ offsetX + strideX2 ];
					X[ offsetX + strideX1 + strideX2 ] = temp * X[ offsetX + strideX1 + strideX2 ];
					xnorm = temp * xnorm;
					scale = temp * scale;
				}
			}
		}
	}

	return {
		'info': info,
		'scale': scale,
		'xnorm': xnorm
	};
}


// EXPORTS //

export default dlaln2;
