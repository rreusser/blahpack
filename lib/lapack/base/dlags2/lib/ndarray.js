
// MODULES //

import base from './base.js';


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
* @param {boolean} upper - whether the input matrices are upper triangular
* @param {number} a1 - (1,1) element of A
* @param {number} a2 - off-diagonal element of A
* @param {number} a3 - (2,2) element of A
* @param {number} b1 - (1,1) element of B
* @param {number} b2 - off-diagonal element of B
* @param {number} b3 - (2,2) element of B
* @returns {Object} object with properties csu, snu, csv, snv, csq, snq
*/
function dlags2( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq ) { // eslint-disable-line max-len, max-params
	return base( upper, a1, a2, a3, b1, b2, b3, csu, snu, csv, snv, csq, snq ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlags2;
