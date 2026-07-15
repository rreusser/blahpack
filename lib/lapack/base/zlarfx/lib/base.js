/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zlarf from '../../zlarf/lib/base.js';


// MAIN //

/**
* Applies an elementary reflector H to a complex M-by-N matrix C, from either the left or the right.
*
* H is represented in the form:
*
* `H = I - tau * v * v^H`
*
* where tau is a complex scalar and v is a complex vector.
*
* If tau = 0, then H is taken to be the unit matrix.
*
* This version uses inline code if H has order <= 10.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} v - the vector v in the reflector
* @param {integer} strideV - stride for v (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for v (in complex elements)
* @param {Complex128} tau - the complex scalar tau
* @param {Complex128Array} C - the M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C (complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - caller-owned workspace, referenced only by the general-order path (H order > 10); length N if side=`'left'`, length M if side=`'right'`
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @returns {void}
*/
function zlarfx( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	var tauArr;
	var sumR;
	var sumI;
	var tauR;
	var tauI;
	var viR;
	var viI;
	var tiR;
	var tiI;
	var sc1;
	var sc2;
	var cR;
	var cI;
	var cv;
	var vv;
	var sv;
	var ov;
	var oc;
	var vr;
	var tr;
	var ic;
	var j;
	var i;

	tauR = real( tau );
	tauI = imag( tau );

	// Quick return if tau = 0
	if ( tauR === 0.0 && tauI === 0.0 ) {
		return;
	}

	cv = reinterpret( C, 0 );
	vv = reinterpret( v, 0 );
	sv = strideV * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;
	ov = offsetV * 2;
	oc = offsetC * 2;

	if ( side === 'left' ) {
		// Form H * C, where H has order M.
		if ( M >= 1 && M <= 10 ) {
			// Inline application (order <= 10 uses no workspace). Reading `v`
			// directly avoids allocating temporaries; the conj(V(k)) and
			// tau*V(k) expressions reproduce the reference bit-for-bit.
			if ( M === 1 ) {
				// T1 = 1 - tau*v(1)*conj(v(1)); v(1)*conj(v(1)) = |v(1)|^2 (real).
				viR = vv[ ov ];
				viI = vv[ ov + 1 ];
				vr = ( viR * viR ) + ( viI * viI ); // |v(1)|^2
				tr = 1.0 - ( tauR * vr );
				tiR = -( tauI * vr );

				// C(1,j) = t1 * C(1,j) for each column.
				for ( j = 0; j < N; j += 1 ) {
					ic = oc + ( j * sc2 );
					cR = cv[ ic ];
					cI = cv[ ic + 1 ];
					cv[ ic ] = ( tr * cR ) - ( tiR * cI );
					cv[ ic + 1 ] = ( tr * cI ) + ( tiR * cR );
				}
				return;
			}
			// General unrolled case for M = 2..10.
			for ( j = 0; j < N; j += 1 ) {
				// SUM = sum_k conj(V(k)) * C(k,j)
				sumR = 0.0;
				sumI = 0.0;
				for ( i = 0; i < M; i += 1 ) {
					ic = oc + ( i * sc1 ) + ( j * sc2 );
					cR = cv[ ic ];
					cI = cv[ ic + 1 ];
					viR = vv[ ov + ( i * sv ) ];
					viI = -vv[ ov + ( i * sv ) + 1 ]; // conj(V(k))
					sumR += ( viR * cR ) - ( viI * cI );
					sumI += ( viR * cI ) + ( viI * cR );
				}

				// C(k,j) -= SUM * ( tau * V(k) )
				for ( i = 0; i < M; i += 1 ) {
					ic = oc + ( i * sc1 ) + ( j * sc2 );
					viR = vv[ ov + ( i * sv ) ];
					viI = vv[ ov + ( i * sv ) + 1 ];
					tiR = ( tauR * viR ) - ( tauI * viI ); // tau * V(k)
					tiI = ( tauR * viI ) + ( tauI * viR );
					cv[ ic ] -= ( sumR * tiR ) - ( sumI * tiI );
					cv[ ic + 1 ] -= ( sumR * tiI ) + ( sumI * tiR );
				}
			}
			return;
		}
		// Fallback to general zlarf (uses the caller-owned WORK, length N).
		tauArr = new Complex128Array( 1 );
		tauArr.set( [ tauR, tauI ], 0 );
		zlarf( 'left', M, N, v, strideV, offsetV, tauArr, 0, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
		return;
	}

	// Form C * H, where H has order N.
	if ( N >= 1 && N <= 10 ) {
		// Inline application (order <= 10 uses no workspace). Reading `v`
		// directly avoids allocating temporaries; the V(k) and tau*conj(V(k))
		// expressions reproduce the reference bit-for-bit.
		if ( N === 1 ) {
			// T1 = 1 - tau*v(1)*conj(v(1)); v(1)*conj(v(1)) = |v(1)|^2 (real).
			viR = vv[ ov ];
			viI = vv[ ov + 1 ];
			vr = ( viR * viR ) + ( viI * viI ); // |v(1)|^2
			tr = 1.0 - ( tauR * vr );
			tiR = -( tauI * vr );

			// C(j,1) = t1 * C(j,1) for each row.
			for ( j = 0; j < M; j += 1 ) {
				ic = oc + ( j * sc1 );
				cR = cv[ ic ];
				cI = cv[ ic + 1 ];
				cv[ ic ] = ( tr * cR ) - ( tiR * cI );
				cv[ ic + 1 ] = ( tr * cI ) + ( tiR * cR );
			}
			return;
		}
		// General unrolled case for N = 2..10.
		for ( j = 0; j < M; j += 1 ) {
			// SUM = sum_k V(k) * C(j,k)
			sumR = 0.0;
			sumI = 0.0;
			for ( i = 0; i < N; i += 1 ) {
				ic = oc + ( j * sc1 ) + ( i * sc2 );
				cR = cv[ ic ];
				cI = cv[ ic + 1 ];
				viR = vv[ ov + ( i * sv ) ];
				viI = vv[ ov + ( i * sv ) + 1 ]; // V(k)
				sumR += ( viR * cR ) - ( viI * cI );
				sumI += ( viR * cI ) + ( viI * cR );
			}

			// C(j,k) -= SUM * ( tau * conj(V(k)) )
			for ( i = 0; i < N; i += 1 ) {
				ic = oc + ( j * sc1 ) + ( i * sc2 );
				viR = vv[ ov + ( i * sv ) ];
				viI = vv[ ov + ( i * sv ) + 1 ];
				tiR = ( tauR * viR ) + ( tauI * viI ); // tau * conj(V(k))
				tiI = -( tauR * viI ) + ( tauI * viR );
				cv[ ic ] -= ( sumR * tiR ) - ( sumI * tiI );
				cv[ ic + 1 ] -= ( sumR * tiI ) + ( sumI * tiR );
			}
		}
		return;
	}
	// Fallback to general zlarf (uses the caller-owned WORK, length M).
	tauArr = new Complex128Array( 1 );
	tauArr.set( [ tauR, tauI ], 0 );
	zlarf( 'right', M, N, v, strideV, offsetV, tauArr, 0, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zlarfx;
