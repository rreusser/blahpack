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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ztrmv from '../../../../blas/base/ztrmv/lib/base.js';


// VARIABLES //

var ONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Form the triangular factor T of a complex block reflector H of order N.
* which is defined as a product of K elementary reflectors.
*
* If DIRECT = 'F', H = H(1) H(2) ... H(k) and T is upper triangular.
* If DIRECT = 'B', H = H(k) ... H(2) H(1) and T is lower triangular.
*
* Supports both STOREV='C' (columnwise) and STOREV='R' (rowwise).
*
* @private
* @param {string} direct - `'forward'` or `'backward'`
* @param {string} storev - `'columnwise'` or `'rowwise'`
* @param {NonNegativeInteger} N - order of the block reflector
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {Complex128Array} V - matrix of reflector vectors
* @param {integer} strideV1 - stride of first dim of V (complex elements)
* @param {integer} strideV2 - stride of second dim of V (complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} TAU - array of scalar factors
* @param {integer} strideTAU - stride for TAU (in complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (in complex elements)
* @param {Complex128Array} T - output triangular matrix
* @param {integer} strideT1 - stride of first dim of T (complex elements)
* @param {integer} strideT2 - stride of second dim of T (complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
*/
function zlarft( direct, storev, N, K, V, strideV1, strideV2, offsetV, TAU, strideTAU, offsetTAU, T, strideT1, strideT2, offsetT ) {
	var prevlastv;
	var negTauCx;
	var negTauI;
	var negTauR;
	var negTau;
	var lastv;
	var tauR;
	var tauI;
	var TAUv;
	var stau;
	var oTAU;
	var sv1;
	var sv2;
	var st1;
	var st2;
	var Vv;
	var Tv;
	var vr;
	var vi;
	var oV;
	var oT;
	var it;
	var iv;
	var jj;
	var i;
	var j;

	if ( N === 0 ) {
		return;
	}

	// Get Float64 views for element access
	Vv = reinterpret( V, 0 );
	TAUv = reinterpret( TAU, 0 );
	Tv = reinterpret( T, 0 );

	// Convert strides and offsets to Float64 units
	sv1 = strideV1 * 2;
	sv2 = strideV2 * 2;
	st1 = strideT1 * 2;
	st2 = strideT2 * 2;
	stau = strideTAU * 2;
	oV = offsetV * 2;
	oTAU = offsetTAU * 2;
	oT = offsetT * 2;

	if ( ( direct === 'forward' ) ) {
		prevlastv = N;
		for ( i = 0; i < K; i++ ) {
			prevlastv = Math.max( prevlastv, i );
			tauR = TAUv[ oTAU + (i * stau) ];
			tauI = TAUv[ oTAU + (i * stau) + 1 ];

			if ( tauR === 0.0 && tauI === 0.0 ) {
				// H(i) = I: set T(:,i) column to zero
				for ( j = 0; j <= i; j++ ) {
					it = oT + (j * st1) + (i * st2);
					Tv[ it ] = 0.0;
					Tv[ it + 1 ] = 0.0;
				}
			} else {
				// General case for columnwise storage
				if ( storev === 'columnwise' ) {
					// Skip trailing zeros in V(:,i)
					lastv = N;
					for ( jj = N - 1; jj > i; jj-- ) {
						iv = oV + (jj * sv1) + (i * sv2);
						if ( Vv[ iv ] !== 0.0 || Vv[ iv + 1 ] !== 0.0 ) {
							break;
						}
						lastv = jj;
					}

					// T(0:i-1, i) = -tau(i) * conj(V(i, 0:i-1))
					negTauR = -tauR;
					negTauI = -tauI;
					for ( j = 0; j < i; j++ ) {
						iv = oV + (i * sv1) + (j * sv2);
						vr = Vv[ iv ];
						vi = -Vv[ iv + 1 ]; // conjugate

						// -tau * conj(V(i,j))
						it = oT + (j * st1) + (i * st2);
						Tv[ it ] = (negTauR * vr) - (negTauI * vi);
						Tv[ it + 1 ] = (negTauR * vi) + (negTauI * vr);
					}
					jj = Math.min( lastv, prevlastv );

					// T(0:i-1, i) += -tau(i) * V(i+1:jj-1, 0:i-1)^H * V(i+1:jj-1, i)
					if ( jj - i - 1 > 0 ) {
						negTau = new Complex128( negTauR, negTauI );
						zgemv( 'conjugate-transpose', jj - i - 1, i, negTau,
							V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV1),
							V, strideV1, offsetV + (( i + 1 ) * strideV1) + (i * strideV2),
							ONE,
							T, strideT1, offsetT + (i * strideT2) );
					}
				} else {
					// Row-wise storage: V(i,:) holds reflector i
					// Skip trailing zeros in V(i,:)
					lastv = N;
					for ( jj = N - 1; jj > i; jj-- ) {
						iv = oV + (i * sv1) + (jj * sv2);
						if ( Vv[ iv ] !== 0.0 || Vv[ iv + 1 ] !== 0.0 ) {
							break;
						}
						lastv = jj;
					}

					// T(0:i-1, i) = -tau(i) * V(0:i-1, i)  (no conjugate for rowwise)
					negTauR = -tauR;
					negTauI = -tauI;
					for ( j = 0; j < i; j++ ) {
						iv = oV + (j * sv1) + (i * sv2);
						vr = Vv[ iv ];
						vi = Vv[ iv + 1 ];
						it = oT + (j * st1) + (i * st2);
						Tv[ it ] = (negTauR * vr) - (negTauI * vi);
						Tv[ it + 1 ] = (negTauR * vi) + (negTauI * vr);
					}
					jj = Math.min( lastv, prevlastv );

					// T(0:i-1, i) += -tau(i) * V(0:i-1, i+1:jj-1) * V(i, i+1:jj-1)^H
					if ( jj - i - 1 > 0 ) {
						negTauCx = new Complex128( negTauR, negTauI );
						zgemm( 'no-transpose', 'conjugate-transpose', i, 1, jj - i - 1, negTauCx,
							V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV2),
							V, strideV1, strideV2, offsetV + (i * strideV1) + (( i + 1 ) * strideV2),
							ONE, T, strideT1, strideT2, offsetT + (i * strideT2) );
					}
				}

				// T(0:i-1, i) := T(0:i-1, 0:i-1) * T(0:i-1, i)
				if ( i > 0 ) {
					ztrmv( 'upper', 'no-transpose', 'non-unit', i, T, strideT1, strideT2, offsetT,
						T, strideT1, offsetT + (i * strideT2) );
				}
				// T(i, i) = tau(i)
				it = oT + (i * st1) + (i * st2);
				Tv[ it ] = tauR;
				Tv[ it + 1 ] = tauI;

				if ( i > 0 ) {
					prevlastv = Math.max( prevlastv, lastv );
				} else {
					prevlastv = lastv;
				}
			}
		}
	} else {
		// Backward: T is lower triangular
		prevlastv = 0;
		for ( i = K - 1; i >= 0; i-- ) {
			tauR = TAUv[ oTAU + (i * stau) ];
			tauI = TAUv[ oTAU + (i * stau) + 1 ];

			if ( tauR === 0.0 && tauI === 0.0 ) {
				// H(i) = I
				for ( j = i; j < K; j++ ) {
					it = oT + (j * st1) + (i * st2);
					Tv[ it ] = 0.0;
					Tv[ it + 1 ] = 0.0;
				}
			} else {
				if ( i < K - 1 ) {
					if ( storev === 'columnwise' ) {
						// Skip leading zeros in V(:,i)
						lastv = 0;
						for ( jj = 0; jj < i; jj++ ) {
							iv = oV + (jj * sv1) + (i * sv2);
							if ( Vv[ iv ] !== 0.0 || Vv[ iv + 1 ] !== 0.0 ) {
								break;
							}
							lastv = jj + 1;
						}

						// T(i+1:K-1, i) = -tau(i) * conj(V(N-K+i, i+1:K-1))
						negTauR = -tauR;
						negTauI = -tauI;
						for ( j = i + 1; j < K; j++ ) {
							iv = oV + (( N - K + i ) * sv1) + (j * sv2);
							vr = Vv[ iv ];
							vi = -Vv[ iv + 1 ]; // conjugate
							it = oT + (j * st1) + (i * st2);
							Tv[ it ] = (negTauR * vr) - (negTauI * vi);
							Tv[ it + 1 ] = (negTauR * vi) + (negTauI * vr);
						}
						jj = Math.max( lastv, prevlastv );

						// T(i+1:K-1, i) += -tau(i) * V(jj:N-K+i-1, i+1:K-1)^H * V(jj:N-K+i-1, i)
						if ( N - K + i - jj > 0 ) {
							negTauCx = new Complex128( negTauR, negTauI );
							zgemv( 'conjugate-transpose', N - K + i - jj, K - i - 1, negTauCx,
								V, strideV1, strideV2, offsetV + (jj * strideV1) + (( i + 1 ) * strideV2),
								V, strideV1, offsetV + (jj * strideV1) + (i * strideV2),
								ONE,
								T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2) );
						}
					} else {
						// Row-wise storage: V(i,:) holds reflector i
						// Skip leading zeros in V(i,:)
						lastv = 0;
						for ( jj = 0; jj < i; jj++ ) {
							iv = oV + (i * sv1) + (jj * sv2);
							if ( Vv[ iv ] !== 0.0 || Vv[ iv + 1 ] !== 0.0 ) {
								break;
							}
							lastv = jj + 1;
						}

						// T(i+1:K-1, i) = -tau(i) * V(i+1:K-1, N-K+i) (no conjugate)
						negTauR = -tauR;
						negTauI = -tauI;
						for ( j = i + 1; j < K; j++ ) {
							iv = oV + (j * sv1) + (( N - K + i ) * sv2);
							vr = Vv[ iv ];
							vi = Vv[ iv + 1 ];
							it = oT + (j * st1) + (i * st2);
							Tv[ it ] = (negTauR * vr) - (negTauI * vi);
							Tv[ it + 1 ] = (negTauR * vi) + (negTauI * vr);
						}
						jj = Math.max( lastv, prevlastv );

						// T(i+1:K-1, i) += -tau(i) * V(i+1:K-1, jj:N-K+i-1) * V(i, jj:N-K+i-1)^H
						if ( N - K + i - jj > 0 ) {
							negTauCx = new Complex128( negTauR, negTauI );
							zgemm( 'no-transpose', 'conjugate-transpose', K - i - 1, 1, N - K + i - jj, negTauCx,
								V, strideV1, strideV2, offsetV + (( i + 1 ) * strideV1) + (jj * strideV2),
								V, strideV1, strideV2, offsetV + (i * strideV1) + (jj * strideV2),
								ONE, T, strideT1, strideT2, offsetT + (( i + 1 ) * strideT1) + (i * strideT2) );
						}
					}

					// T(i+1:K-1, i) := T(i+1:K-1, i+1:K-1) * T(i+1:K-1, i)
					ztrmv( 'lower', 'no-transpose', 'non-unit', K - i - 1, T, strideT1, strideT2,
						offsetT + (( i + 1 ) * strideT1) + (( i + 1 ) * strideT2),
						T, strideT1, offsetT + (( i + 1 ) * strideT1) + (i * strideT2) );
					if ( i > 0 ) {
						prevlastv = Math.min( prevlastv, lastv );
					} else {
						prevlastv = lastv;
					}
				}
				it = oT + (i * st1) + (i * st2);
				Tv[ it ] = tauR;
				Tv[ it + 1 ] = tauI;
			}
		}
	}
}


// EXPORTS //

export default zlarft;
