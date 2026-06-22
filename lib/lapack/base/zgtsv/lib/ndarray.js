
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex general tridiagonal system of linear equations A * X = B.
* using Gaussian elimination with partial pivoting.
*
* ## Notes
*
* -   All complex arrays (DL, d, DU, B) are `Complex128Array` with strides and
*     offsets in complex elements. Internally reinterpreted to Float64Array
*     views for efficient indexed access.
* -   Comparison uses CABS1: |re(z)| + |im(z)|.
* -   Complex division uses numerically stable `cmplx.divAt`.
*
* @param {NonNegativeInteger} N - order of the matrix A
* @param {integer} nrhs - number of right hand sides
* @param {Complex128Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride length for `DL` (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for `DL` (complex elements)
* @param {Complex128Array} d - diagonal elements (length N)
* @param {integer} strideD - stride length for `d` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `d` (complex elements)
* @param {Complex128Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride length for `DU` (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for `DU` (complex elements)
* @param {Complex128Array} B - right hand side matrix (N x nrhs)
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @returns {integer} status code (0 = success, k > 0 means U(k,k) is zero)
*/
function zgtsv( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	return base( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtsv;
