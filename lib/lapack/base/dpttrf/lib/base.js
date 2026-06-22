// MAIN //

/**
* Computes the L_D_L^T factorization of a real symmetric positive definite tridiagonal matrix A.
*
* ## Notes
*
* -   On entry, `d` contains the n diagonal elements of the tridiagonal matrix A. On exit, the n diagonal elements of the diagonal matrix D from the L_D_L^T factorization of A.
* -   On entry, `e` contains the (n-1) subdiagonal elements of A. On exit, the (n-1) subdiagonal elements of the unit bidiagonal factor L.
* -   The routine uses a 4-unrolled loop matching the reference LAPACK implementation.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @returns {integer} status code
*/
function dpttrf( N, d, strideD, offsetD, e, strideE, offsetE ) { // eslint-disable-line max-len, max-params
	var info;
	var ei;
	var id;
	var ie;
	var i4;
	var i;

	info = 0;

	// Quick return if possible:
	if ( N <= 0 ) {
		return info;
	}

	// Compute the L*D*L^T factorization using a 4-unrolled loop.
	// i4 is the number of remainder elements before the unrolled section.
	i4 = ( N - 1 ) % 4;

	// Remainder loop (0 to i4-1 in 0-based):
	id = offsetD;
	ie = offsetE;
	for ( i = 0; i < i4; i++ ) {
		if ( d[ id ] <= 0.0 ) {
			info = i + 1;
			return info;
		}
		ei = e[ ie ];
		e[ ie ] = ei / d[ id ];
		d[ id + strideD ] -= e[ ie ] * ei;
		id += strideD;
		ie += strideE;
	}

	// Main 4-unrolled loop:
	for ( i = i4; i < N - 1; i += 4 ) { // eslint-disable-line max-len
		// Element i:
		if ( d[ id ] <= 0.0 ) {
			info = i + 1;
			return info;
		}
		ei = e[ ie ];
		e[ ie ] = ei / d[ id ];
		d[ id + strideD ] -= e[ ie ] * ei;

		// Element i+1:
		if ( d[ id + strideD ] <= 0.0 ) {
			info = i + 2;
			return info;
		}
		ei = e[ ie + strideE ];
		e[ ie + strideE ] = ei / d[ id + strideD ];
		d[ id + (2*strideD) ] -= e[ ie + strideE ] * ei; // eslint-disable-line max-len

		// Element i+2:
		if ( d[ id + (2*strideD) ] <= 0.0 ) {
			info = i + 3;
			return info;
		}
		ei = e[ ie + (2*strideE) ];
		e[ ie + (2*strideE) ] = ei / d[ id + (2*strideD) ];
		d[ id + (3*strideD) ] -= e[ ie + (2*strideE) ] * ei; // eslint-disable-line max-len

		// Element i+3:
		if ( d[ id + (3*strideD) ] <= 0.0 ) {
			info = i + 4;
			return info;
		}
		ei = e[ ie + (3*strideE) ];
		e[ ie + (3*strideE) ] = ei / d[ id + (3*strideD) ];
		d[ id + (4*strideD) ] -= e[ ie + (3*strideE) ] * ei; // eslint-disable-line max-len

		id += 4 * strideD;
		ie += 4 * strideE;
	}

	// Check d(N) for positive definiteness:
	if ( d[ id ] <= 0.0 ) {
		info = N;
	}
	return info;
}


// EXPORTS //

export default dpttrf;
