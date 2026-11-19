/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import abs from '@stdlib/math/base/special/abs/lib/index.js';


// VARIABLES //

const GAM = 4096.0;
const GAMSQ = 16777216.0;
const RGAMSQ = 5.9604645e-8;


// MAIN //

/**
* Constructs a modified Givens plane rotation.
*
* The routine constructs the modified Givens transformation matrix `H` which
* zeros the second component of the 2-vector
* `(sqrt(dd1)*dx1, sqrt(dd2)*dy1)^T`.
*
* With `DPARAM[0] = DFLAG`, `H` has one of the following forms:
*
* ```text
* DFLAG=-1:     DFLAG=0:      DFLAG=1:      DFLAG=-2:
*
* (DH11  DH12)  (1     DH12)  (DH11  1   )  (1  0)
* (DH21  DH22)  (DH21  1   )  (-1    DH22)  (0  1)
* ```
*
* Locations 1-4 of `DPARAM` contain `DH11`, `DH21`, `DH12`, and `DH22`
* respectively. Values implied by the value of `DPARAM[0]` are not stored.
*
* @private
* @param {Float64Array} dd1 - input/output (length-1 array): `dd1`
* @param {Float64Array} dd2 - input/output (length-1 array): `dd2`
* @param {Float64Array} dx1 - input/output (length-1 array): `dx1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @param {integer} strideParam - stride length for `param`
* @param {NonNegativeInteger} offsetParam - starting index for `param`
* @returns {Float64Array} `param`
*/
function drotmg( dd1, dd2, dx1, dy1, param, strideParam, offsetParam ) {
	let dflag, dtemp, dh11, dh12, dh21, dh22, dd1Local, dd2Local, dx1Local, dp1, dp2, dq1, dq2;
	let du;

	dd1Local = dd1[ 0 ];
	dd2Local = dd2[ 0 ];
	dx1Local = dx1[ 0 ];

	if ( dd1Local < 0.0 ) {
		// Zero H, D, and DX1...
		dflag = -1.0;
		dh11 = 0.0;
		dh12 = 0.0;
		dh21 = 0.0;
		dh22 = 0.0;

		dd1Local = 0.0;
		dd2Local = 0.0;
		dx1Local = 0.0;
	} else {
		// Case dd1 non-negative...
		dp2 = dd2Local * dy1;
		if ( dp2 === 0.0 ) {
			dflag = -2.0;
			param[ offsetParam ] = dflag;
			return;
		}

		// Regular case...
		dp1 = dd1Local * dx1Local;
		dq2 = dp2 * dy1;
		dq1 = dp1 * dx1Local;

		if ( abs( dq1 ) > abs( dq2 ) ) {
			dh21 = -dy1 / dx1Local;
			dh12 = dp2 / dp1;

			du = 1.0 - ( dh12 * dh21 );

			if ( du > 0.0 ) {
				dflag = 0.0;
				dd1Local /= du;
				dd2Local /= du;
				dx1Local *= du;
			} else {
				// Safety path for rounding errors (see DOI: 10.1145/355841.355847)...
				dflag = -1.0;
				dh11 = 0.0;
				dh12 = 0.0;
				dh21 = 0.0;
				dh22 = 0.0;

				dd1Local = 0.0;
				dd2Local = 0.0;
				dx1Local = 0.0;
			}
		} else if ( dq2 < 0.0 ) {
			// Zero H, D, and DX1...
			dflag = -1.0;
			dh11 = 0.0;
			dh12 = 0.0;
			dh21 = 0.0;
			dh22 = 0.0;

			dd1Local = 0.0;
			dd2Local = 0.0;
			dx1Local = 0.0;
		} else {
			dflag = 1.0;
			dh11 = dp1 / dp2;
			dh22 = dx1Local / dy1;
			du = 1.0 + ( dh11 * dh22 );
			dtemp = dd2Local / du;
			dd2Local = dd1Local / du;
			dd1Local = dtemp;
			dx1Local = dy1 * du;
		}

		// Scale-check procedure for dd1...
		if ( dd1Local !== 0.0 ) {
			while ( ( dd1Local <= RGAMSQ ) || ( dd1Local >= GAMSQ ) ) {
				if ( dflag === 0.0 ) {
					dh11 = 1.0;
					dh22 = 1.0;
					dflag = -1.0;
				} else {
					dh21 = -1.0;
					dh12 = 1.0;
					dflag = -1.0;
				}
				if ( dd1Local <= RGAMSQ ) {
					dd1Local *= GAM * GAM;
					dx1Local /= GAM;
					dh11 /= GAM;
					dh12 /= GAM;
				} else {
					dd1Local /= GAM * GAM;
					dx1Local *= GAM;
					dh11 *= GAM;
					dh12 *= GAM;
				}
			}
		}

		// Scale-check procedure for dd2...
		if ( dd2Local !== 0.0 ) {
			while ( ( abs( dd2Local ) <= RGAMSQ ) || ( abs( dd2Local ) >= GAMSQ ) ) {
				if ( dflag === 0.0 ) {
					dh11 = 1.0;
					dh22 = 1.0;
					dflag = -1.0;
				} else {
					dh21 = -1.0;
					dh12 = 1.0;
					dflag = -1.0;
				}
				if ( abs( dd2Local ) <= RGAMSQ ) {
					dd2Local *= GAM * GAM;
					dh21 /= GAM;
					dh22 /= GAM;
				} else {
					dd2Local /= GAM * GAM;
					dh21 *= GAM;
					dh22 *= GAM;
				}
			}
		}
	}

	if ( dflag < 0.0 ) {
		param[ offsetParam + strideParam ] = dh11;
		param[ offsetParam + ( 2 * strideParam ) ] = dh21;
		param[ offsetParam + ( 3 * strideParam ) ] = dh12;
		param[ offsetParam + ( 4 * strideParam ) ] = dh22;
	} else if ( dflag === 0.0 ) {
		param[ offsetParam + ( 2 * strideParam ) ] = dh21;
		param[ offsetParam + ( 3 * strideParam ) ] = dh12;
	} else {
		param[ offsetParam + strideParam ] = dh11;
		param[ offsetParam + ( 4 * strideParam ) ] = dh22;
	}

	param[ offsetParam ] = dflag;
	dd1[ 0 ] = dd1Local;
	dd2[ 0 ] = dd2Local;
	dx1[ 0 ] = dx1Local;
}


// EXPORTS //

export default drotmg;
