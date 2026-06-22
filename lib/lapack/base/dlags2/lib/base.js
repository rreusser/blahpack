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

import dlartg from '../../dlartg/lib/base.js';
import dlasv2 from '../../dlasv2/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var lartgOut = new Float64Array( 3 );


// MAIN //

/**
* Computes 2-by-2 orthogonal matrices U, V, and Q, such that if UPPER is true:.
*
*   U^T _ A _ Q = U^T _ ( A1 A2 ) _ Q = ( x  0  )
*                       ( 0  A3 )       ( x  x  )
* and
*   V^T _ B _ Q = V^T _ ( B1 B2 ) _ Q = ( x  0  )
*                       ( 0  B3 )       ( x  x  )
*
* or if UPPER is false:
*
*   U^T _ A _ Q = U^T _ ( A1 0  ) _ Q = ( x  x  )
*                       ( A2 A3 )       ( 0  x  )
* and
*   V^T _ B _ Q = V^T _ ( B1 0  ) _ Q = ( x  x  )
*                       ( B2 B3 )       ( 0  x  )
*
* @private
* @param {boolean} upper - whether the input matrices are upper triangular
* @param {number} a1 - (1,1) element of A
* @param {number} a2 - off-diagonal element of A
* @param {number} a3 - (2,2) element of A
* @param {number} b1 - (1,1) element of B
* @param {number} b2 - off-diagonal element of B
* @param {number} b3 - (2,2) element of B
* @returns {Object} object with properties csu, snu, csv, snv, csq, snq
*/
function dlags2( upper, a1, a2, a3, b1, b2, b3 ) {
	var ua11r;
	var ua22r;
	var vb11r;
	var vb22r;
	var aua11;
	var aua12;
	var aua21;
	var aua22;
	var avb11;
	var avb12;
	var avb21;
	var avb22;
	var ua11;
	var ua12;
	var ua21;
	var ua22;
	var vb11;
	var vb12;
	var vb21;
	var vb22;
	var csu;
	var snu;
	var csv;
	var snv;
	var csq;
	var snq;
	var csl;
	var csr;
	var snl;
	var snr;
	var svd;
	var a;
	var b;
	var c;
	var d;

	if ( upper ) {
		// Input matrices A and B are upper triangular matrices.
		// Form matrix C = A*adj(B) = ( a b )
		//                             ( 0 d )
		a = a1 * b3;
		d = a3 * b1;
		b = ( a2 * b1 ) - ( a1 * b2 );

		// The SVD of real 2-by-2 triangular C
		svd = dlasv2( a, b, d );
		snr = svd.snr;
		csr = svd.csr;
		snl = svd.snl;
		csl = svd.csl;

		if ( Math.abs( csl ) >= Math.abs( snl ) || Math.abs( csr ) >= Math.abs( snr ) ) {
			// Compute the (1,1) and (1,2) elements of U^T*A and V^T*B,
			// And (1,2) element of |U|^T*|A| and |V|^T*|B|.
			ua11r = csl * a1;
			ua12 = ( csl * a2 ) + ( snl * a3 );

			vb11r = csr * b1;
			vb12 = ( csr * b2 ) + ( snr * b3 );

			aua12 = ( Math.abs( csl ) * Math.abs( a2 ) ) + ( Math.abs( snl ) * Math.abs( a3 ) );
			avb12 = ( Math.abs( csr ) * Math.abs( b2 ) ) + ( Math.abs( snr ) * Math.abs( b3 ) );

			// Zero (1,2) elements of U^T*A and V^T*B
			if ( ( Math.abs( ua11r ) + Math.abs( ua12 ) ) !== ZERO ) {
				if ( aua12 / ( Math.abs( ua11r ) + Math.abs( ua12 ) ) <= avb12 / ( Math.abs( vb11r ) + Math.abs( vb12 ) ) ) {
					dlartg( -ua11r, ua12, lartgOut );
				} else {
					dlartg( -vb11r, vb12, lartgOut );
				}
			} else {
				dlartg( -vb11r, vb12, lartgOut );
			}
			csq = lartgOut[ 0 ];
			snq = lartgOut[ 1 ];

			csu = csl;
			snu = -snl;
			csv = csr;
			snv = -snr;
		} else {
			// Compute the (2,1) and (2,2) elements of U^T*A and V^T*B,
			// And (2,2) element of |U|^T*|A| and |V|^T*|B|.
			ua21 = -snl * a1;
			ua22 = ( -snl * a2 ) + ( csl * a3 );

			vb21 = -snr * b1;
			vb22 = ( -snr * b2 ) + ( csr * b3 );

			aua22 = ( Math.abs( snl ) * Math.abs( a2 ) ) + ( Math.abs( csl ) * Math.abs( a3 ) );
			avb22 = ( Math.abs( snr ) * Math.abs( b2 ) ) + ( Math.abs( csr ) * Math.abs( b3 ) );

			// Zero (2,2) elements of U^T*A and V^T*B, and then swap.
			if ( ( Math.abs( ua21 ) + Math.abs( ua22 ) ) !== ZERO ) {
				if ( aua22 / ( Math.abs( ua21 ) + Math.abs( ua22 ) ) <= avb22 / ( Math.abs( vb21 ) + Math.abs( vb22 ) ) ) {
					dlartg( -ua21, ua22, lartgOut );
				} else {
					dlartg( -vb21, vb22, lartgOut );
				}
			} else {
				dlartg( -vb21, vb22, lartgOut );
			}
			csq = lartgOut[ 0 ];
			snq = lartgOut[ 1 ];

			csu = snl;
			snu = csl;
			csv = snr;
			snv = csr;
		}
	} else {
		// Input matrices A and B are lower triangular matrices.
		// Form matrix C = A*adj(B) = ( a 0 )
		//                             ( c d )
		a = a1 * b3;
		d = a3 * b1;
		c = ( a2 * b3 ) - ( a3 * b2 );

		// The SVD of real 2-by-2 triangular C
		svd = dlasv2( a, c, d );
		snr = svd.snr;
		csr = svd.csr;
		snl = svd.snl;
		csl = svd.csl;

		if ( Math.abs( csr ) >= Math.abs( snr ) || Math.abs( csl ) >= Math.abs( snl ) ) {
			// Compute the (2,1) and (2,2) elements of U^T*A and V^T*B,
			// And (2,1) element of |U|^T*|A| and |V|^T*|B|.
			ua21 = ( -snr * a1 ) + ( csr * a2 );
			ua22r = csr * a3;

			vb21 = ( -snl * b1 ) + ( csl * b2 );
			vb22r = csl * b3;

			aua21 = ( Math.abs( snr ) * Math.abs( a1 ) ) + ( Math.abs( csr ) * Math.abs( a2 ) );
			avb21 = ( Math.abs( snl ) * Math.abs( b1 ) ) + ( Math.abs( csl ) * Math.abs( b2 ) );

			// Zero (2,1) elements of U^T*A and V^T*B.
			if ( ( Math.abs( ua21 ) + Math.abs( ua22r ) ) !== ZERO ) {
				if ( aua21 / ( Math.abs( ua21 ) + Math.abs( ua22r ) ) <= avb21 / ( Math.abs( vb21 ) + Math.abs( vb22r ) ) ) {
					dlartg( ua22r, ua21, lartgOut );
				} else {
					dlartg( vb22r, vb21, lartgOut );
				}
			} else {
				dlartg( vb22r, vb21, lartgOut );
			}
			csq = lartgOut[ 0 ];
			snq = lartgOut[ 1 ];

			csu = csr;
			snu = -snr;
			csv = csl;
			snv = -snl;
		} else {
			// Compute the (1,1) and (1,2) elements of U^T*A and V^T*B,
			// And (1,1) element of |U|^T*|A| and |V|^T*|B|.
			ua11 = ( csr * a1 ) + ( snr * a2 );
			ua12 = snr * a3;

			vb11 = ( csl * b1 ) + ( snl * b2 );
			vb12 = snl * b3;

			aua11 = ( Math.abs( csr ) * Math.abs( a1 ) ) + ( Math.abs( snr ) * Math.abs( a2 ) );
			avb11 = ( Math.abs( csl ) * Math.abs( b1 ) ) + ( Math.abs( snl ) * Math.abs( b2 ) );

			// Zero (1,1) elements of U^T*A and V^T*B, and then swap.
			if ( ( Math.abs( ua11 ) + Math.abs( ua12 ) ) !== ZERO ) {
				if ( aua11 / ( Math.abs( ua11 ) + Math.abs( ua12 ) ) <= avb11 / ( Math.abs( vb11 ) + Math.abs( vb12 ) ) ) {
					dlartg( ua12, ua11, lartgOut );
				} else {
					dlartg( vb12, vb11, lartgOut );
				}
			} else {
				dlartg( vb12, vb11, lartgOut );
			}
			csq = lartgOut[ 0 ];
			snq = lartgOut[ 1 ];

			csu = snr;
			snu = csr;
			csv = snl;
			snv = csl;
		}
	}

	return {
		'csu': csu,
		'snu': snu,
		'csv': csv,
		'snv': snv,
		'csq': csq,
		'snq': snq
	};
}


// EXPORTS //

export default dlags2;
