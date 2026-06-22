/* eslint-disable max-len, max-params */

// MAIN //

/**
* Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
* ( x(i)  z(i) ) := (  c(i)  s(i) ) ( x(i)  z(i) ) ( c(i) -s(i) )
* ( z(i)  y(i) )    ( -s(i)  c(i) ) ( z(i)  y(i) ) ( s(i)  c(i) )
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
* @param {Float64Array} z - third input array
* @param {integer} strideZ - `z` stride length
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} c - array of cosines of the plane rotations
* @param {integer} strideC - `c` stride length
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} s - array of sines of the plane rotations
* @param {integer} strideS - `s` stride length
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @returns {void}
*/
function dlar2v( N, x, strideX, offsetX, y, strideY, offsetY, z, strideZ, offsetZ, c, strideC, offsetC, s, strideS, offsetS ) {
	var ci;
	var si;
	var t1;
	var t2;
	var t3;
	var t4;
	var t5;
	var t6;
	var xi;
	var yi;
	var zi;
	var ix;
	var iy;
	var iz;
	var ic;
	var is;
	var i;

	ix = offsetX;
	iy = offsetY;
	iz = offsetZ;
	ic = offsetC;
	is = offsetS;
	for ( i = 0; i < N; i++ ) {
		xi = x[ ix ];
		yi = y[ iy ];
		zi = z[ iz ];
		ci = c[ ic ];
		si = s[ is ];
		t1 = si * zi;
		t2 = ci * zi;
		t3 = t2 - ( si * xi );
		t4 = t2 + ( si * yi );
		t5 = ( ci * xi ) + t1;
		t6 = ( ci * yi ) - t1;
		x[ ix ] = ( ci * t5 ) + ( si * t4 );
		y[ iy ] = ( ci * t6 ) - ( si * t3 );
		z[ iz ] = ( ci * t4 ) - ( si * t5 );
		ix += strideX;
		iy += strideY;
		iz += strideZ;
		ic += strideC;
		is += strideS;
	}
}


// EXPORTS //

export default dlar2v;
