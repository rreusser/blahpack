/* eslint-disable max-len, max-params */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Applies a vector of complex plane rotations with real cosines from both sides to a sequence of 2-by-2 complex Hermitian matrices.
*
* For `i = 0, 1, ..., N-1`:
*
* ```text
*  (       x(i)  z(i) ) :=
*  ( conj(z(i)) y(i) )
*
*    (  c(i) conj(s(i)) ) (       x(i)  z(i) ) ( c(i) -conj(s(i)) )
*    ( -s(i)       c(i) ) ( conj(z(i)) y(i) ) ( s(i)        c(i) )
* ```
*
* The elements of `x` and `y` are assumed to be real.
*
* @private
* @param {NonNegativeInteger} N - number of plane rotations to apply
* @param {Complex128Array} x - first input array (elements assumed real)
* @param {integer} strideX - stride for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {Complex128Array} y - second input array (elements assumed real)
* @param {integer} strideY - stride for `y` (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `y` (in complex elements)
* @param {Complex128Array} z - third input array (complex)
* @param {integer} strideZ - stride for `z` (in complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `z` (in complex elements)
* @param {Float64Array} c - array of cosines of the plane rotations (real)
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} s - array of sines of the plane rotations (complex)
* @param {integer} strideS - stride for `s` (in complex elements)
* @param {NonNegativeInteger} offsetS - starting index for `s` (in complex elements)
* @returns {void}
*/
function zlar2v( N, x, strideX, offsetX, y, strideY, offsetY, z, strideZ, offsetZ, c, strideC, offsetC, s, strideS, offsetS ) {
	var t4r;
	var t4i;
	var t3r;
	var t3i;
	var t2r;
	var t2i;
	var t1r;
	var t1i;
	var sir;
	var sii;
	var zir;
	var zii;
	var xv;
	var yv;
	var zv;
	var sv;
	var xi;
	var yi;
	var ci;
	var sx;
	var sy;
	var sz;
	var ss;
	var ix;
	var iy;
	var iz;
	var ic;
	var is;
	var t5;
	var t6;
	var i;

	if ( N <= 0 ) {
		return;
	}

	// Reinterpret complex arrays as Float64Array views
	xv = reinterpret( x, 0 );
	yv = ( y === x ) ? xv : reinterpret( y, 0 );
	zv = reinterpret( z, 0 );
	sv = reinterpret( s, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sx = strideX * 2;
	sy = strideY * 2;
	sz = strideZ * 2;
	ss = strideS * 2;
	ix = offsetX * 2;
	iy = offsetY * 2;
	iz = offsetZ * 2;
	is = offsetS * 2;
	ic = offsetC;

	for ( i = 0; i < N; i += 1 ) {
		// X and Y elements are assumed real (take real part only)
		xi = xv[ ix ];
		yi = yv[ iy ];

		// Z is complex
		zir = zv[ iz ];
		zii = zv[ iz + 1 ];

		// C is real, S is complex
		ci = c[ ic ];
		sir = sv[ is ];
		sii = sv[ is + 1 ];

		// t1 = s(i) * z(i)  (complex multiply, inlined)
		t1r = (sir * zir) - (sii * zii);
		t1i = (sir * zii) + (sii * zir);

		// t2 = c(i) * z(i)  (real * complex)
		t2r = ci * zir;
		t2i = ci * zii;

		// t3 = t2 - conj(s(i)) * x(i)  (conj(s) * real scalar = (sir*xi, -sii*xi))
		t3r = t2r - (sir * xi);
		t3i = t2i - (-sii * xi);

		// t4 = conj(t2) + s(i) * y(i)  (s * real scalar = (sir*yi, sii*yi))
		t4r = t2r + (sir * yi);
		t4i = -t2i + (sii * yi);

		// t5 = c(i) * x(i) + real(t1)
		t5 = (ci * xi) + t1r;

		// t6 = c(i) * y(i) - real(t1)
		t6 = (ci * yi) - t1r;

		// x(i) = c(i)*t5 + ( sir*real(t4) + sii*imag(t4) )
		xv[ ix ] = (ci * t5) + ((sir * t4r) + (sii * t4i));
		xv[ ix + 1 ] = 0.0;

		// y(i) = c(i)*t6 - ( sir*real(t3) - sii*imag(t3) )
		yv[ iy ] = (ci * t6) - ((sir * t3r) - (sii * t3i));
		yv[ iy + 1 ] = 0.0;

		// z(i) = c(i)*t3 + conj(s(i)) * (t6 + t1i*i)

		// conj(s) * (t6 + t1i*i) = (sir*t6 + sii*t1i) + (-sii*t6 + sir*t1i)*i
		zv[ iz ] = (ci * t3r) + ((sir * t6) + (sii * t1i));
		zv[ iz + 1 ] = (ci * t3i) + ((-sii * t6) + (sir * t1i));

		ix += sx;
		iy += sy;
		iz += sz;
		ic += strideC;
		is += ss;
	}
}


// EXPORTS //

export default zlar2v;
