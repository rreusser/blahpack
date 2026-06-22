/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Performs reciprocal diagonal scaling on a complex matrix: `X = D^{-1} * X` where `D` is a real diagonal matrix stored as a vector.
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - real diagonal scaling vector of length `M`
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} X - input/output complex matrix
* @param {integer} strideX1 - stride of the first dimension of `X` (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of `X` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `X` (in complex elements)
* @returns {Complex128Array} `X`
*/
function zlarscl2( M, N, d, strideD, offsetD, X, strideX1, strideX2, offsetX ) {
	var sx1;
	var sx2;
	var Xv;
	var di;
	var ix;
	var id;
	var oX;
	var i;
	var j;

	Xv = reinterpret( X, 0 );

	// Convert complex-element strides/offset to Float64 strides/offset:
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	oX = offsetX * 2;

	for ( j = 0; j < N; j += 1 ) {
		ix = oX + ( j * sx2 );
		id = offsetD;
		for ( i = 0; i < M; i += 1 ) {
			di = d[ id ];

			// X(i,j) = X(i,j) / D(i) — complex element divided by real scalar:
			Xv[ ix ] /= di;
			Xv[ ix + 1 ] /= di;
			ix += sx1;
			id += strideD;
		}
	}
	return X;
}


// EXPORTS //

export default zlarscl2;
