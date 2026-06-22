// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Computes the L*D*L^H factorization of a complex Hermitian positive definite tridiagonal matrix.
*
* ## Notes
*
* -   On entry, `d` contains the n diagonal elements of the tridiagonal matrix A. On exit, the n diagonal elements of the diagonal matrix D from the L*D*L^H factorization of A.
* -   On entry, `e` contains the (n-1) subdiagonal elements of A (Complex128Array). On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L.
* -   The routine uses a 4-unrolled loop matching the reference LAPACK implementation.
* -   D is real (Float64Array). E is complex (Complex128Array) — strides/offsets are in complex elements.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N), real
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Complex128Array} e - subdiagonal elements (length N-1), complex
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @returns {integer} status code (0 = success, k > 0 = not positive definite at position k)
*/
function zpttrf( N, d, strideD, offsetD, e, strideE, offsetE ) { // eslint-disable-line max-len, max-params
	var info;
	var eir;
	var eii;
	var ev;
	var se;
	var id;
	var ie;
	var i4;
	var f;
	var g;
	var i;

	info = 0;

	// Quick return if possible:
	if ( N <= 0 ) {
		return info;
	}

	// Get Float64 view of complex E array:
	ev = reinterpret( e, 0 );

	// Convert complex-element stride/offset to Float64 stride/offset:
	se = strideE * 2;
	ie = offsetE * 2;

	// Compute the L*D*L^H factorization using a 4-unrolled loop.
	// i4 is the number of remainder elements before the unrolled section.
	i4 = ( N - 1 ) % 4;

	// Remainder loop (0 to i4-1 in 0-based):
	id = offsetD;
	for ( i = 0; i < i4; i++ ) {
		if ( d[ id ] <= 0.0 ) {
			info = i + 1;
			return info;
		}
		eir = ev[ ie ];       // real part of E[i]
		eii = ev[ ie + 1 ];   // imag part of E[i]
		f = eir / d[ id ];
		g = eii / d[ id ];
		ev[ ie ] = f;
		ev[ ie + 1 ] = g;
		d[ id + strideD ] -= ( f * eir ) + ( g * eii ); // d[i+1] -= |e[i]|^2 / d[i]
		id += strideD;
		ie += se;
	}

	// Main 4-unrolled loop:
	for ( i = i4; i < N - 1; i += 4 ) { // eslint-disable-line max-len
		// Element i:
		if ( d[ id ] <= 0.0 ) {
			info = i + 1;
			return info;
		}
		eir = ev[ ie ];
		eii = ev[ ie + 1 ];
		f = eir / d[ id ];
		g = eii / d[ id ];
		ev[ ie ] = f;
		ev[ ie + 1 ] = g;
		d[ id + strideD ] -= ( f * eir ) + ( g * eii );

		// Element i+1:
		if ( d[ id + strideD ] <= 0.0 ) {
			info = i + 2;
			return info;
		}
		eir = ev[ ie + se ];
		eii = ev[ ie + se + 1 ];
		f = eir / d[ id + strideD ];
		g = eii / d[ id + strideD ];
		ev[ ie + se ] = f;
		ev[ ie + se + 1 ] = g;
		d[ id + (2*strideD) ] -= ( f * eir ) + ( g * eii );

		// Element i+2:
		if ( d[ id + (2*strideD) ] <= 0.0 ) {
			info = i + 3;
			return info;
		}
		eir = ev[ ie + (2*se) ];
		eii = ev[ ie + (2*se) + 1 ];
		f = eir / d[ id + (2*strideD) ];
		g = eii / d[ id + (2*strideD) ];
		ev[ ie + (2*se) ] = f;
		ev[ ie + (2*se) + 1 ] = g;
		d[ id + (3*strideD) ] -= ( f * eir ) + ( g * eii );

		// Element i+3:
		if ( d[ id + (3*strideD) ] <= 0.0 ) {
			info = i + 4;
			return info;
		}
		eir = ev[ ie + (3*se) ];
		eii = ev[ ie + (3*se) + 1 ];
		f = eir / d[ id + (3*strideD) ];
		g = eii / d[ id + (3*strideD) ];
		ev[ ie + (3*se) ] = f;
		ev[ ie + (3*se) + 1 ] = g;
		d[ id + (4*strideD) ] -= ( f * eir ) + ( g * eii );

		id += 4 * strideD;
		ie += 4 * se;
	}

	// Check d(N) for positive definiteness:
	if ( d[ id ] <= 0.0 ) {
		info = N;
	}
	return info;
}


// EXPORTS //

export default zpttrf;
