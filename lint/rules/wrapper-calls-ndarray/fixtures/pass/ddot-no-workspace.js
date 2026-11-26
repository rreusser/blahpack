// target: lib/blas/base/ddot/lib/ddot.js
// A routine with no workspace may call base.js directly.
/* eslint-disable max-len, max-params */

import base from './base.js';

function ddot( N, x, strideX, y, strideY ) {
	return base( N, x, strideX, 0, y, strideY, 0 );
}

export default ddot;
