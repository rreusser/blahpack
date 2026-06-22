/* eslint-disable max-len, max-params */

// MAIN //

/**
* Applies a vector of real plane rotations to elements of two real vectors.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
* ( x(i) ) := (  c(i)  s(i) ) ( x(i) )
* ( y(i) )    ( -s(i)  c(i) ) ( y(i) )
* ```
*
* @private
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Float64Array} x - first input array
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Float64Array} y - second input array
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {integer} strideC - `c` stride length
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} s - array of sines of the plane rotations
* @param {integer} strideS - `s` stride length
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @returns {void}
*/
function dlartv( N, x, strideX, offsetX, y, strideY, offsetY, c, strideC, offsetC, s, strideS, offsetS ) {
	var xi;
	var yi;
	var ix;
	var iy;
	var ic;
	var is;
	var i;

	ix = offsetX;
	iy = offsetY;
	ic = offsetC;
	is = offsetS;
	for ( i = 0; i < N; i++ ) {
		xi = x[ ix ];
		yi = y[ iy ];
		x[ ix ] = ( c[ ic ] * xi ) + ( s[ is ] * yi );
		y[ iy ] = ( c[ ic ] * yi ) - ( s[ is ] * xi );
		ix += strideX;
		iy += strideY;
		ic += strideC;
		is += strideS;
	}
}


// EXPORTS //

export default dlartv;
