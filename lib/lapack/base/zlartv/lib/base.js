/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Applies a vector of complex plane rotations with real cosines to elements of two complex vectors.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
* ( x(i) ) := (        c(i)   s(i) ) ( x(i) )
* ( y(i) )    ( -conj(s(i))  c(i) ) ( y(i) )
* ```
*
* @private
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Complex128Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Complex128Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {integer} strideC - `c` stride length
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} s - array of complex sines of the plane rotations
* @param {integer} strideS - `s` stride length
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @returns {void}
*/
function zlartv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC, s, strideS, offsetS ) {
	var xir;
	var xii;
	var yir;
	var yii;
	var sir;
	var sii;
	var xv;
	var yv;
	var sv;
	var ci;
	var sx;
	var sy;
	var ss;
	var ix;
	var iy;
	var ic;
	var is;
	var i;

	if ( N <= 0 ) {
		return;
	}

	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );
	sv = reinterpret( s, 0 );

	sx = strideX * 2;
	sy = strideY * 2;
	ss = strideS * 2;

	ix = offsetX * 2;
	iy = offsetY * 2;
	ic = offsetC;
	is = offsetS * 2;

	for ( i = 0; i < N; i += 1 ) {
		// Cache x(i) and y(i):
		xir = xv[ ix ];
		xii = xv[ ix + 1 ];
		yir = yv[ iy ];
		yii = yv[ iy + 1 ];
		ci = c[ ic ];
		sir = sv[ is ];
		sii = sv[ is + 1 ];

		// x(i) = c(i)*x(i) + s(i)*y(i)
		xv[ ix ] = ( ci * xir ) + ( sir * yir ) - ( sii * yii );
		xv[ ix + 1 ] = ( ci * xii ) + ( sir * yii ) + ( sii * yir );

		// y(i) = c(i)*y(i) - conj(s(i))*x(i)
		yv[ iy ] = ( ci * yir ) - ( sir * xir ) - ( sii * xii );
		yv[ iy + 1 ] = ( ci * yii ) - ( sir * xii ) + ( sii * xir );

		ix += sx;
		iy += sy;
		ic += strideC;
		is += ss;
	}
}


// EXPORTS //

export default zlartv;
