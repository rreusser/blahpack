/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import abs from '@stdlib/math/base/special/abs/lib/index.js';


// VARIABLES //

var GAM = 4096.0;
var GAMSQ = 16777216.0;
var RGAMSQ = 5.9604645e-8;


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
* @param {Float64Array} D - two-element array containing `[dd1, dd2]`
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} x1 - one-element array containing `dx1`
* @param {integer} strideX1 - stride length for `x1`
* @param {NonNegativeInteger} offsetX1 - starting index for `x1`
* @param {number} dy1 - scalar value `dy1`
* @param {Float64Array} param - five-element output array for the rotation parameters
* @param {integer} strideParam - stride length for `param`
* @param {NonNegativeInteger} offsetParam - starting index for `param`
* @returns {void}
*/
function drotmg( D, strideD, offsetD, x1, strideX1, offsetX1, dy1, param, strideParam, offsetParam ) {
	var dflag;
	var dtemp;
	var dh11;
	var dh12;
	var dh21;
	var dh22;
	var dd1;
	var dd2;
	var dx1;
	var dp1;
	var dp2;
	var dq1;
	var dq2;
	var du;

	dd1 = D[ offsetD ];
	dd2 = D[ offsetD + strideD ];
	dx1 = x1[ offsetX1 ];

	if ( dd1 < 0.0 ) {
		// Zero H, D, and DX1...
		dflag = -1.0;
		dh11 = 0.0;
		dh12 = 0.0;
		dh21 = 0.0;
		dh22 = 0.0;

		dd1 = 0.0;
		dd2 = 0.0;
		dx1 = 0.0;
	} else {
		// Case dd1 non-negative...
		dp2 = dd2 * dy1;
		if ( dp2 === 0.0 ) {
			dflag = -2.0;
			param[ offsetParam ] = dflag;
			return;
		}

		// Regular case...
		dp1 = dd1 * dx1;
		dq2 = dp2 * dy1;
		dq1 = dp1 * dx1;

		if ( abs( dq1 ) > abs( dq2 ) ) {
			dh21 = -dy1 / dx1;
			dh12 = dp2 / dp1;

			du = 1.0 - ( dh12 * dh21 );

			if ( du > 0.0 ) {
				dflag = 0.0;
				dd1 /= du;
				dd2 /= du;
				dx1 *= du;
			} else {
				// Safety path for rounding errors (see DOI: 10.1145/355841.355847)...
				dflag = -1.0;
				dh11 = 0.0;
				dh12 = 0.0;
				dh21 = 0.0;
				dh22 = 0.0;

				dd1 = 0.0;
				dd2 = 0.0;
				dx1 = 0.0;
			}
		} else if ( dq2 < 0.0 ) {
			// Zero H, D, and DX1...
			dflag = -1.0;
			dh11 = 0.0;
			dh12 = 0.0;
			dh21 = 0.0;
			dh22 = 0.0;

			dd1 = 0.0;
			dd2 = 0.0;
			dx1 = 0.0;
		} else {
			dflag = 1.0;
			dh11 = dp1 / dp2;
			dh22 = dx1 / dy1;
			du = 1.0 + ( dh11 * dh22 );
			dtemp = dd2 / du;
			dd2 = dd1 / du;
			dd1 = dtemp;
			dx1 = dy1 * du;
		}

		// Scale-check procedure for dd1...
		if ( dd1 !== 0.0 ) {
			while ( ( dd1 <= RGAMSQ ) || ( dd1 >= GAMSQ ) ) {
				if ( dflag === 0.0 ) {
					dh11 = 1.0;
					dh22 = 1.0;
					dflag = -1.0;
				} else {
					dh21 = -1.0;
					dh12 = 1.0;
					dflag = -1.0;
				}
				if ( dd1 <= RGAMSQ ) {
					dd1 *= GAM * GAM;
					dx1 /= GAM;
					dh11 /= GAM;
					dh12 /= GAM;
				} else {
					dd1 /= GAM * GAM;
					dx1 *= GAM;
					dh11 *= GAM;
					dh12 *= GAM;
				}
			}
		}

		// Scale-check procedure for dd2...
		if ( dd2 !== 0.0 ) {
			while ( ( abs( dd2 ) <= RGAMSQ ) || ( abs( dd2 ) >= GAMSQ ) ) {
				if ( dflag === 0.0 ) {
					dh11 = 1.0;
					dh22 = 1.0;
					dflag = -1.0;
				} else {
					dh21 = -1.0;
					dh12 = 1.0;
					dflag = -1.0;
				}
				if ( abs( dd2 ) <= RGAMSQ ) {
					dd2 *= GAM * GAM;
					dh21 /= GAM;
					dh22 /= GAM;
				} else {
					dd2 /= GAM * GAM;
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
	D[ offsetD ] = dd1;
	D[ offsetD + strideD ] = dd2;
	x1[ offsetX1 ] = dx1;
}


// EXPORTS //

export default drotmg;
