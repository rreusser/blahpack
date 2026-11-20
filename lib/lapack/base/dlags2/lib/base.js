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

import dlartg from '../../dlartg/lib/base.js';
import dlasv2 from '../../dlasv2/lib/base.js';


// VARIABLES //

const ZERO = 0.0;


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
* @param {Float64Array} csu - output (length-1 array): `csu`
* @param {Float64Array} snu - output (length-1 array): the desired orthogonal matrix U
* @param {Float64Array} csv - output (length-1 array): `csv`
* @param {Float64Array} snv - output (length-1 array): the desired orthogonal matrix V
* @param {Float64Array} csq - output (length-1 array): `csq`
* @param {Float64Array} snq - output (length-1 array): the desired orthogonal matrix Q
*/
function dlags2( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq ) {
	const ssmin = new Float64Array( 1 );
	const ssmax = new Float64Array( 1 );
	const snrOut = new Float64Array( 1 );
	const csrOut = new Float64Array( 1 );
	const snlOut = new Float64Array( 1 );
	const cslOut = new Float64Array( 1 );
	const cOut = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const r = new Float64Array( 1 );
	let ua11r, ua22r, vb11r, vb22r, aua11, aua12, aua21, aua22, avb11, avb12;
	let avb21, avb22, ua11, ua12, ua21, ua22, vb11, vb12, vb21, vb22;
	let csl, csr, snl, snr, a, b, c, d;

	if ( upper ) {
		// Input matrices A and B are upper triangular matrices.
		// Form matrix C = A*adj(B) = ( a b )
		//                             ( 0 d )
		a = a1 * b3;
		d = a3 * b1;
		b = ( a2 * b1 ) - ( a1 * b2 );

		// The SVD of real 2-by-2 triangular C
		dlasv2( a, b, d, ssmin, ssmax, snrOut, csrOut, snlOut, cslOut );
		snr = snrOut[ 0 ];
		csr = csrOut[ 0 ];
		snl = snlOut[ 0 ];
		csl = cslOut[ 0 ];

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
					dlartg( -ua11r, ua12, cOut, s, r );
				} else {
					dlartg( -vb11r, vb12, cOut, s, r );
				}
			} else {
				dlartg( -vb11r, vb12, cOut, s, r );
			}
			csq[ 0 ] = cOut[ 0 ];
			snq[ 0 ] = s[ 0 ];

			csu[ 0 ] = csl;
			snu[ 0 ] = -snl;
			csv[ 0 ] = csr;
			snv[ 0 ] = -snr;
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
					dlartg( -ua21, ua22, cOut, s, r );
				} else {
					dlartg( -vb21, vb22, cOut, s, r );
				}
			} else {
				dlartg( -vb21, vb22, cOut, s, r );
			}
			csq[ 0 ] = cOut[ 0 ];
			snq[ 0 ] = s[ 0 ];

			csu[ 0 ] = snl;
			snu[ 0 ] = csl;
			csv[ 0 ] = snr;
			snv[ 0 ] = csr;
		}
	} else {
		// Input matrices A and B are lower triangular matrices.
		// Form matrix C = A*adj(B) = ( a 0 )
		//                             ( c d )
		a = a1 * b3;
		d = a3 * b1;
		c = ( a2 * b3 ) - ( a3 * b2 );

		// The SVD of real 2-by-2 triangular C
		dlasv2( a, c, d, ssmin, ssmax, snrOut, csrOut, snlOut, cslOut );
		snr = snrOut[ 0 ];
		csr = csrOut[ 0 ];
		snl = snlOut[ 0 ];
		csl = cslOut[ 0 ];

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
					dlartg( ua22r, ua21, cOut, s, r );
				} else {
					dlartg( vb22r, vb21, cOut, s, r );
				}
			} else {
				dlartg( vb22r, vb21, cOut, s, r );
			}
			csq[ 0 ] = cOut[ 0 ];
			snq[ 0 ] = s[ 0 ];

			csu[ 0 ] = csr;
			snu[ 0 ] = -snr;
			csv[ 0 ] = csl;
			snv[ 0 ] = -snl;
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
					dlartg( ua12, ua11, cOut, s, r );
				} else {
					dlartg( vb12, vb11, cOut, s, r );
				}
			} else {
				dlartg( vb12, vb11, cOut, s, r );
			}
			csq[ 0 ] = cOut[ 0 ];
			snq[ 0 ] = s[ 0 ];

			csu[ 0 ] = snr;
			snu[ 0 ] = csr;
			csv[ 0 ] = snl;
			snv[ 0 ] = csl;
		}
	}

}


// EXPORTS //

export default dlags2;
